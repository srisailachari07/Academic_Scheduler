'use strict';
/**
 * UniSched Admin — Express Backend
 * ══════════════════════════════════
 * REST API:
 *   GET  /api/state          — load persisted semester state
 *   PUT  /api/state          — save semester state
 *   POST /api/generate       — run scheduling engine for a given semester
 *   GET  /api/health         — server health check
 *   POST /api/validate       — validate an existing schedule
 */

const express  = require('express');
const cors     = require('cors');
const fs       = require('fs');
const path     = require('path');
const nodemailer = require('nodemailer');
const twilio = require('twilio');
const multer = require('multer');
const xlsx = require('xlsx');
require('dotenv').config();

const { generateSchedule } = require('./scheduler');

const app       = express();
const PORT      = 3000;
const STATE_FILE = path.join(__dirname, 'state.json');
const INSTRUCTORS_FILE = path.join(__dirname, 'instructors.json');
const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Disable caching for all static files to prevent browser caching issues
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

app.use(express.static(__dirname));

/* ── Helpers ── */
const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = 'https://gvgaafrfwclmppuqqvac.supabase.co';
const SUPABASE_KEY = 'sb_publishable_vNkf_syOq3oRlzIhcoB1Sw_0zcJg57n';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

let cachedState = null;
let cachedInstructors = null;

async function loadStateAsync() {
  const { data, error } = await supabase.from('unisched_data').select('data').eq('id', 'state').single();
  if (error || !data) {
    if (fs.existsSync(STATE_FILE)) return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
    return null;
  }
  return data.data;
}

function loadState() {
  if (cachedState) return cachedState;
  if (fs.existsSync(STATE_FILE)) return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  return null;
}

async function saveStateAsync(state) {
  cachedState = state;
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2)); // backup
  await supabase.from('unisched_data').upsert({ id: 'state', data: state }, { onConflict: 'id' });
}
function saveState(state) {
  saveStateAsync(state).catch(e => console.error('Supabase save error:', e.message));
}

async function loadInstructorsAsync() {
  const { data, error } = await supabase.from('unisched_data').select('data').eq('id', 'instructors').single();
  if (error || !data) {
    if (fs.existsSync(INSTRUCTORS_FILE)) return JSON.parse(fs.readFileSync(INSTRUCTORS_FILE, 'utf8'));
    return {};
  }
  return data.data;
}

function loadInstructors() {
  if (cachedInstructors) return cachedInstructors;
  if (fs.existsSync(INSTRUCTORS_FILE)) return JSON.parse(fs.readFileSync(INSTRUCTORS_FILE, 'utf8'));
  return {};
}

async function saveInstructorsAsync(data) {
  cachedInstructors = data;
  fs.writeFileSync(INSTRUCTORS_FILE, JSON.stringify(data, null, 2)); // backup
  await supabase.from('unisched_data').upsert({ id: 'instructors', data: data }, { onConflict: 'id' });
}
function saveInstructors(data) {
  saveInstructorsAsync(data).catch(e => console.error('Supabase save error:', e.message));
}

// Initial Sync from Supabase
loadStateAsync().then(s => { if (s) cachedState = s; });
loadInstructorsAsync().then(i => { if (i) cachedInstructors = i; });

/* ─────────────────────── ROUTES ─────────────────────── */

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', engine: 'UniSched v4', time: new Date().toISOString() });
});

app.get('/api/state', (_req, res) => {
  res.json(loadState());
});

