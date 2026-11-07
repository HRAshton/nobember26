'use strict';

const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const output = path.resolve(root, '_site');
if (path.dirname(output) !== root || path.basename(output) !== '_site') {
  throw new Error('The Pages output must be the project _site directory.');
}

fs.rmSync(output, {recursive: true, force: true});
fs.mkdirSync(output);

for (const name of ['index.html', 'config.js', 'engine.js', 'sound.js', 'app.js', 'style.css', 'assets']) {
  fs.cpSync(path.join(root, name), path.join(output, name), {recursive: true});
}
fs.writeFileSync(path.join(output, '.nojekyll'), '');
console.log('GitHub Pages site built in ' + output);
