// Yourkly on Artifacts: plain-language version control for the agentic era.
// Full product: projects backed by Artifacts repos, a writing editor,
// labeled save points with history and restore, and AI agents that work
// on their own copies. No git jargon anywhere the user can see.
import { renderLanding, renderApp } from './ui.js';
import { pushCommit } from './gitmini.js';
import { pushInitialFiles, pushChanges } from './gitops.js';

const STARTER_FILES = {
  'index.html': `<!doctype html>
<html>
<head><meta charset="utf-8"><title>My Site</title><link rel="stylesheet" href="style.css"></head>
<body>
<h1>Welcom to my site</h1>
<p>This is the homepage of my demo project.</p>
</body>
</html>
`,
  'style.css': `body { font-family: sans-serif; margin: 40px; }
h1 { color: #333; }
`,
  'notes.md': `# Notes

Write anything here. Save a new version whenever you want to keep a copy.
`,
};

// --- Agent helpers -------------------------------------------------------
// Each agent reads the project's current files and makes its own kind of
// improvement. They work on separate copies at the same time.

const TYPO_FIXES = [
  ['Welcom', 'Welcome'],
  ['teh ', 'the '],
  ['Teh ', 'The '],
  ['recieve', 'receive'],
  ['seperate', 'separate'],
  ['occured', 'occurred'],
  ['definately', 'definitely'],
];

const TEXT_EXTS = ['.html', '.css', '.md', '.txt', '.js', '.json'];
const isText = (path) => TEXT_EXTS.some((e) => path.toLowerCase().endsWith(e));

function fixerTransform(files) {
  const out = {};
  const notes = [];
  for (const [path, content] of Object.entries(files)) {
    if (!isText(path) || typeof content !== 'string') { out[path] = content; continue; }
    let c = content;
    for (const [wrong, right] of TYPO_FIXES) {
      if (c.includes(wrong)) {
        const n = c.split(wrong).length - 1;
        c = c.split(wrong).join(right);
        notes.push(`in ${path}: "${wrong.trim()}" became "${right.trim()}" (${n} time${n > 1 ? 's' : ''})`);
      }
    }
    out[path] = c;
  }
  const changed = notes.length > 0;
  return {
    files: out,
    changed,
    plainChanges: changed
      ? 'Fixed small mistakes:\n' + notes.map((n) => '- ' + n).join('\n')
      : 'Read every file carefully. No small mistakes found, so nothing needed changing.',
  };
}

function builderTransform(files) {
  const names = Object.keys(files).filter((p) => isText(p)).sort();
  const total = names.reduce((n, p) => n + String(files[p] || '').length, 0);
  const summary = `# About this project

A quick overview, written by the Builder.

- ${names.length} file${names.length === 1 ? '' : 's'}: ${names.join(', ')}
- About ${total} characters in all.

This file was added automatically. Delete it any time.
`;
  return {
    files: { ...files, 'about-this-project.md': summary },
    changed: true,
    plainChanges: `Wrote a summary of the project as a new file, about-this-project.md (${names.length} files, about ${total} characters).`,
  };
}

function polisherTransform(files) {
  const out = {};
  let touched = 0;
  for (const [path, content] of Object.entries(files)) {
    if (!isText(path) || typeof content !== 'string') { out[path] = content; continue; }
    const lines = String(content).split('\n').map((l) => l.replace(/[ \t]+$/, ''));
    let c = lines.join('\n');
    if (!c.endsWith('\n')) c += '\n';
    if (c !== content) touched++;
    out[path] = c;
  }
  return {
    files: out,
    changed: touched > 0,
    plainChanges: touched > 0
      ? `Tidied up spacing in ${touched} file${touched === 1 ? '' : 's'} (trailing spaces removed, clean line endings).`
      : 'Checked the spacing in every file. Already tidy, so nothing needed changing.',
  };
}

const AGENT_DEFS = [
  { id: 'fix', name: 'The Fixer', mascot: 'fixer', task: 'Find and fix small mistakes in the writing.', transform: fixerTransform },
  { id: 'build', name: 'The Builder', mascot: 'builder', task: 'Write a helpful overview of the project.', transform: builderTransform },
  { id: 'polish', name: 'The Polisher', mascot: 'polisher', task: 'Tidy up spacing and formatting.', transform: polisherTransform },
];

// --- Artifacts helpers ----------------------------------------------------

function safeName(name) {
  return String(name || 'my-project').toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'my-project';
}

// The repo name is a safe slug; the display name is the user's exact text,
// kept in the repo description so it survives reloads on any device.
const GENERIC_DESCRIPTIONS = new Set(['Yourkly project', 'Yourkly Artifacts demo project']);
function displayNameOf(info, fallback) {
  const d = info && typeof info.description === 'string' ? info.description.trim() : '';
  if (d && !GENERIC_DESCRIPTIONS.has(d)) return d;
  return fallback;
}

const isAgentCopy = (name) => name.includes('-agent-');
const isProductProject = (name) => !isAgentCopy(name) && name !== AUTH_REPO;

