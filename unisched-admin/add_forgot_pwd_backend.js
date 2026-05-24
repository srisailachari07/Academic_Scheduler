const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');

const injection = `app.post('/api/forgot-password', async (req, res) => {
  const { email } = req.body;
  const adminEmail = process.env.ADMIN_EMAIL;
  
  if (!adminEmail) {
    return res.status(400).json({ error: 'ADMIN_EMAIL is not configured on the server.' });
  }
  
  if (!email || email.trim().toLowerCase() !== adminEmail.trim().toLowerCase()) {
    return res.status(400).json({ error: 'Invalid admin email address.' });
  }
  
  const adminUser = process.env.ADMIN_USER || 'admin';
  const adminPass = process.env.ADMIN_PASS || 'admin';
  
  try {
    let transporter;
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: process.env.SMTP_PORT || 587,
        secure: false,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      });
    } else {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: { user: testAccount.user, pass: testAccount.pass }
      });
    }
    
    const mailOptions = {
      from: '"Academic Administration" <no-reply@unisched.edu>',
      to: adminEmail,
      subject: 'Admin Password Recovery',
      text: \`Hello,\\n\\nYour admin credentials are:\\nUsername: \${adminUser}\\nPassword: \${adminPass}\\n\\nPlease keep them secure.\`,
    };
    
    await transporter.sendMail(mailOptions);
    res.json({ ok: true, message: 'Credentials sent to your email.' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ error: 'Failed to send recovery email.' });
  }
});

`;

const target = `app.post('/api/login', (req, res) => {`;

if (code.includes(target) && !code.includes('/api/forgot-password')) {
  code = code.replace(target, injection + target);
  fs.writeFileSync('server.js', code);
  console.log('Forgot password route added successfully.');
} else {
  console.log('Target not found or route already exists.');
}
