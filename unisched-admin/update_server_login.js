const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');

const target = `app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'admin') {
    return res.json({ token: 'mock-admin', role: 'admin', username: 'admin' });
  }`;

const replacement = `app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const adminUser = process.env.ADMIN_USER || 'admin';
  const adminPass = process.env.ADMIN_PASS || 'admin';
  if (username === adminUser && password === adminPass) {
    return res.json({ token: 'mock-admin', role: 'admin', username: adminUser });
  }`;

code = code.replace(target, replacement);
fs.writeFileSync('server.js', code);
console.log('server.js login updated');
