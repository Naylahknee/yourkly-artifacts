// Runnable tests for yourkly-artifacts. Run with: npm test
// Tests the live Worker endpoints. Product tests use a throwaway project
// that is deleted afterwards. The homepage jargon test guards the
// plain-language rule: no git words where the user can see.
import { test } from 'node:test';
import assert from 'node:assert/strict';

const BASE = process.env.TEST_BASE || 'https://yourkly-artifacts.madincrease.workers.dev';

async function api(path, method = 'GET', body) {
  const r = await fetch(BASE + path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const j = await r.json().catch(() => ({}));
  return { status: r.status, json: j };
}

test('health endpoint answers ok', async () => {
  const { status, json } = await api('/api/health');
  assert.equal(status, 200);
  assert.equal(json.ok, true);
  assert.equal(json.service, 'yourkly-artifacts');
});

test('homepage loads with no git jargon', async () => {
  const r = await fetch(BASE + '/');
  assert.equal(r.status, 200);
  const html = await r.text();
  assert.ok(html.includes('Yourkly'), 'mentions Yourkly');
  assert.ok(html.includes('yourkly-stork') || html.includes('brand-stork'), 'shows the stork lockup');
  const lower = html.toLowerCase();
  for (const word of ['\\bcommit\\b', '\\bmerge\\b', '\\brepository\\b', '\\bfork\\b']) {
    assert.ok(!new RegExp(word).test(lower), `homepage should not say "${word}"`);
  }
});

test('workspace lives behind /app', async () => {
  const r = await fetch(BASE + '/app');
  assert.equal(r.status, 200);
  const html = await r.text();
  assert.ok(html.includes('id="app"'), 'app shell present');
  assert.ok(html.includes('app-sidebar'), 'sidebar present');
  assert.ok(html.includes('New project'), 'nav present');
  assert.ok(html.includes('Your work, made clear.'), 'tagline present');
});

test('landing page mirrors the original Yourkly landing', async () => {
  const r = await fetch(BASE + '/');
  const html = await r.text();
  assert.ok(html.includes('Your projects, made clear'), 'original headline present');
  assert.ok(html.includes('Continue with Yourkly'), 'primary button present');
  assert.ok(html.includes('href="/app"'), 'Continue leads to /app');
  assert.ok(html.includes('What to do next'), 'story card present');
  assert.ok(html.includes('Sign in'), 'quiet sign-in present');
});

test('landing page names no tech and no GitHub rows', async () => {
  const r = await fetch(BASE + '/');
  const html = await r.text();
  const textOnly = html.replace(/src="data:[^"]*"/g, '').replace(/href="[^"]*"/g, '');
  const lower = textOnly.toLowerCase();
  for (const word of ['artifact', 'cloudflare', 'worker', 'meet the team', 'start a project']) {
    assert.ok(!lower.includes(word), `landing page should not say "${word}"`);
  }
  assert.ok(!html.includes('Connect GitHub'), 'no Connect GitHub row');
});

test('full product cycle: create, edit, save points, restore, delete', async () => {
  const name = 'test-cycle-' + Date.now().toString(36);

  // create
  let res = await api('/api/projects', 'POST', { name });
  assert.equal(res.status, 200, 'create failed: ' + res.json.error);
  assert.equal(res.json.name, name);

  // listed on the dashboard
  res = await api('/api/projects');
  assert.equal(res.status, 200);
  assert.ok(res.json.projects.some((p) => p.name === name), 'new project appears in listing');

  // open: starter files present, one save point
  res = await api('/api/projects/' + name);
  assert.equal(res.status, 200);
  assert.ok(res.json.files.includes('index.html'), 'starter files present');
  assert.equal(res.json.savePoints.length, 1, 'one save point after creation');

  // edit a file with a label
  res = await api('/api/projects/' + name + '/files', 'POST', {
    path: 'notes.md', content: '# Hello\n\nEdited by the test.\n', label: 'Test edit of notes',
  });
  assert.equal(res.status, 200, 'file save failed: ' + res.json.error);

  // read it back
  res = await api('/api/projects/' + name + '/file?path=' + encodeURIComponent('notes.md'));
  assert.equal(res.status, 200);
  assert.ok(res.json.content.includes('Edited by the test'), 'edited content readable');

  // two save points now
  res = await api('/api/projects/' + name);
  assert.equal(res.json.savePoints.length, 2, 'two save points after edit');
  assert.equal(res.json.savePoints[0].label, 'Test edit of notes');

  // go back to the first version
  const firstSha = res.json.savePoints[1].sha;
  res = await api('/api/projects/' + name + '/restore', 'POST', { sha: firstSha, label: 'First version of the project' });
  assert.equal(res.status, 200, 'restore failed: ' + res.json.error);

  // content is back to the original
  res = await api('/api/projects/' + name + '/file?path=' + encodeURIComponent('notes.md'));
  assert.ok(!res.json.content.includes('Edited by the test'), 'restore brought back the older version');

  // three save points (restore saves as a new version)
  res = await api('/api/projects/' + name);
  assert.equal(res.json.savePoints.length, 3, 'restore adds a save point');

  // delete
  res = await api('/api/projects/' + name, 'DELETE');
  assert.equal(res.status, 200);
  res = await api('/api/projects');
  assert.ok(!res.json.projects.some((p) => p.name === name), 'deleted project gone from listing');
});

test('agents: send in three helpers, compare, keep one', async () => {
  const name = 'test-agents-' + Date.now().toString(36);
  let res = await api('/api/projects', 'POST', { name });
  assert.equal(res.status, 200, 'create failed: ' + res.json.error);

  res = await api('/api/projects/' + name + '/agents', 'POST');
  assert.equal(res.status, 200, 'agents failed: ' + res.json.error);
  assert.equal(res.json.agents.length, 3, 'three agents');
  for (const a of res.json.agents) {
    assert.ok(a.name && a.task && a.plainChanges && a.mascot, 'agent has name, task, plain-words changes, mascot');
    assert.ok(['fixer', 'builder', 'polisher'].includes(a.mascot), 'mascot is one of the three storks');
  }

  // fixer should have fixed the starter typo
  const fixer = res.json.agents.find((a) => a.id === 'fix');
  assert.ok(fixer.plainChanges.includes('Welcom'), 'fixer reports the typo fix in plain words');

  // keep the fixer
  res = await api('/api/projects/' + name + '/keep', 'POST', { winnerId: 'fix' });
  assert.equal(res.status, 200, 'keep failed: ' + res.json.error);
  assert.equal(res.json.kept, 'fix');

  // project now has the fixed homepage
  res = await api('/api/projects/' + name + '/file?path=' + encodeURIComponent('index.html'));
  assert.ok(res.json.content.includes('<h1>Welcome to my site</h1>'), 'kept version is live in the project');

  // cleanup
  await api('/api/projects/' + name, 'DELETE');
});

test('legacy demo flow still works (onboarding)', async () => {
  const name = 'test-demo-' + Date.now().toString(36);
  let res = await api('/api/demo/project', 'POST', { name });
  assert.equal(res.status, 200, 'demo project failed: ' + res.json.error);
  assert.ok(res.json.sha && res.json.sha.length === 40);

  res = await api('/api/demo/agents', 'POST', { project: name });
  assert.equal(res.status, 200, 'demo agents failed: ' + res.json.error);
  assert.equal(res.json.forks.length, 3);

  res = await api('/api/demo/keep', 'POST', { project: name, winnerId: 'build' });
  assert.equal(res.status, 200, 'demo keep failed: ' + res.json.error);

  await api('/api/projects/' + name, 'DELETE');
});
