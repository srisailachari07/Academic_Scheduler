const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const targetRegex = /adminLogin\(\)\s*\{\s*const u = document\.getElementById\('overlay-admin-user'\)\.value;\s*const p = document\.getElementById\('overlay-admin-pass'\)\.value;\s*if \(u === 'admin' && p === 'admin'\) \{[\s\S]*?\}\s*,\s*adminLogout\(\)/;

const replacement = `async adminLogin() {
        const u = document.getElementById('overlay-admin-user').value;
        const p = document.getElementById('overlay-admin-pass').value;
        const errEl = document.getElementById('overlay-admin-err');
        errEl.textContent = 'Invalid credentials';
        
        try {
          const res = await fetch(\`\${API}/api/login\`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: u, password: p })
          });
          const data = await res.json();
          if (res.ok && data.role === 'admin') {
            localStorage.setItem('admin_token', 'true');
            document.getElementById('overlay-admin-user').value = '';
            document.getElementById('overlay-admin-pass').value = '';
            errEl.style.display = 'none';
            App.updateAdminUI();
          } else {
            errEl.style.display = 'block';
          }
        } catch (e) {
          errEl.textContent = "Network error";
          errEl.style.display = 'block';
        }
      },

      adminLogout()`;

if (targetRegex.test(code)) {
  code = code.replace(targetRegex, replacement);
  fs.writeFileSync('index.html', code);
  console.log('Frontend adminLogin updated successfully.');
} else {
  console.log('Could not find adminLogin function.');
}
