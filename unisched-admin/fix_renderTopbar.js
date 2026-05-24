const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const target = `      document.getElementById('topbar-title').innerHTML =

        \`Weekly Schedule <span>\${sem ? sem.label : ''}</span>\`;

      document.getElementById('topbar-sub').textContent = '';`;

const targetFallback = `      document.getElementById('topbar-title').innerHTML =
        \`Weekly Schedule <span>\${sem ? sem.label : ''}</span>\`;
      document.getElementById('topbar-sub').textContent = '';`;

const replacement = `      document.getElementById('topbar-title').innerHTML =
        \`Weekly Schedule <span>\${sem ? sem.label : ''}</span> <span id="topbar-sub"></span>\`;`;

let replaced = false;
if (code.includes(target)) {
  code = code.replace(target, replacement);
  replaced = true;
} else if (code.includes(targetFallback)) {
  code = code.replace(targetFallback, replacement);
  replaced = true;
} else {
  // Try regex
  code = code.replace(/document\.getElementById\('topbar-title'\)\.innerHTML\s*=\s*`Weekly Schedule <span>\$\{sem \? sem\.label : ''\}<\/span>`;\s*document\.getElementById\('topbar-sub'\)\.textContent\s*=\s*'';/g, replacement);
  replaced = true;
}

fs.writeFileSync('index.html', code);
console.log('renderTopbar fixed!');