// --- Email-code sign-in -------------------------------------------------------
// No passwords, no GitHub login. A 6-digit code goes to the email, the user
// types it in, and a session cookie keeps them signed in. Sign-in records
// live in a hidden Artifacts repo (yourkly-signin-data) as three small JSON files:
// codes.json (pending codes), sessions.json (active sessions),
// profiles.json (display name + avatar per account).

const AUTH_REPO = 'yourkly-signin-data';
const CODE_TTL_MS = 10 * 60 * 1000;            // codes work for 10 minutes
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // sessions last 30 days
const SESSION_COOKIE = 'yourkly_session';
const CODE_SEND_LIMIT = 5;                     // max codes per email per hour
const CODE_TRY_LIMIT = 5;                      // max guesses per code

async function sha256hex(s) {
  const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function validEmail(s) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(s || ''));
}

function randomCode() {
  const a = new Uint32Array(1);
  crypto.getRandomValues(a);
  return String(100000 + (a[0] % 900000));
}

function getCookie(request, name) {
  const h = request.headers.get('Cookie') || '';
  const parts = h.split(';');
  for (const p of parts) {
    const i = p.indexOf('=');
    if (i < 0) continue;
    if (p.slice(0, i).trim() === name) return decodeURIComponent(p.slice(i + 1).trim());
  }
  return '';
}

async function getSessionEmail(request, env) {
  const token = getCookie(request, SESSION_COOKIE);
  if (!token) return null;
  // No in-memory cache: worker isolates do not share memory, so a cached
  // session would survive sign-out on another isolate.
  try {
    const repo = await authRepo(env);
    const sessions = await readAuthJson(repo, 'sessions.json');
    const s = sessions[token];
    if (!s || s.expiresAt <= Date.now()) return null;
    return s.email;
  } catch { return null; }
}

async function authRepo(env) {
  try {
    const repo = await env.ARTIFACTS.get(AUTH_REPO);
    await repo.info();
    return repo;
  } catch { /* create below */ }
  const created = await env.ARTIFACTS.create(AUTH_REPO, {
    description: 'Yourkly sign-in data',
    setDefaultBranch: 'main',
  });
  await pushInitialFiles({
    remote: created.remote, token: created.token,
    files: { 'codes.json': '{}', 'sessions.json': '{}', 'profiles.json': '{}' },
    message: 'Set up sign-in storage',
  });
  return env.ARTIFACTS.get(AUTH_REPO);
}

async function readAuthJson(repo, name) {
  const t = await readFileAt(repo, 'main', name);
  try { return t ? JSON.parse(t) : {}; } catch { return {}; }
}

// Read-modify-write for the auth files, with one retry on push conflict.
// Expired codes and sessions are pruned on every write, as are stale
// rate-limit buckets (see hitRateLimit below).
const AUTH_FILES = ['codes.json', 'sessions.json', 'profiles.json', 'ratelimits.json'];
const RL_PRUNE_WINDOW_MS = 60 * 60 * 1000; // longest rate-limit window; prune cutoff
async function authWrite(env, mutate, message) {
  for (let attempt = 0; attempt < 2; attempt++) {
    const repo = await authRepo(env);
    const log = await repo.log({ ref: 'main', limit: 1 }).catch(() => []);
    const baseSha = (Array.isArray(log) && log[0] && log[0].hash) || null;
    const codes = await readAuthJson(repo, 'codes.json');
    const sessions = await readAuthJson(repo, 'sessions.json');
    const profiles = await readAuthJson(repo, 'profiles.json');
    const ratelimits = await readAuthJson(repo, 'ratelimits.json');
    const now = Date.now();
    for (const k of Object.keys(codes)) if (codes[k].expiresAt <= now) delete codes[k];
    for (const k of Object.keys(sessions)) if (sessions[k].expiresAt <= now) delete sessions[k];
    for (const k of Object.keys(ratelimits)) {
      const hits = Array.isArray(ratelimits[k]) ? ratelimits[k].filter((t) => now - t < RL_PRUNE_WINDOW_MS) : [];
      if (hits.length) ratelimits[k] = hits; else delete ratelimits[k];
    }
    const draft = { codes: { ...codes }, sessions: { ...sessions }, profiles: { ...profiles }, ratelimits: { ...ratelimits } };
    mutate(draft);
    const creds = await pushCreds(env, AUTH_REPO);
    const baseFiles = { 'codes.json': JSON.stringify(codes), 'sessions.json': JSON.stringify(sessions), 'profiles.json': JSON.stringify(profiles), 'ratelimits.json': JSON.stringify(ratelimits) };
    const changes = { 'codes.json': JSON.stringify(draft.codes), 'sessions.json': JSON.stringify(draft.sessions), 'profiles.json': JSON.stringify(draft.profiles), 'ratelimits.json': JSON.stringify(draft.ratelimits) };
    try {
      if (baseSha) {
        await pushChanges({ remote: creds.remote, token: creds.token, baseSha, baseFiles, changes, message });
      } else {
        await pushInitialFiles({ remote: creds.remote, token: creds.token, files: changes, message });
      }
      return;
    } catch (e) { if (attempt === 1) throw e; }
  }
}

