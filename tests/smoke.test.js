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
  // Intentional exception: the migration flow names GitHub as the source the
  // user is moving a project from. Strip that flow's copy before the blanket check.
  const withoutBring = lower
    .replace(/i want to bring a project from github/g, '')
    .replace(/move a whole project from a github link into yourkly\. no login needed\./g, '')
    .replace(/copy the github link to the project\. it looks like github\.com\/someone\/their-project\./g, '')
    .replace(/no github account needed, and only public projects can come over\./g, '')
    .replace(/move a whole project from github into yourkly\. paste the link and yourkly brings every file over\./g, '')
    .replace(/paste the github link to the project\. something like github\.com\/someone\/their-project works, or just someone\/their-project\./g, '')
    .replace(/you do not need a github account, and yourkly never asks you to log in anywhere else\./g, '')
    .replace(/that does not look like a github link\. try something like github\.com\/someone\/their-project\./g, '')
    .replace(/paste a github link first\./g, '')
    .replace(/brought over /g, '')
    .replace(/ files from github\./g, '')
    .replace(/>github link</g, '><');
  for (const word of ['github', 'artifact', 'cloudflare', 'worker']) {
    assert.ok(!withoutBring.includes(word), `app should not say "${word}" where the user can see`);
  }
  for (const word of ['\\bcommit\\b', '\\bmerge\\b', '\\brepository\\b', '\\bbranch\\b']) {
    assert.ok(!new RegExp(word).test(withoutBring), `app should not say "${word}"`);
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

test('sidebar Help expands into a topics submenu', async () => {
  const r = await fetch(BASE + '/app');
  const html = await r.text();
  assert.ok(html.includes('helpSubmenu'), 'submenu builder exists');
  assert.ok(html.includes('Help topics'), 'small-caps HELP TOPICS label exists');
  for (const topic of ['Getting started', 'How Yourkly works', 'What are you trying to do?', 'Plain-English glossary', 'When something looks wrong', 'Contact support']) {
    assert.ok(html.includes(topic), 'submenu lists: ' + topic);
  }
  assert.ok(html.includes('app-nav-item--active'), 'active topic gets the purple highlight');
  assert.ok(html.includes('bindHelpTopicClicks'), 'submenu clicks are wired');
});

test('help: main content has no duplicate topics list (sidebar submenu only)', async () => {
  const r = await fetch(BASE + '/app');
  const html = await r.text();
  const start = html.indexOf('function showHelp(topic)');
  assert.ok(start !== -1, 'showHelp located in served script');
  const end = html.indexOf('function renderHelpTopic', start);
  assert.ok(end !== -1, 'showHelp bounds located');
  const src = html.slice(start, end);
  assert.ok(!src.includes('app-nav-label'), 'no in-page topics list in the help main content');
  assert.ok(!src.includes('220px 1fr'), 'no two-column help layout in the main content');
  assert.ok(src.includes('backToHome()'), 'back-to-Home link kept above the help content');
  // The sidebar submenu must survive: it uses a different class.
  assert.ok(html.includes('app-nav-sublabel'), 'sidebar topics submenu still exists');
});

test('help: how-it-works uses the email sign-in step with prev/next navigation', async () => {
  const r = await fetch(BASE + '/app');
  const html = await r.text();
  assert.ok(html.includes('Sign in with your email'), 'step 1 is the email sign-in step');
  assert.ok(html.includes('Your email is your login'), 'email login copy present');
  assert.ok(html.includes('id="stepPrev"'), 'previous step button present');
  assert.ok(html.includes('id="stepNext"'), 'next step button present');
  assert.ok(html.includes('steps-wrap'), 'two-column steps layout present');
  assert.ok(html.includes('where-box'), 'where-you-will-see-this box present');
  assert.ok(html.includes('Step 1 of 4'), 'step counter present');
});

test('help: tasks topic has all eight adapted cards', async () => {
  const r = await fetch(BASE + '/app');
  const html = await r.text();
  const cards = [
    'I want to understand how versions work',
    'I want to save my project',
    'I want to share my project',
    'I want help from the helpers',
    'I want to see what changed',
    'I want to undo a mistake',
    'I want to publish my app',
    'I want to bring a project from GitHub',
  ];
  for (const c of cards) assert.ok(html.includes(c), 'task card present: ' + c);
  assert.ok(html.includes('Step by step'), 'step-by-step section present');
  assert.ok(html.includes('task-grid'), 'two-column card grid present');
});

test('help: glossary has toggle pills and the also-called column', async () => {
  const r = await fetch(BASE + '/app');
  const html = await r.text();
  assert.ok(html.includes('id="glossPillYt"'), 'Yourkly-first pill present');
  assert.ok(html.includes('id="glossPillTy"'), 'technical-term-first pill present');
  assert.ok(html.includes('toggle-pills'), 'toggle pill styling present');
  assert.ok(html.includes('id="glossTh1"'), 'flippable first column header present');
  assert.ok(html.includes('Also called'), 'also-called column present');
  assert.ok(html.includes('What it means'), 'meaning column present');
  assert.ok(html.includes('id="glossFilter"'), 'glossary filter present');
});

test('help: troubleshooting accordion has the adapted entries and helper link', async () => {
  const r = await fetch(BASE + '/app');
  const html = await r.text();
  assert.ok(html.includes('accordion-head'), 'accordion layout present');
  assert.ok(html.includes('I do not see my project'), 'missing-project entry present');
  assert.ok(html.includes('How the helpers work'), 'helpers explainer link present');
  assert.ok(html.includes('I closed the tab.'), 'unsaved-work entry present');
});

test('help: contact support has kind cards and a plain report button', async () => {
  const r = await fetch(BASE + '/app');
  const html = await r.text();
  assert.ok(html.includes('Something is broken'), 'broken kind card present');
  assert.ok(html.includes('I got stuck'), 'stuck kind card present');
  assert.ok(html.includes('An idea'), 'idea kind card present');
  assert.ok(html.includes('>Open a report</button>'), 'report button present');
  assert.ok(!html.includes('Open a report on GitHub'), 'button copy does not say "on GitHub"');
  assert.ok(html.includes('Nothing is sent until you press Submit there'), 'report microcopy present');
  assert.ok(html.includes('Check the common problems first'), 'back-to-troubleshooting button present');
});

test('help topics use no em-dashes', async () => {
  const r = await fetch(BASE + '/app');
  const html = await r.text();
  const start = html.indexOf('function helpGettingStarted');
  assert.ok(start !== -1, 'help section located in served script');
  // The help topic functions are contiguous (~20KB); slice generously.
  const helpSrc = html.slice(start, start + 40000);
  assert.ok(helpSrc.includes('function helpContact'), 'slice covers all help topics');
  // \u2014 in the served inline script is the em-dash escape; it must not appear in help copy.
  assert.ok(!helpSrc.includes('\\u2014'), 'no em-dash escapes in the help topics');
});

test('import screen and dashboard Import button are present', async () => {
  const r = await fetch(BASE + '/app');
  const html = await r.text();
  assert.ok(html.includes('Bring a project over'), 'import screen title present');
  assert.ok(html.includes('Bring it over'), 'import button present');
  assert.ok(html.includes('data-go="import"'), 'dashboard Import button present');
  assert.ok(html.includes('Public projects only.'), 'public-only note present');
});

test('import rejects a bad link', async () => {
  const { status, json } = await api('/api/import', 'POST', { link: 'not a link at all' });
  assert.equal(status, 400);
  assert.ok(/github link/i.test(json.error), 'error names the GitHub link: ' + json.error);
});

test('import rejects shorthand and full URLs the same way', async () => {
  for (const link of ['octocat', 'https://example.com/foo', 'github.com//']) {
    const { status } = await api('/api/import', 'POST', { link });
    assert.equal(status, 400, 'rejected: ' + link);
  }
});

test('import of a missing repo explains the public-only rule', async () => {
  const { status, json } = await api('/api/import', 'POST', { link: 'https://github.com/definitely-not-a-real-owner-xyz123/definitely-not-a-real-repo-xyz123' });
  assert.equal(status, 404);
  assert.ok(json.error.includes('Only public repos can be brought over right now.'), 'public-only error copy: ' + json.error);
});

test('import brings a whole public project over, then cleans up', async () => {
  const { status, json } = await api('/api/import', 'POST', { link: 'octocat/Hello-World' });
  assert.equal(status, 200, 'import ok: ' + JSON.stringify(json));
  assert.ok(json.files > 0, 'files came over');
  assert.equal(json.displayName, 'Hello-World');
  const opened = await api('/api/projects/' + encodeURIComponent(json.name));
  assert.equal(opened.status, 200);
  assert.ok(opened.json.savePoints.some((s) => s.label === 'Brought over from GitHub'), 'first save point labeled');
  const del = await api('/api/projects/' + encodeURIComponent(json.name), 'DELETE');
  assert.equal(del.status, 200);
});

test('landing sign-in points at the in-app sign-in screen', async () => {
  const r = await fetch(BASE + '/');
  const html = await r.text();
  assert.ok(html.includes('href="/app#signin"'), 'sign in link opens the sign-in screen');
  assert.ok(html.includes('Type your email. We will send you a code to type in. No password to remember.') === false, 'landing itself stays clean');
});

test('app shell contains the sign-in view copy', async () => {
  const r = await fetch(BASE + '/app');
  const html = await r.text();
  assert.ok(html.includes('No password to remember.'), 'sign-in screen copy present');
  assert.ok(html.includes('We will send you a code to type in.'), 'code step copy present');
});

test('send-code rejects a bad email address', async () => {
  const { status, json } = await api('/api/auth/send-code', 'POST', { email: 'not-an-email' });
  assert.equal(status, 400);
  assert.ok(/email address/i.test(json.error), 'plain-language error: ' + json.error);
});

test('verify-code with no pending code explains what to do', async () => {
  const { status, json } = await api('/api/auth/verify-code', 'POST', { email: 'nobody-here-' + Date.now() + '@example.com', code: '123456' });
  assert.equal(status, 400);
  assert.ok(/Send one first/i.test(json.error), 'tells the user to send a code: ' + json.error);
});

test('me reports signed-out without a session', async () => {
  const { status, json } = await api('/api/auth/me');
  assert.equal(status, 200);
  assert.equal(json.email, null);
});

test('sign-out without a session is harmless', async () => {
  const { status, json } = await api('/api/auth/sign-out', 'POST', {});
  assert.equal(status, 200);
  assert.equal(json.ok, true);
});

test('avatar picker offers exactly the two approved choices', async () => {
  const r = await fetch(BASE + '/app');
  const html = await r.text();
  assert.ok(html.includes("[['stork', 'Stork'], ['initial', 'Your initial']]"), 'stork + initial only');
  assert.ok(html.includes('What should Yourkly call you?'), 'profile prompt copy');
});

test('glossary Helpers entry uses the approved wording', async () => {
  const r = await fetch(BASE + '/app');
  const html = await r.text();
  assert.ok(html.includes('The fixer, the builder, and the polisher. Each takes a copy of your project and works at the same time.'), 'helpers glossary copy');
});

test('full sign-in flow: code, profile, session, sign-out', async () => {
  const email = 'flowtest-' + Date.now() + '@example.com';
  const authed = async (path, method, body, cookie) => {
    const r = await fetch(BASE + path, {
      method: method || 'GET',
      headers: { 'Content-Type': 'application/json', ...(cookie ? { Cookie: cookie } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    });
    const sc = r.headers.get('set-cookie') || '';
    const m = sc.match(/yourkly_session=([^;]*)/);
    return { status: r.status, json: await r.json().catch(() => ({})), cookie: m ? 'yourkly_session=' + m[1] : '' };
  };
  // send code (example.com test domain returns the code for tests)
  let s = await authed('/api/auth/send-code', 'POST', { email });
  assert.equal(s.status, 200, 'send-code: ' + JSON.stringify(s.json));
  assert.ok(/^\d{6}$/.test(s.json.devCode || ''), 'test code returned');
  // wrong code rejected
  let v = await authed('/api/auth/verify-code', 'POST', { email, code: '000000' });
  assert.equal(v.status, 400, 'wrong code rejected');
  // right code signs in, first-timer needs a profile
  v = await authed('/api/auth/verify-code', 'POST', { email, code: s.json.devCode });
  assert.equal(v.status, 200, 'verify: ' + JSON.stringify(v.json));
  assert.equal(v.json.email, email);
  assert.equal(v.json.needsProfile, true, 'first sign-in needs a profile');
  assert.ok(v.cookie, 'session cookie set');
  // save the profile
  const pf = await authed('/api/auth/profile', 'POST', { displayName: 'Testy Tester', avatar: 'initial' }, v.cookie);
  assert.equal(pf.status, 200, 'profile save: ' + JSON.stringify(pf.json));
  assert.equal(pf.json.profile.displayName, 'Testy Tester');
  assert.equal(pf.json.profile.avatar, 'initial', 'two-avatar choice saved');
  const badAv = await authed('/api/auth/profile', 'POST', { displayName: 'Testy Tester', avatar: 'dragon' }, v.cookie);
  assert.equal(badAv.status, 200);
  assert.equal(badAv.json.profile.avatar, 'stork', 'unknown avatar falls back to stork');
  // me shows email + profile
  const me = await authed('/api/auth/me', 'GET', null, v.cookie);
  assert.equal(me.json.email, email);
  assert.equal(me.json.profile.displayName, 'Testy Tester');
  // profile rejects an empty name
  const bad = await authed('/api/auth/profile', 'POST', { displayName: '  ' }, v.cookie);
  assert.equal(bad.status, 400, 'empty name rejected');
  // a project made while signed in belongs to the account
  const p = await authed('/api/projects', 'POST', { name: 'Flow Probe ' + Date.now() }, v.cookie);
  assert.equal(p.status, 200, 'project create: ' + JSON.stringify(p.json));
  assert.ok(/^u-[0-9a-f]{12}-/.test(p.json.name), 'owner prefix: ' + p.json.name);
  const listIn = await authed('/api/projects', 'GET', null, v.cookie);
  assert.ok(listIn.json.projects.some((x) => x.name === p.json.name), 'signed-in list shows it');
  const listOut = await authed('/api/projects');
  assert.ok(!listOut.json.projects.some((x) => x.name === p.json.name), 'signed-out list hides it');
  const direct = await authed('/api/projects/' + encodeURIComponent(p.json.name));
  assert.equal(direct.status, 404, 'signed-out direct access blocked');
  await authed('/api/projects/' + encodeURIComponent(p.json.name), 'DELETE', null, v.cookie);
  // sign out clears the session
  const so = await authed('/api/auth/sign-out', 'POST', {}, v.cookie);
  assert.equal(so.status, 200);
  const me2 = await authed('/api/auth/me', 'GET', null, v.cookie);
  assert.equal(me2.json.email, null, 'signed out');
});

test('returning user skips profile creation', async () => {
  const email = 'returning-' + Date.now() + '@example.com';
  const authed = async (path, method, body, cookie) => {
    const r = await fetch(BASE + path, {
      method: method || 'GET',
      headers: { 'Content-Type': 'application/json', ...(cookie ? { Cookie: cookie } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    });
    const sc = r.headers.get('set-cookie') || '';
    const m = sc.match(/yourkly_session=([^;]*)/);
    return { status: r.status, json: await r.json().catch(() => ({})), cookie: m ? 'yourkly_session=' + m[1] : '' };
  };
  let s = await authed('/api/auth/send-code', 'POST', { email });
  let v = await authed('/api/auth/verify-code', 'POST', { email, code: s.json.devCode });
  await authed('/api/auth/profile', 'POST', { displayName: 'Returner', avatar: 'stork' }, v.cookie);
  await authed('/api/auth/sign-out', 'POST', {}, v.cookie);
  s = await authed('/api/auth/send-code', 'POST', { email });
  v = await authed('/api/auth/verify-code', 'POST', { email, code: s.json.devCode });
  assert.equal(v.status, 200);
  assert.equal(v.json.needsProfile, false, 'returning user skips profile setup');
  await authed('/api/auth/sign-out', 'POST', {}, v.cookie);
});

test('landing shows the three steps section', async () => {
  const r = await fetch(BASE + '/');
  assert.equal(r.status, 200);
  const html = await r.text();
  assert.ok(html.includes('Three steps, then you'), 'steps heading present');
  for (const s of ['Start your project', 'Yourkly explains it in plain words', 'Send in the helpers']) {
    assert.ok(html.includes(s), 'step present: ' + s);
  }
  assert.ok(html.includes('landing-steps-grid'), 'steps grid present');
});
