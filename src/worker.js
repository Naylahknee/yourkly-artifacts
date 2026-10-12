// Yourkly on Artifacts: plain-language version control for the agentic era.
// Contest entry for Cloudflare's "next Git platform" competition.
import { renderUI } from './ui.js';
import { pushInitialFiles, pushChanges, pushWinnerToMain } from './gitops.js';

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
  'AGENTS.md': `# Instructions for helpers working on this project

- This is a small demo website.
- Keep changes small and focused.
- Write in plain language, no jargon.
`,
};

// The three agents and what each one is asked to do.
const AGENT_TASKS = [
  {
    id: 'fix', label: 'Agent 1, the Fixer', task: 'Fix the typo on the homepage.',
    plainChanges: 'Fixed the typo on the homepage. "Welcom" became "Welcome".',
    files: {
      'index.html': `<!doctype html>
<html>
<head><meta charset="utf-8"><title>My Site</title><link rel="stylesheet" href="style.css"></head>
<body>
<h1>Welcome to my site</h1>
<p>This is the homepage of my demo project.</p>
</body>
</html>
`,
      'TASK.md': `# My task\n\nFix the typo on the homepage. "Welcom" should be "Welcome".\n`,
    },
  },
  {
    id: 'build', label: 'Agent 2, the Builder', task: 'Add a features section to the homepage.',
    plainChanges: 'Added a features section to the homepage with three bullet points.',
    files: {
      'index.html': `<!doctype html>
<html>
<head><meta charset="utf-8"><title>My Site</title><link rel="stylesheet" href="style.css"></head>
<body>
<h1>Welcom to my site</h1>
<p>This is the homepage of my demo project.</p>
<h2>Features</h2>
<ul>
<li>Fast to load</li>
<li>Easy to read</li>
<li>Simple to change</li>
</ul>
</body>
</html>
`,
      'TASK.md': `# My task\n\nAdd a features section to the homepage listing three things this site does well.\n`,
    },
  },
  {
    id: 'polish', label: 'Agent 3, the Polisher', task: 'Improve the page styling.',
    plainChanges: 'Improved the styling: warmer background, better spacing, easier to read.',
    files: {
      'style.css': `body { font-family: Georgia, serif; margin: 40px; background: #fdf6ec; color: #3a3a3a; line-height: 1.7; }
h1 { color: #1a1a1a; }
`,
      'TASK.md': `# My task\n\nImprove the page styling so it feels warmer and is easier to read.\n`,
    },
  },
];

function json(data, status = 200) {
  return Response.json(data, { status });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (path === '/' && request.method === 'GET') {
      return new Response(renderUI(), { headers: { 'Content-Type': 'text/html;charset=utf-8' } });
    }

    if (path === '/api/health' && request.method === 'GET') {
      return json({ ok: true, service: 'yourkly-artifacts', time: new Date().toISOString() });
    }

    // Step 1: create the project repo and save the first version.
    if (path === '/api/demo/project' && request.method === 'POST') {
      try {
        const { name } = await request.json();
        const safe = String(name || 'demo-project').toLowerCase().replace(/[^a-z0-9-]/g, '-').slice(0, 40) || 'demo-project';
        // Clean slate for repeat demos.
        for (const n of [safe, ...AGENT_TASKS.map(t => `${safe}-agent-${t.id}`)]) {
          try { await env.ARTIFACTS.delete(n); } catch { /* did not exist */ }
        }
        const created = await env.ARTIFACTS.create(safe, {
          description: 'Yourkly Artifacts demo project',
          setDefaultBranch: 'main',
        });
        const sha = await pushInitialFiles({
          remote: created.remote, token: created.token,
          files: STARTER_FILES, message: 'First version of the project',
        });
        return json({ name: created.name, remote: created.remote, token: created.token, sha });
      } catch (e) {
        return json({ error: 'Could not start the project: ' + (e.message || e) }, 500);
      }
    }

    // Step 2: fork once per agent and let each agent save its work.
    if (path === '/api/demo/agents' && request.method === 'POST') {
      try {
        const { project, token, baseSha } = await request.json();
        const base = await env.ARTIFACTS.get(project);
        const forks = [];
        for (const t of AGENT_TASKS) {
          const forkName = `${project}-agent-${t.id}`;
          const forked = await base.fork(forkName, {
            description: `${t.label}: ${t.task}`,
            defaultBranchOnly: true,
          });
          const fullFiles = { ...STARTER_FILES, ...t.files };
          const sha = await pushChanges({
            remote: forked.remote, token: forked.token,
            baseSha: baseSha, baseFiles: STARTER_FILES, changes: t.files,
            message: t.task,
          });
          forks.push({
            id: t.id, name: forkName, label: t.label, task: t.task,
            plainChanges: t.plainChanges, sha,
          });
        }
        return json({ forks });
      } catch (e) {
        return json({ error: 'Could not send in the agents: ' + (e.message || e) }, 500);
      }
    }

    // Step 4: keep the winner. Their work becomes the project's main version.
    if (path === '/api/demo/keep' && request.method === 'POST') {
      try {
        const { remote, token, projectSha, winnerId } = await request.json();
        const winner = AGENT_TASKS.find(t => t.id === winnerId);
        if (!winner) return json({ error: 'Unknown agent' }, 400);
        const winnerFiles = { ...STARTER_FILES, ...winner.files };
        const sha = await pushWinnerToMain({
          projectRemote: remote,
          projectToken: token, projectSha,
          winnerFiles, winnerMessage: 'Kept ' + winner.label + ': ' + winner.task,
        });
        return json({ ok: true, kept: winnerId, sha });
      } catch (e) {
        return json({ error: 'Could not keep that version: ' + (e.message || e) }, 500);
      }
    }

    return json({ error: 'Not found' }, 404);
  },
};
