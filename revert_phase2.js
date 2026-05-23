const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, 'unisched-admin', 'index.html');

if (!fs.existsSync(indexPath)) {
  console.error("index.html not found.");
  process.exit(1);
}

let content = fs.readFileSync(indexPath, 'utf8');

// Normalize line endings to avoid matching issues
content = content.replace(/\r\n/g, '\n');

// 1. Revert INITIAL_DEFAULT_PERIODS & updateGlobalContextForActiveUniversity
const targetHelperBlock = `const INITIAL_DEFAULT_PERIODS = [
  {id:'P1', start:'09:00', end:'09:50', type:'teaching', num:1},
  {id:'P2', start:'09:50', end:'10:40', type:'teaching', num:2},
  {id:'SB1',start:'10:40', end:'10:50', type:'break',    name:'Short Break'},
  {id:'P3', start:'10:50', end:'11:40', type:'teaching', num:3},
  {id:'P4', start:'11:40', end:'12:30', type:'teaching', num:4},
  {id:'LB', start:'12:30', end:'13:10', type:'lunch',    name:'Lunch'},
  {id:'P5', start:'13:10', end:'14:00', type:'teaching', num:5},
  {id:'P6', start:'14:00', end:'14:50', type:'teaching', num:6},
  {id:'SB2',start:'14:50', end:'15:00', type:'break',    name:'Short Break'},
  {id:'P7', start:'15:00', end:'15:50', type:'teaching', num:7},
  {id:'P8', start:'15:50', end:'16:40', type:'teaching', num:8},
];

function curUniversity() {
  if (!STATE.universities || STATE.universities.length === 0) return null;
  return STATE.universities.find(u => u.id === STATE.currentUniversityId) || STATE.universities[0] || null;
}

function updateGlobalContextForActiveUniversity() {
  const uni = curUniversity();
  if (!uni) return;

  // 1. Sync semesters array
  if (!uni.semesters) uni.semesters = [];
  if (uni.semesters.length === 0) {
    uni.semesters.push({
      id: 'Y2-S2-2024',
      label: 'Year 2 · Sem 2 · 2024',
      year: 2, sem: 2, cohort: '2024',
      sections: ['Section-1','Section-2','Section-3'],
      subjects: JSON.parse(JSON.stringify(DEFAULT_SUBJECTS)),
      fixedSlots: JSON.parse(JSON.stringify(FIXED_SLOT_DEFS)),
      fixedPlacements: makeDefaultPlacements(['Section-1','Section-2','Section-3']),
      schedule: {},
    });
    uni.currentSemId = 'Y2-S2-2024';
  }
  STATE.semesters = uni.semesters;
  STATE.currentSemId = uni.currentSemId || uni.semesters[0].id;

  // 2. Sync dynamic PERIODS array in-place
  if (!uni.periods || uni.periods.length === 0) {
    uni.periods = JSON.parse(JSON.stringify(INITIAL_DEFAULT_PERIODS));
  }
  PERIODS.length = 0;
  uni.periods.forEach(p => {
    p.label = \`\${p.start}–\${p.end}\`;
    PERIODS.push(p);
  });

  // Re-generate TEACHING_PERIODS dynamically in-place
  TEACHING_PERIODS.length = 0;
  PERIODS.filter(p => p.type === 'teaching').forEach(p => TEACHING_PERIODS.push(p));

  // 3. Sync dynamic instructors datalist in frontend
  if (!uni.instructors) uni.instructors = {};
  App.globalInstructors = Object.values(uni.instructors).map(d => d.name).sort();
  buildInstrDatalist();
}`;

