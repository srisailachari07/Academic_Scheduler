'use strict';
const { JSDOM } = require("jsdom");
const dom = new JSDOM(`<!DOCTYPE html><html><body><div id="backend-status"></div><div id="app"></div></body></html>`, { url: "http://localhost:3000" });
global.window = dom.window;
global.document = dom.window.document;
global.localStorage = { getItem: () => null, setItem: () => {} };
global.alert = console.log;
/* ═══════════════════════════════════════

   CONSTANTS

   ═══════════════════════════════════════ */

const PERIODS = [

  {id:'P1', start:'9:00',  end:'9:50',  label:'9:00–9:50',   type:'teaching', num:1},

  {id:'P2', start:'9:50',  end:'10:40', label:'9:50–10:40',  type:'teaching', num:2},

  {id:'SB1',start:'10:40', end:'10:50', label:'10:40–10:50', type:'break',    name:'Short Break'},

  {id:'P3', start:'10:50', end:'11:40', label:'10:50–11:40', type:'teaching', num:3},

  {id:'P4', start:'11:40', end:'12:30', label:'11:40–12:30', type:'teaching', num:4},

  {id:'LB', start:'12:30', end:'13:10', label:'12:30–13:10', type:'lunch',    name:'Lunch'},

  {id:'P5', start:'13:10', end:'14:00', label:'13:10–14:00', type:'teaching', num:5},

  {id:'P6', start:'14:00', end:'14:50', label:'14:00–14:50', type:'teaching', num:6},

  {id:'SB2',start:'14:50', end:'15:00', label:'14:50–15:00', type:'break',    name:'Short Break'},

  {id:'P7', start:'15:00', end:'15:50', label:'15:00–15:50', type:'teaching', num:7},

  {id:'P8', start:'15:50', end:'16:40', label:'15:50–16:40', type:'teaching', num:8},

];

const TEACHING_PERIODS = PERIODS.filter(p => p.type === 'teaching');

const DAYS = ['Mon','Tue','Wed','Thu','Fri'];

const DAY_NAMES = {Mon:'Monday',Tue:'Tuesday',Wed:'Wednesday',Thu:'Thursday',Fri:'Friday'};

const COLOR_PALETTE = [

  '#f4a261','#e67e4e','#48cae4','#0096c7','#ff85a1','#e63980',

  '#ffd166','#f9a825','#95d5b2','#52b788','#9b5de5','#7b2fff',

  '#264653','#118ab2','#1d3557','#fb8500','#ffd43b','#74c0fc',

  '#69db7c','#ff922b','#f8a5c2','#748ffc','#74c0fc','#a9e34b',

  '#b5838d','#e07a5f','#3d405b','#81b29a','#f2cc8f','#264653',

];

/* ═══════════════════════════════════════

   DEFAULT DATA

   ═══════════════════════════════════════ */

const FIXED_SLOT_DEFS = [

  {code:'YOGA201',  name:'Application of yoga in mind body management YOGA201', instructor:'UNIVERSITY FACULTY', color:'#f8a5c2', textColor:'#1a1a1a', isFixed:true},

  {code:'COIN201',  name:'COIN201', instructor:'UNIVERSITY FACULTY', color:'#748ffc', textColor:'#ffffff', isFixed:true},

  {code:'MODQUIZ',  name:'Module Quiz', instructor:'', color:'#74c0fc', textColor:'#1a1a1a', isFixed:true},

  {code:'SPORTS',   name:'Sports', instructor:'', color:'#69db7c', textColor:'#1a1a1a', isFixed:true},

  {code:'LIBRARY',  name:'Library', instructor:'', color:'#ff922b', textColor:'#ffffff', isFixed:true},

  {code:'MENTOR',   name:'Mentoring', topic:'SC 1:1\nUniversity allotted slot for interactions', instructor:'', color:'#ffd43b', textColor:'#1a1a1a', isFixed:true},

  {code:'INTASSESS',name:'Internal Assessments', instructor:'UNIVERSITY FACULTY', color:'#b197fc', textColor:'#ffffff', isFixed:true},

  {code:'MIDTERM',  name:'Mid Term Exams', instructor:'UNIVERSITY FACULTY', color:'#ff8787', textColor:'#ffffff', isFixed:true},

];

const DEFAULT_SUBJECTS = [

  {code:'BTNX221', name:'Data Structures Using C++', type:'lecture', color:'#b91c1c', textColor:'#ffffff', instructor:'SATYA APARNA', labPerWeek:0, lecPerWeek:2},

  {code:'BTNX222', name:'Data Structures Using C++ Laboratory', type:'lab', color:'#fbbf24', textColor:'#ffffff', instructor:'SATYA APARNA', labPerWeek:1, lecPerWeek:0},

  {code:'BTNX231', name:'Frontend Full Stack Development', type:'lecture', color:'#ffadad', textColor:'#1a1a1a', instructor:'PALLAVI B', labPerWeek:0, lecPerWeek:2},

  {code:'BTNX232', name:'Frontend Full Stack Development Laboratory', type:'lab', color:'#ffc6ff', textColor:'#ffffff', instructor:'PALLAVI B', labPerWeek:1, lecPerWeek:0},

  {code:'BTNX233', name:'Database Systems', type:'lecture', color:'#48cae4', textColor:'#1a1a1a', instructor:'PALLAVI B', labPerWeek:0, lecPerWeek:0},

  {code:'BTNX234', name:'Database Systems Laboratory', type:'lab', color:'#2dd4bf', textColor:'#ffffff', instructor:'SUSHMITHA AMARNATH', labPerWeek:1, lecPerWeek:0},

  {code:'BTNX223', name:'Building LLM Applications', type:'lecture', color:'#818cf8', textColor:'#ffffff', instructor:'SUSHMITHA AMARNATH', labPerWeek:0, lecPerWeek:1},

  {code:'BTNX212', name:'Mathematics 2', type:'lecture', color:'#d946ef', textColor:'#ffffff', instructor:'DILEEP KUMAR', labPerWeek:0, lecPerWeek:2},

  {code:'MATH_2P', name:'Mathematics 2', type:'practice', color:'#4338ca', textColor:'#ffffff', instructor:'DILEEP KUMAR', labPerWeek:1, lecPerWeek:0},

  {code:'BTNX211', name:'English Advanced', type:'lecture', color:'#f97316', textColor:'#ffffff', instructor:'FEBI MARIAM JOHN', labPerWeek:0, lecPerWeek:2},

  {code:'ENG_2P', name:'English Advanced', type:'practice', color:'#0369a1', textColor:'#ffffff', instructor:'FEBI MARIAM JOHN', labPerWeek:1, lecPerWeek:0}

];

function makeDefaultPlacements(sections) {

  const s = sections;

  const s0 = s[0]||'Section-1', s1 = s[1]||'Section-2', s2 = s[2]||'Section-3';

  const U = 'UNIVERSITY FACULTY';

  return [

    {code:'MODQUIZ',day:'Mon',section:s0,periodId:'P7',instructor:''},

    {code:'MODQUIZ',day:'Mon',section:s1,periodId:'P7',instructor:''},

    {code:'MODQUIZ',day:'Mon',section:s2,periodId:'P7',instructor:''},

    {code:'MODQUIZ',day:'Tue',section:s0,periodId:'P7',instructor:''},

    {code:'MODQUIZ',day:'Tue',section:s1,periodId:'P7',instructor:''},

    {code:'MODQUIZ',day:'Tue',section:s2,periodId:'P7',instructor:''},

    {code:'MODQUIZ',day:'Wed',section:s0,periodId:'P7',instructor:''},

    {code:'MODQUIZ',day:'Wed',section:s1,periodId:'P7',instructor:''},

    {code:'MODQUIZ',day:'Wed',section:s2,periodId:'P7',instructor:''},

    {code:'MODQUIZ',day:'Thu',section:s0,periodId:'P7',instructor:''},

    {code:'MODQUIZ',day:'Thu',section:s1,periodId:'P7',instructor:''},

    {code:'MODQUIZ',day:'Thu',section:s2,periodId:'P7',instructor:''},

    {code:'MODQUIZ',day:'Fri',section:s0,periodId:'P7',instructor:''},

    {code:'MODQUIZ',day:'Fri',section:s1,periodId:'P7',instructor:''},

    {code:'MODQUIZ',day:'Fri',section:s2,periodId:'P7',instructor:''},

    {code:'YOGA201',day:'Mon',section:s0,periodId:'P3',instructor:U},

    {code:'YOGA201',day:'Mon',section:s1,periodId:'P5',instructor:U},

    {code:'YOGA201',day:'Tue',section:s2,periodId:'P3',instructor:U},

    {code:'COIN201',day:'Thu',section:s0,periodId:'P2',instructor:U},

    {code:'COIN201',day:'Mon',section:s1,periodId:'P2',instructor:U},

    {code:'COIN201',day:'Tue',section:s2,periodId:'P2',instructor:U},

    {code:'SPORTS',day:'Wed',section:s0,periodId:'P8',instructor:''},

    {code:'SPORTS',day:'Thu',section:s1,periodId:'P8',instructor:''},

    {code:'SPORTS',day:'Fri',section:s2,periodId:'P8',instructor:''},

    {code:'LIBRARY',day:'Fri',section:s0,periodId:'P8',instructor:''},

    {code:'LIBRARY',day:'Tue',section:s1,periodId:'P8',instructor:''},

    {code:'LIBRARY',day:'Thu',section:s2,periodId:'P8',instructor:''},

    {code:'MENTOR',day:'Mon',section:s0,periodId:'P5',instructor:''},

    {code:'MENTOR',day:'Wed',section:s1,periodId:'P5',instructor:''},

    {code:'MENTOR',day:'Fri',section:s2,periodId:'P5',instructor:''},

  ];

}

/* ═══════════════════════════════════════

   STATE

   ═══════════════════════════════════════ */

const STATE = {

  currentSemId: 'Y2-S2-2024',

  currentDay: 'Mon',

  semesters: [

    {

      id: 'Y2-S2-2024',

      label: 'Year 2 · Sem 2 · 2024',

      year: 2, sem: 2, cohort: '2024',

      sections: ['Section-1','Section-2','Section-3'],

      subjects: [],

      fixedSlots: JSON.parse(JSON.stringify(FIXED_SLOT_DEFS)),

      fixedPlacements: makeDefaultPlacements(['Section-1','Section-2','Section-3']),

      schedule: {},

    }

  ],

  _editCtx: null,

};

function curSem() { return STATE.semesters.find(s=>s.id===STATE.currentSemId); }

function getAllSubjects(sem) { return [...(sem.subjects||[]), ...(sem.fixedSlots||[])]; }

function getSubject(sem, code) { return getAllSubjects(sem).find(s=>s.code===code); }

/* ═══════════════════════════════════════

   PERSISTENCE

   ═══════════════════════════════════════ */

const API = typeof window !== 'undefined' && window.location.port === '3000' ? '' : 'http://localhost:3000';

let _backendOnline = false;

async function checkBackend() {

  try {

    const r = await fetch(`${API}/api/health`, { signal: AbortSignal.timeout(2000) });

    _backendOnline = r.ok;

  } catch { _backendOnline = false; }

  const el = document.getElementById('backend-status');

  if (el) {

    el.textContent   = _backendOnline ? '🟢 Backend Connected' : '🔴 Backend Offline';

    el.style.color   = _backendOnline ? '#1a7a40' : '#d32f2f';

    el.style.display = 'inline';

  }

}

function saveState() {

  try { localStorage.setItem('unisched_v3', JSON.stringify(STATE)); } catch(e) {}

  if (_backendOnline) {

    fetch(`${API}/api/state`, {

      method: 'PUT',

      headers: { 'Content-Type': 'application/json' },

      body: JSON.stringify(STATE),

    }).catch(() => {});

  }

}

