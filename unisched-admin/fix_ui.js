const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

// Fix 1: Enter to login
code = code.replace(
  '<input type="text" id="overlay-admin-user" placeholder="Username"',
  '<input type="text" id="overlay-admin-user" placeholder="Username" onkeyup="if(event.key === \\'Enter\\') App.adminLogin()"'
);
code = code.replace(
  '<input type="password" id="overlay-admin-pass" placeholder="Password"',
  '<input type="password" id="overlay-admin-pass" placeholder="Password" onkeyup="if(event.key === \\'Enter\\') App.adminLogin()"'
);

// Fix 2: Auto-hide login overlay on refresh if already logged in
const initEndTarget = `    })();

    function extractManualFixed(sem) {`;

const initEndReplacement = `      App.updateAdminUI();
    })();

    function extractManualFixed(sem) {`;

if (code.includes(initEndTarget)) {
  code = code.replace(initEndTarget, initEndReplacement);
} else {
  console.log("Could not find init end block.");
}

fs.writeFileSync('index.html', code);
console.log('UI fixes applied successfully!');