const originalHelperBlock = `const DEFAULT_TIMINGS = {
  P1: { start: '09:00', end: '09:50' },
  P2: { start: '09:50', end: '10:40' },
  SB1: { start: '10:40', end: '10:50', name: 'Short Break' },
  P3: { start: '10:50', end: '11:40' },
  P4: { start: '11:40', end: '12:30' },
  LB: { start: '12:30', end: '13:10', name: 'Lunch' },
  P5: { start: '13:10', end: '14:00' },
  P6: { start: '14:00', end: '14:50' },
  SB2: { start: '14:50', end: '15:00', name: 'Short Break' },
  P7: { start: '15:00', end: '15:50' },
  P8: { start: '15:50', end: '16:40' }
};

function curUniversity() {
  if (!STATE.universities || STATE.universities.length === 0) return null;
  return STATE.universities.find(u => u.id === STATE.currentUniversityId) || STATE.universities[0] || null;
}

function updateGlobalPeriodsFromUniversity() {
  const uni = curUniversity();
  if (!uni || !uni.timings) return;
  PERIODS.forEach(p => {
    const t = uni.timings[p.id];
    if (t) {
      p.start = t.start;
      p.end = t.end;
      p.label = \`\${t.start}–\${t.end}\`;
      if (t.name) p.name = t.name;
    }
  });
}`;

if (content.includes(targetHelperBlock)) {
  content = content.replace(targetHelperBlock, originalHelperBlock);
  console.log("1. Reverted helper declarations.");
} else {
  console.warn("1. Helper block not found exactly.");
}

// 2. Revert loadState university configuration
const targetLoadStateSeeding = `  // Initialize universities directory (26 entries for 25+ universities) if it does not exist
  if (!STATE.universities || STATE.universities.length === 0) {
    const list = [
      'Stitch Enterprise Academic University', 'Apex Technology Institute', 'Stitch University of Science',
      'Summit Research University', 'Beacon Hill College', 'Vanguard Engineering Academy',
      'Meridian State University', 'Pacific Crest University', 'Metro Business School',
      'Atlas Design Academy', 'Cascade Culinary Institute', 'Apex Medical College',
      'Pinnacle Flight Academy', 'Liberty Law School', 'Zenith Arts & Science College',
      'Nova Maritime University', 'Horizon Engineering College', 'Vanguard Business Academy',
      'Equinox Theological Seminary', 'Elysian Music Conservatory', 'Fortis Military Institute',
      'Sovereign Sports University', 'Aegis Security College', 'Omni Virtual University',
      'Stellar Aerospace Academy', 'Unity Environmental College'
    ];
    STATE.universities = list.map((name, idx) => {
      const uId = 'U' + (idx + 1);
      return {
        id: uId,
        name: name,
        periods: JSON.parse(JSON.stringify(INITIAL_DEFAULT_PERIODS)),
        semesters: [
          {
            id: 'Y2-S2-2024',
            label: 'Year 2 · Sem 2 · 2024',
            year: 2, sem: 2, cohort: '2024',
            sections: ['Section-1','Section-2','Section-3'],
            subjects: JSON.parse(JSON.stringify(DEFAULT_SUBJECTS)),
            fixedSlots: JSON.parse(JSON.stringify(FIXED_SLOT_DEFS)),
            fixedPlacements: makeDefaultPlacements(['Section-1','Section-2','Section-3']),
            schedule: {},
          }
        ],
        currentSemId: 'Y2-S2-2024',
        instructors: {}
      };
    });
    STATE.currentUniversityId = 'U1';
  }

  // Migrate: Ensure INTASSESS and MIDTERM exist in all semesters of all universities
  (STATE.universities||[]).forEach(uni => {
    (uni.semesters||[]).forEach(sem => {
      if (!sem.fixedSlots) sem.fixedSlots = [];
      ['INTASSESS', 'MIDTERM'].forEach(code => {
        if (!sem.fixedSlots.find(s => s.code === code)) {
          const def = FIXED_SLOT_DEFS.find(d => d.code === code);
          if (def) sem.fixedSlots.push(JSON.parse(JSON.stringify(def)));
        }
      });
    });
  });

  updateGlobalContextForActiveUniversity();`;