async function loadState() {

  if (_backendOnline) {

    try {

      const r = await fetch(`${API}/api/state`);

      if (r.ok) {

        const saved = await r.json();

        if (saved && saved.semesters) { Object.assign(STATE, saved); }

      }

    } catch(e) {}

  }

  if (!STATE.semesters || STATE.semesters.length === 0) {

    try {

      const raw = localStorage.getItem('unisched_v3');

      if (raw) { const saved = JSON.parse(raw); Object.assign(STATE, saved); }

    } catch(e) {}

  }

  // Migration: Ensure INTASSESS and MIDTERM exist in all semesters

  (STATE.semesters||[]).forEach(sem => {

    if (!sem.fixedSlots) sem.fixedSlots = [];

    ['INTASSESS', 'MIDTERM'].forEach(code => {

      if (!sem.fixedSlots.find(s => s.code === code)) {

        const def = FIXED_SLOT_DEFS.find(d => d.code === code);

        if (def) sem.fixedSlots.push(JSON.parse(JSON.stringify(def)));

      }

    });

  });

}

async function generateScheduleBackend(sem) {

  if (_backendOnline) {

    try {

      const r = await fetch(`${API}/api/generate`, {

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

      });

      if (r.ok) {

        const result = await r.json();

        sem.schedule         = result.schedule;

        sem._unplaced        = result.unplaced;

        sem._unplacedRounds  = result.unplacedRounds  || [];

        sem._capacityWarnings= result.capacityWarnings|| [];

        sem._imbalanced      = result.imbalances       || [];

        flagConflicts(sem.schedule, sem);

        return true;

      }

    } catch(e) {

      console.warn('[Backend] generate failed, falling back to client-side:', e);

    }

  }

  generateSchedule(sem);

  return false;

}

/* ═══════════════════════════════════════

   AUTO-GENERATION ENGINE

   ═══════════════════════════════════════ */

function shuffle(arr) {

  const a = [...arr];

  for (let i = a.length-1; i>0; i--) {

    const j = Math.floor(Math.random()*(i+1));

    [a[i],a[j]] = [a[j],a[i]];

  }

  return a;

}

function rotateArr(arr, n) {

  const len = arr.length;

  if (!len) return arr;

  n = ((n%len)+len)%len;

  return [...arr.slice(n),...arr.slice(0,n)];

}

function generateSessionList(sem) {

  const list = [];

  (sem.subjects||[]).forEach(subj => {

    for (let i=0;i<(subj.lecPerWeek||0);i++) list.push({code:subj.code,instructor:subj.instructor,topic:'',type:'lecture'});

    for (let i=0;i<(subj.labPerWeek||0);i++) list.push({code:subj.code,instructor:subj.instructor,topic:'',type:'lab'});

  });

  return list;

}

const CONSEC_PAIRS  = [['P1','P2'],['P3','P4'],['P5','P6'],['P7','P8']];

const MORNING_PS    = new Set(['P1','P2','P3','P4']);

const AFTERNOON_PS  = new Set(['P5','P6','P7','P8']);

const PAIR_NEXT_FREE = { P2:'P3', P6:'P7' };

const PAIR_PARTNER   = { P1:'P2', P2:'P1', P3:'P4', P4:'P3', P5:'P6', P6:'P5', P7:'P8', P8:'P7' };

const BATCH_PATTERNS_3 = [

  ['P1','P2','P4'],

  ['P5','P6','P8'],

  ['P3','P4','P6'],

  ['P3','P4','P5'],

  ['P1','P2','P5'],

  ['P1','P3','P4'],

  ['P2','P3','P4'],

  ['P2','P4','P5'],

  ['P4','P5','P6'],

  ['P4','P6','P7'],

  ['P1','P3','P5'],

  ['P2','P3','P5'],

  ['P5','P7','P8'],

  ['P6','P7','P8'],

];

const BATCH_PATTERNS_2 = [

  ['P1','P2'],['P5','P6'],['P3','P4'],['P7','P8'],

  ['P1','P3'],['P2','P4'],['P4','P5'],['P3','P5'],

  ['P2','P3'],['P4','P6'],['P5','P7'],['P6','P8'],

  ['P1','P4'],['P2','P5'],['P3','P6'],['P5','P8'],

];

function getInstrDayData(instr, day, sched, sem) {

  const periodType = {};

  (sem.sections||[]).forEach(section => {

    TEACHING_PERIODS.forEach(p => {

      if (periodType[p.id]) return;

      const sess = sched?.[day]?.[section]?.[p.id];

      if (!sess || sess.instructor !== instr) return;

      const subj = getSubject(sem, sess.code);

      periodType[p.id] = subj?.type || sess.type || 'lecture';

    });

  });

  const periods = new Set(Object.keys(periodType));

  let lecCount = 0, pracCount = 0;

  for (const t of Object.values(periodType)) {

    if (t === 'practice' || t === 'lab') pracCount++;

    else lecCount++;

  }

  return { periods, lecCount, pracCount };

}

function canAssignWith(instr, periodId, type, tempPeriods, tempLec, tempPrac) {

  if (!instr || instr === 'UNIVERSITY FACULTY') return true;

  const isPrac = (type === 'practice' || type === 'lab');

  if (isPrac && periodId === 'P1') return false;

  if (tempPeriods.has(periodId)) return false;

  

  if (tempLec + tempPrac >= 6) return false;

  if (!isPrac && tempLec >= 4) return false;

  if (isPrac && tempPrac >= 3) return false;

  

  // C4: No 3 continuous classes (reset at lunch)

  const periodsWithNew = new Set([...tempPeriods, periodId]);

  let consecMorning = 0;

  for (const p of ['P1','P2','P3','P4']) {

    if (periodsWithNew.has(p)) consecMorning++;

    else consecMorning = 0;

    if (consecMorning >= 3) return false;

  }

  let consecAfternoon = 0;

  for (const p of ['P5','P6','P7','P8']) {

    if (periodsWithNew.has(p)) consecAfternoon++;

    else consecAfternoon = 0;

    if (consecAfternoon >= 3) return false;

  }

  return true;

}

function canAssign(instr, day, periodId, type, sched, sem) {

  if (!instr || instr === 'UNIVERSITY FACULTY') return true;

  const d = getInstrDayData(instr, day, sched, sem);

  return canAssignWith(instr, periodId, type, d.periods, d.lecCount, d.pracCount);

}

function slotScore(instr, day, sched, sem) {

  if (!instr) return 0;

  const d = getInstrDayData(instr, day, sched, sem);

  return d.lecCount + d.pracCount;

}

function findBatchPattern(instr, sections, day, type, sched, sem) {

  const n = sections.length;

  if (!n) return [];

  const d0 = getInstrDayData(instr, day, sched, sem);

  const isPrac = (type === 'practice' || type === 'lab');

  const patterns = n >= 3 ? BATCH_PATTERNS_3 : (n >= 2 ? BATCH_PATTERNS_2 : TEACHING_PERIODS.map(p=>[p.id]));

  for (const patt of patterns) {

    if (patt.length < n) continue;

    const slotsOk = sections.every((sec, i) => !sched[day]?.[sec]?.[patt[i]]);

    if (!slotsOk) continue;

    let tempPeriods = new Set(d0.periods);

    let tempLec  = d0.lecCount;

    let tempPrac = d0.pracCount;

    let ok = true;

    for (let i = 0; i < n; i++) {

      const pid = patt[i];

      if (!canAssignWith(instr, pid, type, tempPeriods, tempLec, tempPrac)) {

        ok = false; break;

      }

      tempPeriods.add(pid);

      if (isPrac) tempPrac++; else tempLec++;

    }

    if (ok) return sections.map((sec, i) => ({ section: sec, periodId: patt[i] }));

  }

  return null;

}

function generateSchedule(sem) {

  const sched = {};

  DAYS.forEach(d => {

    sched[d] = {};

    (sem.sections||[]).forEach(s => { sched[d][s] = {}; });

  });

  const instrCapacity = {};

  const numSec = (sem.sections||[]).length;

  (sem.subjects||[]).forEach(subj => {

    const key = subj.instructor || '(unassigned)';

    if (!instrCapacity[key]) instrCapacity[key] = { lecTotal:0, pracTotal:0, subjects:[] };

    instrCapacity[key].lecTotal  += (subj.lecPerWeek||0) * numSec;

    instrCapacity[key].pracTotal += (subj.labPerWeek||0) * numSec;

    if ((subj.lecPerWeek||0) + (subj.labPerWeek||0) > 0)

      instrCapacity[key].subjects.push(subj.name || subj.code);

  });

  const MAX_LEC_WEEK = 4 * 5;

  const MAX_PRAC_WEEK = 3 * 5;

  const capacityWarnings = [];

  Object.entries(instrCapacity).forEach(([instr, data]) => {

    const msgs = [];

    if (data.lecTotal > MAX_LEC_WEEK)

      msgs.push(`${data.lecTotal} lectures needed but max is ${MAX_LEC_WEEK}/week`);

    if (data.pracTotal > MAX_PRAC_WEEK)

      msgs.push(`${data.pracTotal} labs/practice needed but max is ${MAX_PRAC_WEEK}/week`);

    if (msgs.length) capacityWarnings.push({ instr, msgs, subjects: data.subjects });

  });

  sem._capacityWarnings = capacityWarnings;

  (sem.fixedPlacements||[]).forEach(fp => {

    const subj = getSubject(sem, fp.code);

    if (!subj || !sched[fp.day] || !sched[fp.day][fp.section]) return;

    sched[fp.day][fp.section][fp.periodId] = {

      code: fp.code,

      instructor: fp.instructor || subj.instructor || '',

      topic: subj.topic || '',

      isFixed: true,

    };

  });

  const lectureRounds = [];

  const labRounds = [];

  (sem.subjects||[]).forEach(subj => {

    const secs = [...(sem.sections||[])];

    for (let i = 0; i < (subj.lecPerWeek||0); i++)

      lectureRounds.push({ code:subj.code, instructor:subj.instructor, type:'lecture', sections:secs, round:i });

    for (let i = 0; i < (subj.labPerWeek||0); i++)

      labRounds.push({ code:subj.code, instructor:subj.instructor, type:subj.type||'lab', sections:secs, round:i });

  });

  if (!lectureRounds.length && !labRounds.length) { sem.schedule = sched; return; }

  const instrLoad = {};

  [...lectureRounds,...labRounds].forEach(r => {

    instrLoad[r.instructor] = (instrLoad[r.instructor]||0) + r.sections.length;

  });

  const sortByLoad = arr => {

    const s = shuffle(arr);

    s.sort((a,b) => (instrLoad[b.instructor]||0) - (instrLoad[a.instructor]||0));

    return s;

  };

  const orderedRounds = [...sortByLoad(lectureRounds), ...sortByLoad(labRounds)];

  const unplaced = [];

  orderedRounds.forEach(round => {

    let placed = false;

    for (const day of shuffle([...DAYS])) {

      const pattern = findBatchPattern(round.instructor, round.sections, day, round.type, sched, sem);

      if (pattern) {

        pattern.forEach(({ section, periodId }) => {

          sched[day][section][periodId] = {

            code: round.code,

            instructor: round.instructor,

            topic: '',

            isFixed: false,

            type: round.type,

          };

        });

        placed = true;

        break;

      }

    }

    if (!placed) {

      let anyUnplaced = false;

      round.sections.forEach(section => {

        let bestSlot = null, bestScore = Infinity;

        for (const day of shuffle([...DAYS])) {

          for (const period of shuffle([...TEACHING_PERIODS])) {

            if (sched[day][section][period.id]) continue;

            if (!canAssign(round.instructor, day, period.id, round.type, sched, sem)) continue;

            const score = slotScore(round.instructor, day, sched, sem);

            if (score < bestScore) { bestScore = score; bestSlot = { day, periodId: period.id }; }

          }

        }

        if (bestSlot) {

          sched[bestSlot.day][section][bestSlot.periodId] = {

            code: round.code, instructor: round.instructor, topic: '', isFixed: false, type: round.type,

          };

        } else {

          anyUnplaced = true;

        }

      });

      if (anyUnplaced) unplaced.push(round);

    }

  });

  flagConflicts(sched, sem);

  sem._unplaced = unplaced.length;

  (sem.sections||[]).forEach(section => {

    DAYS.forEach(day => {

      if (sched[day]?.[section]?.['P1']) return;

      const swapCandidates = ['P2','P3','P4','P5','P6'];

      for (const pid of swapCandidates) {

        const sess = sched[day]?.[section]?.[pid];

        if (!sess || sess.isFixed || sess.forced) continue;

        const t = sess.type;

        if (t !== 'lecture') continue;

        const instrOk = !sess.instructor || sess.instructor === 'UNIVERSITY FACULTY' ||

          !(sem.sections||[]).some(

            s2 => s2 !== section &&

                  sched[day]?.[s2]?.['P1']?.instructor === sess.instructor

          );

        if (!instrOk) continue;

        sched[day][section]['P1'] = { ...sess };

        delete sched[day][section][pid];

        break;

      }

    });

  });

  flagConflicts(sched, sem);

  const workloadCheck = {};

  (sem.subjects||[]).forEach(subj => {

    workloadCheck[subj.code] = {

      name: subj.name || subj.code,

      expectedLec: subj.lecPerWeek || 0,

      expectedLab: subj.labPerWeek || 0,

      sections: {}

    };

    (sem.sections||[]).forEach(sec => {

      workloadCheck[subj.code].sections[sec] = { lec: 0, lab: 0 };

    });

  });

  DAYS.forEach(day => {

    (sem.sections||[]).forEach(sec => {

      TEACHING_PERIODS.forEach(p => {

        const sess = sched[day]?.[sec]?.[p.id];

        if (!sess || !workloadCheck[sess.code]) return;

        const t = sess.type || 'lecture';

        if (t === 'practice' || t === 'lab') workloadCheck[sess.code].sections[sec].lab++;

        else workloadCheck[sess.code].sections[sec].lec++;

      });

    });

  });

  const imbalanced = [];

  Object.entries(workloadCheck).forEach(([code, info]) => {

    const sectionEntries = Object.entries(info.sections);

    const lecCounts = sectionEntries.map(([,v]) => v.lec);

    const labCounts = sectionEntries.map(([,v]) => v.lab);

    const lecOk = lecCounts.every(c => c === info.expectedLec);

    const labOk = labCounts.every(c => c === info.expectedLab);

    if (!lecOk || !labOk) {

      imbalanced.push({ code, name: info.name, expectedLec: info.expectedLec, expectedLab: info.expectedLab,

        sections: info.sections, lecOk, labOk });

    }

  });

  sem._workloadCheck  = workloadCheck;

  sem._imbalanced     = imbalanced;

  sem.schedule        = sched;

}

