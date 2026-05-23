const fs = require('fs');
let c = fs.readFileSync('index_reverted.html', 'utf8');

// 1. Revert PERIODS
c = c.replace(/const INITIAL_DEFAULT_PERIODS = \[[^]*?updateGlobalContextForActiveUniversity\(\) \{[^]*?\n\}/, 
`const PERIODS = [
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
const TEACHING_PERIODS = PERIODS.filter(p => p.type === 'teaching');`);

// 2. Revert saveSemester
c = c.replace(/saveSemester\(\) \{[^]*?toast\(\`Created: \$\{label\}\`, 'success'\);\s*\}/, 
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
  }`);

// 3. Revert deleteSemester
c = c.replace(/deleteSemester\(id\) \{[^]*?toast\('Semester deleted', 'info'\);\s*\}/, 
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
  }`);

// 4. Revert changeSemester
c = c.replace(/changeSemester\(id\) \{[^]*?toast\('Switched to ' \+ \(curSem\(\)\?\.label\|\|id\), 'info'\);\s*\}/, 
`changeSemester(id) {
    if (!STATE.semesters.find(s=>s.id===id)) return;
    STATE.currentSemId = id;
    saveState();
    renderTopbar();
    renderScheduleTable();
    renderStatsBar();
    this.showView('schedule');
    toast('Switched to ' + (curSem()?.label||id), 'info');
  }`);

// 5. Revert loadState
c = c.replace(/\/\/ Initialize universities directory[^]*?STATE\.universities = list\.map[^]*?return \{[^]*?instructors: \{\}\n\s*\}\n\s*\}\);\n\s*\}/, '');

// 6. Remove HTML
c = c.replace(/<a class="nav-item" data-view="universities" onclick="App\.showView\('universities'\)">[\s\S]*?Universities & Timings[\s\S]*?<\/a>/, '');
c = c.replace(/<div class="view" id="view-universities">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/, '');

// 7. Remove App University Methods
c = c.replace(/selectUniversity\(id\) \{[\s\S]*?toast\('University deleted', 'info'\);\n  \},/, '');
c = c.replace(/saveUniversityTimings\(\) \{[\s\S]*?toast\('University and timings saved successfully!', 'success'\);\n  \},/, '');
c = c.replace(/addPeriodSlot\(\) \{[\s\S]*?toast\(\`Removed period slot \$\{pid\}\`, 'info'\);\n  \},/, '');

// 8. Revert saveInstructors
c = c.replace(/const uni = curUniversity\(\);\n  if \(uni\) \{\n    uni\.instructors = data;\n    App\.globalInstructors = Object\.values\(data\)\.map\(d => d\.name\)\.sort\(\);\n    buildInstrDatalist\(\);\n  \}/, 
  `App.globalInstructors = Object.values(data).map(d => d.name).sort();\n  buildInstrDatalist();`);

// 9. Revert generateScheduleBackend
c = c.replace(/const activeUni = curUniversity\(\);\n\s*const r = await fetch/, 'const r = await fetch');
c = c.replace(/periods: activeUni \? activeUni\.periods : null,/, 'periods: PERIODS,');

// 10. Revert exportExcel
c = c.replace(/function curUniversity\(\) \{[\s\S]*?\}[\s\S]*?function updateGlobalContextForActiveUniversity\(\) \{/, 'function updateGlobalContextForActiveUniversity() {');
c = c.replace(/const activeUni = curUniversity\(\);\n\s*const semWithTimings = \{[\s\S]*?timings: activeUni \? activeUni\.timings : null\n\s*\};\n\s*const r = await fetch\(`\$\{API\}\/api\/export-excel`, \{\n\s*method: 'POST',\n\s*headers: \{ 'Content-Type': 'application\/json' \},\n\s*body: JSON\.stringify\(\{ sem: semWithTimings \}\)\n\s*\}\);/, 
  `const r = await fetch(\`\${API}/api/export-excel\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sem: sem })
      });`);

// 11. Remove all updateGlobalContextForActiveUniversity calls
c = c.replace(/updateGlobalContextForActiveUniversity\(\);/g, '');
c = c.replace(/function updateGlobalContextForActiveUniversity\(\) \{[\s\S]*?TEACHING_PERIODS\.push\(p\)\);\n\}/, '');

fs.writeFileSync('index.html', c);
console.log('Fixed index.html generated!');