// --- Per-IP rate limits ------------------------------------------------------
// Counters live in the hidden sign-in repo (ratelimits.json) so every worker
// isolate shares the same counts. Best-effort by design: if the counter write
// fails or conflicts, the request is allowed through rather than failed,
// because a broken limiter must not break the app.
function clientIp(request) {
  const fwd = request.headers.get('X-Forwarded-For') || '';
  return request.headers.get('CF-Connecting-IP') || fwd.split(',')[0].trim() || 'unknown';
}

async function hitRateLimit(env, request, bucket, limit, windowMs) {
  const key = bucket + '|' + clientIp(request);
  const now = Date.now();
  let allowed = true;
  try {
    await authWrite(env, (draft) => {
      const rl = draft.ratelimits || {};
      const hits = (Array.isArray(rl[key]) ? rl[key] : []).filter((t) => now - t < windowMs);
      if (hits.length >= limit) { allowed = false; }
      else { hits.push(now); rl[key] = hits; }
      draft.ratelimits = rl;
    }, 'Rate limit ' + bucket);
  } catch { /* fail open: a broken limiter must not break the app */ }
  return allowed;
}

function tooManyRequests(what) {
  return json({ error: 'Too many ' + what + ' in a short time. Wait a little while and try again.' }, 429);
}

async function getEmailHash12(request, env) {
  const email = await getSessionEmail(request, env);
  if (!email) return null;
  return (await sha256hex(email)).slice(0, 12);
}

// A project belongs to a signed-in email when its repo name carries that
// email's prefix. Repos without a prefix are the anonymous workspace and
// stay visible exactly as before.
function projectVisible(name, hash12) {
  const m = name.match(/^u-([0-9a-f]{12})-/);
  if (!m) return true;
  return !!hash12 && m[1] === hash12;
}

function repoNameForProject(displayName, hash12, existing) {
  const prefix = hash12 ? 'u-' + hash12 + '-' : '';
  const base = safeName(displayName);
  let safe = prefix + base;
  let n = 2;
  while (existing.has(safe)) safe = prefix + base + '-' + (n++);
  return safe;
}

function sessionCookieHeader(token, maxAgeSecs) {
  return `${SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; Max-Age=${maxAgeSecs}; HttpOnly; SameSite=Lax; Secure`;
}

// Sends the code email through Resend when a key is configured. The key is
// never logged or exposed. Returns { sent: true } or { sent: false }.
async function sendCodeEmail(env, email, code) {
  const key = env.RESEND_API_KEY;
  if (!key) return { sent: false };
  const from = env.AUTH_FROM_EMAIL || 'Yourkly <hello@yourkly.com>';
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from,
        to: email,
        subject: 'Your Yourkly sign-in code',
        text: 'Your Yourkly sign-in code is ' + code + '. Type it in within 10 minutes to sign in. If you did not ask for this code, just ignore this email.',
      }),
    });
    return { sent: r.ok };
  } catch { return { sent: false }; }
}

async function listRepos(env) {
  const res = await env.ARTIFACTS.list();
  if (Array.isArray(res)) return res;
  if (res && Array.isArray(res.repositories)) return res.repositories;
  if (res && Array.isArray(res.repos)) return res.repos;
  return [];
}

function repoNameOf(r) {
  return typeof r === 'string' ? r : (r.name || r.repository || '');
}

// Log entries look like: { hash, treeHash, message, parents, authoredAt, committedAt }
// (times are epoch seconds). readTree returns [{ name, mode, hash, type: 'blob'|'tree' }].
// readFile returns a MIME-typed Blob (or null).

// Resolve the tree hash for a ref via its newest log entry.
async function treeHashForRef(repo, ref) {
  const log = await repo.log({ ref, limit: 1 }).catch(() => []);
  const e = (Array.isArray(log) ? log : [])[0];
  return (e && e.treeHash) || null;
}

// readFile returns a MIME-typed Blob (or null). Decode it as text.
async function readFileAt(repo, ref, path) {
  const f = await repo.readFile({ ref, path }).catch(() => null);
  if (f === null || f === undefined) return '';
  if (typeof f === 'string') return f;
  if (typeof f.text === 'function') return await f.text();
  if (f.content !== undefined) return String(f.content);
  return '';
}

// Read every text file in a repo at a given save point.
async function readAllFiles(env, repoName, ref) {
  const repo = await env.ARTIFACTS.get(repoName);
  const treeHash = await treeHashForRef(repo, ref);
  if (!treeHash) return {};
  const tree = await repo.readTree(treeHash).catch(() => []);
  const entries = Array.isArray(tree) ? tree : [];
  const files = {};
  for (const e of entries) {
    if (!e.name || e.type === 'tree') continue;
    try { files[e.name] = await readFileAt(repo, ref, e.name); } catch { /* unreadable file, skip */ }
  }
  return files;
}

function savePointOf(e) {
  if (!e) return null;
  const secs = e.committedAt || e.authoredAt || null;
  return { sha: e.hash || '', label: e.message || 'Saved version', time: secs ? secs * 1000 : null };
}

async function latestSavePoint(env, repoName) {
  const repo = await env.ARTIFACTS.get(repoName);
  const log = await repo.log({ ref: 'main', limit: 1 }).catch(() => []);
  return savePointOf((Array.isArray(log) ? log : [])[0]);
}