function flagConflicts(sched, sem) {

  DAYS.forEach(day => {

    TEACHING_PERIODS.forEach(period => {

      (sem.sections||[]).forEach(section => {

        const sess = sched?.[day]?.[section]?.[period.id];

        if (sess) delete sess.conflict;

      });

    });

  });

  DAYS.forEach(day => {

    TEACHING_PERIODS.forEach(period => {

      const instrSeen = {};

      (sem.sections||[]).forEach(section => {

        const sess = sched[day]?.[section]?.[period.id];

        if (!sess || !sess.instructor || sess.instructor === 'UNIVERSITY FACULTY') return;

        if (instrSeen[sess.instructor]) {

          sess.conflict = true;

          instrSeen[sess.instructor].conflict = true;

        } else {

          instrSeen[sess.instructor] = sess;

        }

      });

    });

  });

}

/* ═══════════════════════════════════════

   RENDERING

   ═══════════════════════════════════════ */

function renderSemesterSelect() {

  const sel = document.getElementById('sem-select');

  sel.innerHTML = STATE.semesters.map(s =>

    `<option value="${s.id}" ${s.id===STATE.currentSemId?'selected':''}>${s.label}</option>`

  ).join('');

}

function renderTopbar() {

  const sem = curSem();

  const titleEl = document.getElementById('topbar-title');

  if (titleEl) {

    titleEl.innerHTML = `Weekly Schedule <span id="topbar-sub">${sem ? sem.label : ''}</span>`;

  }

  const startInput = document.getElementById('sem-start-date');

  const endInput = document.getElementById('sem-end-date');

  if (sem) {

    if (startInput) startInput.value = sem.startDate || '';

    if (endInput) endInput.value = sem.endDate || '';

  }

  

  if (typeof App !== 'undefined' && App.updateWeekDropdown) {

    App.updateWeekDropdown();

  }

}

function renderStatsBar() {

  const sem = curSem();

  if (!sem) return;

  const sessions = generateSessionList(sem);

  const fixedCount = (sem.fixedPlacements||[]).length;

  let conflicts = 0;

  DAYS.forEach(day => {

    TEACHING_PERIODS.forEach(period => {

      (sem.sections||[]).forEach(sec => {

        if (sem.schedule?.[day]?.[sec]?.[period.id]?.conflict) conflicts++;

      });

    });

  });

  const unplaced   = sem._unplaced  || 0;

  const imbalanced = sem._imbalanced || [];

  const hasIssues  = conflicts > 0 || unplaced > 0 || imbalanced.length > 0;

  let imbalanceHTML = '';

  if (imbalanced.length > 0) {

    const rows = imbalanced.map(s => {

      const secDetail = Object.entries(s.sections)

        .map(([sec, cnt]) => `${sec}: ${cnt.lec}L/${cnt.lab}P`).join(', ');

      return `<div style="margin-bottom:4px"><b>${s.name}</b> — expected ${s.expectedLec}L/${s.expectedLab}P per section → ${secDetail}</div>`;

    }).join('');

    imbalanceHTML = `

      <div class="stat-divider"></div>

      <div class="stat-pill" style="background:#fff0f4;color:#b80060;cursor:pointer;"

        title="${imbalanced.map(s=>s.name).join(', ')} have unequal session counts across sections">

        <span class="num" style="color:#b80060;">⚖ ${imbalanced.length}</span> Workload Imbalance

      </div>`;

  }

  let bufferHours = 0, p1Warnings = 0;

  if (sem.schedule && Object.keys(sem.schedule).length > 0) {

    DAYS.forEach(day => {

      (sem.sections||[]).forEach(sec => {

        TEACHING_PERIODS.forEach(p => {

          if (!sem.schedule[day]?.[sec]?.[p.id]) {

            bufferHours++;

            if (p.id === 'P1') p1Warnings++;

          }

        });

      });

    });

  }

  document.getElementById('stats-bar').innerHTML = `

    <div class="stat-pill"><span class="num">${(sem.sections||[]).length}</span> Sections</div>

    <div class="stat-divider"></div>

    <div class="stat-pill"><span class="num">${(sem.subjects||[]).length}</span> Subjects</div>

    <div class="stat-divider"></div>

    <div class="stat-pill"><span class="num">${sessions.length}</span> Sessions/Section/Week</div>

    <div class="stat-divider"></div>

    <div class="stat-pill"><span class="num">${fixedCount}</span> Fixed Placements</div>

    <div class="stat-divider"></div>

    ${conflicts > 0

      ? `<div class="stat-pill" style="background:#fff0f0;color:#d32f2f;"><span class="num" style="color:#d32f2f;">⚠ ${conflicts}</span> Same-Time Conflicts</div>`

      : `<div class="stat-pill" style="background:#e8fdf2;color:#1a7a40;">✓ No Conflicts</div>`}

    ${unplaced > 0

      ? `<div class="stat-divider"></div><div class="stat-pill" style="background:#fff8e6;color:#b45309;"><span class="num" style="color:#b45309;">⚑ ${unplaced}</span> Unplaced Rounds</div>`

      : ''}

    ${bufferHours > 0

      ? `<div class="stat-divider"></div><div class="stat-pill" style="background:#fffbeb;color:#92400e;" title="${bufferHours} empty teaching slots across all sections — shown as Buffer Hours in the grid"><span class="num" style="color:#d97706;">⏸ ${bufferHours}</span> Buffer Hours${p1Warnings > 0 ? ` <span style="color:#ba1a1a;font-weight:800;">(⚠️ ${p1Warnings} at P1!)</span>` : ''}</div>`

      : `<div class="stat-divider"></div><div class="stat-pill" style="background:#e8fdf2;color:#1a7a40;">📅 Schedule Full</div>`}

    ${imbalanceHTML}

    <div class="stat-divider"></div>

    ${imbalanced.length === 0 && sem.schedule

      ? `<div class="stat-pill" style="background:#e8fdf2;color:#1a7a40;">⚖ Workload Balanced</div><div class="stat-divider"></div>`

      : ''}

    <div class="stat-pill" style="background:#f0f4ff;color:#3540a0;" title="Rules: No lab in P1, ≤4 Lec/day, ≤2 Prac/day, ≤3 Morning, ≤3 Afternoon, Break after 2 consecutive, Equal sessions across all sections">

      🛡 Constraints Active

    </div>

  `;

}

