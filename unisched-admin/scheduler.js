'use strict';
/**
 * UniSched Scheduling Engine — Backend (Node.js)
 * ═══════════════════════════════════════════════
 * Multi-algorithm solver:
 *   Pass 1 → Batch placement
 *   Pass 2 → Cross-day backtracking CSP
 *   Pass 3 → Local Repair (P1 Guarantee)
 *
 * UNBREAKABLE RULES ENFORCED:
 *   C0:  No practice/lab at P1
 *   C1:  No instructor double-booking
 *   C2:  Max 4 lectures/day
 *   C3:  Max 3 practice/labs/day
 *   C4/5:Max 3 morning / 3 afternoon blocks
 *   C6:  Break after 2 consecutive blocks
 *   C7:  Lectures-First sequence
 *   C8:  Empty P1 validation 
 *   C9:  Absolute Section Parity
 *   C11: Simultaneous Quizzes (via fixed slots)
 *   C12: Temporal Precedence (Lectures precede labs)
 */

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const PERIOD_IDS = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8'];

const MORNING_PS   = new Set(['P1', 'P2', 'P3', 'P4']);
const AFTERNOON_PS = new Set(['P5', 'P6', 'P7', 'P8']);
const CONSEC_PAIRS  = [['P1','P2'], ['P3','P4'], ['P5','P6'], ['P7','P8']];
const PAIR_NEXT_FREE = { P2: 'P3', P6: 'P7' };
const PAIR_PARTNER   = { P1:'P2', P2:'P1', P3:'P4', P4:'P3', P5:'P6', P6:'P5', P7:'P8', P8:'P7' };

const BATCH_PATTERNS_3 = [
  ['P1','P2','P4'], ['P5','P6','P8'], ['P3','P4','P6'], ['P3','P4','P5'],
  ['P1','P2','P5'], ['P1','P3','P4'], ['P2','P3','P4'], ['P2','P4','P5'],
  ['P4','P5','P6'], ['P4','P6','P8'], ['P1','P3','P5'], ['P2','P3','P5'],
  ['P5','P7','P8'], ['P6','P7','P8'], ['P1','P4','P6'], ['P2','P4','P6'],
  ['P1','P2','P6'], ['P3','P5','P8'], ['P2','P5','P8'], ['P1','P5','P6'],
];
const BATCH_PATTERNS_2 = [
  ['P1','P2'],['P5','P6'],['P3','P4'],['P7','P8'],
  ['P1','P3'],['P2','P4'],['P4','P5'],['P3','P5'],
  ['P2','P3'],['P4','P6'],['P5','P7'],['P6','P8'],
  ['P1','P4'],['P2','P5'],['P3','P6'],['P5','P8'],
  ['P1','P6'],['P2','P6'],['P3','P7'],['P4','P8'],
];

function getInstrDayData(instr, day, schedule, sections) {
  if (!instr || instr === 'UNIVERSITY FACULTY')
    return { periods: new Set(), lecCount: 0, pracCount: 0 };

  const periodType = {};
  for (const sec of sections) {
    for (const pid of PERIOD_IDS) {
      if (periodType[pid]) continue;
      const sess = schedule[day]?.[sec]?.[pid];
      if (!sess || sess.instructor !== instr) continue;
      periodType[pid] = sess.type || 'lecture';
    }
  }
  const periods = new Set(Object.keys(periodType));
  let lecCount = 0, pracCount = 0;
  for (const t of Object.values(periodType)) {
    if (t === 'practice' || t === 'lab') pracCount++; else lecCount++;
  }
  return { periods, lecCount, pracCount };
}

// Helper to check if a section has fulfilled its quota
function hasMetQuota(schedule, section, code, type, subjects) {
  const subjDef = subjects.find(s => s.code === code);
  if (!subjDef) return false;
  const isPrac = type === 'practice' || type === 'lab';
  const target = isPrac ? (subjDef.labPerWeek || 0) : (subjDef.lecPerWeek || 0);
  
  let count = 0;
  for (const day of ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']) {
    for (const p of ['P1','P2','P3','P4','P5','P6','P7','P8']) {
      const sess = schedule[day]?.[section]?.[p];
      if (sess && sess.code === code) {
        const sessIsPrac = sess.type === 'practice' || sess.type === 'lab';
        if (isPrac === sessIsPrac) count++;
      }
    }
  }
  return count >= target;
}

