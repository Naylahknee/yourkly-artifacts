// Yourkly on Artifacts: plain-language version control for the agentic era.
// Full product: projects backed by Artifacts repos, a writing editor,
// labeled save points with history and restore, and AI agents that work
// on their own copies. No git jargon anywhere the user can see.
import { renderLanding, renderApp } from './ui.js';
import { pushCommit } from './gitmini.js';

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

const isAgentCopy = (name) => name.includes('-agent-');
const isProductProject = (name) => !isAgentCopy(name);

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

export default {
  async fetch(request, env) {
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

    // --- Projects ------------------------------------------------------
    if (path === '/api/projects' && method === 'GET') {
      try {
        const repos = (await listRepos(env)).map(repoNameOf).filter(isProductProject);
        const projects = [];
        for (const name of repos) {
          try {
            const latest = await latestSavePoint(env, name);
            const history = await savePointHistory(env, name);
            projects.push({
              name,
              lastSaved: latest ? latest.label : 'No versions yet',
              lastTime: latest ? latest.time : null,
              savePoints: history.length,
            });
          } catch { projects.push({ name, lastSaved: 'No versions yet', lastTime: null, savePoints: 0 }); }
        }
        return json({ projects });
      } catch (e) {
        return json({ error: 'Could not list projects: ' + (e.message || e) }, 500);
      }
    }

    if (path === '/api/projects' && method === 'POST') {
      try {
        const { name } = await request.json();
        const safe = safeName(name);
        try { await env.ARTIFACTS.delete(safe); } catch { /* fresh start */ }
        const created = await env.ARTIFACTS.create(safe, {
          description: 'Yourkly project',
          setDefaultBranch: 'main',
        });
        const sha = await pushCommit({
          remote: created.remote, token: created.token,
          ref: 'refs/heads/main', parentSha: null,
          files: STARTER_FILES, message: 'First version of the project',
        });
        return json({ name: created.name, sha });
      } catch (e) {
        return json({ error: 'Could not start the project: ' + (e.message || e) }, 500);
      }
    }

    const projectMatch = path.match(/^\/api\/projects\/([^/]+)(\/.*)?$/);
    if (projectMatch) {
      const name = decodeURIComponent(projectMatch[1]);
      const rest = projectMatch[2] || '';

      // Open a project: files + save point history.
      if (rest === '' && method === 'GET') {
        try {
          const files = await readAllFiles(env, name, 'main');
          const savePoints = await savePointHistory(env, name);
          return json({ name, files: Object.keys(files).sort(), savePoints });
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
        const { name } = await request.json();
        const safe = safeName(name || 'demo-project');
        for (const n of [safe, ...AGENT_DEFS.map((t) => `${safe}-agent-${t.id}`)]) {
          try { await env.ARTIFACTS.delete(n); } catch { /* did not exist */ }
        }
        const created = await env.ARTIFACTS.create(safe, {
          description: 'Yourkly Artifacts demo project',
          setDefaultBranch: 'main',
        });
        const sha = await pushCommit({
          remote: created.remote, token: created.token,
          ref: 'refs/heads/main', parentSha: null,
          files: STARTER_FILES, message: 'First version of the project',
        });
        return json({ name: created.name, remote: created.remote, token: created.token, sha });
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
  },
};