function renderScheduleTable() {

  const sem = curSem();

  const day = STATE.currentDay;

  if (!sem) { document.getElementById('tt-table-area').innerHTML = '<div class="empty-state"><p>No semester selected.</p></div>'; return; }

  const sched = sem.schedule[day] || {};

  const sections = sem.sections || [];

  if (!sections.length) {

    document.getElementById('tt-table-area').innerHTML = '<div class="empty-state"><p>No sections configured. Go to Sections to add them.</p></div>';

    return;

  }

  document.getElementById('sched-card-title').textContent = DAY_NAMES[day] + ' Schedule';

  function getSubj(code) {

    return getSubject(sem, code) || {name:code, color:'#eee', textColor:'#333', instructor:''};

  }

  let html = '<table class="tt-main">';

  html += '<thead><tr>';

  html += '<th class="th-section">Section</th>';

  html += '<th class="th-rowlabel" style="background:#15295a;"></th>';

  PERIODS.forEach(p => {

    if (p.type === 'teaching') {

      html += `<th class="th-period"><span class="th-period-time">${p.start}</span><span class="th-period-end">–${p.end}</span></th>`;

    } else if (p.type === 'break') {

      html += `<th class="th-break">${p.name}<br>${p.start}–${p.end}</th>`;

    } else {

      html += `<th class="th-lunch">Lunch<br>${p.start}–${p.end}</th>`;

    }

  });

  html += '</tr></thead>';

  html += '<tbody>';

  const totalDataRows = sections.length * 3;

  const rowLabels = ['Course','Topic','Instructors Name'];

  sections.forEach((section, si) => {

    const secData = sched[section] || {};

    const isFirstSection = si === 0;

    ['course','topic','instr'].forEach((rt, ri) => {

      const isFirstDataRow = isFirstSection && ri === 0;

      const sectionBorder = (si > 0 && ri === 0);

      html += `<tr class="${sectionBorder ? 'section-border' : ''}">`;

      if (ri === 0) {

        html += `<td class="td-section" rowspan="3"><div class="section-label-inner">${section}</div></td>`;

      }

      html += `<td class="td-rowlabel">${rowLabels[ri]}</td>`;

      PERIODS.forEach(p => {

        if (p.type !== 'teaching') {

          if (isFirstDataRow) {

            if (p.type === 'break') {

              html += `<td class="td-break" rowspan="${totalDataRows}"><div class="break-inner"><span>${p.name}</span><span>${p.start}–${p.end}</span></div></td>`;

            } else {

              html += `<td class="td-lunch" rowspan="${totalDataRows}"><div class="break-inner"><span>Lunch</span><span>${p.start}–${p.end}</span></div></td>`;

            }

          }

          return;

        }

        const sess = secData[p.id];

        const subj = sess ? getSubj(sess.code) : null;

        if (rt === 'course') {

          if (sess && subj) {

            const conflictClass = sess.conflict ? ' conflict-cell' : '';

            const cColor = subj.color || '#e2e8f0';

            const tColor = subj.textColor || '#1a1a1a';

            const forcedStyle = `background:${cColor};color:${tColor};`;

            const typeSuffix = sess.type === 'lab' ? ' (Lab)' : sess.type === 'practice' ? ' (Practice)' : '';

            html += `<td class="td-course${conflictClass}"

              style="${forcedStyle}"

              onclick="App.openCellModal('${day}','${section}','${p.id}')"

              title="${subj.name}${typeSuffix}">

              ${sess.conflict ? '<span class="conflict-dot"></span>' : ''}

              <span class="course-text">${subj.name}${typeSuffix}</span>

            </td>`;

          } else {

            const isP1 = p.id === 'P1';

            html += `<td class="td-course"

              onclick="App.openCellModal('${day}','${section}','${p.id}')"

              style="background:${isP1?'#fff0f0':'#fffbeb'};border:1px dashed #d97706;cursor:pointer;"

              title="Buffer Hour — click to assign a subject">

              <span style="font-size:9px;font-weight:700;color:${isP1?'#d32f2f':'#b45309'};display:block;text-align:center;line-height:1.4;padding:4px 2px;">

                ${isP1?'⚠<br>Must be<br>Lecture':'⏸<br>Buffer<br>Hour'}

              </span>

            </td>`;

          }

        } else if (rt === 'topic') {

          html += `<td class="td-topic" style="white-space:pre-line;">${sess?.topic || ''}</td>`;

        } else {

          html += `<td class="td-instr">${sess?.instructor || ''}</td>`;

        }

      });

      html += '</tr>';

    });

  });

  html += '</tbody></table>';

  document.getElementById('tt-table-area').innerHTML = html;

  renderLegend(sem, day);

  renderMissingClasses(sem);

}

function renderLegend(sem, day) {

  const sched = sem.schedule[day] || {};

  const usedCodes = new Set();

  (sem.sections||[]).forEach(sec => {

    TEACHING_PERIODS.forEach(p => {

      const sess = sched[sec]?.[p.id];

      if (sess?.code) usedCodes.add(sess.code);

    });

  });

  const items = [...usedCodes].map(code => {

    const s = getSubject(sem, code);

    return s ? `<div class="legend-item"><span class="legend-dot" style="background:${s.color||'#e2e8f0'};border:1px solid rgba(0,0,0,.15);"></span>${s.name}</div>` : '';

  }).join('');

  document.getElementById('legend-area').innerHTML = items || '';

}

function buildColorPicker() {

  const colors = [

    '#ffadad', '#ffd6a5', '#fdffb6', '#caffbf', '#9bf6ff', '#a0c4ff', '#bdb2ff', '#ffc6ff', '#fffffc', '#f1f5f9',

    '#f87171', '#fb923c', '#fbbf24', '#a3e635', '#4ade80', '#34d399', '#2dd4bf', '#38bdf8', '#818cf8', '#a78bfa',

    '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e', '#10b981', '#14b8a6', '#0ea5e9', '#6366f1', '#8b5cf6',

    '#b91c1c', '#c2410c', '#b45309', '#4d7c0f', '#15803d', '#047857', '#0f766e', '#0369a1', '#4338ca', '#6d28d9',

    '#f43f5e', '#ec4899', '#d946ef', '#94a3b8', '#64748b', '#475569', '#334155', '#1e293b', '#0f172a', '#000000'

  ];

  const current = document.getElementById('f-color')?.value || '#38bdf8';

  const container = document.getElementById('color-picker');

  if (!container) return;

  container.style.display = 'flex';

  container.style.gap = '6px';

  container.style.flexWrap = 'wrap';

  container.style.marginTop = '6px';

  container.innerHTML = colors.map(c => `

    <div onclick="App.pickColor('${c}')" style="background:${c};width:24px;height:24px;border-radius:4px;cursor:pointer;border:2px solid ${c===current?'#1e293b':'transparent'};box-shadow:${c===current?'0 0 0 1px #fff inset':''}"></div>

  `).join('');

}

function renderSubjectsView() {

  const sem = curSem();

  if (!sem) return;

  const tbody = document.getElementById('subjects-tbody');

  tbody.innerHTML = (sem.subjects||[]).map((s,i) => {

    let placed = 0;

    DAYS.forEach(day => {

      (sem.sections||[]).forEach(sec => {

        TEACHING_PERIODS.forEach(p => {

          if (sem.schedule?.[day]?.[sec]?.[p.id]?.code === s.code) placed++;

        });

      });

    });

    const targetPerSection = (s.lecPerWeek||0) + (s.labPerWeek||0);

    const totalTarget = targetPerSection * (sem.sections||[]).length;

    const leftOver = totalTarget - placed;

    const typeBadge = s.type==='lab' ? 'badge-lab' : s.type==='practice' ? 'badge-prac' : 'badge-lec';

    const typeLabel = s.type==='lab' ? 'Lab' : s.type==='practice' ? 'Practice' : 'Lecture';

    const instrOptions = ['<option value="">-- Unassigned --</option>']

      .concat((App.globalInstructors||[]).map(i => `<option value="${i}" ${s.instructor===i?'selected':''}>${i}</option>`))

      .join('');

    return `<tr>

      <td><span class="color-dot" style="background:${s.color};" onclick="App.editSubject('${s.code}')"></span></td>

      <td class="subj-name-cell">${s.name}<span class="subj-code-badge">${s.code}</span></td>

      <td style="font-size:11px;color:var(--muted);">

        <select class="form-select" style="font-size:11px;padding:4px;height:auto;min-width:120px;" onchange="App.assignInstructor('${s.code}', this.value)">

          ${instrOptions}

        </select>

      </td>

      <td><span class="type-badge ${typeBadge}">${typeLabel}</span></td>

      <td style="text-align:center;">

        <div class="hrs-ctrl">

          <button class="hrs-btn" onclick="App.changeHrs('${s.code}','lec',-1)">−</button>

          <span class="hrs-val">${s.lecPerWeek||0}</span>

          <button class="hrs-btn" onclick="App.changeHrs('${s.code}','lec',1)">+</button>

        </div>

      </td>

      <td style="text-align:center;">

        <div class="hrs-ctrl">

          <button class="hrs-btn" onclick="App.changeHrs('${s.code}','lab',-1)">−</button>

          <span class="hrs-val">${s.labPerWeek||0}</span>

          <button class="hrs-btn" onclick="App.changeHrs('${s.code}','lab',1)">+</button>

        </div>

      </td>

      <td style="text-align:center;font-weight:700;color:var(--brand);">${totalTarget}</td>

      <td style="text-align:center;font-weight:600;color:${placed===totalTarget?'#10b981':'#3b82f6'};">${placed}</td>

      <td style="text-align:center;font-weight:700;color:${leftOver>0?'#ef4444':leftOver<0?'#f59e0b':'#10b981'};">${leftOver}</td>

      <td>

        <div style="display:flex;gap:4px;">

          <button class="icon-btn icon-btn-edit" onclick="App.editSubject('${s.code}')" title="Edit">✎</button>

          <button class="icon-btn icon-btn-del" onclick="App.deleteSubject('${s.code}')" title="Delete">✕</button>

        </div>

      </td>

    </tr>`;

  }).join('');

  buildInstrDatalist();

}

function renderFixedView() {

  const sem = curSem();

  if (!sem) return;

  const tbody = document.getElementById('fixed-placement-tbody');

  const pls = sem.fixedPlacements || [];

  tbody.innerHTML = pls.length ? pls.map((fp, i) => {

    const subj = getSubject(sem, fp.code);

    return `<tr>

      <td><div style="display:flex;align-items:center;gap:6px;"><span style="width:10px;height:10px;border-radius:3px;background:${subj?.color||'#ddd'};display:inline-block;"></span><span style="font-weight:600;font-size:11px;">${subj?.name||fp.code}</span></div></td>

      <td><span style="font-weight:600;color:var(--brand);">${DAY_NAMES[fp.day]||fp.day}</span></td>

      <td>${fp.section}</td>

      <td>${fp.periodId} · ${PERIODS.find(p=>p.id===fp.periodId)?.label||''}</td>

      <td style="font-size:11px;color:var(--muted);">${fp.instructor||'(default)'}</td>

      <td><button class="icon-btn icon-btn-del" onclick="App.removeFixedPlacement(${i})" title="Remove">✕</button></td>

    </tr>`;

  }).join('') :

    '<tr><td colspan="6"><div class="empty-state"><p>No fixed placements.</p></div></td></tr>';

}

function renderSectionsView() {

  const sem = curSem();

  if (!sem) return;

  const container = document.getElementById('sections-list');

  container.innerHTML = (sem.sections||[]).map((s,i) => `

    <div class="section-card" style="margin-bottom:10px;">

      <div>

        <div class="sec-card-name">${s}</div>

        <div class="sec-card-sub">Active in ${sem.label}</div>

      </div>

      <div class="sec-card-actions"><button class="icon-btn icon-btn-del" onclick="App.removeSection(${i})" title="Remove">✕</button></div>

    </div>

  `).join('');

}

function renderSettingsView() {

  App.updateAdminUI();

  const sem = curSem();

  const semList = document.getElementById('sem-list-panel');

  semList.innerHTML = STATE.semesters.map(s => `

    <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border);">

      <div>

        <div style="font-weight:700;font-size:12px;">${s.label}</div>

        <div style="font-size:10px;color:var(--muted);">${(s.sections||[]).length} sections · ${(s.subjects||[]).length} subjects</div>

      </div>

      <div style="display:flex;gap:6px;">

        <button class="tb-btn tb-btn-secondary" style="font-size:10px;padding:4px 10px;" onclick="App.copySemester('${s.id}')">Copy</button>

        ${STATE.semesters.length>1?`<button class="icon-btn icon-btn-del" onclick="App.deleteSemester('${s.id}')">✕</button>`:''}

      </div>

    </div>

  `).join('');

}

