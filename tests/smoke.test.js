// Runnable tests for yourkly-artifacts. Run with: npm test
// Tests the live Worker endpoints (read-only except for a throwaway demo repo).
import { test } from 'node:test';
import assert from 'node:assert/strict';

const BASE = process.env.TEST_BASE || 'https://yourkly-artifacts.madincrease.workers.dev';

async function api(path, method = 'GET', body) {
  const r = await fetch(BASE + path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const j = await r.json();
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
  // Banned words in user-facing copy (lowercase check on visible text)
  const lower = html.toLowerCase();
  for (const word of ['\bcommit\b', '\bmerge\b', '\brepository\b', '\bfork\b']) {
    assert.ok(!new RegExp(word).test(lower), `homepage should not say "${word}"`);
  }
});

test('demo project creation returns a repo with a save point', async () => {
  const name = 'test-' + Date.now().toString(36);
  const { status, json } = await api('/api/demo/project', 'POST', { name });
  assert.equal(status, 200, 'project creation failed: ' + json.error);
  assert.ok(json.name, 'returns repo name');
  assert.ok(json.sha && json.sha.length === 40, 'returns full commit SHA');
  assert.ok(json.token, 'returns a repo token');
});
