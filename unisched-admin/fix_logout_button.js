const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const corruptStart = '        <button onclick="App.async forgotPassword() {';
const corruptEnd = '      adminLogout()"';

const startIndex = code.indexOf(corruptStart);
if (startIndex !== -1) {
  const endIndex = code.indexOf(corruptEnd, startIndex);
  if (endIndex !== -1) {
    const corruptBlock = code.substring(startIndex, endIndex + corruptEnd.length);
    code = code.replace(corruptBlock, '        <button onclick="App.adminLogout()"');
  }
}

const targetFunc = '      adminLogout() {';
const newFunc = `      async forgotPassword() {
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

      adminLogout() {`;

if (code.includes(targetFunc) && !code.includes('async forgotPassword() {')) {
  code = code.replace(targetFunc, newFunc);
}

fs.writeFileSync('index.html', code);
console.log('Fixed broken HTML button and added JS function correctly.');
