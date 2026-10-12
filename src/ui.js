// Plain-language web UI. No git jargon anywhere the user can see.
// Translation table (from Yourkly): repository -> project, commit -> save point,
// commit message -> what changed / label, file history -> history,
// restore a commit -> go back to this version, merge -> keep this one,
// fork -> copy for an agent. Branch, SHA and ref are never surfaced.
import {
  IMG_YOURKLY_STORK, IMG_YOURKLY_WORDMARK,
  IMG_STORK_FIXER, IMG_STORK_BUILDER, IMG_STORK_POLISHER,
} from './assets.js';

const PAGE_STYLE = `
  :root { --ink: #1a1a1a; --muted: #666; --line: #e5e5e5; --bg: #fafafa; --purple: #5b4bd6; }
  * { box-sizing: border-box; }
  body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: var(--ink); background: var(--bg); line-height: 1.6; }
  .wrap { max-width: 1024px; margin: 0 auto; padding: 24px 20px 80px; }
  .topbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 28px; }
  .brand-lockup { display: flex; align-items: center; gap: 10px; cursor: pointer; }
  .brand-lockup .brand-stork { width: 40px; height: 40px; object-fit: contain; }
  .brand-lockup .brand-wordmark { height: 28px; width: auto; }
  .topbar nav a { color: var(--muted); text-decoration: none; font-size: 15px; cursor: pointer; }
  .topbar nav a:hover { color: var(--ink); }
  .tagline { color: var(--muted); font-size: 17px; margin: 0 0 24px; }
  .card { background: #fff; border: 1px solid var(--line); border-radius: 12px; padding: 24px; margin-bottom: 20px; }
  .card h2 { margin: 0 0 8px; font-size: 20px; }
  .card p { margin: 0 0 16px; color: var(--muted); }
  .step-num { display: inline-block; background: var(--ink); color: #fff; width: 28px; height: 28px; border-radius: 50%; text-align: center; line-height: 28px; font-size: 14px; margin-right: 8px; }
  input[type=text] { width: 100%; padding: 12px; font-size: 16px; border: 1px solid var(--line); border-radius: 8px; margin-bottom: 12px; }
  textarea.editor { width: 100%; min-height: 320px; padding: 14px; font-size: 14px; font-family: ui-monospace, Menlo, Consolas, monospace; border: 1px solid var(--line); border-radius: 8px; line-height: 1.5; }
  button { background: var(--ink); color: #fff; border: none; padding: 12px 24px; font-size: 16px; border-radius: 8px; cursor: pointer; }
  button:hover { opacity: 0.85; }
  button:disabled { opacity: 0.4; cursor: default; }
  button.secondary { background: #fff; color: var(--ink); border: 1px solid var(--ink); }
  button.danger { background: #fff; color: #9b2c2c; border: 1px solid #fc8181; }
  button.small { padding: 8px 14px; font-size: 14px; }
  .proj-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; }
  .proj-card { background: #fff; border: 1px solid var(--line); border-radius: 12px; padding: 20px; cursor: pointer; }
  .proj-card:hover { border-color: var(--ink); }
  .proj-card h3 { margin: 0 0 6px; font-size: 18px; }
  .proj-card .meta { color: var(--muted); font-size: 14px; }
  .proj-new { border: 2px dashed var(--line); background: transparent; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 140px; color: var(--muted); cursor: pointer; }
  .proj-new:hover { border-color: var(--ink); color: var(--ink); }
  .proj-layout { display: grid; grid-template-columns: 260px 1fr; gap: 20px; }
  @media (max-width: 760px) { .proj-layout { grid-template-columns: 1fr; } }
  .file-list { list-style: none; margin: 0; padding: 0; }
  .file-list li { padding: 10px 12px; border-radius: 8px; cursor: pointer; font-size: 15px; }
  .file-list li:hover { background: var(--bg); }
  .file-list li.active { background: #eef0ff; font-weight: 600; }
  .savepoint { border: 1px solid var(--line); border-radius: 10px; padding: 14px 16px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; gap: 12px; }
  .savepoint .label { font-weight: 600; }
  .savepoint .time { color: var(--muted); font-size: 13px; }
  .savepoint.current { border-color: var(--purple); }
  .agents { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px; margin-top: 16px; }
  .agent { border: 1px solid var(--line); border-radius: 10px; padding: 18px; background: #fff; }
  .agent img.mascot { width: 96px; height: 96px; object-fit: contain; display: block; margin-bottom: 10px; }
  .agent h3 { margin: 0 0 6px; font-size: 17px; }
  .agent .task { color: var(--muted); font-size: 14px; margin-bottom: 10px; }
  .agent .status { font-size: 13px; font-weight: 600; margin-bottom: 10px; }
  .status.working { color: #b7791f; }
  .status.done { color: #276749; }
  .changes { font-size: 14px; background: var(--bg); border-radius: 8px; padding: 12px; margin: 10px 0; white-space: pre-wrap; }
  .hidden { display: none; }
  .error { color: #9b2c2c; background: #fff5f5; border: 1px solid #fc8181; border-radius: 8px; padding: 12px; margin-top: 12px; }
  .ok { color: #276749; }
  .row { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }
  .section-title { font-size: 18px; margin: 28px 0 12px; }
  footer { text-align: center; color: var(--muted); font-size: 13px; margin-top: 48px; }
  .winner { border: 2px solid #276749; }
  .back { color: var(--muted); cursor: pointer; font-size: 15px; margin-bottom: 16px; display: inline-block; }
  .back:hover { color: var(--ink); }
  /* Landing page */
  .hero { text-align: center; padding: 56px 0 40px; }
  .hero-lockup { display: flex; align-items: center; justify-content: center; gap: 14px; margin-bottom: 20px; }
  .hero-lockup .brand-stork { width: 84px; height: 84px; object-fit: contain; }
  .hero-lockup .brand-wordmark { height: 56px; width: auto; }
  .lede { color: var(--muted); font-size: 18px; max-width: 660px; margin: 0 auto 28px; }
  .cta { display: inline-block; background: var(--ink); color: #fff; border: none; padding: 14px 34px; font-size: 17px; border-radius: 8px; cursor: pointer; text-decoration: none; }
  .cta:hover { opacity: 0.85; }
  .team { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px; margin-bottom: 8px; }
  .teammate { text-align: center; }
  .teammate img.mascot { width: 128px; height: 128px; object-fit: contain; display: block; margin: 0 auto 12px; }
  .teammate h3 { margin: 0 0 8px; font-size: 18px; }
  .teammate p { margin: 0; }
  .section-sub { color: var(--muted); margin: -6px 0 18px; }
  .cta-row { text-align: center; margin: 36px 0 8px; }
`;

