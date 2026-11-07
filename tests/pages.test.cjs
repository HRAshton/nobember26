const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {execFileSync} = require('node:child_process');

test('Pages build includes the playable site and resolves all local asset references', () => {
  const root = path.resolve(__dirname, '..');
  execFileSync(process.execPath, [path.join(root, 'scripts/build-pages.cjs')], {cwd: root});
  const output = path.join(root, '_site');
  for (const required of ['index.html', 'app.js', 'config.js', 'engine.js', 'sound.js', 'style.css', 'assets', '.nojekyll']) {
    assert.ok(fs.existsSync(path.join(output, required)), required);
  }
  for (const excluded of ['.git', 'tests', 'scripts', 'local-input', 'previews', 'server.cjs']) {
    assert.equal(fs.existsSync(path.join(output, excluded)), false, excluded);
  }
  for (const file of ['index.html', 'style.css', 'assets/real-ui/skin.css']) {
    const text = fs.readFileSync(path.join(output, file), 'utf8');
    const references = file.endsWith('.html')
      ? [...text.matchAll(/(?:src|href)="([^"#]+)"/g)].map(match => match[1])
      : [...text.matchAll(/url\(['"]?([^)'"\s]+)['"]?\)/g)].map(match => match[1]);
    for (const reference of references) {
      if (/^(?:data:|https?:)/.test(reference)) continue;
      assert.equal(reference.startsWith('/'), false, reference);
      const target = path.resolve(output, path.dirname(file), reference);
      assert.ok(target.startsWith(output + path.sep), reference);
      assert.ok(fs.existsSync(target), file + ' refers to missing ' + reference);
    }
  }
});
