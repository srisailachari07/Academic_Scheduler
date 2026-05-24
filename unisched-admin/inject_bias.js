const fs = require('fs');
let code = fs.readFileSync('scheduler.js', 'utf8');

const daysSortedFind = `    const daysSorted = [...DAYS].sort((a, b) => {
      const da = getInstrDayData(round.instructor, a, schedule, sections);
      const db = getInstrDayData(round.instructor, b, schedule, sections);
      return (da.lecCount + da.pracCount) - (db.lecCount + db.pracCount);
    });`;

const daysSortedReplace = `    const daysSorted = [...DAYS].sort((a, b) => {
      const da = getInstrDayData(round.instructor, a, schedule, sections);
      const db = getInstrDayData(round.instructor, b, schedule, sections);
      const loadDiff = (da.lecCount + da.pracCount) - (db.lecCount + db.pracCount);
      if (loadDiff !== 0) return loadDiff;
      
      // If loads are equal, heavily bias Lectures to earlier days, and Labs to later days
      if (round.type === 'lecture') {
        return DAYS.indexOf(a) - DAYS.indexOf(b);
      } else {
        return DAYS.indexOf(b) - DAYS.indexOf(a);
      }
    });`;

if (code.includes(daysSortedFind)) {
  code = code.replace(daysSortedFind, daysSortedReplace);
  fs.writeFileSync('scheduler.js', code);
  console.log('Injected day selection bias successfully.');
} else {
  console.log('Could not find daysSorted to replace.');
}