export function renderLanding() {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Yourkly on Artifacts</title>
<style>${PAGE_STYLE}</style>
</head>
<body>
<div class="wrap">
  <div class="hero">
    <div class="hero-lockup">
      <img class="brand-stork" src="${IMG_YOURKLY_STORK}" alt="">
      <img class="brand-wordmark" src="${IMG_YOURKLY_WORDMARK}" alt="Yourkly">
    </div>
    <p class="tagline">Version control for people who never want to hear the word git.</p>
    <p class="lede">Yourkly Artifacts is version control rebuilt on Cloudflare Workers and Artifacts. Save your work as labeled versions, go back to any of them, and send in a team of AI helpers that all work on your project at the same time. No terminals, no jargon.</p>
    <a class="cta" href="/app">Start a project</a>
  </div>
  <h2 class="section-title">Meet the team</h2>
  <p class="section-sub">Three AI helpers. Each one gets its own copy of your project and works at the same time as the others.</p>
  <div class="team">
    <div class="card teammate">
      <img class="mascot" src="${IMG_STORK_FIXER}" alt="">
      <h3>The Fixer</h3>
      <p>Mends broken files, like typos and small mistakes.</p>
    </div>
    <div class="card teammate">
      <img class="mascot" src="${IMG_STORK_BUILDER}" alt="">
      <h3>The Builder</h3>
      <p>Writes brand new files, like a summary of your project.</p>
    </div>
    <div class="card teammate">
      <img class="mascot" src="${IMG_STORK_POLISHER}" alt="">
      <h3>The Polisher</h3>
      <p>Tidies up your files so everything reads clean.</p>
    </div>
  </div>
  <h2 class="section-title">How it works</h2>
  <div class="card"><h2><span class="step-num">1</span> Start a project</h2><p>Give it a name. We set up a safe place for it and save the first version.</p></div>
  <div class="card"><h2><span class="step-num">2</span> Send in the helpers</h2><p>Each helper gets its own private copy of the project and a written task. They work at the same time without stepping on each other.</p></div>
  <div class="card"><h2><span class="step-num">3</span> Keep the winner</h2><p>Compare what each helper changed, in plain words. Keep the one you like. The other copies stay saved.</p></div>
  <div class="cta-row"><a class="cta" href="/app">Start a project</a></div>
  <footer>Yourkly on Cloudflare Artifacts. MIT licensed. Built for the agentic era.</footer>
</div>
</body>
</html>`;
}

export function renderApp() {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Yourkly on Artifacts</title>
<style>${PAGE_STYLE}</style>
</head>
<body>
<div class="wrap">
  <div class="topbar">
    <div class="brand-lockup" id="brandHome" aria-label="Yourkly">
      <img class="brand-stork" src="${IMG_YOURKLY_STORK}" alt="">
      <img class="brand-wordmark" src="${IMG_YOURKLY_WORDMARK}" alt="">
    </div>
    <nav><a id="navProjects">Your projects</a></nav>
  </div>
  <div id="app"></div>
  <footer>Yourkly on Cloudflare Artifacts. MIT licensed. Built for the agentic era.</footer>
</div>

<script>
const MASCOT_IMG = {
  fixer: "${IMG_STORK_FIXER}",
  builder: "${IMG_STORK_BUILDER}",
  polisher: "${IMG_STORK_POLISHER}"
};
const app = document.getElementById('app');
const state = { project: null, files: [], savePoints: [], openFile: null, fileContent: '', agents: [] };

function esc(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function fmtTime(t) {
  if (!t) return '';
  try { return new Date(t).toLocaleString(); } catch (e) { return ''; }
}
async function api(path, method, body) {
  const r = await fetch(path, { method: method || 'GET', headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
  const j = await r.json().catch(function() { return {}; });
  if (!r.ok) throw new Error(j.error || 'Something went wrong');
  return j;
}

document.getElementById('brandHome').onclick = showDashboard;
document.getElementById('navProjects').onclick = showDashboard;

// ---------- Dashboard ----------
async function showDashboard() {
  state.project = null;
  app.innerHTML = '<p class="tagline">Version control for people who never want to hear the word git.<br>Now with room for a whole team of AI helpers.</p>' +
    '<h2 class="section-title" style="margin-top:0">Your projects</h2>' +
    '<div id="dashMsg"><p>Loading your projects...</p></div><div class="proj-grid" id="projGrid"></div>';
  try {
    const j = await api('/api/projects');
    document.getElementById('dashMsg').innerHTML = '';
    const grid = document.getElementById('projGrid');
    if (j.projects.length === 0) { showOnboarding(); return; }
    let html = '';
    j.projects.forEach(function(p) {
      html += '<div class="proj-card" data-name="' + esc(p.name) + '"><h3>' + esc(p.name) + '</h3>' +
        '<div class="meta">Last saved: ' + esc(p.lastSaved) +
        (p.lastTime ? '<br>' + esc(fmtTime(p.lastTime)) : '') + '<br>' +
        p.savePoints + ' save point' + (p.savePoints === 1 ? '' : 's') + '</div></div>';
    });
    html += '<div class="proj-card proj-new" id="newProjCard"><div style="font-size:32px">+</div><div>Start a new project</div></div>';
    grid.innerHTML = html;
    const cards = grid.querySelectorAll('.proj-card[data-name]');
    cards.forEach(function(c) { c.onclick = function() { showProject(c.getAttribute('data-name')); }; });
    document.getElementById('newProjCard').onclick = showNewProjectForm;
  } catch (e) {
    document.getElementById('dashMsg').innerHTML = '<div class="error">' + esc(e.message) + '</div>';
  }
}

function showNewProjectForm() {
  app.innerHTML = '<span class="back" id="backBtn">&larr; Back to your projects</span>' +
    '<div class="card"><h2>Start a new project</h2>' +
    '<p>Give your project a name. We will set up a safe place for it and save the first version.</p>' +
    '<input type="text" id="projectName" placeholder="my-project">' +
    '<button id="btnCreate">Start the project</button><div id="createMsg"></div></div>';
  document.getElementById('backBtn').onclick = showDashboard;
  document.getElementById('btnCreate').onclick = async function() {
    const input = document.getElementById('projectName');
    const msg = document.getElementById('createMsg');
    msg.innerHTML = '<p>Setting up your project...</p>';
    try {
      const j = await api('/api/projects', 'POST', { name: input.value });
      showProject(j.name);
    } catch (e) { msg.innerHTML = '<div class="error">' + esc(e.message) + '</div>'; }
  };
}

// ---------- First-run onboarding (the 4-step tour) ----------
function showOnboarding() {
  app.innerHTML =
    '<p class="tagline">Version control for people who never want to hear the word git.<br>Now with room for a whole team of AI helpers.</p>' +
    '<div class="card"><h2>Welcome. Let us show you around.</h2>' +
    '<p>Four quick steps. You will start a project, send in three AI helpers, compare their work, and keep the winner.</p></div>' +
    '<div class="card" id="ob1"><h2><span class="step-num">1</span> Start a new project</h2>' +
    '<p>Give your project a name. We will set up a safe place for it and save the first version.</p>' +
    '<input type="text" id="obName" value="demo-project">' +
    '<button id="obCreate">Start the project</button><div id="obMsg1"></div></div>' +
    '<div class="card hidden" id="ob2"><h2><span class="step-num">2</span> Send in 3 helpers</h2>' +
    '<p>Each helper gets its own private copy of the project and a written task. They work at the same time without stepping on each other.</p>' +
    '<button id="obAgents">Send in the helpers</button><div class="agents" id="obAgentList"></div></div>' +
    '<div class="card hidden" id="ob3"><h2><span class="step-num">3</span> Compare their work</h2>' +
    '<p>Here is what each helper changed, in plain words. Pick the one to keep.</p>' +
    '<div class="agents" id="obCompare"></div></div>' +
    '<div class="card hidden" id="ob4"><h2><span class="step-num">4</span> Done</h2><p id="obDone"></p>' +
    '<button id="obGo">See your projects</button></div>';

  const tour = { project: null };

  document.getElementById('obCreate').onclick = async function() {
    const msg = document.getElementById('obMsg1');
    msg.innerHTML = '<p>Setting up your project...</p>';
    try {
      const j = await api('/api/demo/project', 'POST', { name: document.getElementById('obName').value });
      tour.project = j.name;
      msg.innerHTML = '<p class="ok">Project ready. First version saved.</p>';
      document.getElementById('ob2').classList.remove('hidden');
    } catch (e) { msg.innerHTML = '<div class="error">' + esc(e.message) + '</div>'; }
  };

  document.getElementById('obAgents').onclick = async function() {
    const list = document.getElementById('obAgentList');
    list.innerHTML = '<p>Sending in the helpers...</p>';
    try {
      const j = await api('/api/demo/agents', 'POST', { project: tour.project });
      list.innerHTML = '';
      const cl = document.getElementById('obCompare');
      cl.innerHTML = '';
      j.forks.forEach(function(f, i) {
        list.innerHTML += '<div class="agent"><img class="mascot" src="' + MASCOT_IMG[f.mascot] + '" alt="">' +
          '<h3>' + esc(f.label) + '</h3><div class="task">Task: ' + esc(f.task) + '</div>' +
          '<div class="status done">Done. Changes saved.</div></div>';
        cl.innerHTML += '<div class="agent" id="obcmp' + i + '"><img class="mascot" src="' + MASCOT_IMG[f.mascot] + '" alt="">' +
          '<h3>' + esc(f.label) + '</h3><div class="changes">' + esc(f.plainChanges) + '</div>' +
          '<button data-i="' + i + '">Keep this one</button></div>';
      });
      document.getElementById('ob3').classList.remove('hidden');
      const btns = cl.querySelectorAll('button');
      btns.forEach(function(b) {
        b.onclick = async function() {
          const i = parseInt(b.getAttribute('data-i'), 10);
          const f = j.forks[i];
          const others = cl.querySelectorAll('.agent');
          others.forEach(function(a) { a.classList.remove('winner'); });
          document.getElementById('obcmp' + i).classList.add('winner');
          try {
            await api('/api/demo/keep', 'POST', { project: tour.project, winnerId: f.id });
            document.getElementById('obDone').innerHTML = 'Kept <b>' + esc(f.label) + '</b>. The project now has their changes. The other helpers\\u2019 copies are still saved if you ever want to look back.';
            document.getElementById('ob4').classList.remove('hidden');
          } catch (e) { alert(e.message); }
        };
      });
    } catch (e) { list.innerHTML = '<div class="error">' + esc(e.message) + '</div>'; }
  };

  document.getElementById('obGo').onclick = showDashboard;
}

// ---------- Project view ----------
async function showProject(name) {
  state.project = name;
  app.innerHTML = '<span class="back" id="backBtn">&larr; Back to your projects</span>' +
    '<h2 style="margin-top:0">' + esc(name) + '</h2><div id="projMsg"><p>Opening your project...</p></div>' +
    '<div id="projBody"></div>';
  document.getElementById('backBtn').onclick = showDashboard;
  try {
    const j = await api('/api/projects/' + encodeURIComponent(name));
    state.files = j.files;
    state.savePoints = j.savePoints;
    state.openFile = null;
    state.agents = [];
    renderProjectBody();
  } catch (e) {
    document.getElementById('projMsg').innerHTML = '<div class="error">' + esc(e.message) + '</div>';
  }
}

function renderProjectBody() {
  document.getElementById('projMsg').innerHTML = '';
  const body = document.getElementById('projBody');
  let fileItems = '';
  state.files.forEach(function(f) {
    fileItems += '<li data-f="' + esc(f) + '" class="' + (state.openFile === f ? 'active' : '') + '">' + esc(f) + '</li>';
  });
  let spItems = '';
  state.savePoints.forEach(function(s, i) {
    spItems += '<div class="savepoint' + (i === 0 ? ' current' : '') + '"><div><div class="label">' + esc(s.label) + '</div>' +
      '<div class="time">' + esc(fmtTime(s.time)) + (i === 0 ? ' &middot; current version' : '') + '</div></div>' +
      (i === 0 ? '' : '<button class="secondary small" data-sha="' + esc(s.sha) + '" data-label="' + esc(s.label) + '">Go back to this version</button>') +
      '</div>';
  });

  body.innerHTML =
    '<div class="proj-layout"><div><div class="card"><h2>Files</h2>' +
    '<ul class="file-list" id="fileList">' + fileItems + '</ul>' +
    '<div class="row" style="margin-top:12px"><button class="secondary small" id="btnNewFile">New file</button></div>' +
    '</div></div>' +
    '<div><div class="card" id="editorCard"><h2 id="editorTitle">Pick a file to edit</h2><div id="editorBody"><p>Choose a file on the left, or start a new one.</p></div></div>' +
    '<div class="card"><h2>AI helpers</h2>' +
    '<p>Send in three helpers. Each gets its own private copy of the project and a written task. They work at the same time, then you compare and keep the winner.</p>' +
    '<button id="btnAgents">Send in the helpers</button><div class="agents" id="agentList"></div></div>' +
    '<div class="card hidden" id="compareCard"><h2>Compare their work</h2>' +
    '<p>Here is what each helper changed, in plain words. Pick the one to keep.</p>' +
    '<div class="agents" id="compareList"></div></div>' +
    '</div></div>' +
    '<h2 class="section-title">Save points (' + state.savePoints.length + ')</h2>' +
    '<div id="spList">' + (spItems || '<p>No save points yet.</p>') + '</div>' +
    '<div class="row" style="margin-top:24px"><button class="danger small" id="btnDelete">Delete this project</button></div>';

  const fl = document.getElementById('fileList');
  fl.querySelectorAll('li').forEach(function(li) {
    li.onclick = function() { openFile(li.getAttribute('data-f')); };
  });
  document.getElementById('btnNewFile').onclick = function() {
    const n = prompt('Name the new file (for example: notes.md)');
    if (n && n.trim()) openFile(n.trim(), '');
  };
  const spList = document.getElementById('spList');
  spList.querySelectorAll('button[data-sha]').forEach(function(b) {
    b.onclick = async function() {
      if (!confirm('Go back to "' + b.getAttribute('data-label') + '"? Your current work will be saved first as its own version.')) return;
      try {
        await api('/api/projects/' + encodeURIComponent(state.project) + '/restore', 'POST', { sha: b.getAttribute('data-sha'), label: b.getAttribute('data-label') });
        showProject(state.project);
      } catch (e) { alert(e.message); }
    };
  });
  document.getElementById('btnDelete').onclick = async function() {
    if (!confirm('Delete "' + state.project + '" and all its helper copies? This cannot be undone.')) return;
    try {
      await api('/api/projects/' + encodeURIComponent(state.project), 'DELETE');
      showDashboard();
    } catch (e) { alert(e.message); }
  };
  document.getElementById('btnAgents').onclick = sendAgents;
}

async function openFile(path, presetContent) {
  state.openFile = path;
  const items = document.querySelectorAll('#fileList li');
  items.forEach(function(li) { li.classList.toggle('active', li.getAttribute('data-f') === path); });
  const title = document.getElementById('editorTitle');
  const eb = document.getElementById('editorBody');
  title.textContent = path;
  eb.innerHTML = '<p>Loading...</p>';
  try {
    let content = presetContent;
    let isNew = presetContent !== undefined;
    if (!isNew) {
      const j = await api('/api/projects/' + encodeURIComponent(state.project) + '/file?path=' + encodeURIComponent(path));
      content = j.content;
    }
    state.fileContent = content;
    eb.innerHTML = '<textarea class="editor" id="fileEditor"></textarea>' +
      '<div style="margin-top:12px"><input type="text" id="saveLabel" placeholder="What changed? (for example: rewrote the intro)"></div>' +
      '<div class="row"><button id="btnSave">Save as a new version</button>' +
      (isNew ? '' : '<button class="danger small" id="btnDelFile">Delete this file</button>') + '</div><div id="saveMsg"></div>';
    document.getElementById('fileEditor').value = content;
    document.getElementById('btnSave').onclick = async function() {
      const msg = document.getElementById('saveMsg');
      msg.innerHTML = '<p>Saving...</p>';
      try {
        await api('/api/projects/' + encodeURIComponent(state.project) + '/files', 'POST', {
          path: path, content: document.getElementById('fileEditor').value,
          label: document.getElementById('saveLabel').value || ('Saved ' + path),
        });
        msg.innerHTML = '<p class="ok">Saved as a new version.</p>';
        showProject(state.project);
      } catch (e) { msg.innerHTML = '<div class="error">' + esc(e.message) + '</div>'; }
    };
    const delBtn = document.getElementById('btnDelFile');
    if (delBtn) delBtn.onclick = async function() {
      if (!confirm('Delete "' + path + '"?')) return;
      try {
        await api('/api/projects/' + encodeURIComponent(state.project) + '/files', 'POST', { path: path, remove: true, label: 'Deleted ' + path });
        showProject(state.project);
      } catch (e) { alert(e.message); }
    };
  } catch (e) { eb.innerHTML = '<div class="error">' + esc(e.message) + '</div>'; }
}

async function sendAgents() {
  const list = document.getElementById('agentList');
  list.innerHTML = '<p>Sending in the helpers...</p>';
  try {
    const j = await api('/api/projects/' + encodeURIComponent(state.project) + '/agents', 'POST');
    state.agents = j.agents;
    list.innerHTML = '';
    const cl = document.getElementById('compareList');
    cl.innerHTML = '';
    j.agents.forEach(function(a, i) {
      list.innerHTML += '<div class="agent"><img class="mascot" src="' + MASCOT_IMG[a.mascot] + '" alt="">' +
        '<h3>' + esc(a.name) + '</h3><div class="task">Task: ' + esc(a.task) + '</div>' +
        '<div class="status done">Done. Changes saved.</div></div>';
      cl.innerHTML += '<div class="agent" id="cmp' + i + '"><img class="mascot" src="' + MASCOT_IMG[a.mascot] + '" alt="">' +
        '<h3>' + esc(a.name) + '</h3><div class="changes">' + esc(a.plainChanges) + '</div>' +
        '<button data-i="' + i + '" data-id="' + esc(a.id) + '">Keep this one</button></div>';
    });
    document.getElementById('compareCard').classList.remove('hidden');
    const btns = cl.querySelectorAll('button');
    btns.forEach(function(b) {
      b.onclick = async function() {
        const i = parseInt(b.getAttribute('data-i'), 10);
        const a = j.agents[i];
        const cards = cl.querySelectorAll('.agent');
        cards.forEach(function(c) { c.classList.remove('winner'); });
        document.getElementById('cmp' + i).classList.add('winner');
        try {
          await api('/api/projects/' + encodeURIComponent(state.project) + '/keep', 'POST', { winnerId: b.getAttribute('data-id') });
          alert('Kept ' + a.name + '\\u2019s work. The project now has their changes. The other helpers\\u2019 copies are still saved.');
          showProject(state.project);
        } catch (e) { alert(e.message); }
      };
    });
  } catch (e) { list.innerHTML = '<div class="error">' + esc(e.message) + '</div>'; }
}

showDashboard();
</script>
</body>
</html>`;
}
