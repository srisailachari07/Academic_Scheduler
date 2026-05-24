const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const regex = /const API = window\.location\.port === '3000' \? '' : 'https:\/\/academic-scheduler-2wxz\.onrender\.com';/;
const replacement = "const API = 'http://localhost:3000'; // FORCED LOCALHOST FOR TESTING";

if (regex.test(code)) {
  code = code.replace(regex, replacement);
  fs.writeFileSync('index.html', code);
  console.log('Forced localhost API');
} else {
  console.log('Regex did not match');
}
