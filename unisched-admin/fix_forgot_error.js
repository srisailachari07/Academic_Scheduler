const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const target = `        try {
          const res = await fetch(\`\${API}/api/forgot-password\`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
          });
          const data = await res.json();`;

const replacement = `        try {
          const res = await fetch(\`\${API}/api/forgot-password\`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
          });
          
          if (!res.ok) {
            let errorText = 'Failed to send email.';
            try {
              const data = await res.json();
              errorText = data.error || errorText;
            } catch (jsonErr) {
              errorText = 'Server route not found. Did you restart the server?';
            }
            msgEl.style.color = '#d32f2f';
            msgEl.textContent = errorText;
            return;
          }
          
          const data = await res.json();`;

code = code.replace(target, replacement);
fs.writeFileSync('index.html', code);
console.log('Fixed error handling');
