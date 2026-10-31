const test = require('node:test');
const assert = require('node:assert/strict');
const {spawn} = require('node:child_process');
const path = require('node:path');

test('static server hides Git files and survives malformed URLs', async () => {
  const child = spawn(process.execPath, [path.join(__dirname, '../server.cjs')], {
    env: {...process.env, PORT: '0'}, stdio: ['ignore', 'pipe', 'pipe']
  });
  try {
    const url = await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Server did not start')), 5000);
      child.once('error', reject);
      child.stdout.on('data', chunk => {
        const match = String(chunk).match(/http:\/\/localhost:\d+/);
        if (match) { clearTimeout(timer); resolve(match[0]); }
      });
    });
    for (const file of ['/.gitignore', '/.git/config', '/%2egit/config']) {
      assert.equal((await fetch(url + file)).status, 404, file);
    }
    assert.equal((await fetch(url + '/%ZZ')).status, 400);
    assert.equal((await fetch(url + '/')).status, 200);
  } finally { child.kill(); }
});
