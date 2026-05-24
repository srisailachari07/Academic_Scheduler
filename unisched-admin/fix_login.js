const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

// Fix 1: Add onkeyup to username
code = code.replace(
  '<input type="text" id="overlay-admin-user" placeholder="Username"',
  '<input type="text" id="overlay-admin-user" placeholder="Username" onkeyup="if(event.key === \'Enter\') App.adminLogin()"'
);

// Fix 2: Add onkeyup to password
code = code.replace(
  '<input type="password" id="overlay-admin-pass" placeholder="Password"',
  '<input type="password" id="overlay-admin-pass" placeholder="Password" onkeyup="if(event.key === \'Enter\') App.adminLogin()"'
);

fs.writeFileSync('index.html', code);
console.log('Login enter key fixed!');