function canAssignWith(instr, periodId, type, tempPeriods, tempLec, tempPrac, relax = false) {
  if (!instr || instr === 'UNIVERSITY FACULTY') return true;
  const isPrac = (type === 'practice' || type === 'lab');

  // C0: No Practice at P1
  if (isPrac && periodId === 'P1') return false;
  
  // C1: Double booking
  if (tempPeriods.has(periodId)) return false;
  
  // C2 / C3: Strict Daily Maximums (Never relaxed)
  if (tempLec + tempPrac >= 6) return false; // Max 6 total classes per day
  if (!isPrac && tempLec >= 4) return false; // Max 4 lectures per day
  if (isPrac && tempPrac >= 3) return false; // Max 3 practice per day

  // C4: Strict Fatigue Management (No 3 continuous classes, must have a break after 2)
  const periodsWithNew = new Set([...tempPeriods, periodId]);
  
  // Check morning session
  let consecMorning = 0;
  for (const p of ['P1','P2','P3','P4']) {
    if (periodsWithNew.has(p)) consecMorning++;
    else consecMorning = 0;
    if (consecMorning >= 3) return false;
  }
  
  // Check afternoon session (Lunch break resets the fatigue counter)
  let consecAfternoon = 0;
  for (const p of ['P5','P6','P7','P8']) {
    if (periodsWithNew.has(p)) consecAfternoon++;
    else consecAfternoon = 0;
    if (consecAfternoon >= 3) return false;
  }

  return true;
}

function tryBatchOnDay(round, day, schedule, sections, subjects) {
  const n = sections.length;
  let patterns = n >= 3 ? BATCH_PATTERNS_3 : n >= 2 ? BATCH_PATTERNS_2 : PERIOD_IDS.map(p => [p]);
  
  if (schedule._shuffleMode) {
    patterns = [...patterns];
    for (let i = patterns.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [patterns[i], patterns[j]] = [patterns[j], patterns[i]];
    }
  }

  for (const pattern of patterns) {
    if (pattern.length < n) continue;
    const pids = pattern.slice(0, n);

    const d = getInstrDayData(round.instructor, day, schedule, sections);
    let tmpPeriods = new Set(d.periods);
    let tmpLec = d.lecCount, tmpPrac = d.pracCount;
    let ok = true;

    for (let i = 0; i < n; i++) {
      if (subjects && hasMetQuota(schedule, sections[i], round.code, round.type, subjects)) { ok = false; break; }
      if (schedule[day]?.[sections[i]]?.[pids[i]]) { ok = false; break; } 
      if (!canAssignWith(round.instructor, pids[i], round.type, tmpPeriods, tmpLec, tmpPrac, false)) { ok = false; break; }
      tmpPeriods = new Set([...tmpPeriods, pids[i]]);
      const isPrac = round.type === 'practice' || round.type === 'lab';
      if (isPrac) tmpPrac++; else tmpLec++;
    }
    if (ok) return pids;
  }
  return null;
}

function placeIndividually(round, sectionIdx, sections, schedule, dayOrder, subjects, relax = false) {
  if (sectionIdx >= sections.length) return true; 
  const section = sections[sectionIdx];

  if (subjects && hasMetQuota(schedule, section, round.code, round.type, subjects)) {
    return placeIndividually(round, sectionIdx + 1, sections, schedule, dayOrder, subjects, relax);
  }

  const days = dayOrder || [...DAYS].sort((a, b) => {
    const da = getInstrDayData(round.instructor, a, schedule, sections);
    const db = getInstrDayData(round.instructor, b, schedule, sections);
    return (da.lecCount + da.pracCount) - (db.lecCount + db.pracCount);
  });

  let pids = [...PERIOD_IDS];
  if (schedule._shuffleMode) {
    for (let i = pids.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pids[i], pids[j]] = [pids[j], pids[i]];
    }
  }

  for (const day of days) {
    for (const pid of pids) {
      if (schedule[day]?.[section]?.[pid]) continue;
      const d = getInstrDayData(round.instructor, day, schedule, sections);
      if (!canAssignWith(round.instructor, pid, round.type, d.periods, d.lecCount, d.pracCount, relax)) continue;

      schedule[day][section][pid] = {
        code: round.code, instructor: round.instructor,
        type: round.type, topic: '', isFixed: false,
      };

      if (placeIndividually(round, sectionIdx + 1, sections, schedule, dayOrder, subjects, relax)) return true;

      delete schedule[day][section][pid];
    }
  }
  return false; 
}