function renderWorkloadView() {

  const sem = curSem();

  const panel = document.querySelector('#view-workload .sections-body');

  if (!sem || !panel) return;

  const headerHtml = `

    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">

      <h3 style="margin:0;color:var(--text);font-size:16px;">Instructor Workload & Analytics</h3>

      <button class="btn-primary" style="margin:0;padding:6px 12px;font-size:12px;cursor:pointer;background:#2563eb;color:#fff;border-radius:6px;border:none;font-weight:600;" onclick="App.publishWorkloads()">📧 Publish to Instructors</button>

    </div>

  `;

  const sched = sem.schedule || {};

  const instrSet = new Set();

  DAYS.forEach(day => {

    (sem.sections||[]).forEach(sec => {

      TEACHING_PERIODS.forEach(p => {

        const sess = sched?.[day]?.[sec]?.[p.id];

        if (sess?.instructor && sess.instructor !== 'UNIVERSITY FACULTY') instrSet.add(sess.instructor);

      });

    });

  });

  if (!instrSet.size) {

    panel.innerHTML = '<div class="empty-state"><p>Generate the schedule first to see workload analysis.</p></div>';

    return;

  }

  let html = '<div style="display:grid;gap:16px;grid-template-columns:repeat(auto-fill, minmax(320px, 1fr));padding:20px;">';

  [...instrSet].sort().forEach(instr => {

    let weekLec = 0, weekPrac = 0;

    let subjCounts = {};

    let tableHtml = `<table class="data-table" style="width:100%;margin-top:10px;font-size:12px;background:#f8fafc;border-collapse:collapse;">

      <thead><tr style="text-align:left;color:var(--muted);border-bottom:1px solid var(--border);">

        <th style="padding:6px;">Day</th><th style="padding:6px;">Period</th><th style="padding:6px;">Section</th><th style="padding:6px;">Subject</th><th style="padding:6px;">Type</th>

      </tr></thead><tbody>`;

    DAYS.forEach(day => {

      (sem.sections||[]).forEach(sec => {

        TEACHING_PERIODS.forEach(p => {

          const sess = sched[day]?.[sec]?.[p.id];

          if (sess && sess.instructor === instr) {

            const isPrac = sess.type === 'practice' || sess.type === 'lab';

            if (isPrac) weekPrac++; else weekLec++;

            

            // Find subject name

            const subjObj = (sem.subjects||[]).find(s => s.code === sess.code);

            const subjName = subjObj ? subjObj.name : sess.code;

            if (!subjCounts[subjName]) subjCounts[subjName] = { lec: 0, prac: 0 };

            if (isPrac) subjCounts[subjName].prac++; else subjCounts[subjName].lec++;

            tableHtml += `<tr style="border-bottom:1px solid var(--border);">

              <td style="padding:6px;font-weight:600;">${day}</td>

              <td style="padding:6px;">${p.id}</td>

              <td style="padding:6px;"><span style="background:#e2e8f0;padding:2px 6px;border-radius:4px;font-weight:600;">${sec}</span></td>

              <td style="padding:6px;max-width:150px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${subjName}">${subjName}</td>

              <td style="padding:6px;"><span style="color:${isPrac?'#b45309':'#1d4ed8'};font-weight:600;">${isPrac?'Practice/Lab':'Lecture'}</span></td>

            </tr>`;

          }

        });

      });

    });

    tableHtml += `</tbody></table>`;

    

    let breakdownHtml = `<div style="margin-bottom:12px;display:flex;flex-direction:column;gap:4px;">`;

    for (const [subj, counts] of Object.entries(subjCounts)) {

      breakdownHtml += `<div style="font-size:11px;color:#475569;background:#f8fafc;padding:4px 8px;border-radius:4px;border:1px solid #e2e8f0;display:flex;justify-content:space-between;align-items:center;">

        <span style="font-weight:600;max-width:200px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${subj}">${subj}</span>

        <span style="font-weight:700;color:${counts.prac > 0 ? '#b45309' : '#1d4ed8'}">${counts.lec} Lec, ${counts.prac} Lab</span>

      </div>`;

    }

    breakdownHtml += `</div>`;

    

    html += `

      <div style="background:#fff;border:1px solid var(--border);border-radius:12px;padding:16px;box-shadow:0 1px 3px rgba(0,0,0,0.05);">

        <div style="font-size:16px;font-weight:800;color:var(--brand);margin-bottom:8px;">${instr}</div>

        <div style="display:flex;gap:10px;margin-bottom:8px;">

          <span style="background:#dbeafe;color:#1e40af;padding:4px 8px;border-radius:6px;font-size:12px;font-weight:600;">${weekLec} Lectures</span>

          <span style="background:#fce7f3;color:#9d174d;padding:4px 8px;border-radius:6px;font-size:12px;font-weight:600;">${weekPrac} Practices</span>

          <span style="background:#f1f5f9;color:#475569;padding:4px 8px;border-radius:6px;font-size:12px;font-weight:700;">Total: ${weekLec+weekPrac} Sessions</span>

        </div>

        ${breakdownHtml}

        <div style="max-height:220px;overflow-y:auto;border:1px solid var(--border);border-radius:8px;">

          ${tableHtml}

        </div>

      </div>

    `;

  });

  html += '</div>';

  panel.innerHTML = headerHtml + html;

}

function buildInstrDatalist() {

  const sel = document.getElementById('f-instr');

  if (sel) {

    const opts = ['<option value="">-- Unassigned --</option>']

      .concat((App.globalInstructors||[]).map(i => `<option value="${i}">${i}</option>`))

      .join('');

    sel.innerHTML = opts;

  }

}

