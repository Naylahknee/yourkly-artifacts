#!/usr/bin/env node
// Deploy the Worker via the Cloudflare API (multipart script upload).
// Uses the same dynamic_credentials pattern as the other project scripts.
import { execSync } from 'child_process';
import { readFileSync } from 'fs';

const ACCOUNT = process.env.CLOUDFLARE_ACCOUNT_ID || 'f6341f77b5dfbd56589d1cd68f38c2d8';
const SCRIPT = 'yourkly-artifacts';

const metadata = {
  main_module: 'worker.js',
  compatibility_date: '2026-10-12',
  compatibility_flags: ['nodejs_compat'],
  bindings: [{ type: 'artifacts', name: 'ARTIFACTS', namespace: 'default' }],
};

// Build first
execSync('npm run build', { stdio: 'inherit', cwd: new URL('..', import.meta.url).pathname });

const code = readFileSync(new URL('../dist/worker.js', import.meta.url).pathname);

const helper = `
import sys, json, urllib.request, uuid
sys.path.insert(0, '/opt/hatch/skills/skill-creator/bin')
from dynamic_credentials import add_surrogate_to_request, read_json_response
metadata = json.loads(sys.argv[1])
code = open(sys.argv[2], 'rb').read()
acct, script = sys.argv[3], sys.argv[4]
boundary = '----wboundary' + uuid.uuid4().hex
body = b''
body += ('--' + boundary + '\\r\\n').encode()
body += b'Content-Disposition: form-data; name="metadata"; filename="blob"\\r\\nContent-Type: application/json\\r\\n\\r\\n'
body += json.dumps(metadata).encode() + b'\\r\\n'
body += ('--' + boundary + '\\r\\n').encode()
body += b'Content-Disposition: form-data; name="worker.js"; filename="worker.js"\\r\\nContent-Type: application/javascript+module\\r\\n\\r\\n'
body += code + b'\\r\\n' + ('--' + boundary + '--\\r\\n').encode()
req = urllib.request.Request(
    f'https://api.cloudflare.com/client/v4/accounts/{acct}/workers/scripts/{script}',
    data=body, method='PUT',
    headers={'User-Agent': 'yourkly-artifacts-build/1.0', 'Content-Type': f'multipart/form-data; boundary={boundary}'})
add_surrogate_to_request(req, 'custom.cloudflare', allowed_hosts=('api.cloudflare.com',))
with urllib.request.urlopen(req, timeout=120) as r:
    resp = read_json_response(r)
    print('deploy success:', resp.get('success'))
    if not resp.get('success'):
        print(json.dumps(resp.get('errors'))[:1000])
`;
import { writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
const helperPath = join(tmpdir(), 'cf-deploy-helper.py');
writeFileSync(helperPath, helper);
execSync(
  `python3 ${helperPath} '${JSON.stringify(metadata)}' ${new URL('../dist/worker.js', import.meta.url).pathname} ${ACCOUNT} ${SCRIPT}`,
  { stdio: 'inherit' }
);
console.log('Live at: https://yourkly-artifacts.madincrease.workers.dev');