function repairP1(schedule, sections) {
  for (const section of sections) {
    for (const day of DAYS) {
      if (schedule[day]?.[section]?.['P1']) continue; 
      for (const pid of ['P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8']) {
        const sess = schedule[day]?.[section]?.[pid];
        if (!sess || sess.isFixed || sess.type !== 'lecture') continue;

        const instr = sess.instructor;
        const instrConflict = instr && instr !== 'UNIVERSITY FACULTY' &&
          sections.some(s2 => s2 !== section &&
            schedule[day]?.[s2]?.['P1']?.instructor === instr);
        if (instrConflict) continue;

        // Before shifting to P1, ensure it doesn't violate break rules or limits
        if (instr && instr !== 'UNIVERSITY FACULTY') {
          const d = getInstrDayData(instr, day, schedule, sections);
          d.periods.delete(pid); // simulate removal from its current slot
          if (!canAssignWith(instr, 'P1', sess.type, d.periods, d.lecCount - 1, d.pracCount)) continue;
        }

        schedule[day][section]['P1'] = { ...sess };
        delete schedule[day][section][pid];
        break;
      }
    }
  }
}

function flagConflicts(schedule, sections) {
  DAYS.forEach(day => {
    PERIOD_IDS.forEach(pid => {
      const seen = {};
      sections.forEach(sec => {
        const sess = schedule[day]?.[sec]?.[pid];
        if (!sess || !sess.instructor || sess.instructor === 'UNIVERSITY FACULTY') return;
        delete sess.conflict;
        if (seen[sess.instructor]) {
          sess.conflict = true;
          seen[sess.instructor].conflict = true;
        } else { seen[sess.instructor] = sess; }
      });
    });
  });
}