const App = {

    updateWeekDropdown() {

    const startEl = document.getElementById('sem-start-date');

    const endEl = document.getElementById('sem-end-date');

    const selector = document.getElementById('week-selector');

    if (!startEl || !endEl || !selector) return;

    const startStr = startEl.value;

    const endStr = endEl.value;

    if (!startStr || !endStr) return;

    const sem = curSem();

    if (sem) {

      sem.startDate = startStr;

      sem.endDate = endStr;

      saveState();

    }

    const start = new Date(startStr);

    const end = new Date(endStr);

    

    // Calculate total weeks

    const diffTime = Math.abs(end - start);

    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

    const totalWeeks = Math.max(1, Math.ceil(diffDays / 7));

    

    // Remember current selection

    const prevSelectedVal = selector.value;

    

    selector.innerHTML = '';

    

    // Date formatter helper (e.g. 09-02-2026)

    const formatDate = (date) => {

      const d = new Date(date);

      const day = String(d.getDate()).padStart(2, '0');

      const month = String(d.getMonth() + 1).padStart(2, '0');

      const year = d.getFullYear();

      return `${day}-${month}-${year}`;

    };

    for (let i = 1; i <= totalWeeks; i++) {

      const opt = document.createElement('option');

      opt.value = i;

      

      const wStart = new Date(start);

      wStart.setDate(start.getDate() + (i - 1) * 7);

      

      const wEnd = new Date(wStart);

      wEnd.setDate(wStart.getDate() + 4); // 5-day Mon-Fri

      

      opt.textContent = `Week ${i} (${formatDate(wStart)} to ${formatDate(wEnd)})`;

      selector.appendChild(opt);

    }

    

    // Restore selection if valid

    if (prevSelectedVal && prevSelectedVal <= totalWeeks) {

      selector.value = prevSelectedVal;

    }

  },

  

    async publishWorkload() {

    const sem = curSem();

    if (!sem || !sem.schedule) return alert("Generate a schedule first!");

    const startStr = document.getElementById('sem-start-date').value;

    const endStr = document.getElementById('sem-end-date').value;

    if (!startStr || !endStr) return alert("Please select a Semester Start and End date first.");

    const weekSelector = document.getElementById('week-selector');

    const selectedWeekVal = parseInt(weekSelector.value) || 1;

    const weekNum = weekSelector.options[weekSelector.selectedIndex]?.text || `Week ${selectedWeekVal}`;

    // Calculate dates for this specific selected week

    const startD = new Date(startStr);

    startD.setDate(startD.getDate() + (selectedWeekVal - 1) * 7);

    

    const endD = new Date(startD);

    endD.setDate(startD.getDate() + 4); // 5-day Mon-Fri

    const weekStartStr = startD.toISOString().split('T')[0];

    const weekEndStr = endD.toISOString().split('T')[0];

    document.getElementById('backend-status').textContent = "Publishing...";

    document.getElementById('backend-status').style.display = 'inline';

    document.getElementById('backend-status').style.color = '#fff';

    document.getElementById('backend-status').style.background = '#d97706';

    try {

      const res = await fetch(`${API}/api/publish`, {

        method: 'POST',

        headers: { 'Content-Type': 'application/json' },

        body: JSON.stringify({ 

          schedule: sem.schedule, 

          weekNum, 

          startStr: weekStartStr, 

          endStr: weekEndStr 

        })

      });

      const data = await res.json();

      if (res.ok) {

        document.getElementById('backend-status').textContent = "✓ Published to Emails & WhatsApp!";

        document.getElementById('backend-status').style.background = '#10b981';

        setTimeout(() => { document.getElementById('backend-status').style.display = 'none'; }, 4000);

      } else {

        alert("Error publishing: " + data.error);

      }

    } catch(err) {

      alert("Failed to connect to backend publish API.");

      console.error(err);

    }

  },

  async publishWorkloads() {

    if (!localStorage.getItem('admin_token')) { toast('Please log in as Admin in the Settings tab to publish schedules.', 'error'); return; }

    const sem = curSem();

    if (!sem) return;

    const btn = document.querySelector('.btn-primary[onclick="App.publishWorkloads()"]');

    if (btn) { btn.disabled = true; btn.textContent = '⏳ Publishing...'; }

    toast('Preparing to send messages...', 'info');

    try {

      const cWeek = sem.currentWeek || 1;

      let startD = new Date();

      if (sem.startDate) {

        startD = new Date(sem.startDate);

      }

      startD.setDate(startD.getDate() + (cWeek - 1) * 7);

      const endD = new Date(startD);

      endD.setDate(endD.getDate() + 4); // 5-day academic week (Mon-Fri)

      const res = await fetch(`${API}/api/publish`, {

        method: 'POST',

        headers: { 'Content-Type': 'application/json' },

        body: JSON.stringify({

          schedule: sem.schedule,

          startStr: startD.toISOString().split('T')[0],

          endStr: endD.toISOString().split('T')[0],

          weekNum: 'Week ' + cWeek

        })

      });

      const data = await res.json();

      if (res.ok) {

        toast(`✅ Published ${data.sent} messages successfully!`, 'success');

      } else {

        toast(`❌ Failed to publish: ${data.error}`, 'error');

      }

    } catch (err) {

      console.error(err);

      toast('❌ Error connecting to backend publisher.', 'error');

    } finally {

      if (btn) { btn.disabled = false; btn.textContent = '📧 Publish to Instructors'; }

    }

  },

  saveSettings() {

    if (!localStorage.getItem('admin_token')) { toast('Please log in as Admin to save settings.', 'error'); return; }

    saveState();

    toast('Settings saved','success');

  },

  adminLogin() {

    const u = document.getElementById('overlay-admin-user').value;

    const p = document.getElementById('overlay-admin-pass').value;

    if (u === 'admin' && p === 'admin') {

      localStorage.setItem('admin_token', 'true');

      document.getElementById('overlay-admin-user').value = '';

      document.getElementById('overlay-admin-pass').value = '';

      document.getElementById('overlay-admin-err').style.display = 'none';

      App.updateAdminUI();

    } else {

      document.getElementById('overlay-admin-err').style.display = 'block';

    }

  },

  adminLogout() {

    localStorage.removeItem('admin_token');

    App.updateAdminUI();

  },

  updateAdminUI() {

    const isLoggedIn = localStorage.getItem('admin_token') === 'true';

    const overlay = document.getElementById('login-overlay');

    if (overlay) {

      overlay.style.display = isLoggedIn ? 'none' : 'flex';

    }

  },

  /* ── Section management ── */

  addSection() {

    const sem = curSem(); if (!sem) return;

    const name = prompt('Section name:', `Section-${(sem.sections||[]).length+1}`);

    if (!name) return;

    if ((sem.sections||[]).includes(name)) { toast('Section already exists','error'); return; }

    sem.sections = [...(sem.sections||[]), name];

    // Refresh fixed placements for new section count

    // (don't reset existing ones)

    renderSectionsView();

    saveState();

    toast(`Added ${name}`,'success');

  },

  removeSection(i) {

    const sem = curSem(); if (!sem) return;

    const name = sem.sections[i];

    if (!confirm(`Remove ${name}? This will also remove its schedule data.`)) return;

    sem.sections.splice(i,1);

    // Remove schedule for this section

    DAYS.forEach(d => { if(sem.schedule[d]) delete sem.schedule[d][name]; });

    renderSectionsView();

    saveState();

    toast(`Removed ${name}`,'info');

  },

  /* ── Subject management ── */

  changeHrs(code, field, delta) {

    const sem = curSem(); if (!sem) return;

    const s = (sem.subjects||[]).find(s=>s.code===code);

    if (!s) return;

    if (field==='lec') s.lecPerWeek = Math.max(0, (s.lecPerWeek||0)+delta);

    else s.labPerWeek = Math.max(0, (s.labPerWeek||0)+delta);

    saveState();

    renderSubjectsView();

  },

  assignInstructor(code, instrName) {

    const sem = curSem(); if (!sem) return;

    const subj = (sem.subjects||[]).find(s => s.code === code);

    if (subj) {

      subj.instructor = instrName;

      saveState();

      toast('Instructor assigned', 'success');

    }

  },

  editSubject(code) {

    const sem = curSem(); if (!sem) return;

    const s = (sem.subjects||[]).find(s=>s.code===code);

    if (!s) return;

    document.getElementById('edit-subj-code-orig').value = code;

    document.getElementById('f-code').value = s.code;

    document.getElementById('f-name').value = s.name;

    document.getElementById('f-instr').value = s.instructor||'';

    document.getElementById('f-type').value = s.type||'lecture';

    document.getElementById('f-lec').value = s.lecPerWeek||0;

    document.getElementById('f-lab').value = s.labPerWeek||0;

    document.getElementById('f-color').value = s.color||'#48cae4';

    document.getElementById('f-textcolor').value = s.textColor||'#1a1a1a';

    document.getElementById('subj-form-title').textContent = '✎ Edit Subject';

    buildColorPicker();

    // Scroll to form

    document.getElementById('subj-form-title').scrollIntoView({behavior:'smooth'});

  },

  deleteSubject(code) {

    const sem = curSem(); if (!sem) return;

    if (!confirm('Remove this subject?')) return;

    sem.subjects = (sem.subjects||[]).filter(s=>s.code!==code);

    saveState();

    renderSubjectsView();

    toast('Subject removed','info');

  },

  clearSubjForm() {

    document.getElementById('edit-subj-code-orig').value='';

    document.getElementById('f-code').value='';

    document.getElementById('f-name').value='';

    document.getElementById('f-instr').value='';

    document.getElementById('f-type').value='lecture';

    document.getElementById('f-lec').value='3';

    document.getElementById('f-lab').value='0';

    document.getElementById('subj-form-title').textContent='+ Add Subject';

  },

  saveSubject() {

    const sem = curSem(); if (!sem) return;

    const origCode = document.getElementById('edit-subj-code-orig').value;

    const code  = document.getElementById('f-code').value.trim().toUpperCase();

    const name  = document.getElementById('f-name').value.trim();

    const instr = document.getElementById('f-instr').value.trim();

    const type  = document.getElementById('f-type').value;

    const lec   = +document.getElementById('f-lec').value||0;

    const lab   = +document.getElementById('f-lab').value||0;

    const color = document.getElementById('f-color').value;

    const textColor = document.getElementById('f-textcolor').value;

    if (!code||!name) { toast('Code and Name are required','error'); return; }

    const obj = {code,name,instructor:instr,type,lecPerWeek:lec,labPerWeek:lab,color,textColor};

    if (origCode) {

      // edit

      const i = (sem.subjects||[]).findIndex(s=>s.code===origCode);

      if (i>=0) sem.subjects[i] = obj;

    } else {

      if ((sem.subjects||[]).find(s=>s.code===code)) { toast('Subject code already exists','error'); return; }

      sem.subjects = [...(sem.subjects||[]), obj];

    }

    this.clearSubjForm();

    saveState();

    renderSubjectsView();

    toast(`Subject saved: ${name}`,'success');

  },

  scrollTable(delta) {

    const wrap = document.querySelector('.tt-scroll-wrap');

    if (wrap) wrap.scrollBy({ left: delta, behavior: 'smooth' });

  },

  pickColor(c) {

    document.getElementById('f-color').value = c;

    buildColorPicker();

  },

  setTextColor(c, btn) {

    document.getElementById('f-textcolor').value = c;

    document.querySelectorAll('.tc-btn').forEach(b=>b.classList.remove('active-tc'));

    btn.classList.add('active-tc');

  },

  /* ── Fixed slot management ── */

  toggleFpManual() {

    const val = document.getElementById('fp-slot').value;

    document.getElementById('fp-manual-name').style.display = (val === 'MANUAL_ENTRY') ? 'block' : 'none';

  },

  openAddFixedModal() {

    const sem = curSem(); if (!sem) return;

    document.getElementById('fp-section').innerHTML = (sem.sections||[]).map(s=>`<option>${s}</option>`).join('');

    let slotOpts = (sem.fixedSlots||[]).map(s=>`<option value="${s.code}">${s.name}</option>`).join('');

    slotOpts += `<option value="MANUAL_ENTRY">-- Custom Manual Entry --</option>`;

    document.getElementById('fp-slot').innerHTML = slotOpts;

    document.getElementById('fp-manual-name').style.display = 'none';

    document.getElementById('fp-manual-name').value = '';

    document.getElementById('fixed-modal').classList.add('open');

  },

  saveFixedPlacement() {

    const sem = curSem(); if (!sem) return;

    let code = document.getElementById('fp-slot').value;

    if (code === 'MANUAL_ENTRY') {

      code = document.getElementById('fp-manual-name').value.trim();

      if (!code) { toast('Please enter a custom name', 'error'); return; }

    }

    const day       = document.getElementById('fp-day').value;

    const startId   = document.getElementById('fp-period-start').value;

    const endId     = document.getElementById('fp-period-end').value;

    const section   = document.getElementById('fp-section').value;

    const instr     = document.getElementById('fp-instr').value.trim();

    

    const pids = PERIODS.map(p => p.id);

    const sIdx = pids.indexOf(startId);

    const eIdx = pids.indexOf(endId);

    if (eIdx < sIdx) { toast('To Period must be after or equal to From Period', 'error'); return; }

    let addedCount = 0;

    for (let i = sIdx; i <= eIdx; i++) {

      const periodId = pids[i];

      const dup = (sem.fixedPlacements||[]).find(p=>p.day===day&&p.section===section&&p.periodId===periodId);

      if (dup) {

        toast(`Skipped ${periodId} - A slot is already placed here (${dup.code})`, 'error');

        continue;

      }

      sem.fixedPlacements = [...(sem.fixedPlacements||[]), {code, day, section, periodId, instructor: instr}];

      addedCount++;

    }

    

    if (addedCount > 0) {

      saveState();

      renderFixedView();

      this.closeModal('fixed-modal');

      toast(`Added ${addedCount} fixed slot(s)`, 'success');

    }

  },

  removeFixedPlacement(i) {

    const sem = curSem(); if (!sem) return;

    const fp = sem.fixedPlacements[i];

    if (fp && sem.schedule?.[fp.day]?.[fp.section]) {

      const sess = sem.schedule[fp.day][fp.section][fp.periodId];

      if (sess && sess.code === fp.code) {

        delete sem.schedule[fp.day][fp.section][fp.periodId];

      }

    }

    sem.fixedPlacements.splice(i,1);

    saveState();

    renderFixedView();

    renderScheduleTable();

    toast('Placement removed','info');

  },

  /* ── Cell editing ── */

  openCellModal(day, section, periodId) {

    const sem = curSem(); if (!sem) return;

    const sess = sem.schedule?.[day]?.[section]?.[periodId];

    const period = PERIODS.find(p=>p.id===periodId);

    STATE._editCtx = {day,section,periodId};

    document.getElementById('cell-modal-title').textContent = `${DAY_NAMES[day]||day} · ${period?.label||periodId} · ${section}`;

    document.getElementById('cell-modal-info').textContent = `Period ${period?.num||''} · ${period?.start||''}–${period?.end||''}`;

    // Build subject dropdown

    const sel = document.getElementById('cell-subj-select');

    const allSubj = getAllSubjects(sem);

    sel.innerHTML = `<option value="">— Empty Slot —</option>` +

      allSubj.map(s=>`<option value="${s.code}" ${sess?.code===s.code?'selected':''}>${s.name}</option>`).join('');

    // Set instructor and topic

    document.getElementById('cell-instr-input').value = sess?.instructor || (sess?.code ? (getSubject(sem,sess.code)?.instructor||'') : '');

    document.getElementById('cell-topic-input').value = sess?.topic||'';

    // Auto-fill instructor on subject change

    sel.onchange = () => {

      const s = getSubject(sem, sel.value);

      if (s) document.getElementById('cell-instr-input').value = s.instructor||'';

    };

    document.getElementById('cell-modal').classList.add('open');

  },

  saveCellEdit() {

    const ctx = STATE._editCtx; if (!ctx) return;

    const sem = curSem(); if (!sem) return;

    const {day,section,periodId} = ctx;

    const code  = document.getElementById('cell-subj-select').value;

    const instr = document.getElementById('cell-instr-input').value.trim();

    const topic = document.getElementById('cell-topic-input').value.trim();

    // Check for instructor conflict across other sections at the same time

    if (code && instr && instr !== 'UNIVERSITY FACULTY') {

      const conflictSec = (sem.sections||[]).find(sec => 

        sec !== section && 

        sem.schedule?.[day]?.[sec]?.[periodId]?.instructor === instr

      );

      if (conflictSec) {

        alert(`Instructor conflict: ${instr} is already teaching section ${conflictSec} at this time.`);

        return;

      }

      // Check strict daily workload limits

      const subjObj = (sem.subjects||[]).find(s => s.code === code);

      const isPrac = subjObj && (subjObj.type === 'practice' || subjObj.type === 'lab');

      let lecCount = 0;

      let pracCount = 0;

      (sem.sections||[]).forEach(sec => {

        ['P1','P2','P3','P4','P5','P6','P7','P8'].forEach(p => {

           if (sec === section && p === periodId) return;

           const s = sem.schedule?.[day]?.[sec]?.[p];

           if (s && s.instructor === instr) {

             if (s.type === 'practice' || s.type === 'lab') pracCount++;

             else lecCount++;

           }

        });

      });

      if (lecCount + pracCount >= 6) {

         alert(`Daily Limit Exceeded: ${instr} is already scheduled for the absolute maximum of 6 classes on ${day}.`);

         return;

      }

      if (isPrac && pracCount >= 3) {

         alert(`Daily Limit Exceeded: ${instr} is already scheduled for the maximum of 3 lab sessions on ${day}.`);

         return;

      }

      if (!isPrac && lecCount >= 4) {

         alert(`Daily Limit Exceeded: ${instr} is already scheduled for the maximum of 4 lectures on ${day}.`);

         return;

      }

      // Check strict fatigue limit (No 3 continuous periods, resets at Lunch)

      const instrPeriods = new Set([periodId]);

      (sem.sections||[]).forEach(sec => {

        ['P1','P2','P3','P4','P5','P6','P7','P8'].forEach(p => {

           if (sec === section && p === periodId) return;

           const s = sem.schedule?.[day]?.[sec]?.[p];

           if (s && s.instructor === instr) instrPeriods.add(p);

        });

      });

      let consecMorning = 0;

      for (const p of ['P1','P2','P3','P4']) {

        if (instrPeriods.has(p)) consecMorning++;

        else consecMorning = 0;

        if (consecMorning >= 3) {

           alert(`Fatigue Limit Exceeded: ${instr} cannot teach 3 consecutive classes without a break. Please insert a free period.`);

           return;

        }

      }

      let consecAfternoon = 0;

      for (const p of ['P5','P6','P7','P8']) {

        if (instrPeriods.has(p)) consecAfternoon++;

        else consecAfternoon = 0;

        if (consecAfternoon >= 3) {

           alert(`Fatigue Limit Exceeded: ${instr} cannot teach 3 consecutive classes without a break. Please insert a free period.`);

           return;

        }

      }

    }

    if (!sem.schedule[day]) sem.schedule[day] = {};

    if (!sem.schedule[day][section]) sem.schedule[day][section] = {};

    if (!code) {

      delete sem.schedule[day][section][periodId];

    } else {

      const subjObj = (sem.subjects||[]).find(s => s.code === code);

      const type = subjObj ? subjObj.type : 'lecture';

      sem.schedule[day][section][periodId] = {code, instructor:instr, topic, type, isFixed:true};

    }

    flagConflicts(sem.schedule, sem);

    saveState();

    this.closeModal('cell-modal');

    renderScheduleTable();

    renderStatsBar();

    toast('Slot updated','success');

  },

  clearCell() {

    const ctx = STATE._editCtx; if (!ctx) return;

    const sem = curSem(); if (!sem) return;

    const {day,section,periodId} = ctx;

    if (sem.schedule?.[day]?.[section]) delete sem.schedule[day][section][periodId];

    flagConflicts(sem.schedule, sem);

    saveState();

    this.closeModal('cell-modal');

    renderScheduleTable();

    renderStatsBar();

    toast('Slot cleared','info');

  },

  /* ── Generate & Shuffle ── */

  async generateAndShow() {

    const sem = curSem(); if (!sem) return;

    const btn = document.querySelector('.btn-generate');

    if (btn) { btn.disabled = true; btn.textContent = '⏳ Generating…'; }

    toast('⏳ Running backend scheduling engine (CSP + Backtracking)…', 'info');

    const fromBackend = await generateScheduleBackend(sem);

    saveState();

    this.showView('schedule');

    renderScheduleTable();

    renderStatsBar();

    const src = fromBackend ? '🟢 Backend CSP Engine' : '🟡 Client fallback';

    toast(`Schedule generated! [${src}]`, 'success');

    

    // Check for missing assignments

    let missingArr = [];

    (sem.sections||[]).forEach(sec => {

      (sem.subjects||[]).forEach(subj => {

        let placedLec = 0, placedLab = 0;

        DAYS.forEach(day => {

          TEACHING_PERIODS.forEach(p => {

            const sess = sem.schedule?.[day]?.[sec]?.[p.id];

            if (sess && sess.code === subj.code) {

               const t = sess.type || 'lecture';

               if (t === 'lab' || t === 'practice') placedLab++; else placedLec++;

            }

          });

        });

        if (placedLec < (subj.lecPerWeek||0)) missingArr.push(`- ${sec} is missing ${subj.lecPerWeek - placedLec} Lecture(s) of ${subj.name}`);

        if (placedLab < (subj.labPerWeek||0)) missingArr.push(`- ${sec} is missing ${subj.labPerWeek - placedLab} Practice/Lab(s) of ${subj.name}`);

      });

    });

    if (missingArr.length > 0) {

       alert("⚠️ INCOMPLETE SCHEDULE GENERATED:\n\nThe engine could not place all required classes due to severe constraints (e.g. instructor conflicts or lack of slots).\n\n" + missingArr.join("\n"));

    }

    this.showScheduleSummaryModal(sem);

    if (btn) { btn.disabled = false; btn.textContent = '⚡ Generate Full Week'; }

  },

  showScheduleSummaryModal(sem) {

    if (!sem) return;

    const sched = sem.schedule || {};

    // Count scheduled sessions per section per subject

    const counts = {}; // counts[section][code] = {lec:0, lab:0}

    (sem.sections||[]).forEach(sec => {

      counts[sec] = {};

      (sem.subjects||[]).forEach(subj => {

        counts[sec][subj.code] = { lec:0, lab:0, name:subj.name, color:subj.color,

          textColor:subj.textColor, expLec:subj.lecPerWeek||0, expLab:subj.labPerWeek||0,

          instructor:subj.instructor };

      });

    });

    DAYS.forEach(day => {

      (sem.sections||[]).forEach(sec => {

        TEACHING_PERIODS.forEach(p => {

          const sess = sched[day]?.[sec]?.[p.id];

          if (!sess || !counts[sec]?.[sess.code]) return;

          const t = sess.type || getSubject(sem, sess.code)?.type || 'lecture';

          if (t === 'lab' || t === 'practice') counts[sec][sess.code].lab++;

          else counts[sec][sess.code].lec++;

        });

      });

    });

    const typeColor = t => t==='lab'?'#c05621':t==='practice'?'#276749':'#2b4acb';

    const typeBg    = t => t==='lab'?'#fff0e6':t==='practice'?'#e6f7ef':'#ebedff';

    let body = `<div style="display:flex;flex-direction:column;gap:18px;">`;

    (sem.sections||[]).forEach(sec => {

      const subjEntries = Object.entries(counts[sec]);

      let totalLec=0, totalLab=0;

      subjEntries.forEach(([,c]) => { totalLec+=c.lec; totalLab+=c.lab; });

      body += `<div style="border:1px solid #dde3ec;border-radius:10px;overflow:hidden;">`;

      body += `<div style="padding:10px 16px;background:var(--brand);color:#fff;display:flex;align-items:center;justify-content:space-between;">

        <span style="font-weight:700;font-size:13px;">📚 ${sec}</span>

        <span style="font-size:11px;opacity:.8;">${totalLec} Lectures &nbsp;·&nbsp; ${totalLab} Practice/Lab sessions scheduled</span>

      </div>`;

      body += `<div style="padding:0;">`;

      // Column headers

      body += `<div style="display:grid;grid-template-columns:1fr 130px 100px 80px 80px 60px 60px;

        background:#f1f5fb;border-bottom:1px solid #e2e8f0;padding:5px 14px;gap:4px;">

        <div style="font-size:9px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.5px;">Subject</div>

        <div style="font-size:9px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.5px;">Instructor</div>

        <div style="font-size:9px;font-weight:700;color:#2b4acb;text-transform:uppercase;letter-spacing:.5px;text-align:center;">Lectures</div>

        <div style="font-size:9px;font-weight:700;color:#2b4acb;text-transform:uppercase;letter-spacing:.5px;text-align:center;">Expected</div>

        <div style="font-size:9px;font-weight:700;color:#c05621;text-transform:uppercase;letter-spacing:.5px;text-align:center;">Lab/Prac</div>

        <div style="font-size:9px;font-weight:700;color:#c05621;text-transform:uppercase;letter-spacing:.5px;text-align:center;">Expected</div>

        <div style="font-size:9px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.5px;text-align:center;">Status</div>

      </div>`;

      subjEntries.forEach(([code, c], idx) => {

        const lecOk = c.lec === c.expLec;

        const labOk = c.lab === c.expLab;

        const allOk = lecOk && labOk;

        const rowBg = idx%2===0?'#fff':'#fafbfd';

        const statusIcon = allOk

          ? `<span style="color:#1a7a40;font-weight:700;">✓</span>`

          : `<span style="color:#d32f2f;font-weight:700;" title="${!lecOk?`Lec: ${c.lec}/${c.expLec} `:''}${!labOk?`Lab: ${c.lab}/${c.expLab}`:''}">⚠</span>`;

        body += `<div style="display:grid;grid-template-columns:1fr 130px 100px 80px 80px 60px 60px;

          padding:6px 14px;background:${rowBg};border-top:1px solid #f0f2f5;gap:4px;align-items:center;">

          <div style="font-size:10px;font-weight:600;color:#1e293b;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${c.name}">

            <span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:${c.color};margin-right:5px;"></span>${c.name}

          </div>

          <div style="font-size:10px;color:#555;">${c.instructor}</div>

          <div style="text-align:center;"><span style="font-size:11px;font-weight:700;color:${lecOk?'#2b4acb':'#d32f2f'}">${c.lec}</span></div>

          <div style="text-align:center;font-size:10px;color:#94a3b8;">${c.expLec}</div>

          <div style="text-align:center;"><span style="font-size:11px;font-weight:700;color:${labOk?'#c05621':'#d32f2f'}">${c.lab}</span></div>

          <div style="text-align:center;font-size:10px;color:#94a3b8;">${c.expLab}</div>

          <div style="text-align:center;">${statusIcon}</div>

        </div>`;

      });

      // Section footer

      body += `<div style="padding:7px 14px;background:#e9f0fa;border-top:1px solid #dde3ec;display:flex;justify-content:space-between;font-size:11px;font-weight:700;color:var(--brand);">

        <span>Total: ${totalLec + totalLab} sessions</span>

        <span>${totalLec} Lectures &nbsp;+&nbsp; ${totalLab} Practice/Lab</span>

      </div>`;

      body += `</div></div>`;

    });

    body += `</div>`;

    // Show in modal

    let modal = document.getElementById('summary-modal');

    if (!modal) {

      modal = document.createElement('div');

      modal.id = 'summary-modal';

      modal.className = 'modal-backdrop';

      modal.innerHTML = `

        <div class="modal-box" style="width:820px;max-width:96vw;">

          <div class="modal-header">

            <div class="modal-title">📊 Schedule Summary — ${sem.label}</div>

            <button class="modal-close" onclick="document.getElementById('summary-modal').classList.remove('open')">✕</button>

          </div>

          <div class="modal-body" id="summary-modal-body" style="max-height:70vh;overflow-y:auto;"></div>

          <div class="modal-footer">

            <button class="mf-btn mf-btn-save" onclick="document.getElementById('summary-modal').classList.remove('open')">Close</button>

          </div>

        </div>`;

      document.body.appendChild(modal);

    }

        document.getElementById('summary-modal-body').innerHTML = body;

    modal.classList.add('open');

  },

  resetToDefaultWorkload() {

    const sem = curSem(); if (!sem) return;

    if (!confirm(

      'This will replace ALL subjects and fixed placements with the standard workload:\n\n' +

      '  DSA: 4 lec + 4 lab\n' +

      '  Frontend: 3 lec + 2 lab\n' +

      '  DBMS: 3 lec + 2 lab\n' +

      '  LLM: 2 lec\n' +

      '  Math: 2 lec + 2 prac\n' +

      '  English: 2 lec + 1 prac\n' +

      '  Yoga:4  COIN:1  Sports:1  Library:1  Mentor:1  Quiz:5\n\n' +

      'Continue?'

    )) return;

    sem.subjects          = JSON.parse(JSON.stringify(DEFAULT_SUBJECTS));

    sem.fixedSlots        = JSON.parse(JSON.stringify(FIXED_SLOT_DEFS));

    sem.fixedPlacements   = makeDefaultPlacements(sem.sections || ['Section-1','Section-2','Section-3']);

    sem.schedule          = {};

    this.showView('schedule');

    toast('⏳ Generating schedule via backend…', 'info');

    generateScheduleBackend(sem).then(fromBackend => {

      saveState();

      renderScheduleTable();

      renderStatsBar();

      renderSubjectsView();

      const src = fromBackend ? '(Backend CSP Engine)' : '(Client fallback)';

      toast(`✅ Standard workload applied ${src}`, 'success');

      this.showScheduleSummaryModal(sem);

    });

  },

  async shuffleWeek() {

    const sem = curSem(); if (!sem) return;

    toast('Shuffling schedule via backend...', 'info');

    

    sem.shuffle = true;

    await generateScheduleBackend(sem);

    sem.shuffle = false;

    saveState();

    renderScheduleTable();

    renderStatsBar();

    toast('Week schedule shuffled!', 'success');

  },

  clearSchedule() {

    const sem = curSem(); if (!sem) return;

    if (!confirm('Are you sure you want to clear the schedule? Fixed slots will be kept.')) return;

    if (sem.schedule) {

      Object.keys(sem.schedule).forEach(day => {

        Object.keys(sem.schedule[day]).forEach(sec => {

          Object.keys(sem.schedule[day][sec]).forEach(pid => {

            if (!sem.schedule[day][sec][pid].isFixed) {

              delete sem.schedule[day][sec][pid];

            }

          });

        });

      });

    }

    saveState();

    renderScheduleTable();

    renderStatsBar();

    toast('Schedule cleared (except fixed slots).', 'success');

  },

  resetWorkloads() {

    const sem = curSem(); if (!sem) return;

    if (!confirm('Are you sure you want to reset all subject workloads to 0 AND clear the entire schedule?')) return;

    if (sem.subjects) {

      sem.subjects.forEach(subj => {

        subj.lecPerWeek = 0;

        subj.labPerWeek = 0;

      });

    }

    // Also clear the entire schedule so SCH and LEFT become 0

    sem.schedule = {};

    saveState();

    renderSubjectsView();

    renderStatsBar();

    toast('Workloads and Schedule fully reset to zero.', 'success');

  },

  saveManualEdits() {

    saveState();

    toast('Manual edits saved securely!', 'success');

  },

  /* ── Modal helpers ── */

  closeModal(id) { document.getElementById(id).classList.remove('open'); },

  /* ── Export ── */

  async exportExcel() {

    const sem = curSem(); if (!sem) return;

    toast('Generating Excel file...', 'info');

    try {

      const r = await fetch(`${API}/api/export-excel`, {

        method: 'POST',

        headers: { 'Content-Type': 'application/json' },

        body: JSON.stringify({ sem })

      });

      if (!r.ok) throw new Error('Export failed');

      const blob = await r.blob();

      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');

      a.href = url;

      a.download = `Timetable_${sem.label || 'export'}.xlsx`;

      a.click();

      URL.revokeObjectURL(url);

      toast('Excel exported successfully!', 'success');

    } catch (err) {

      console.error(err);

      toast('Export failed', 'error');

    }

  },

};