async function savePointHistory(env, repoName) {
  const repo = await env.ARTIFACTS.get(repoName);
  const log = await repo.log({ ref: 'main', limit: 50 });
  const entries = Array.isArray(log) ? log : [];
  return entries.map(savePointOf).filter((s) => s && s.sha);
}

// Credentials for pushing via the git protocol: remote URL from info(),
// short-lived write token from createToken(). env.ARTIFACTS.get() returns an
// RPC handle, not metadata, so .remote/.token on it are not usable.
async function pushCreds(env, name) {
  const repo = await env.ARTIFACTS.get(name);
  const info = await repo.info();
  const tok = await repo.createToken('write', 3600);
  const token = typeof tok === 'string' ? tok : (tok.plaintext || tok.token || '');
  return { remote: info.remote, token };
}

function json(data, status = 200) {  return Response.json(data, { status });
}

// --- GitHub migration helpers ---------------------------------------------
// No GitHub login anywhere. The user pastes a public repo link; we fetch the
// public tarball from codeload.github.com and bring the whole project over.

const IMPORT_MAX_TARBALL = 50 * 1024 * 1024; // 50MB download cap
const IMPORT_MAX_FILES = 2000;               // file-count cap
const IMPORT_MAX_FILE = 5 * 1024 * 1024;     // per-file cap; bigger files are left behind

