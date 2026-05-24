const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const buttonRegex = /<button onclick="App\.adminLogin\(\)"[\s\S]*?>Login<\/button>/;

const buttonReplacement = `<button onclick="App.adminLogin()"
        style="width:100%;padding:10px;background:#2563eb;color:white;border:none;border-radius:6px;font-weight:600;cursor:pointer;font-family:inherit;">Login</button>
      <div style="margin-top: 15px; font-size: 13px;">
        <a href="#" onclick="document.getElementById('forgot-pwd-section').style.display='block'; return false;" style="color: #2563eb; text-decoration: none;">Forgot Password?</a>
      </div>
      
      <div id="forgot-pwd-section" style="display:none; margin-top: 15px; padding-top: 15px; border-top: 1px solid #eee; text-align: left;">
        <p style="font-size: 12px; color: var(--muted); margin-bottom: 8px;">Enter your admin email to receive your credentials.</p>
        <input type="email" id="forgot-pwd-email" placeholder="Admin Email" style="width:100%;padding:10px;margin-bottom:10px;border:1px solid #ccc;border-radius:6px;font-family:inherit;box-sizing:border-box;">
        <button onclick="App.forgotPassword()" style="width:100%;padding:8px;background:#10b981;color:white;border:none;border-radius:6px;font-weight:600;cursor:pointer;font-family:inherit;">Send Recovery Email</button>
        <p id="forgot-pwd-msg" style="font-size:12px;margin-top:8px;"></p>
      </div>`;

if (buttonRegex.test(code)) {
  code = code.replace(buttonRegex, buttonReplacement);
  
  // Add the JS function for forgot password
  const funcRegex = /adminLogout\(\)/;
  const funcReplacement = `async forgotPassword() {
        const email = document.getElementById('forgot-pwd-email').value;
        const msgEl = document.getElementById('forgot-pwd-msg');
        if (!email) {
           msgEl.style.color = '#d32f2f';
           msgEl.textContent = 'Please enter an email.';
           return;
        }
        msgEl.style.color = '#2563eb';
        msgEl.textContent = 'Sending...';
        
        try {
          const res = await fetch(\`\${API}/api/forgot-password\`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
          });
          const data = await res.json();
          if (res.ok) {
            msgEl.style.color = '#10b981';
            msgEl.textContent = data.message || 'Email sent successfully!';
          } else {
            msgEl.style.color = '#d32f2f';
            msgEl.textContent = data.error || 'Failed to send email.';
          }
        } catch (e) {
          msgEl.style.color = '#d32f2f';
          msgEl.textContent = 'Network error.';
        }
      },

      adminLogout()`;
      
  code = code.replace(funcRegex, funcReplacement);
  fs.writeFileSync('index.html', code);
  console.log('Forgot password UI added successfully.');
} else {
  console.log('Could not find target button in index.html');
}