/* ═══════════════════════════════════════

   TOAST

   ═══════════════════════════════════════ */

function toast(msg, type='info') {

  const el = document.createElement('div');

  el.className = `toast toast-${type}`; el.textContent = msg;

  document.getElementById('toast-area').appendChild(el);

  setTimeout(() => el.remove(), 3200);

}

/* ═══════════════════════════════════════

   MODAL: Close on backdrop click

   ═══════════════════════════════════════ */

document.querySelectorAll('.modal-backdrop').forEach(m => {

  m.addEventListener('click', e => { if(e.target===m) m.classList.remove('open'); });

});

/* ═══════════════════════════════════════

   SEMESTER LABEL AUTO-UPDATE

   ═══════════════════════════════════════ */

['sem-year','sem-num','sem-cohort'].forEach(id => {

  const el = document.getElementById(id);

  if (el) el.addEventListener('input', () => App._updateSemLabel());

});

/* ═══════════════════════════════════════

   BOOT

   ═══════════════════════════════════════ */

(async function init() {

  try {

    App.globalInstructors = [];

    try {

      const res = await fetch(`${API}/api/instructors`);

      if(res.ok) {

        const data = await res.json();

        App.globalInstructors = Object.values(data).map(d => d.name).sort();

      }

    } catch(e) {}

    // 1. Check backend availability

    await checkBackend();

    // 2. Load state (backend preferred, localStorage fallback)

    await loadState();

    // 3. Ensure a default semester exists

    if (!STATE.semesters.length) {

      const sem = {

        id:'Y1-S1-2026', label:'Year 1 · Sem 1 · 2026',

        year:1, sem:1, cohort:'2026',

        sections:['Section-1','Section-2','Section-3'],

        subjects: JSON.parse(JSON.stringify(DEFAULT_SUBJECTS)),

        fixedSlots: JSON.parse(JSON.stringify(FIXED_SLOT_DEFS)),

        fixedPlacements: makeDefaultPlacements(['Section-1','Section-2','Section-3']),

        schedule:{},

      };

      STATE.semesters.push(sem);

      STATE.currentSemId = sem.id;

    }

    // 4. Render UI immediately (even before schedule is generated)

    renderSemesterSelect();

    renderTopbar();

    renderScheduleTable();

    renderStatsBar();

    // 5. Generate schedules for any semester that doesn't have one yet

    const needsGen = STATE.semesters.filter(s => !s.schedule || !Object.keys(s.schedule).length);

    if (needsGen.length) {

      toast(`⏳ Generating ${needsGen.length} schedule(s) via backend…`, 'info');

      for (const sem of needsGen) {

        await generateScheduleBackend(sem);

      }

      renderScheduleTable();

      renderStatsBar();

      saveState();

      toast('✅ Schedule generated successfully!', 'success');

    }

  } catch (error) {

    console.error("BOOT ERROR:", error);

    alert("Application Boot Error: " + error.message + "\n" + error.stack);

  }

})();

