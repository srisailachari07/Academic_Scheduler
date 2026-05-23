const fs = require('fs');
let code = fs.readFileSync('index_reverted.html', 'utf8');

function replaceBlock(regex, replacement, name) {
  if (regex.test(code)) {
    code = code.replace(regex, replacement);
    console.log('SUCCESS: ' + name);
  } else {
    console.log('FAILED: ' + name);
  }
}

// 1. Sidebar HTML
replaceBlock(/<a class="nav-item" data-view="universities" onclick="App\.showView\('universities'\)">[^]*?Universities & Timings[^]*?<\/a>/, '', 'Sidebar HTML');

// 2. View HTML
replaceBlock(/<div class="view" id="view-universities">[^]*?<\/div>\s*<\/div>\s*<\/div>/, '', 'View HTML');

// 3. INITIAL_DEFAULT_PERIODS to updateGlobalContextForActiveUniversity
// We just remove it completely because index_reverted already has const PERIODS!
replaceBlock(/const INITIAL_DEFAULT_PERIODS = \[[^]*?function updateGlobalContextForActiveUniversity\(\) \{[^]*?\n\}/, '', 'PERIODS');

// 4. loadState
replaceBlock(/\/\/ Initialize universities directory[^]*?STATE\.universities = list\.map[^]*?instructors: \{\}\n\s*\}\n\s*\}\);\n\s*\}/, '', 'loadState');

// 5. App Methods
replaceBlock(/selectUniversity\(id\) \{[^]*?toast\('University deleted', 'info'\);\s*\},/, '', 'Uni Methods 1');
replaceBlock(/saveUniversityTimings\(\) \{[^]*?toast\('University and timings saved successfully!', 'success'\);\s*\},/, '', 'Uni Methods 2');
replaceBlock(/addPeriodSlot\(\) \{[^]*?toast\(`Removed period slot \$\{pid\}`\, 'info'\);\s*\},/, '', 'Uni Methods 3');
replaceBlock(/addUniversity\(\) \{[^]*?toast\(`Added: \$\{name\.trim\(\)\}`\, 'success'\);\s*\},/, '', 'Uni Methods 4');

// 6. saveSemester
replaceBlock(/saveSemester\(\) \{[^]*?toast\(`Created: \$\{label\}`\, 'success'\);\s*\}/, 
`saveSemester() {
    const year  = +document.getElementById('sem-year').value;
    const semNum   = +document.getElementById('sem-num').value;
    const cohort= document.getElementById('sem-cohort').value.trim();
    const startDate = document.getElementById('sem-start').value;
    const endDate = document.getElementById('sem-end').value;
    const label = document.getElementById('sem-label').value.trim() || \`Y\${year}-S\${semNum}-\${cohort}\`;
    const id    = label.replace(/\\s+/g,'-');
    if (STATE.semesters.find(s=>s.id===id)) { toast('Semester already exists','error'); return; }
    const newSem = {
      id, label,
      year, sem: semNum, cohort, startDate, endDate,
      sections: ['Section-1','Section-2','Section-3'],
      subjects: JSON.parse(JSON.stringify(DEFAULT_SUBJECTS)),
      fixedSlots: JSON.parse(JSON.stringify(FIXED_SLOT_DEFS)),
      fixedPlacements: makeDefaultPlacements(['Section-1','Section-2','Section-3']),
      schedule: {},
    };
    STATE.semesters.push(newSem);
    STATE.currentSemId = id;
    renderSemesterSelect();
    this.closeModal('sem-modal');
    saveState();
    generateSchedule(newSem);
    saveState();
    renderScheduleTable();
    renderStatsBar();
    toast(\`Created: \${label}\`, 'success');
  }`, 'saveSemester');

// 7. deleteSemester
replaceBlock(/deleteSemester\(id\) \{[^]*?toast\('Semester deleted','info'\);\s*\}/, 
`deleteSemester(id) {
    if (!confirm('Delete this semester and all its data?')) return;
    STATE.semesters = STATE.semesters.filter(s=>s.id!==id);
    if (STATE.currentSemId === id) STATE.currentSemId = STATE.semesters[0]?.id||'';
    saveState();
    renderSemesterSelect();
    renderTopbar();
    renderScheduleTable();
    renderStatsBar();
    toast('Semester deleted', 'info');
  }`, 'deleteSemester');

// 8. changeSemester
replaceBlock(/changeSemester\(id\) \{[^]*?toast\('Switched to ' \+ \(curSem\(\)\?\.label\|\|id\), 'info'\);\s*\}/, 
`changeSemester(id) {
    if (!STATE.semesters.find(s=>s.id===id)) return;
    STATE.currentSemId = id;
    saveState();
    renderTopbar();
    renderScheduleTable();
    renderStatsBar();
    this.showView('schedule');
    toast('Switched to ' + (curSem()?.label||id), 'info');
  }`, 'changeSemester');

// 9. saveInstructors
replaceBlock(/const uni = curUniversity\(\);\s*if \(uni\) \{\s*uni\.instructors = data;\s*App\.globalInstructors = Object\.values\(data\)\.map\(d => d\.name\)\.sort\(\);\s*buildInstrDatalist\(\);\s*\}/, 
  `App.globalInstructors = Object.values(data).map(d => d.name).sort();\n  buildInstrDatalist();`, 'saveInstructors');

// 10. exportExcel
replaceBlock(/function curUniversity\(\) \{[^]*?\}[^]*?function updateGlobalContextForActiveUniversity/, 'function updateGlobalContextForActiveUniversity', 'exportExcel Part 1');
replaceBlock(/const activeUni = curUniversity\(\);\s*const semWithTimings = \{[^]*?\};\s*const r = await fetch\(`\$\{API\}\/api\/export-excel`\, \{\s*method: 'POST',\s*headers: \{ 'Content-Type': 'application\/json' \},\s*body: JSON\.stringify\(\{ sem: semWithTimings \}\)\s*\}\);/, 
  `const r = await fetch(\`\${API}/api/export-excel\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sem: sem })
      });`, 'exportExcel Part 2');

// 11. generateScheduleBackend
replaceBlock(/const activeUni = curUniversity\(\);\s*const r = await fetch/, 'const r = await fetch', 'generateScheduleBackend 1');
replaceBlock(/periods: activeUni \? activeUni\.periods : null,/, 'periods: PERIODS,', 'generateScheduleBackend 2');

// 12. Remove stray function curUniversity and updateGlobalContextForActiveUniversity calls
code = code.replace(/updateGlobalContextForActiveUniversity\(\);/g, '');
code = code.replace(/function curUniversity\(\) \{[^]*?\}/g, '');
code = code.replace(/function updateGlobalContextForActiveUniversity\(\) \{[^]*?TEACHING_PERIODS\.push\(p\)\);\n\}/g, '');
code = code.replace(/const uni = curUniversity\(\);/g, '');
code = code.replace(/const currentUni = curUniversity\(\);/g, '');
code = code.replace(/const activeUni = curUniversity\(\);/g, '');
code = code.replace(/if \(!uni\) return;/g, '');

// Save to index.html
fs.writeFileSync('index.html', code);
console.log('Saved to index.html');