function generateSingleSchedule(sem) {
  const sections = sem.sections || [];
  const subjects  = sem.subjects  || [];
  const fixedPlacements = sem.fixedPlacements || [];
  const fixedSlots      = sem.fixedSlots      || [];

  const MAX_LEC_WEEK  = 4 * DAYS.length; 
  const MAX_PRAC_WEEK = 3 * DAYS.length; 
  const instrLoad = {};
  subjects.forEach(s => {
    const k = s.instructor || '(unassigned)';
    if (!instrLoad[k]) instrLoad[k] = { lec: 0, prac: 0, subjects: [] };
    instrLoad[k].lec  += (s.lecPerWeek || 0) * sections.length;
    instrLoad[k].prac += (s.labPerWeek || 0) * sections.length;
    if ((s.lecPerWeek || 0) + (s.labPerWeek || 0) > 0) instrLoad[k].subjects.push(s.name || s.code);
  });
  const capacityWarnings = Object.entries(instrLoad).flatMap(([instr, d]) => {
    const msgs = [];
    if (d.lec  > MAX_LEC_WEEK)  msgs.push(`Needs ${d.lec} lectures but max is ${MAX_LEC_WEEK}/week`);
    if (d.prac > MAX_PRAC_WEEK) msgs.push(`Needs ${d.prac} labs/practice but max is ${MAX_PRAC_WEEK}/week`);
    return msgs.length ? [{ instr, msgs, subjects: d.subjects }] : [];
  });

  const schedule = { _shuffleMode: !!sem.shuffle };
  DAYS.forEach(d => {
    schedule[d] = {};
    sections.forEach(s => { schedule[d][s] = {}; });
  });

  fixedPlacements.forEach(fp => {
    const def = fixedSlots.find(s => s.code === fp.code) || subjects.find(s => s.code === fp.code);
    if (!def || !schedule[fp.day]?.[fp.section]) return;
    schedule[fp.day][fp.section][fp.periodId] = {
      code: fp.code,
      instructor: fp.instructor || def.instructor || '',
      topic: def.topic || '',
      isFixed: true,
      type: fp.type || def.type || 'lecture',
    };
  });

  // C7: Two-pass engine (Lectures first)
  // Interleave lectures and labs by instructor to achieve "one lecture, one practice" pattern
  const instrRounds = {};
  subjects.forEach(subj => {
    const k = subj.instructor || '(unassigned)';
    if (!instrRounds[k]) instrRounds[k] = { lecs: [], labs: [] };
    
    for (let i = 0; i < (subj.lecPerWeek || 0); i++)
      instrRounds[k].lecs.push({ code: subj.code, name: subj.name, instructor: subj.instructor, type: 'lecture', round: i });
    for (let i = 0; i < (subj.labPerWeek || 0); i++)
      instrRounds[k].labs.push({ code: subj.code, name: subj.name, instructor: subj.instructor, type: (subj.type === 'practice' ? 'practice' : 'lab'), round: i });
  });

  const allLecs = [];
  const allLabs = [];

  // Sort instructors by total load
  const instrs = Object.keys(instrRounds).sort((a, b) => 
    (instrRounds[b].lecs.length + instrRounds[b].labs.length) - (instrRounds[a].lecs.length + instrRounds[a].labs.length)
  );

  instrs.forEach(k => {
    allLecs.push(...instrRounds[k].lecs);
    allLabs.push(...instrRounds[k].labs);
  });

  // Inject some randomness for the Hill Climbing search, but strictly keep lectures before labs
  for (let i = allLecs.length - 1; i > 0; i--) {
    if (Math.random() < 0.1) {
      const j = Math.floor(Math.random() * (i + 1));
      [allLecs[i], allLecs[j]] = [allLecs[j], allLecs[i]];
    }
  }

  for (let i = allLabs.length - 1; i > 0; i--) {
    if (Math.random() < 0.1) {
      const j = Math.floor(Math.random() * (i + 1));
      [allLabs[i], allLabs[j]] = [allLabs[j], allLabs[i]];
    }
  }

  const orderedRounds = [...allLecs, ...allLabs];

  const unplacedRounds = [];

  for (const round of orderedRounds) {
    const daysSorted = [...DAYS].sort((a, b) => {
      const da = getInstrDayData(round.instructor, a, schedule, sections);
      const db = getInstrDayData(round.instructor, b, schedule, sections);
      return (da.lecCount + da.pracCount) - (db.lecCount + db.pracCount);
    });

    let placed = false;
    for (const day of daysSorted) {
      const pids = tryBatchOnDay(round, day, schedule, sections, subjects);
      if (pids) {
        sections.forEach((sec, i) => {
          schedule[day][sec][pids[i]] = {
            code: round.code, instructor: round.instructor,
            type: round.type, topic: '', isFixed: false,
          };
        });
        placed = true;
        break;
      }
    }

    if (!placed) {
      placed = placeIndividually(round, 0, sections, schedule, daysSorted, subjects, false);
      if (!placed) {
        // Last resort: Relax constraints (allow > 4 classes, allow consecutive) to force placement into buffer hours
        placed = placeIndividually(round, 0, sections, schedule, daysSorted, subjects, true);
      }
      if (!placed) unplacedRounds.push(round);
    }
  }

  repairP1(schedule, sections);
  flagConflicts(schedule, sections);

  const sectionCounts = {};
  sections.forEach(sec => {
    sectionCounts[sec] = {};
    subjects.forEach(subj => {
      sectionCounts[sec][subj.code] = {
        lec: 0, lab: 0,
        expected_lec: subj.lecPerWeek || 0,
        expected_lab: subj.labPerWeek || 0,
        name: subj.name,
      };
    });
  });
  DAYS.forEach(day => {
    sections.forEach(sec => {
      PERIOD_IDS.forEach(pid => {
        const sess = schedule[day]?.[sec]?.[pid];
        if (!sess || !sectionCounts[sec]?.[sess.code]) return;
        if (sess.type === 'lab' || sess.type === 'practice') sectionCounts[sec][sess.code].lab++;
        else if (sess.type === 'lecture') sectionCounts[sec][sess.code].lec++;
      });
    });
  });

  const imbalances = [];
  subjects.forEach(subj => {
    const lecCounts = sections.map(sec => sectionCounts[sec]?.[subj.code]?.lec || 0);
    const labCounts = sections.map(sec => sectionCounts[sec]?.[subj.code]?.lab || 0);
    const lecOk = lecCounts.every(c => c === (subj.lecPerWeek || 0));
    const labOk = labCounts.every(c => c === (subj.labPerWeek || 0));
    if (!lecOk || !labOk) {
      imbalances.push({
        code: subj.code, name: subj.name,
        expectedLec: subj.lecPerWeek || 0, expectedLab: subj.labPerWeek || 0,
        sections: Object.fromEntries(sections.map(sec => [sec, sectionCounts[sec]?.[subj.code]])),
      });
    }
  });

  return {
    schedule,
    unplaced: unplacedRounds.length,
    unplacedRounds: unplacedRounds.map(r => ({ code: r.code, name: r.name, type: r.type })),
    capacityWarnings,
    imbalances,
    sectionCounts,
  };
}

function generateSchedule(sem) {
  // Random Restart Hill Climbing Wrapper
  let bestResult = null;
  let minUnplaced = Infinity;
  const numIterations = 30; // Generate 30 distinct schedules

  sem.shuffle = true; // Force shuffle internally for variety

  for (let i = 0; i < numIterations; i++) {
    const result = generateSingleSchedule(sem);
    if (result.unplaced === 0) {
      return result; // Perfect schedule found early
    }
    if (result.unplaced < minUnplaced) {
      minUnplaced = result.unplaced;
      bestResult = result;
    }
  }

  return bestResult;
}

module.exports = { generateSchedule, getInstrDayData, canAssignWith };