const originalLoadStateSeeding = `  // Initialize universities directory (26 entries for 25+ universities)
  if (!STATE.universities || STATE.universities.length === 0) {
    const list = [
      'Stitch Enterprise Academic University', 'Apex Technology Institute', 'Stitch University of Science',
      'Summit Research University', 'Beacon Hill College', 'Vanguard Engineering Academy',
      'Meridian State University', 'Pacific Crest University', 'Metro Business School',
      'Atlas Design Academy', 'Cascade Culinary Institute', 'Apex Medical College',
      'Pinnacle Flight Academy', 'Liberty Law School', 'Zenith Arts & Science College',
      'Nova Maritime University', 'Horizon Engineering College', 'Vanguard Business Academy',
      'Equinox Theological Seminary', 'Elysian Music Conservatory', 'Fortis Military Institute',
      'Sovereign Sports University', 'Aegis Security College', 'Omni Virtual University',
      'Stellar Aerospace Academy', 'Unity Environmental College'
    ];
    STATE.universities = list.map((name, idx) => ({
      id: 'U' + (idx + 1),
      name: name,
      timings: JSON.parse(JSON.stringify(DEFAULT_TIMINGS))
    }));
    STATE.currentUniversityId = 'U1';
  }
  updateGlobalPeriodsFromUniversity();

  // Migration: Ensure INTASSESS and MIDTERM exist in all semesters
  (STATE.semesters||[]).forEach(sem => {
    if (!sem.fixedSlots) sem.fixedSlots = [];
    ['INTASSESS', 'MIDTERM'].forEach(code => {
      if (!sem.fixedSlots.find(s => s.code === code)) {
        const def = FIXED_SLOT_DEFS.find(d => d.code === code);
        if (def) sem.fixedSlots.push(JSON.parse(JSON.stringify(def)));
      }
    });
  });`;

if (content.includes(targetLoadStateSeeding)) {
  content = content.replace(targetLoadStateSeeding, originalLoadStateSeeding);
  console.log("2. Reverted loadState university config.");
} else {
  console.warn("2. loadState university config not found exactly.");
}

// 3. Revert generateScheduleBackend
const targetGenerateBackend = `async function generateScheduleBackend(sem) {
  if (_backendOnline) {
    try {
      const activeUni = curUniversity();
      const r = await fetch(\`\${API}/api/generate\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          sem: {
            ...sem,
            periods: activeUni ? activeUni.periods : null,
            fixedPlacements: [
              ...(sem.fixedPlacements || []),
              ...extractManualFixed(sem)
            ]
          }
        }),
      });`;

const originalGenerateBackend = `async function generateScheduleBackend(sem) {
  if (_backendOnline) {
    try {
      const r = await fetch(\`\${API}/api/generate\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          sem: {
            ...sem,
            fixedPlacements: [
              ...(sem.fixedPlacements || []),
              ...extractManualFixed(sem)
            ]
          }
        }),
      });`;

if (content.includes(targetGenerateBackend)) {
  content = content.replace(targetGenerateBackend, originalGenerateBackend);
  console.log("3. Reverted generateScheduleBackend.");
} else {
  console.warn("3. generateScheduleBackend not found exactly.");
}

// 4. Revert exportExcel timings sync
const targetExportExcel = `      const activeUni = curUniversity();
      const semWithTimings = {
        ...sem,
        timings: activeUni ? activeUni.timings : null
      };
      const r = await fetch(\`\${API}/api/export-excel\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sem: semWithTimings })
      });`;

const originalExportExcel = `      const activeUni = curUniversity();
      const semWithTimings = {
        ...sem,
        timings: activeUni ? activeUni.timings : null
      };
      const r = await fetch(\`\${API}/api/export-excel\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sem: semWithTimings })
      });`;
// Wait, exportExcel passed timings in Yesterday's version too. We can leave it as is or match exactly.

