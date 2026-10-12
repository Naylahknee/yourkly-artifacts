// Plain-language web UI. No git jargon anywhere the user can see.
import { LOGO_B64 } from './logo.js';

export function renderUI() {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Yourkly on Artifacts</title>
<style>
  :root { --ink: #1a1a1a; --muted: #666; --line: #e5e5e5; --accent: #2b6cb0; --bg: #fafafa; }
  * { box-sizing: border-box; }
  body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: var(--ink); background: var(--bg); line-height: 1.6; }
  .wrap { max-width: 960px; margin: 0 auto; padding: 32px 20px 80px; }
  header { text-align: center; margin-bottom: 36px; }
  header img { max-width: 280px; height: auto; }
  .tagline { color: var(--muted); font-size: 18px; margin-top: 8px; }
  .card { background: #fff; border: 1px solid var(--line); border-radius: 12px; padding: 24px; margin-bottom: 20px; }
  .card h2 { margin: 0 0 8px; font-size: 20px; }
  .card p { margin: 0 0 16px; color: var(--muted); }
  .step-num { display: inline-block; background: var(--ink); color: #fff; width: 28px; height: 28px; border-radius: 50%; text-align: center; line-height: 28px; font-size: 14px; margin-right: 8px; }
  input[type=text] { width: 100%; padding: 12px; font-size: 16px; border: 1px solid var(--line); border-radius: 8px; margin-bottom: 12px; }
  button { background: var(--ink); color: #fff; border: none; padding: 12px 24px; font-size: 16px; border-radius: 8px; cursor: pointer; }
  button:hover { opacity: 0.85; }
  button:disabled { opacity: 0.4; cursor: default; }
  button.secondary { background: #fff; color: var(--ink); border: 1px solid var(--ink); }
  .agents { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px; margin-top: 16px; }
  .agent { border: 1px solid var(--line); border-radius: 10px; padding: 18px; background: #fff; }
  .agent h3 { margin: 0 0 6px; font-size: 17px; }
  .agent .task { color: var(--muted); font-size: 14px; margin-bottom: 10px; }
  .agent .status { font-size: 13px; font-weight: 600; margin-bottom: 10px; }
  .status.working { color: #b7791f; }
  .status.done { color: #276749; }
  .changes { font-size: 14px; background: var(--bg); border-radius: 8px; padding: 12px; margin: 10px 0; white-space: pre-wrap; }
  .hidden { display: none; }
  .error { color: #9b2c2c; background: #fff5f5; border: 1px solid #fc8181; border-radius: 8px; padding: 12px; margin-top: 12px; }
  .ok { color: #276749; }
  footer { text-align: center; color: var(--muted); font-size: 13px; margin-top: 48px; }
  .winner { border: 2px solid #276749; }
</style>
</head>
<body>
<div class="wrap">
  <header>
    <img src="data:image/png;base64,${LOGO_B64}" alt="Yourkly">
    <div class="tagline">Version control for people who never want to hear the word git.<br>Now with room for a whole team of AI helpers.</div>
  </header>

  <div class="card" id="step1">
    <h2><span class="step-num">1</span> Start a new project</h2>
    <p>Give your project a name. We will set up a safe place for it and save the first version.</p>
    <input type="text" id="projectName" placeholder="my-project" value="demo-project">
    <button id="btnCreate">Start the project</button>
    <div id="createMsg"></div>
  </div>

  <div class="card hidden" id="step2">
    <h2><span class="step-num">2</span> Send in 3 agents</h2>
    <p>Each agent gets its own private copy of the project and a written task. They work at the same time without stepping on each other.</p>
    <button id="btnAgents">Send in the agents</button>
    <div class="agents" id="agentList"></div>
  </div>

  <div class="card hidden" id="step3">
    <h2><span class="step-num">3</span> Compare their work</h2>
    <p>Here is what each agent changed, in plain words. Pick the one to keep.</p>
    <div class="agents" id="compareList"></div>
  </div>

  <div class="card hidden" id="step4">
    <h2><span class="step-num">4</span> Done</h2>
    <p id="doneMsg"></p>
    <button class="secondary" onclick="location.reload()">Start over</button>
  </div>

  <footer>Yourkly on Cloudflare Artifacts. MIT licensed. Built for the agentic era.</footer>
</div>

<script>
const state = { project: null, token: null, forks: [] };

async function api(path, method, body) {
  const r = await fetch(path, { method, headers: {'Content-Type':'application/json'}, body: body ? JSON.stringify(body) : undefined });
  const j = await r.json();
  if (!r.ok) throw new Error(j.error || 'Something went wrong');
  return j;
}

document.getElementById('btnCreate').onclick = async () => {
  const name = document.getElementById('projectName').value.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-') || 'demo-project';
  const msg = document.getElementById('createMsg');
  msg.innerHTML = '<p>Setting up your project...</p>';
  try {
    const j = await api('/api/demo/project', 'POST', { name });
    state.project = j.name; state.remote = j.remote; state.token = j.token; state.sha = j.sha;
    msg.innerHTML = '<p class="ok">Project ready. First version saved.</p>';
    document.getElementById('step2').classList.remove('hidden');
  } catch (e) { msg.innerHTML = '<div class="error">' + e.message + '</div>'; }
};

document.getElementById('btnAgents').onclick = async () => {
  const list = document.getElementById('agentList');
  list.innerHTML = '<p>Sending in the agents...</p>';
  try {
    const j = await api('/api/demo/agents', 'POST', { project: state.project, token: state.token, baseSha: state.sha });
    state.forks = j.forks;
    list.innerHTML = '';
    const cl = document.getElementById('compareList');
    cl.innerHTML = '';
    j.forks.forEach((f, i) => {
      list.innerHTML += '<div class="agent"><h3>' + f.label + '</h3><div class="task">Task: ' + f.task + '</div><div class="status done">Done. Changes saved.</div></div>';
      cl.innerHTML += '<div class="agent" id="cmp' + i + '"><h3>' + f.label + '</h3><div class="changes">' + f.plainChanges + '</div><button data-i="' + i + '" data-id="' + f.id + '">Keep this one</button></div>';
    });
    document.getElementById('step3').classList.remove('hidden');
    cl.querySelectorAll('button').forEach(b => b.onclick = () => keepWinner(parseInt(b.dataset.i), b.dataset.id));
  } catch (e) { list.innerHTML = '<div class="error">' + e.message + '</div>'; }
};

async function keepWinner(i, winnerId) {
  const f = state.forks[i];
  document.querySelectorAll('#compareList .agent').forEach(a => a.classList.remove('winner'));
  document.getElementById('cmp' + i).classList.add('winner');
  try {
    const kj = await api('/api/demo/keep', 'POST', { remote: state.remote, token: state.token, projectSha: state.sha, winnerId });
    state.sha = kj.sha;
    document.getElementById('doneMsg').innerHTML = 'Kept <b>' + f.label + '</b>. The project now has their changes. The other agents\\u2019 copies are still saved if you ever want to look back.';
    document.getElementById('step4').classList.remove('hidden');
    window.scrollTo(0, document.body.scrollHeight);
  } catch (e) { alert(e.message); }
}
</script>
</body>
</html>`;
}
