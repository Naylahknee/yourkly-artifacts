// Minimal git client for pushing commits to Artifacts remotes.
// Implements just enough of the Git Smart HTTP protocol: object creation
// (blob/tree/commit), packfile assembly, and git-receive-pack.
// No filesystem needed. All user-facing strings stay out of this file.

const te = new TextEncoder();

async function sha1hex(data) {
  const buf = await crypto.subtle.digest('SHA-1', data);
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
}

function sha1bytes(hex) {
  const out = new Uint8Array(20);
  for (let i = 0; i < 20; i++) out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return out;
}

async function deflate(data) {
  const cs = new CompressionStream('deflate');
  const w = cs.writable.getWriter();
  w.write(data);
  w.close();
  const chunks = [];
  for await (const c of cs.readable) chunks.push(c);
  const total = chunks.reduce((n, c) => n + c.length, 0);
  const out = new Uint8Array(total);
  let o = 0;
  for (const c of chunks) { out.set(c, o); o += c.length; }
  return out;
}

async function makeBlob(content) {
  const body = typeof content === 'string' ? te.encode(content) : content;
  const header = te.encode(`blob ${body.length}\0`);
  const full = new Uint8Array(header.length + body.length);
  full.set(header); full.set(body, header.length);
  return { sha: await sha1hex(full), data: full, type: 3 };
}

async function makeTree(entries) {
  // entries: [{mode, name, sha}] sorted by name
  const sorted = [...entries].sort((a, b) => a.name < b.name ? -1 : 1);
  const parts = [];
  for (const e of sorted) {
    parts.push(te.encode(`${e.mode} ${e.name}\0`));
    parts.push(sha1bytes(e.sha));
  }
  const bodyLen = parts.reduce((n, p) => n + p.length, 0);
  const body = new Uint8Array(bodyLen);
  let o = 0;
  for (const p of parts) { body.set(p, o); o += p.length; }
  const header = te.encode(`tree ${body.length}\0`);
  const full = new Uint8Array(header.length + body.length);
  full.set(header); full.set(body, header.length);
  return { sha: await sha1hex(full), data: full, type: 2 };
}

async function makeCommit({ tree, parents, message, author }) {
  const lines = [`tree ${tree}`];
  for (const p of parents) lines.push(`parent ${p}`);
  const ts = Math.floor(Date.now() / 1000);
  lines.push(`author ${author.name} <${author.email}> ${ts} +0000`);
  lines.push(`committer ${author.name} <${author.email}> ${ts} +0000`);
  lines.push('', message);
  const body = te.encode(lines.join('\n') + '\n');
  const header = te.encode(`commit ${body.length}\0`);
  const full = new Uint8Array(header.length + body.length);
  full.set(header); full.set(body, header.length);
  return { sha: await sha1hex(full), data: full, type: 1 };
}

function encodeObjectHeader(type, size) {
  const out = [];
  let b = (type << 4) | (size & 0x0f);
  size >>= 4;
  while (size > 0) {
    out.push(b | 0x80);
    b = size & 0x7f;
    size >>= 7;
  }
  out.push(b);
  return new Uint8Array(out);
}

async function makePack(objects) {
  const parts = [];
  const header = new Uint8Array(12);
  header.set(te.encode('PACK'));
  new DataView(header.buffer).setUint32(4, 2);
  new DataView(header.buffer).setUint32(8, objects.length);
  parts.push(header);
  for (const obj of objects) {
    // Re-encode: strip the "type len\0" header, we need raw body
    const nul = obj.data.indexOf(0);
    const body = obj.data.slice(nul + 1);
    parts.push(encodeObjectHeader(obj.type, body.length));
    parts.push(await deflate(body));
  }
  const bodyLen = parts.reduce((n, p) => n + p.length, 0);
  const pack = new Uint8Array(bodyLen + 20);
  let o = 0;
  for (const p of parts) { pack.set(p, o); o += p.length; }
  const checksum = new Uint8Array(await crypto.subtle.digest('SHA-1', pack.slice(0, bodyLen)));
  pack.set(checksum, bodyLen);
  return pack;
}

