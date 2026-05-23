const fs=require('fs'); let c=fs.readFileSync('index_manual.html','utf8'); const methods = `
  openAddSemesterModal() {
    const today = new Date();
    document.getElementById('sem-cohort').value = today.getFullYear();
    document.getElementById('sem-modal').classList.add('open');
    this._updateSemLabel();
    ['sem-year','sem-num','sem-cohort'].forEach(id => {
      document.getElementById(id).addEventListener('input', () => this._updateSemLabel(), {once:false});
    });
  },

  _updateSemLabel() {
    const y = document.getElementById('sem-year').value;
    const n = document.getElementById('sem-num').value;
    const c = document.getElementById('sem-cohort').value;
    document.getElementById('sem-label').value = \`Y\${y}-S\${n}-\${c}\`;
  },

  saveSemester() {
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
  },

  deleteSemester(id) {
    if (!confirm('Delete this semester and all its data?')) return;
    STATE.semesters = STATE.semesters.filter(s=>s.id!==id);
    if (STATE.currentSemId === id) STATE.currentSemId = STATE.semesters[0]?.id||'';
    saveState();
    renderSemesterSelect();
    renderTopbar();
    renderScheduleTable();
    renderStatsBar();
    toast('Semester deleted', 'info');
  },

  changeSemester(id) {
    if (!STATE.semesters.find(s=>s.id===id)) return;
    STATE.currentSemId = id;
    saveState();
    renderTopbar();
    renderScheduleTable();
    renderStatsBar();
    this.showView('schedule');
    toast('Switched to ' + (curSem()?.label||id), 'info');
  },

`; c=c.replace('  /* ── Modals ── */', methods + '  /* ── Modals ── */'); fs.writeFileSync('index_manual.html', c);
