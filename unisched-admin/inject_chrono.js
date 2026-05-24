const fs = require('fs');
let code = fs.readFileSync('scheduler.js', 'utf8');

const validationFunc = `
function isValidChronologicalPlacement(schedule, section, code, type, newDay, newPid) {
  if (type === 'lecture') return true;

  let lecsCount = 0;
  let labsCount = 0;
  
  const allDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const targetDayIdx = allDays.indexOf(newDay);
  const targetPidIdx = PERIOD_IDS.indexOf(newPid);
  
  for (let i = 0; i < allDays.length; i++) {
    const d = allDays[i];
    for (let j = 0; j < PERIOD_IDS.length; j++) {
      const p = PERIOD_IDS[j];
      
      const isPastTarget = (i > targetDayIdx) || (i === targetDayIdx && j >= targetPidIdx);
      
      if (!isPastTarget) {
         const slot = schedule[d]?.[section]?.[p];
         if (slot && slot.code === code) {
             if (slot.type === 'lecture') lecsCount++;
             if (slot.type === 'lab' || slot.type === 'practice') labsCount++;
         }
      } else {
         break;
      }
    }
    if (i > targetDayIdx) break;
  }
  
  if (lecsCount < labsCount + 1) {
    return false;
  }
  return true;
}

`;

if (!code.includes('function isValidChronologicalPlacement')) {
  // Inject function
  const batchIdx = code.indexOf('function tryBatchOnDay');
  code = code.substring(0, batchIdx) + validationFunc + code.substring(batchIdx);
}

// Modify tryBatchOnDay
const tryBatchFind = `if (!canAssignWith(round.instructor, pids[i], round.type, tmpPeriods, tmpLec, tmpPrac, false)) { ok = false; break; }`;
const tryBatchReplace = tryBatchFind + `\n      if (!isValidChronologicalPlacement(schedule, sections[i], round.code, round.type, day, pids[i])) { ok = false; break; }`;
if (code.includes(tryBatchFind) && !code.includes('isValidChronologicalPlacement(schedule, sections[i]')) {
  code = code.replace(tryBatchFind, tryBatchReplace);
}

// Modify placeIndividually
const placeIndivFind = `if (!canAssignWith(round.instructor, pid, round.type, tmpPeriods, d.lecCount, d.pracCount, relax)) continue;`;
const placeIndivReplace = placeIndivFind + `\n      if (!relax && !isValidChronologicalPlacement(schedule, sections[sectionIdx], round.code, round.type, day, pid)) continue;`;
if (code.includes(placeIndivFind) && !code.includes('!isValidChronologicalPlacement(schedule, sections[sectionIdx]')) {
  code = code.replace(placeIndivFind, placeIndivReplace);
}

fs.writeFileSync('scheduler.js', code);
console.log('Injected chronological validation successfully.');