function pktLine(str) {
  const len = str.length + 4;
  return te.encode(len.toString(16).padStart(4, '0') + str);
}

// Build a full file tree from a flat path->content map. Returns root tree sha + all objects.
async function buildTree(files) {
  const dirMap = new Map(); // dirpath -> [{mode, name, sha}]
  const blobs = [];
  for (const [path, content] of Object.entries(files)) {
    const blob = await makeBlob(content);
    blobs.push(blob);
    const parts = path.split('/');
    const name = parts.pop();
    const dir = parts.join('/');
    if (!dirMap.has(dir)) dirMap.set(dir, []);
    dirMap.get(dir).push({ mode: '100644', name, sha: blob.sha });
  }
  // Build trees bottom-up
  const treeShas = new Map();
  const trees = [];
  const dirs = [...dirMap.keys()].sort((a, b) => b.split('/').length - a.split('/').length);
  for (const dir of dirs) {
    const entries = [...dirMap.get(dir)];
    // Add subtree entries for child dirs
    for (const [childDir, childSha] of treeShas) {
      const parent = childDir.split('/').slice(0, -1).join('/');
      if (parent === dir) {
        entries.push({ mode: '040000', name: childDir.split('/').pop(), sha: childSha });
      }
    }
    const tree = await makeTree(entries);
    trees.push(tree);
    treeShas.set(dir, tree.sha);
  }
  // Handle nested dirs that had no direct files (ensure parents exist)
  const rootSha = treeShas.get('') || (await makeTree([])).sha;
  if (!treeShas.has('') && dirs.length > 0) {
    // Root wasn't built because no files at root; build it from top-level subtrees
    const entries = [];
    for (const [d, s] of treeShas) {
      if (!d.includes('/')) entries.push({ mode: '040000', name: d, sha: s });
    }
    const root = await makeTree(entries);
    trees.push(root);
    return { rootSha: root.sha, objects: [...blobs, ...trees] };
  }
  return { rootSha, objects: [...blobs, ...trees] };
}

// Push newSha to ref, replacing oldSha. objects = all new git objects needed.
export async function gitPush({ remote, token, ref, oldSha, newSha, objects }) {
  const pack = await makePack(objects);
  const refLine = `${oldSha} ${newSha} ${ref}\0report-status`;
  const bodyParts = [pktLine(refLine), te.encode('0000'), pack];
  const bodyLen = bodyParts.reduce((n, p) => n + p.length, 0);
  const body = new Uint8Array(bodyLen);
  let o = 0;
  for (const p of bodyParts) { body.set(p, o); o += p.length; }

  const creds = btoa(`x:${token}`);
  const res = await fetch(remote.replace(/\/$/, '') + '/git-receive-pack', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-git-receive-pack-request',
      'Authorization': `Basic ${creds}`,
    },
    body,
  });
  if (!res.ok) {
    throw new Error(`Push failed with HTTP ${res.status}`);
  }
  const text = await res.text();
  if (text.includes('\nng ')) {
    throw new Error('Push rejected: ' + text.slice(text.indexOf('\nng ') + 4, text.indexOf('\nng ') + 120));
  }
  return true;
}

const AGENT_IDENT = { name: 'Yourkly Agent', email: 'agent@yourkly-artifacts.workers.dev' };

// High-level: push a full file set as a new commit on top of parentSha (or root if null).
export async function pushCommit({ remote, token, ref, parentSha, files, message }) {
  const { rootSha, objects } = await buildTree(files);
  const commit = await makeCommit({
    tree: rootSha,
    parents: parentSha ? [parentSha] : [],
    message,
    author: AGENT_IDENT,
  });
  const oldSha = parentSha || '0000000000000000000000000000000000000000';
  await gitPush({ remote, token, ref, oldSha, newSha: commit.sha, objects: [...objects, commit] });
  return commit.sha;
}