function parseGitHubLink(link) {
  let s = String(link || '').trim();
  if (!s) return null;
  s = s.replace(/^[a-z][a-z0-9+.-]*:\/\//i, '').replace(/^www\./i, '');
  if (s.toLowerCase().startsWith('github.com/')) s = s.slice('github.com/'.length);
  s = s.split(/[?#]/)[0].replace(/\/+$/, '').replace(/\.git$/i, '');
  const m = s.match(/^([A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?)\/([A-Za-z0-9_.-]+)(?:\/.*)?$/);
  if (!m || !m[1] || !m[2] || m[2].toLowerCase() === 'github.com') return null;
  return { owner: m[1], repo: m[2] };
}

function importError(message, status) {
  const e = new Error(message);
  e.status = status;
  return e;
}

async function fetchRepoTarball(owner, repo) {
  const url = `https://codeload.github.com/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/tar.gz/HEAD`;
  let res;
  try {
    res = await fetch(url, { headers: { 'User-Agent': 'yourkly-artifacts-import' }, redirect: 'follow' });
  } catch {
    throw importError('Could not reach GitHub. Check your connection and try again.', 502);
  }
  if (res.status === 404) {
    throw importError('That repo is private or does not exist. Only public repos can be brought over right now.', 404);
  }
  if (!res.ok) {
    throw importError('GitHub did not answer. Check the link and try again.', 502);
  }
  const len = Number(res.headers.get('content-length') || 0);
  if (len > IMPORT_MAX_TARBALL) {
    throw importError('That project is too big to bring over right now. Try a smaller one.', 422);
  }
  const buf = new Uint8Array(await res.arrayBuffer());
  if (buf.length > IMPORT_MAX_TARBALL) {
    throw importError('That project is too big to bring over right now. Try a smaller one.', 422);
  }
  return buf;
}

async function gunzipData(data) {
  const ds = new DecompressionStream('gzip');
  const w = ds.writable.getWriter();
  await w.write(data);
  await w.close();
  const chunks = [];
  for await (const c of ds.readable) chunks.push(c);
  const total = chunks.reduce((n, c) => n + c.length, 0);
  const out = new Uint8Array(total);
  let o = 0;
  for (const c of chunks) { out.set(c, o); o += c.length; }
  return out;
}

// Minimal tar reader: regular files only, first path segment (the
// "<repo>-HEAD" wrapper) stripped. Returns { files, skippedLarge }.
function parseTarFiles(data) {
  const files = {};
  let skippedLarge = 0;
  const td = new TextDecoder();
  const clean = (b) => td.decode(b).replace(/\0[\s\S]*$/, '');
  let o = 0;
  let prefix = null;
  let longName = null;
  while (o + 512 <= data.length) {
    const h = data.subarray(o, o + 512);
    let allZero = true;
    for (let i = 0; i < 512; i++) { if (h[i] !== 0) { allZero = false; break; } }
    if (allZero) break;
    let name = clean(h.subarray(0, 100));
    const pfx = clean(h.subarray(345, 500));
    if (pfx) name = pfx + '/' + name;
    const sizeStr = clean(h.subarray(124, 136)).trim();
    const size = sizeStr ? parseInt(sizeStr, 8) : 0;
    const type = String.fromCharCode(h[156]);
    const dataStart = o + 512;
    o = dataStart + Math.ceil(size / 512) * 512;
    if (type === 'L') {
      longName = clean(data.subarray(dataStart, dataStart + size));
      continue;
    }
    if (type === '5' || name.endsWith('/')) continue; // directory
    const full = longName || name;
    longName = null;
    if (type !== '0' && type !== '\0' && type !== '' && type !== ' ') continue; // symlink, etc.
    const parts = full.split('/');
    if (prefix === null) prefix = parts[0];
    const rel = parts.slice(1).join('/');
    if (!rel || rel.startsWith('.git/')) continue;
    if (size > IMPORT_MAX_FILE) { skippedLarge++; continue; }
    if (Object.keys(files).length >= IMPORT_MAX_FILES) {
      throw importError('That project has too many files to bring over right now. Try a smaller one.', 422);
    }
    files[rel] = data.slice(dataStart, dataStart + size);
  }
  return { files, skippedLarge };
}

// --- Security headers ----------------------------------------------------------
// Stamped on every response, pages and API alike. The app serves only its own
// inline code and images, so the content policy stays strict: same-origin and
// inline only, no framing, no sniffing.
const SECURITY_HEADERS = {
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy': "default-src 'self'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
};

function withSecurityHeaders(res) {
  const headers = new Headers(res.headers);
  for (const [k, v] of Object.entries(SECURITY_HEADERS)) headers.set(k, v);
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers });
}

async function handleFetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    if (path === '/' && method === 'GET') {
      return new Response(renderLanding(), { headers: { 'Content-Type': 'text/html;charset=utf-8' } });
    }

    if (path === '/app' && method === 'GET') {
      return new Response(renderApp(), { headers: { 'Content-Type': 'text/html;charset=utf-8' } });
    }

    if (path === '/api/health' && method === 'GET') {
      return json({ ok: true, service: 'yourkly-artifacts', time: new Date().toISOString() });
    }

    // --- Sign-in (email code, no passwords) ----------------------------------
    if (path === '/api/auth/send-code' && method === 'POST') {
      try {
        const body = await request.json().catch(() => ({}));
        const email = String(body.email || '').trim().toLowerCase();
        if (!validEmail(email)) {
          return json({ error: 'That does not look like an email address. Check it and try again.' }, 400);
        }
        const key = await sha256hex(email);
        const repo = await authRepo(env);
        const codes = await readAuthJson(repo, 'codes.json');
        const now = Date.now();
        const prev = codes[key];
        const recent = prev && Array.isArray(prev.sent) ? prev.sent.filter((t) => now - t < 3600000) : [];
        if (recent.length >= CODE_SEND_LIMIT) {
          return json({ error: 'Too many codes sent to that email. Wait a little while and try again.' }, 429);
        }
        const code = randomCode();
        await authWrite(env, (draft) => {
          draft.codes[key] = {
            email, code, attempts: 0,
            sent: [...recent, now],
            expiresAt: now + CODE_TTL_MS,
          };
        }, 'Sign-in code sent');
        const sentRes = await sendCodeEmail(env, email, code);
        if (sentRes.sent) return json({ ok: true, emailSent: true });
        // Local-dev-only gate: the code is echoed back in the API response
        // ONLY when the AUTH_DEV_BYPASS flag is explicitly enabled, which is
        // for automated tests on a non-production worker. It must never be
        // set in production. The old example.com shortcut is gone: test
        // addresses now get the same response as everyone else, so no code
        // can be minted without access to the inbox.
        if (env.AUTH_DEV_BYPASS === '1') {
          return json({ ok: true, emailSent: false, devCode: code, devNote: 'Development bypass: email sending is not set up.' });
        }
        return json({ ok: true, emailSent: false });
      } catch (e) {
        return json({ error: 'Could not send the code. Try again in a bit.' }, 500);
      }
    }

    if (path === '/api/auth/verify-code' && method === 'POST') {
      try {
        const body = await request.json().catch(() => ({}));
        const email = String(body.email || '').trim().toLowerCase();
        const code = String(body.code || '').trim();
        if (!validEmail(email) || !code) {
          return json({ error: 'Type the code from the email.' }, 400);
        }
        const key = await sha256hex(email);
        const repo = await authRepo(env);
        const codes = await readAuthJson(repo, 'codes.json');
        const rec = codes[key];
        if (!rec) {
          return json({ error: 'No code was sent to that email. Send one first.' }, 400);
        }
        if (Date.now() > rec.expiresAt) {
          await authWrite(env, (draft) => { delete draft.codes[key]; }, 'Expired code cleared');
          return json({ error: 'That code expired. Send a new one.' }, 400);
        }
        if ((rec.attempts || 0) >= CODE_TRY_LIMIT) {
          return json({ error: 'Too many tries. Send a new code.' }, 400);
        }
        if (rec.code !== code) {
          await authWrite(env, (draft) => {
            if (draft.codes[key]) draft.codes[key].attempts = (draft.codes[key].attempts || 0) + 1;
          }, 'Wrong code tried');
          return json({ error: 'That code does not match. Check the email and try again.' }, 400);
        }
        const token = crypto.randomUUID();
        let needsProfile = true;
        await authWrite(env, (draft) => {
          delete draft.codes[key];
          draft.sessions[token] = { email, createdAt: Date.now(), expiresAt: Date.now() + SESSION_TTL_MS };
          needsProfile = !draft.profiles[key];
        }, 'Signed in');
        return new Response(JSON.stringify({ ok: true, email, needsProfile }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Set-Cookie': sessionCookieHeader(token, Math.floor(SESSION_TTL_MS / 1000)),
          },
        });
      } catch (e) {
        return json({ error: 'Could not check the code. Try again in a bit.' }, 500);
      }
    }

    if (path === '/api/auth/sign-out' && method === 'POST') {
      try {
        const token = getCookie(request, SESSION_COOKIE);
        if (token) {
          await authWrite(env, (draft) => { delete draft.sessions[token]; }, 'Signed out');
        }
        return new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Set-Cookie': sessionCookieHeader('', 0),
          },
        });
      } catch (e) {
        return json({ error: 'Could not sign out. Try again.' }, 500);
      }
    }

    if (path === '/api/auth/me' && method === 'GET') {
      const email = await getSessionEmail(request, env);
      if (!email) return json({ email: null, profile: null });
      const key = await sha256hex(email);
      try {
        const repo = await authRepo(env);
        const profiles = await readAuthJson(repo, 'profiles.json');
        return json({ email, profile: profiles[key] || null });
      } catch {
        return json({ email, profile: null });
      }
    }

    // Save or update the signed-in user's profile (display name + avatar).
    const AVATARS = ['stork', 'initial'];
    if (path === '/api/auth/profile' && method === 'POST') {
      try {
        const email = await getSessionEmail(request, env);
        if (!email) return json({ error: 'Sign in first.' }, 401);
        const body = await request.json().catch(() => ({}));
        const displayName = String(body.displayName || '').trim().slice(0, 40);
        const avatar = AVATARS.includes(body.avatar) ? body.avatar : 'stork';
        if (!displayName) {
          return json({ error: 'Tell us what to call you.' }, 400);
        }
        const key = await sha256hex(email);
        const profile = { displayName, avatar };
        await authWrite(env, (draft) => { draft.profiles[key] = profile; }, 'Profile saved');
        return json({ ok: true, profile });
      } catch (e) {
        return json({ error: 'Could not save your profile. Try again.' }, 500);
      }
    }

    // --- Projects ------------------------------------------------------
    if (path === '/api/projects' && method === 'GET') {
      try {
        const hash12 = await getEmailHash12(request, env);
        const repos = (await listRepos(env)).map(repoNameOf)
          .filter(isProductProject)
          .filter((name) => projectVisible(name, hash12));
        // One log call per repo (limit 50); latest is entries[0]. All repos in parallel.
        const projects = await Promise.all(repos.map(async (name) => {
          try {
            const repo = await env.ARTIFACTS.get(name);
            const [log, info] = await Promise.all([
              repo.log({ ref: 'main', limit: 50 }).catch(() => []),
              repo.info().catch(() => ({})),
            ]);
            const entries = (Array.isArray(log) ? log : []).map(savePointOf).filter((s) => s && s.sha);
            const latest = entries[0] || null;
            return {
              name,
              displayName: displayNameOf(info, name),
              lastSaved: latest ? latest.label : 'No versions yet',
              lastTime: latest ? latest.time : null,
              savePoints: entries.length,
            };
          } catch { return { name, displayName: name, lastSaved: 'No versions yet', lastTime: null, savePoints: 0 }; }
        }));
        return json({ projects });
      } catch (e) {
        return json({ error: 'Could not list projects: ' + (e.message || e) }, 500);
      }
    }

    if (path === '/api/projects' && method === 'POST') {
      try {
        if (!(await hitRateLimit(env, request, 'create-project', 20, 60 * 60 * 1000))) {
          return tooManyRequests('new projects');
        }
        const { name } = await request.json();
        const displayName = String(name || 'my-project').trim().slice(0, 60) || 'my-project';
        const hash12 = await getEmailHash12(request, env);
        const safe = repoNameForProject(displayName, hash12, new Set());
        try { await env.ARTIFACTS.delete(safe); } catch { /* fresh start */ }
        const created = await env.ARTIFACTS.create(safe, {
          description: displayName,
          setDefaultBranch: 'main',
        });
        const sha = await pushCommit({
          remote: created.remote, token: created.token,
          ref: 'refs/heads/main', parentSha: null,
          files: STARTER_FILES, message: 'First version of the project',
        });
        return json({ name: created.name, displayName, sha });
      } catch (e) {
        return json({ error: 'Could not start the project: ' + (e.message || e) }, 500);
      }
    }

    // --- Bring a project over from GitHub (migration, no login) --------------
    if (path === '/api/import' && method === 'POST') {
      try {
        const { link } = await request.json();
        const parsed = parseGitHubLink(link);
        if (!parsed) {
          return json({ error: 'That does not look like a GitHub link. Try something like github.com/someone/their-project.' }, 400);
        }
        if (!(await hitRateLimit(env, request, 'import', 10, 60 * 60 * 1000))) {
          return tooManyRequests('project imports');
        }
        const tarball = await fetchRepoTarball(parsed.owner, parsed.repo);
        const tar = await gunzipData(tarball);
        const { files, skippedLarge } = parseTarFiles(tar);
        const names = Object.keys(files);
        if (names.length === 0) {
          return json({ error: 'That project came over empty. There were no files to bring in.' }, 422);
        }
        const existing = new Set((await listRepos(env)).map(repoNameOf));
        const hash12 = await getEmailHash12(request, env);
        const safe = repoNameForProject(parsed.repo, hash12, existing);
        const displayName = parsed.repo.slice(0, 60);
        const created = await env.ARTIFACTS.create(safe, {
          description: displayName,
          setDefaultBranch: 'main',
        });
        const sha = await pushCommit({
          remote: created.remote, token: created.token,
          ref: 'refs/heads/main', parentSha: null,
          files, message: 'Brought over from GitHub',
        });
        return json({ name: created.name, displayName, files: names.length, skippedLarge, sha });
      } catch (e) {
        return json({ error: e.message || 'Could not bring that project over.' }, e.status || 500);
      }
    }

    const projectMatch = path.match(/^\/api\/projects\/([^/]+)(\/.*)?$/);
    if (projectMatch) {
      const name = decodeURIComponent(projectMatch[1]);
      const rest = projectMatch[2] || '';
      const hash12 = await getEmailHash12(request, env);
      if (name === AUTH_REPO || !projectVisible(name, hash12)) {
        return json({ error: 'That project is not in your workspace.' }, 404);
      }

      // Open a project: files + save point history.
      if (rest === '' && method === 'GET') {
        try {
          const files = await readAllFiles(env, name, 'main');
          const savePoints = await savePointHistory(env, name);
          const repo = await env.ARTIFACTS.get(name);
          const info = await repo.info().catch(() => ({}));
          return json({ name, displayName: displayNameOf(info, name), files: Object.keys(files).sort(), savePoints });
        } catch (e) {
          return json({ error: 'Could not open the project: ' + (e.message || e) }, 500);
        }
      }

      // Read one file, optionally at an older save point.
      if (rest === '/file' && method === 'GET') {
        try {
          const filePath = url.searchParams.get('path');
          const ref = url.searchParams.get('ref') || 'main';
          if (!filePath) return json({ error: 'Missing file path' }, 400);
          const repo = await env.ARTIFACTS.get(name);
          const content = await readFileAt(repo, ref, filePath);
          return json({ path: filePath, content });
        } catch (e) {
          return json({ error: 'Could not read the file: ' + (e.message || e) }, 500);
        }
      }

      // Save a file (creates a new save point).
      if (rest === '/files' && method === 'POST') {
        try {
          const { path: filePath, content, label, remove } = await request.json();
          if (!filePath) return json({ error: 'Missing file path' }, 400);
          if (!(await hitRateLimit(env, request, 'save-file', 200, 60 * 60 * 1000))) {
            return tooManyRequests('file saves');
          }
          const repo = await env.ARTIFACTS.get(name);
          const latest = await latestSavePoint(env, name);
          const files = await readAllFiles(env, name, 'main');
          if (remove) delete files[filePath];
          else files[filePath] = String(content ?? '');
          const { remote, token } = await pushCreds(env, name);
          const sha = await pushCommit({
            remote, token,
            ref: 'refs/heads/main', parentSha: latest ? latest.sha : null,
            files, message: label || `Saved ${filePath}`,
          });
          return json({ sha });
        } catch (e) {
          return json({ error: 'Could not save: ' + (e.message || e) }, 500);
        }
      }

      // Go back to an older save point (restores as a new save point).
      if (rest === '/restore' && method === 'POST') {
        try {
          const { sha, label } = await request.json();
          if (!sha) return json({ error: 'Missing version' }, 400);
          const latest = await latestSavePoint(env, name);
          const files = await readAllFiles(env, name, sha);
          const { remote, token } = await pushCreds(env, name);
          const newSha = await pushCommit({
            remote, token,
            ref: 'refs/heads/main', parentSha: latest ? latest.sha : null,
            files, message: `Went back to: ${label || 'an older version'}`,
          });
          return json({ sha: newSha });
        } catch (e) {
          return json({ error: 'Could not go back to that version: ' + (e.message || e) }, 500);
        }
      }

      // Delete a project and its agent copies.
      if (rest === '' && method === 'DELETE') {
        try {
          const repos = (await listRepos(env)).map(repoNameOf);
          for (const r of repos) {
            if (r === name || r.startsWith(name + '-agent-')) {
              try { await env.ARTIFACTS.delete(r); } catch { /* already gone */ }
            }
          }
          return json({ ok: true });
        } catch (e) {
          return json({ error: 'Could not delete the project: ' + (e.message || e) }, 500);
        }
      }

      // Send in the agents: one copy per agent, working at the same time.
      if (rest === '/agents' && method === 'POST') {
        try {
          const latest = await latestSavePoint(env, name);
          const baseFiles = await readAllFiles(env, name, 'main');
          const base = await env.ARTIFACTS.get(name);
          const agents = [];
          for (const def of AGENT_DEFS) {
            const copyName = `${name}-agent-${def.id}`;
            try { await env.ARTIFACTS.delete(copyName); } catch { /* fresh */ }
            const forked = await base.fork(copyName, {
              description: `${def.name}: ${def.task}`,
              defaultBranchOnly: true,
            });
            const result = def.transform(baseFiles);
            const sha = await pushCommit({
              remote: forked.remote, token: forked.token,
              ref: 'refs/heads/main', parentSha: latest ? latest.sha : null,
              files: result.files, message: def.task,
            });
            agents.push({
              id: def.id, name: def.name, mascot: def.mascot,
              task: def.task, plainChanges: result.plainChanges,
              changed: result.changed, sha, copyName,
            });
          }
          return json({ agents });
        } catch (e) {
          return json({ error: 'Could not send in the agents: ' + (e.message || e) }, 500);
        }
      }

      // List the agent copies for a project.
      if (rest === '/agents' && method === 'GET') {
        try {
          const repos = (await listRepos(env)).map(repoNameOf).filter((r) => r.startsWith(name + '-agent-'));
          const agents = [];
          for (const r of repos) {
            const id = r.slice((name + '-agent-').length);
            const def = AGENT_DEFS.find((d) => d.id === id);
            if (!def) continue;
            const repo = await env.ARTIFACTS.get(r);
            const info = await repo.info().catch(() => ({}));
            agents.push({
              id, name: def.name, mascot: def.mascot, task: def.task,
              description: info.description || def.task, copyName: r,
            });
          }
          return json({ agents });
        } catch (e) {
          return json({ error: 'Could not list the agents: ' + (e.message || e) }, 500);
        }
      }

      // Keep one agent's work: it becomes the project's current version.
      if (rest === '/keep' && method === 'POST') {
        try {
          const { winnerId } = await request.json();
          const def = AGENT_DEFS.find((d) => d.id === winnerId);
          if (!def) return json({ error: 'Unknown helper' }, 400);
          const copyName = `${name}-agent-${winnerId}`;
          const winnerFiles = await readAllFiles(env, copyName, 'main');
          const latest = await latestSavePoint(env, name);
          const { remote, token } = await pushCreds(env, name);
          const sha = await pushCommit({
            remote, token,
            ref: 'refs/heads/main', parentSha: latest ? latest.sha : null,
            files: winnerFiles, message: `Kept ${def.name}'s work: ${def.task}`,
          });
          return json({ ok: true, kept: winnerId, sha });
        } catch (e) {
          return json({ error: 'Could not keep that version: ' + (e.message || e) }, 500);
        }
      }
    }

    // --- Legacy demo routes (used by onboarding + tests) -------------------
    if (path === '/api/demo/project' && method === 'POST') {
      try {
        if (!(await hitRateLimit(env, request, 'demo-project', 20, 60 * 60 * 1000))) {
          return tooManyRequests('new projects');
        }
        const { name } = await request.json();
        const displayName = String(name || 'demo-project').trim().slice(0, 60) || 'demo-project';
        const safe = safeName(displayName);
        for (const n of [safe, ...AGENT_DEFS.map((t) => `${safe}-agent-${t.id}`)]) {
          try { await env.ARTIFACTS.delete(n); } catch { /* did not exist */ }
        }
        const created = await env.ARTIFACTS.create(safe, {
          description: displayName,
          setDefaultBranch: 'main',
        });
        const sha = await pushCommit({
          remote: created.remote, token: created.token,
          ref: 'refs/heads/main', parentSha: null,
          files: STARTER_FILES, message: 'First version of the project',
        });
        return json({ name: created.name, displayName, remote: created.remote, token: created.token, sha });
      } catch (e) {
        return json({ error: 'Could not start the project: ' + (e.message || e) }, 500);
      }
    }

    if (path === '/api/demo/agents' && method === 'POST') {
      try {
        const { project } = await request.json();
        const latest = await latestSavePoint(env, project);
        const baseFiles = await readAllFiles(env, project, 'main');
        const base = await env.ARTIFACTS.get(project);
        const forks = [];
        for (const def of AGENT_DEFS) {
          const copyName = `${project}-agent-${def.id}`;
          const forked = await base.fork(copyName, {
            description: `${def.name}: ${def.task}`,
            defaultBranchOnly: true,
          });
          const result = def.transform(baseFiles);
          const sha = await pushCommit({
            remote: forked.remote, token: forked.token,
            ref: 'refs/heads/main', parentSha: latest ? latest.sha : null,
            files: result.files, message: def.task,
          });
          forks.push({
            id: def.id, name: copyName, label: def.name, task: def.task,
            plainChanges: result.plainChanges, sha, mascot: def.mascot,
          });
        }
        return json({ forks });
      } catch (e) {
        return json({ error: 'Could not send in the agents: ' + (e.message || e) }, 500);
      }
    }

    if (path === '/api/demo/keep' && method === 'POST') {
      try {
        const { project, winnerId } = await request.json();
        const def = AGENT_DEFS.find((d) => d.id === winnerId);
        if (!def) return json({ error: 'Unknown helper' }, 400);
        const winnerFiles = await readAllFiles(env, `${project}-agent-${winnerId}`, 'main');
        const latest = await latestSavePoint(env, project);
        const { remote, token } = await pushCreds(env, project);
        const sha = await pushCommit({
          remote, token,
          ref: 'refs/heads/main', parentSha: latest ? latest.sha : null,
          files: winnerFiles, message: `Kept ${def.name}'s work: ${def.task}`,
        });
        return json({ ok: true, kept: winnerId, sha });
      } catch (e) {
        return json({ error: 'Could not keep that version: ' + (e.message || e) }, 500);
      }
    }

    return json({ error: 'Not found' }, 404);
}

export default {
  async fetch(request, env) {
    return withSecurityHeaders(await handleFetch(request, env));
  },
};