// 5. Revert App semester management functions
const targetSemFunctions = `    STATE.semesters.push(newSem);
    const uni = curUniversity();
    if (uni) {
      uni.currentSemId = id;
    }
    updateGlobalContextForActiveUniversity();
    renderSemesterSelect();
    this.closeModal('sem-modal');
    saveState();
    generateSchedule(newSem);
    saveState();
    renderScheduleTable();
    renderStatsBar();
    toast(\`Created: \${label}\`, 'success');
  },

  deleteSemester(id) {
    if (!confirm('Delete this semester and all its data?')) return;
    const uni = curUniversity();
    if (!uni) return;
    uni.semesters = uni.semesters.filter(s=>s.id!==id);
    if (uni.currentSemId === id) uni.currentSemId = uni.semesters[0]?.id||'';
    updateGlobalContextForActiveUniversity();
    renderSemesterSelect();
    saveState();
    renderSettingsView();
    toast('Semester deleted','info');
  },

  copySemester(id) {
    const uni = curUniversity();
    if (!uni) return;
    const src = uni.semesters.find(s=>s.id===id);
    if (!src) return;
    const newId = src.id + '-copy-' + Date.now();
    const copy = JSON.parse(JSON.stringify(src));
    copy.id = newId;
    copy.label = src.label + ' (Copy)';
    copy.schedule = {};
    uni.semesters.push(copy);
    updateGlobalContextForActiveUniversity();
    renderSemesterSelect();
    saveState();
    renderSettingsView();
    toast('Semester copied. Switch to it to edit.','success');
  },`;

const originalSemFunctions = `    STATE.semesters.push(newSem);
    STATE.currentSemId = id;
    renderSemesterSelect();
    this.closeModal('sem-modal');
    saveState();
    generateSchedule(newSem);
    saveState();
    renderScheduleTable();
    renderStatsBar();
    toast(\`Created: \${label}\`, 'success');
  },

  deleteSemester(id) {
    if (!confirm('Delete this semester and all its data?')) return;
    STATE.semesters = STATE.semesters.filter(s=>s.id!==id);
    if (STATE.currentSemId === id) STATE.currentSemId = STATE.semesters[0]?.id||'';
    renderSemesterSelect();
    saveState();
    renderSettingsView();
    toast('Semester deleted','info');
  },

  copySemester(id) {
    const src = STATE.semesters.find(s=>s.id===id);
    if (!src) return;
    const newId = src.id + '-copy-' + Date.now();
    const copy = JSON.parse(JSON.stringify(src));
    copy.id = newId;
    copy.label = src.label + ' (Copy)';
    copy.schedule = {};
    STATE.semesters.push(copy);
    renderSemesterSelect();
    saveState();
    renderSettingsView();
    toast('Semester copied','success');
  },`;

if (content.includes(targetSemFunctions)) {
  content = content.replace(targetSemFunctions, originalSemFunctions);
  console.log("5. Reverted semester functions.");
} else {
  console.warn("5. Semester functions not found exactly.");
}

// 6. Revert changeSemester
const targetChangeSemester = `  changeSemester(id) {
    STATE.currentSemId = id;
    const uni = curUniversity();
    if (uni) {
      uni.currentSemId = id;
    }
    saveState();
    renderTopbar();
    this.updateWeekDropdown();
    renderScheduleTable();
    renderStatsBar();
    this.showView('schedule');
    toast('Switched to ' + (curSem()?.label||id), 'info');
  },`;

const originalChangeSemester = `  changeSemester(id) {
    STATE.currentSemId = id;
    saveState();
    renderTopbar();
    renderScheduleTable();
    renderStatsBar();
    this.showView('schedule');
    toast('Switched to ' + (curSem()?.label||id), 'info');
  },`;