function extractManualFixed(sem) {

  const manual = [];

  DAYS.forEach(day => {

    (sem.sections||[]).forEach(sec => {

      TEACHING_PERIODS.forEach(p => {

        const sess = sem.schedule?.[day]?.[sec]?.[p.id];

        if (sess && sess.isFixed) {

          manual.push({

            code: sess.code,

            day,

            section: sec,

            periodId: p.id,

            instructor: sess.instructor,

            type: sess.type

          });

        }

      });

    });

  });

  return manual;

}

function renderMissingClasses(sem) {

  const missingArr = [];

  (sem.sections||[]).forEach(sec => {

    (sem.subjects||[]).forEach(subj => {

      let placedLec = 0, placedLab = 0;

      DAYS.forEach(day => {

        TEACHING_PERIODS.forEach(p => {

          const sess = sem.schedule?.[day]?.[sec]?.[p.id];

          if (sess && sess.code === subj.code) {

             const t = sess.type || 'lecture';

             if (t === 'lab' || t === 'practice') placedLab++; else placedLec++;

          }

        });

      });

      const missingLec = (subj.lecPerWeek||0) - placedLec;

      const missingLab = (subj.labPerWeek||0) - placedLab;

      if (missingLec > 0) missingArr.push(`<b>${sec}</b>: Needs ${missingLec} more Lecture(s) of <b>${subj.name}</b>`);

      if (missingLab > 0) missingArr.push(`<b>${sec}</b>: Needs ${missingLab} more Practice/Lab(s) of <b>${subj.name}</b>`);

    });

  });

  const area = document.getElementById('missing-area');

  if (missingArr.length > 0) {

    area.style.display = 'block';

    area.innerHTML = '<h4 style="margin:0 0 8px 0;color:#b91c1c;font-size:13px;">⚠️ Classes Yet to be Scheduled</h4>' +

      '<ul style="margin:0;padding-left:20px;font-size:12px;color:#7f1d1d;line-height:1.6;">' + 

      missingArr.map(m => `<li>${m}</li>`).join('') + 

      '</ul>';

  } else {

    area.style.display = 'none';

    area.innerHTML = '';

  }

}

async function renderInstructorsView() {

  try {

    const res = await fetch(`${API}/api/instructors`);

    const instrs = await res.json();

    const tbody = document.getElementById('instructors-tbody');

    let html = '';

    

    if (Object.keys(instrs).length === 0) {

      tbody.innerHTML = '<tr class="empty-row"><td colspan="6" style="text-align:center;padding:40px;color:var(--muted);">No instructors found. Click "+ Add Instructor" to add manually, or upload your Excel data.</td></tr>';

      return;

    }

    for (const [key, instr] of Object.entries(instrs)) {

      html += `

        <tr style="border-bottom:1px solid var(--border);" class="instructor-row">

          <td style="padding:12px 16px;"><input type="text" class="form-input" style="width:100%;font-weight:600;" data-field="name" value="${instr.name}" placeholder="Name"></td>

          <td style="padding:12px 16px;"><input type="text" class="form-input" style="width:100%" data-field="email" value="${instr.email||''}" placeholder="Email"></td>

          <td style="padding:12px 16px;"><input type="text" class="form-input" style="width:100%" data-field="whatsapp" value="${instr.whatsapp||''}" placeholder="WhatsApp No"></td>

          <td style="padding:12px 16px;"><input type="text" class="form-input" style="width:100%" data-field="username" value="${instr.username||''}" placeholder="Username"></td>

          <td style="padding:12px 16px;"><input type="text" class="form-input" style="width:100%" data-field="password" value="${instr.password||''}" placeholder="Password"></td>

          <td style="padding:12px 16px;text-align:center;"><button class="icon-btn icon-btn-del" onclick="this.closest('tr').remove()" title="Remove">✕</button></td>

        </tr>

      `;

    }

    tbody.innerHTML = html;

  } catch(e) {

    console.error("Failed to load instructors", e);

  }

}

App.addInstructorRow = function() {

  const tbody = document.getElementById('instructors-tbody');

  if (tbody.querySelector('.empty-row')) tbody.innerHTML = '';

  

  const tr = document.createElement('tr');

  tr.className = 'instructor-row';

  tr.style.borderBottom = '1px solid var(--border)';

  tr.innerHTML = `

      <td style="padding:12px 16px;"><input type="text" class="form-input" style="width:100%;font-weight:600;" data-field="name" value="" placeholder="New Instructor"></td>

      <td style="padding:12px 16px;"><input type="text" class="form-input" style="width:100%" data-field="email" value="" placeholder="Email"></td>

      <td style="padding:12px 16px;"><input type="text" class="form-input" style="width:100%" data-field="whatsapp" value="" placeholder="WhatsApp No"></td>

      <td style="padding:12px 16px;"><input type="text" class="form-input" style="width:100%" data-field="username" value="" placeholder="Username"></td>

      <td style="padding:12px 16px;"><input type="text" class="form-input" style="width:100%" data-field="password" value="${Math.random().toString(36).slice(-8)}" placeholder="Password"></td>

      <td style="padding:12px 16px;text-align:center;"><button class="icon-btn icon-btn-del" onclick="this.closest('tr').remove()" title="Remove">✕</button></td>

  `;

  tbody.appendChild(tr);

};

App.saveInstructors = async function() {

  const rows = document.querySelectorAll('#instructors-tbody tr.instructor-row');

  const data = {};

  

  rows.forEach(row => {

    const nameInput = row.querySelector('[data-field="name"]');

    if (!nameInput) return;

    const name = nameInput.value.trim().toUpperCase();

    if (!name) return;

    

    data[name] = {

      name: name,

      email: row.querySelector('[data-field="email"]').value.trim(),

      whatsapp: row.querySelector('[data-field="whatsapp"]').value.trim(),

      username: row.querySelector('[data-field="username"]').value.trim(),

      password: row.querySelector('[data-field="password"]').value.trim()

    };

  });

  

  try {

    const postRes = await fetch(`${API}/api/instructors`, {

      method: 'POST',

      headers: { 'Content-Type': 'application/json' },

      body: JSON.stringify(data)

    });

    if (postRes.ok) {

      toast('Instructor Directory Saved Successfully!', 'success');

    } else {

      toast('Error saving directory.', 'error');

    }

  } catch(e) {

    toast('Server error.', 'error');

  }

};


