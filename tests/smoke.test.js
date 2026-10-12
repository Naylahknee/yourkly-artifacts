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
  assert.ok(html.includes('Your work, made clear.'), 'tagline present');
  for (const item of ['My Projects', 'Recent Activity', 'Account', 'Help']) {
    assert.ok(html.includes(item), 'nav has ' + item);
  }
  assert.ok(html.includes('id="drawer"'), 'mobile drawer present');
});

test('app serves every screen group from the page map', async () => {
  const r = await fetch(BASE + '/app');
  const html = await r.text();
  const screens = [
    'My Projects', 'Timeline', 'Account', 'Add a project',
    'Project Home', 'Updates', 'Things to Do', 'What do you want to change?',
    'Project files', 'What changed', 'Restore an earlier version',
    'Separate versions', 'Continue in', 'Who Can See It', 'Project settings',
    'Plain-English glossary', 'When something looks wrong', 'Contact support',
    'How Yourkly works', 'Send in the helpers', 'Keep this one', 'Profile preview',
  ];
  for (const s of screens) {
    assert.ok(html.includes(s), 'screen copy present: ' + s);
  }
});

test('continue-in page is the agreed empty state', async () => {
  const r = await fetch(BASE + '/app');
  const html = await r.text();
  assert.ok(html.includes('Nothing here yet.'), 'continue-in empty state present');
  assert.ok(!html.includes('What Yourkly is packing'), 'no brief-builder UI');
});

test('profile preview view renders the pill', async () => {
  const r = await fetch(BASE + '/app');
  const html = await r.text();
  assert.ok(html.includes('Profile preview'), 'preview page copy present');
  assert.ok(html.includes('pp-pill'), 'pill markup present');
  assert.ok(html.includes('Hello, I'), 'greeting present');
  assert.ok(html.includes('Preview the pill'), 'reachable from the Account page');
  assert.ok(html.includes('profile-preview'), 'view route wired');
});

test('empty-basket mascot wired into the My Projects empty state', async () => {
  const r = await fetch(BASE + '/app');
  const html = await r.text();
  assert.ok(html.includes('IMG_EMPTY_BASKET'), 'empty basket mascot embedded');
  assert.ok(html.includes('Your basket is empty.'), 'empty state headline present');
  assert.ok(html.includes('the stork will carry it home'), 'warm plain-language line present');
});

test('agent mascots appear wherever agents appear', async () => {
  const r = await fetch(BASE + '/app');
  const html = await r.text();
  assert.ok(html.includes('MASCOT_IMG'), 'mascot image map present (data URLs inlined by the bundler)');
  assert.ok(html.includes('IMG_EMPTY_BASKET'), 'empty basket mascot embedded');
  assert.ok(html.includes('mascot-trio'), 'mascot trio on the helpers promo');
  assert.ok(html.includes('mascot--working'), 'working-state mascot animation present');
});

test('upgraded animations present with reduced-motion fallback', async () => {
  const r = await fetch(BASE + '/app');
  const html = await r.text();
  for (const token of ['stork-delivery', 'parcel-drop', 'basket-land', 'mascot-bob', 'shimmer', 'prefers-reduced-motion']) {
    assert.ok(html.includes(token), 'animation token present: ' + token);
  }
});

test('app names no GitHub, no Artifacts, no Cloudflare, no Workers in user text', async () => {
  const r = await fetch(BASE + '/app');
  const html = await r.text();
  const textOnly = html
    .replace(/src="data:[^"]*"/g, '')
    .replace(/href="[^"]*"/g, '')
    .replace(/https:\/\/github\.com\/[A-Za-z0-9/_?=&;.-]*/g, '');
  const lower = textOnly.toLowerCase();
  for (const word of ['github', 'artifact', 'cloudflare', 'worker']) {
    assert.ok(!lower.includes(word), `app should not say "${word}" where the user can see`);
  }
  for (const word of ['\\bcommit\\b', '\\bmerge\\b', '\\brepository\\b', '\\bbranch\\b']) {
    assert.ok(!new RegExp(word).test(lower), `app should not say "${word}"`);
  }
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

test('project name casing is preserved exactly', async () => {
  const input = 'My MiXeD Case Project';
  let res = await api('/api/projects', 'POST', { name: input });
  assert.equal(res.status, 200, 'create failed: ' + res.json.error);
  assert.equal(res.json.displayName, input, 'display name keeps exact casing');
  const slug = res.json.name;
  assert.ok(slug && slug !== input, 'slug is separate from display name');

  // listing returns the exact display name
  res = await api('/api/projects');
  const found = (res.json.projects || []).find((p) => p.name === slug);
  assert.ok(found, 'project appears in listing');
  assert.equal(found.displayName, input, 'listing preserves casing');

  // opening the project returns the exact display name
  res = await api('/api/projects/' + slug);
  assert.equal(res.json.displayName, input, 'open project preserves casing');

  await api('/api/projects/' + slug, 'DELETE');
});

test('keep completes quickly and never hangs', async () => {
  const name = 'test-keep-' + Date.now().toString(36);
  let res = await api('/api/projects', 'POST', { name });
  assert.equal(res.status, 200);
  const slug = res.json.name;

  res = await api('/api/projects/' + slug + '/agents', 'POST');
  assert.equal(res.status, 200);

  const start = Date.now();
  res = await api('/api/projects/' + slug + '/keep', 'POST', { winnerId: 'build' });
  const elapsed = Date.now() - start;
  assert.equal(res.status, 200, 'keep failed: ' + res.json.error);
  assert.ok(elapsed < 60000, 'keep completed in ' + elapsed + 'ms (must not hang)');

  // kept version is current: builder's file exists
  res = await api('/api/projects/' + slug + '/file?path=' + encodeURIComponent('about-this-project.md'));
  assert.equal(res.status, 200);
  assert.ok(res.json.content.includes('About this project'), 'kept version is live in the project');

  await api('/api/projects/' + slug, 'DELETE');
});

test('keep flow never uses a blocking dialog', async () => {
  const r = await fetch(BASE + '/app');
  const html = await r.text();
  assert.ok(html.includes('askKeepVersion'), 'inline keep confirm exists');
  assert.ok(html.includes('Keeping the'), 'keep progress text exists');
  assert.ok(html.includes('ok-banner'), 'keep confirmation banner exists');
  assert.ok(!html.includes("confirm('Keep the"), 'no blocking confirm() on the keep action');
});

test('save-task-for-later wires into Things to Do', async () => {
  const r = await fetch(BASE + '/app');
  const html = await r.text();
  assert.ok(html.includes('id="nuSaveLater"'), 'save-for-later button exists');
  assert.ok(html.includes('saveTodos'), 'save handler persists the draft');
  assert.ok(html.includes("go('todos')"), 'saved draft lands in Things to Do');
  // the old broken behavior was a bare navigation with no save
  assert.ok(!html.includes('data-go="project">Save task for later'), 'button no longer just navigates away');
});

test('sign-in link does not collide with the stork', async () => {
  const r = await fetch(BASE + '/');
  const html = await r.text();
  assert.ok(!html.includes('top: -80px'), 'stork peek no longer reaches into the header');
  assert.ok(html.includes('landing-signin'), 'sign in link still present');
});