if (content.includes(targetChangeSemester)) {
  content = content.replace(targetChangeSemester, originalChangeSemester);
  console.log("6. Reverted changeSemester.");
} else {
  // Let's try matching with updateWeekDropdown or renderTopbar
  const regex = /changeSemester\(id\) {[\s\S]*?toast\('Switched to ' \+ \(curSem\(\)\?\.label\|\|id\), 'info'\);?\n?\s*?},/;
  if (regex.test(content)) {
    content = content.replace(regex, originalChangeSemester);
    console.log("6. Reverted changeSemester via regex.");
  } else {
    console.warn("6. changeSemester not found.");
  }
}

// 7. Revert selectUniversity, addUniversity, deleteUniversity, saveUniversityTimings
const targetUniManagement = `  selectUniversity(id) {
    STATE.currentUniversityId = id;
    updateGlobalContextForActiveUniversity();
    saveState();
    renderTopbar();
    renderSemesterSelect();
        const activeNav = document.querySelector('.nav-item.active');
    const activeView = activeNav ? activeNav.dataset.view : 'schedule';
    this.showView(activeView);
    toast('Switched university settings', 'info');
  },

  addUniversity() {
    const name = prompt('Enter new university name:');
    if (!name || !name.trim()) return;
    const id = 'U' + Date.now();
    if (!STATE.universities) STATE.universities = [];
    STATE.universities.push({
      id: id,
      name: name.trim(),
      periods: JSON.parse(JSON.stringify(INITIAL_DEFAULT_PERIODS)),
      semesters: [
        {
          id: 'Y2-S2-2024',
          label: 'Year 2 · Sem 2 · 2024',
          year: 2, sem: 2, cohort: '2024',
          sections: ['Section-1','Section-2','Section-3'],
          subjects: JSON.parse(JSON.stringify(DEFAULT_SUBJECTS)),
          fixedSlots: JSON.parse(JSON.stringify(FIXED_SLOT_DEFS)),
          fixedPlacements: makeDefaultPlacements(['Section-1','Section-2','Section-3']),
          schedule: {},
        }
      ],
      currentSemId: 'Y2-S2-2024',
      instructors: {}
    });
    STATE.currentUniversityId = id;
    updateGlobalContextForActiveUniversity();
    saveState();
    renderTopbar();
    renderSemesterSelect();
        const activeNav = document.querySelector('.nav-item.active');
    const activeView = activeNav ? activeNav.dataset.view : 'schedule';
    this.showView(activeView);
    toast(\`Added: \${name.trim()}\`, 'success');
  },

  deleteUniversity(id) {
    if (!confirm('Are you sure you want to delete this university?')) return;
    STATE.universities = STATE.universities.filter(u => u.id !== id);
    if (STATE.currentUniversityId === id) {
      STATE.currentUniversityId = STATE.universities[0]?.id || '';
    }
    updateGlobalContextForActiveUniversity();
    saveState();
    renderTopbar();
    renderSemesterSelect();
        const activeNav = document.querySelector('.nav-item.active');
    const activeView = activeNav ? activeNav.dataset.view : 'schedule';
    this.showView(activeView);
    toast('University deleted', 'info');
  },

  saveUniversityTimings() {
    const currentUni = curUniversity();
    if (!currentUni) return;

    const newName = document.getElementById('uni-name-input').value.trim();
    if (!newName) {
      toast('University name cannot be empty', 'error');
      return;
    }
    currentUni.name = newName;

    const starts = document.querySelectorAll('.time-start-input');
    const ends = document.querySelectorAll('.time-end-input');

    if (currentUni.periods) {
      starts.forEach((input, idx) => {
        const pid = input.dataset.pid;
        const startVal = input.value.trim();
        const endVal = ends[idx].value.trim();
        
        const periodObj = currentUni.periods.find(p => p.id === pid);
        if (periodObj) {
          periodObj.start = startVal;
          periodObj.end = endVal;
        }
      });
    }

    updateGlobalContextForActiveUniversity();
    saveState();
    renderTopbar();
    renderScheduleTable();
    renderStatsBar();
    renderUniversitiesView();
    toast('University and timings saved successfully!', 'success');
  },`;