app.put('/api/state', (req, res) => {
  try {
    saveState(req.body);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* ── AUTH & INSTRUCTORS ── */
app.post('/api/forgot-password', async (req, res) => {
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
      text: `Hello,\n\nYour admin credentials are:\nUsername: ${adminUser}\nPassword: ${adminPass}\n\nPlease keep them secure.`,
    };
    
    await transporter.sendMail(mailOptions);
    res.json({ ok: true, message: 'Credentials sent to your email.' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ error: 'Failed to send recovery email.' });
  }
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const adminUser = process.env.ADMIN_USER || 'admin';
  const adminPass = process.env.ADMIN_PASS || 'admin';
  if (username === adminUser && password === adminPass) {
    return res.json({ token: 'mock-admin', role: 'admin', username: adminUser });
  }
  const instrs = loadInstructors();
  const instr = Object.values(instrs).find(i => i.username === username && i.password === password);
  if (instr) {
    return res.json({ token: 'mock-instr-' + username, role: 'instructor', username: instr.name });
  }
  res.status(401).json({ error: 'Invalid credentials' });
});

app.get('/api/instructors', (req, res) => {
  res.json(loadInstructors());
});

app.post('/api/instructors', (req, res) => {
  try {
    saveInstructors(req.body);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/my-schedule', (req, res) => {
  // Simple auth extraction from Bearer token
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '');
  if (!token.startsWith('mock-instr-')) return res.status(401).json({ error: 'Unauthorized' });
  
  const username = token.replace('mock-instr-', '');
  const instrs = loadInstructors();
  const instr = Object.values(instrs).find(i => i.username === username);
  if (!instr) return res.status(401).json({ error: 'Instructor not found' });

  const state = loadState();
  const schedule = state?.semesters?.[0]?.schedule || {};
  
  const mySchedule = {};
  const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const PIDS = ['P1','P2','P3','P4','P5','P6','P7','P8'];
  
  DAYS.forEach(day => {
    mySchedule[day] = [];
    Object.keys(schedule[day] || {}).forEach(sec => {
      PIDS.forEach(pid => {
        const sess = schedule[day][sec][pid];
        if (sess && sess.instructor === instr.name) {
          const subjDef = state.semesters[0].subjects.find(s => s.code === sess.code);
          const subjName = subjDef ? subjDef.name : sess.code;
          mySchedule[day].push({ pid, section: sec, name: subjName, type: sess.type });
        }
      });
    });
  });
  
  res.json({ schedule: mySchedule, instructorName: instr.name });
});

/* ── EXCEL UPLOAD/DOWNLOAD ── */
app.get('/api/template', (req, res) => {
  const wb = xlsx.utils.book_new();
  const wsData = [
    ['Subject Code', 'Subject Name', 'Instructor Name', 'Type', 'Email', 'WhatsApp', 'Lecture Hrs', 'Lab Hrs'],
    ['BTNX212', 'Mathematics 2', 'DILEEP KUMAR', 'lecture', 'dileep@example.com', '+1234567890', 2, 0],
    ['MATH2P', 'Mathematics 2 Practice', 'DILEEP KUMAR', 'practice', 'dileep@example.com', '+1234567890', 0, 2]
  ];
  const ws = xlsx.utils.aoa_to_sheet(wsData);
  xlsx.utils.book_append_sheet(wb, ws, 'Subjects');
  const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
  res.setHeader('Content-Disposition', 'attachment; filename="Academic_Scheduler_Template.xlsx"');
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.send(buffer);
});

app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  try {
    const wb = xlsx.readFile(req.file.path);
    const ws = wb.Sheets[wb.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(ws);
    
    const subjects = [];
    const instrs = loadInstructors();
    
    data.forEach(row => {
      const code = row['Subject Code'] || row['Code'];
      const name = row['Subject Name'] || row['Name'];
      const instrName = (row['Instructor Name'] || row['Instructor'] || 'UNIVERSITY FACULTY').trim().toUpperCase();
      const type = (row['Type'] || 'lecture').toLowerCase();
      const lec = parseInt(row['Lecture Hrs']) || 0;
      const lab = parseInt(row['Lab Hrs'] || row['Practice Hrs']) || 0;
      
      if (code && name) {
        const colors = [
          '#ffadad', '#ffd6a5', '#fdffb6', '#caffbf', '#9bf6ff', '#a0c4ff', '#bdb2ff', '#ffc6ff', '#fffffc', '#f1f5f9',
          '#f87171', '#fb923c', '#fbbf24', '#a3e635', '#4ade80', '#34d399', '#2dd4bf', '#38bdf8', '#818cf8', '#a78bfa',
          '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e', '#10b981', '#14b8a6', '#0ea5e9', '#6366f1', '#8b5cf6',
          '#b91c1c', '#c2410c', '#b45309', '#4d7c0f', '#15803d', '#047857', '#0f766e', '#0369a1', '#4338ca', '#6d28d9',
          '#f43f5e', '#ec4899', '#d946ef', '#94a3b8', '#64748b', '#475569', '#334155', '#1e293b', '#0f172a', '#000000'
        ];
        const color = colors[Math.floor(Math.random() * colors.length)];
        subjects.push({ code, name, instructor: instrName, type, lecPerWeek: lec, labPerWeek: lab, color, textColor: '#1a1a1a' });
        
        if (instrName !== 'UNIVERSITY FACULTY') {
          if (!instrs[instrName]) {
            instrs[instrName] = {
              name: instrName,
              email: row['Email'] || '',
              whatsapp: row['WhatsApp'] || '',
              username: instrName.toLowerCase().replace(/\s+/g, '_'),
              password: Math.random().toString(36).slice(-8)
            };
          } else {
            // Update contact info if missing
            if (row['Email'] && !instrs[instrName].email) instrs[instrName].email = row['Email'];
            if (row['WhatsApp'] && !instrs[instrName].whatsapp) instrs[instrName].whatsapp = row['WhatsApp'];
          }
        }
      }
    });
    
    saveInstructors(instrs);
    
    const state = loadState() || { semesters: [{ id: 'S1', label: 'Imported Semester', sections: ['Section-1', 'Section-2', 'Section-3'], subjects: [], fixedPlacements: [], fixedSlots: [] }] };
    if (state.semesters.length > 0) {
      state.semesters[0].subjects = subjects;
      // Provide some default fixed slots if missing
      if (!state.semesters[0].fixedSlots || state.semesters[0].fixedSlots.length === 0) {
         state.semesters[0].fixedSlots = [
          {code:'MODQUIZ',  name:'Module Quiz', instructor:'', isFixed:true}
         ];
      }
    }
    saveState(state);
    
    fs.unlinkSync(req.file.path);
    res.json({ ok: true, subjectsAdded: subjects.length, instructorsProcessed: Object.keys(instrs).length });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

const { generateExcelBuffer } = require('./excel-export');

app.post('/api/export-excel', async (req, res) => {
  const { sem } = req.body;
  if (!sem) return res.status(400).json({ error: '"sem" field required' });

  try {
    const buffer = await generateExcelBuffer(sem);
    res.setHeader('Content-Disposition', `attachment; filename="Timetable_${sem.id || 'export'}.xlsx"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (err) {
    console.error('Excel Export Error:', err);
    res.status(500).json({ error: 'Failed to generate Excel file' });
  }
});

app.post('/api/generate', (req, res) => {
  const { sem } = req.body;
  if (!sem) return res.status(400).json({ error: '"sem" field required' });

  const start = Date.now();
  try {
    const result = generateSchedule(sem);
    const ms = Date.now() - start;

    console.log(
      `[generate] ${sem.label || sem.id}` +
      ` | ${result.unplaced} unplaced` +
      ` | ${result.imbalances.length} imbalances` +
      ` | ${result.capacityWarnings.length} warnings` +
      ` | ${ms}ms`
    );

    res.json({ ...result, generatedMs: ms });
  } catch (e) {
    console.error('[generate error]', e);
    res.status(500).json({ error: e.message, stack: e.stack });
  }
});

app.post('/api/validate', (req, res) => {
  const { sem } = req.body;
  if (!sem || !sem.schedule) return res.status(400).json({ error: '"sem.schedule" required' });

  const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const PIDS  = ['P1','P2','P3','P4','P5','P6','P7','P8'];
  const sections = sem.sections || [];
  const subjects  = sem.subjects  || [];
  const sched     = sem.schedule;

  const sectionCounts = {};
  sections.forEach(sec => {
    sectionCounts[sec] = {};
    subjects.forEach(s => {
      sectionCounts[sec][s.code] = { lec: 0, lab: 0, expected_lec: s.lecPerWeek || 0, expected_lab: s.labPerWeek || 0 };
    });
  });

  let conflicts = 0;
  let p1Violations = 0;
  
  DAYS.forEach(day => {
    PIDS.forEach(pid => {
      const seen = {};
      sections.forEach(sec => {
        const sess = sched[day]?.[sec]?.[pid];
        if (!sess) return;
        if (sess.instructor && sess.instructor !== 'UNIVERSITY FACULTY') {
          if (seen[sess.instructor]) conflicts++;
          else seen[sess.instructor] = true;
        }
        if (pid === 'P1' && (sess.type === 'lab' || sess.type === 'practice')) p1Violations++;
        if (sectionCounts[sec]?.[sess.code]) {
          if (sess.type === 'lab' || sess.type === 'practice') sectionCounts[sec][sess.code].lab++;
          else if (sess.type === 'lecture') sectionCounts[sec][sess.code].lec++;
        }
      });
    });
  });

  const imbalances = subjects.filter(s => {
    const lecs = sections.map(sec => sectionCounts[sec]?.[s.code]?.lec || 0);
    const labs  = sections.map(sec => sectionCounts[sec]?.[s.code]?.lab || 0);
    return !lecs.every(c => c === (s.lecPerWeek || 0)) || !labs.every(c => c === (s.labPerWeek || 0));
  }).map(s => ({ code: s.code, name: s.name, sections: Object.fromEntries(sections.map(sec => [sec, sectionCounts[sec]?.[s.code]])) }));

  res.json({ conflicts, p1Violations, imbalances, sectionCounts });
});

app.post('/api/publish', async (req, res) => {
  const { schedule, weekNum, startStr, endStr } = req.body;
  if (!schedule) return res.status(400).json({ error: 'Missing schedule data' });

  try {
    // Ensure workloads directory exists
    const workloadsDir = path.join(__dirname, 'workloads');
    if (!fs.existsSync(workloadsDir)) fs.mkdirSync(workloadsDir);

    const PERIOD_TIMES = {
      'P1': '09:00 AM - 09:50 AM',
      'P2': '09:50 AM - 10:40 AM',
      'P3': '10:50 AM - 11:40 AM',
      'P4': '11:40 AM - 12:30 PM',
      'P5': '01:10 PM - 02:00 PM',
      'P6': '02:00 PM - 02:50 PM',
      'P7': '03:00 PM - 03:50 PM',
      'P8': '03:50 PM - 04:40 PM',
    };
    
    const startD = new Date(startStr);
    const dayOffsets = { 'Mon': 0, 'Tue': 1, 'Wed': 2, 'Thu': 3, 'Fri': 4 };

    // Group schedule by instructor
    const instrSchedules = {};
    const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    const PIDS = ['P1','P2','P3','P4','P5','P6','P7','P8'];

    const state = loadState();
    const subjects = state?.semesters?.[0]?.subjects || [];

    DAYS.forEach(day => {
      const classDate = new Date(startD);
      classDate.setDate(classDate.getDate() + dayOffsets[day]);
      const dateStr = classDate.toISOString().split('T')[0];

      Object.keys(schedule[day] || {}).forEach(sec => {
        PIDS.forEach(pid => {
          const sess = schedule[day][sec][pid];
          if (sess && sess.instructor && sess.instructor !== 'UNIVERSITY FACULTY') {
            if (!instrSchedules[sess.instructor]) instrSchedules[sess.instructor] = [];
            const capType = sess.type.charAt(0).toUpperCase() + sess.type.slice(1);
            const subjDef = subjects.find(s => s.code === sess.code);
            const subjName = subjDef ? subjDef.name : (sess.name || sess.code);
            instrSchedules[sess.instructor].push(`${dateStr} | ${day} | ${PERIOD_TIMES[pid]} | ${subjName} (${sec}) | ${capType}`);
          }
        });
      });
    });

    // Setup mock transports using environment variables
    let transporter;
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: process.env.SMTP_PORT || 587,
        secure: false,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      });
    } else {
      console.log('No SMTP credentials found. Creating Ethereal test account...');
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    }
    
    // Setup Twilio
    const twilioClient = (process.env.TWILIO_SID && process.env.TWILIO_TOKEN) 
      ? twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN) 
      : null;
    
    console.log(`\n===========================================`);
    console.log(`🚀 PUBLISHING SCHEDULE FOR ${weekNum} (${startStr} to ${endStr})`);
    console.log(`===========================================\n`);

    // Load instructors to get emails and phones
    const instrs = loadInstructors();

    // Generate files and send logic in the background to prevent request timeout
    const totalInstructors = Object.keys(instrSchedules).length;
    
    (async () => {
      let totalSent = 0;
      for (const [instrName, sessions] of Object.entries(instrSchedules)) {
        const formatted = `WORKLOAD FOR ${instrName.toUpperCase()}\n${weekNum} (${startStr} to ${endStr})\n\n` + sessions.join('\n');
        
        const instrData = instrs[instrName] || { email: 'unknown@unisched.edu', whatsapp: '+000000000' };

        // Save locally as proof of generation
        const filename = path.join(workloadsDir, `${weekNum.replace(' ', '_')}_${instrName.replace(/\s+/g, '_')}.txt`);
        fs.writeFileSync(filename, formatted);

        // Email Sending
        const htmlBody = `
          <div style="font-family:sans-serif;color:#333;line-height:1.6;max-width:600px;">
            <h2 style="color:#00236f;">Academic Scheduler Update</h2>
            <p>Dear <strong>${instrName}</strong>,</p>
            <p>We hope this email finds you well.</p>
            <p>Please be advised that your teaching schedule for <strong>${weekNum}</strong> (${startStr} to ${endStr}) has been finalized. Below is a summary of your assigned workload for the upcoming week:</p>
            <pre style="background:#f8fafc;padding:15px;border-radius:8px;border:1px solid #e2e8f0;font-family:monospace;overflow-x:auto;">${formatted}</pre>
            <p>For a detailed day-by-day breakdown, please log in to your Instructor Portal.</p>
            <br>
            <p>Best regards,<br><strong>Academic Administration</strong></p>
          </div>
        `;
        const mailOptions = {
          from: '"Academic Administration" <no-reply@unisched.edu>',
          to: instrData.email || 'unknown@unisched.edu',
          subject: `Your Teaching Schedule for ${weekNum}`,
          text: `Dear ${instrName},\n\nWe hope this email finds you well.\n\nPlease be advised that your teaching schedule for ${weekNum} (${startStr} to ${endStr}) has been finalized.\n\n${formatted}\n\nBest regards,\nAcademic Administration`,
          html: htmlBody
        };
        
        try {
          const info = await transporter.sendMail(mailOptions);
          console.log(`📧 [EMAIL SENT] To: ${instrData.email}`);
          if (nodemailer.getTestMessageUrl(info)) {
            console.log(`   🔗 Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
          }
        } catch(e) {
          console.error(`📧 [EMAIL FAILED] To: ${instrData.email} - ${e.message}`);
        }
        
        // WhatsApp Sending
        const waMsg = `Dear ${instrName},\n\nWe hope this message finds you well.\n\nPlease be advised that your teaching schedule for ${weekNum} (${startStr} to ${endStr}) has been finalized and is now available.\n\nKindly log in to your Instructor Portal to view your detailed workload.\n\nBest regards,\nAcademic Administration`;
        if (twilioClient && instrData.whatsapp) {
          try {
            await twilioClient.messages.create({
              body: waMsg,
              from: `whatsapp:${process.env.TWILIO_WHATSAPP_FROM}`,
              to: `whatsapp:${instrData.whatsapp}`
            });
            console.log(`📱 [WHATSAPP SENT] To: ${instrData.whatsapp}`);
          } catch(e) {
            console.error(`📱 [WHATSAPP FAILED] To: ${instrData.whatsapp} - ${e.message}`);
          }
        } else {
          console.log(`📱 [WHATSAPP SIMULATED] To: ${instrData.whatsapp}`);
        }
        
        totalSent++;
      }
      console.log(`\n✅ Background publish complete: Sent to ${totalSent} instructors.`);
    })().catch(err => console.error('[Background Publish Error]', err));

    res.json({ ok: true, totalInstructors, message: `Publishing to ${totalInstructors} instructors in the background...` });
  } catch (err) {
    console.error('[Publish Error]', err);
    res.status(500).json({ error: err.message });
  }
});

/* ─────────────────────────────────────────────────────── */
app.listen(PORT, () => {
  console.log('  ╔══════════════════════════════════════════╗');
  console.log('  ║   Academic Scheduler — Backend v4.0      ║');
  console.log(`  ║   Running at http://localhost:${PORT}       ║`);
  console.log('  ╚══════════════════════════════════════════╝');
});