const originalUniManagement = `  selectUniversity(id) {
    STATE.currentUniversityId = id;
    updateGlobalPeriodsFromUniversity();
    saveState();
    renderTopbar();
    renderScheduleTable();
    renderStatsBar();
    renderUniversitiesView();
    toast('Switched university settings', 'info');
  },

  addUniversity() {
    const name = prompt('Enter new university name:');
    if (!name || !name.trim()) return;
    const id = 'U' + Date.now();
    if (!STATE.universities) STATE.universities = [];
    STATE.universities.push({
      id: id,
      name: name.trim(),
      timings: JSON.parse(JSON.stringify(DEFAULT_TIMINGS))
    });
    STATE.currentUniversityId = id;
    updateGlobalPeriodsFromUniversity();
    saveState();
    renderTopbar();
    renderScheduleTable();
    renderStatsBar();
    renderUniversitiesView();
    toast(\`Added: \${name.trim()}\`, 'success');
  },

  deleteUniversity(id) {
    if (!confirm('Are you sure you want to delete this university?')) return;
    STATE.universities = STATE.universities.filter(u => u.id !== id);
    if (STATE.currentUniversityId === id) {
      STATE.currentUniversityId = STATE.universities[0]?.id || '';
    }
    updateGlobalPeriodsFromUniversity();
    saveState();
    renderTopbar();
    renderScheduleTable();
    renderStatsBar();
    renderUniversitiesView();
    toast('University deleted', 'info');
  },

  saveUniversityTimings() {
    const currentUni = curUniversity();
    if (!currentUni) return;

    const newName = document.getElementById('uni-name-input').value.trim();
    if (!newName) {
      toast('University name cannot be empty', 'error');
      return;
    }
    currentUni.name = newName;

    const starts = document.querySelectorAll('.time-start-input');
    const ends = document.querySelectorAll('.time-end-input');

    const timings = {};
    starts.forEach((input, idx) => {
      const pid = input.dataset.pid;
      const startVal = input.value.trim();
      const endVal = ends[idx].value.trim();
      timings[pid] = {
        start: startVal,
        end: endVal,
        name: input.dataset.pname || ''
      };
    });
    currentUni.timings = timings;

    updateGlobalPeriodsFromUniversity();
    saveState();
    renderTopbar();
    renderScheduleTable();
    renderStatsBar();
    renderUniversitiesView();
    toast('University settings saved successfully!', 'success');
  },`;

if (content.includes(targetUniManagement)) {
  content = content.replace(targetUniManagement, originalUniManagement);
  console.log("7. Reverted university management functions.");
} else {
  console.warn("7. University management functions not found exactly.");
}

// 8. Revert App.saveInstructors
const targetSaveInstructors = `  const uni = curUniversity();
  if (uni) {
    uni.instructors = data;
    App.globalInstructors = Object.values(data).map(d => d.name).sort();
    buildInstrDatalist();
  }
  
  try {
    const postRes = await fetch(\`\${API}/api/instructors\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (postRes.ok) {
      toast('Instructor Directory Saved Successfully!', 'success');
    } else {
      toast('Error saving directory.', 'error');
    }
    saveState();
  } catch(e) {`;

const originalSaveInstructors = `  try {
    const postRes = await fetch(\`\${API}/api/instructors\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (postRes.ok) {
      toast('Instructor Directory Saved Successfully!', 'success');
    } else {
      toast('Error saving directory.', 'error');
    }
  } catch(e) {`;

if (content.includes(targetSaveInstructors)) {
  content = content.replace(targetSaveInstructors, originalSaveInstructors);
  console.log("8. Reverted App.saveInstructors.");
} else {
  console.warn("8. App.saveInstructors not found exactly.");
}

// Convert line endings back to Windows CRLF
content = content.replace(/\n/g, '\r\n');

fs.writeFileSync(indexPath, content, 'utf8');
console.log("\nFinished executing revert_phase2.js!");
console.log("Current index.html size:", fs.statSync(indexPath).size, "bytes");
