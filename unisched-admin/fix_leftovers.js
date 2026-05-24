const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const targetCount = `        DAYS.forEach(day => {

          (sem.sections || []).forEach(sec => {

            TEACHING_PERIODS.forEach(p => {

              if (sem.schedule?.[day]?.[sec]?.[p.id]?.code === s.code) placed++;

            });

          });

        });`;

const replaceCount = targetCount + `\n
        (sem.fixedPlacements || []).forEach(fp => {
          if (fp.code === s.code) {
            // Only count if not already counted via schedule
            if (!sem.schedule?.[fp.day]?.[fp.section]?.[fp.periodId]) {
              placed++;
            }
          }
        });`;

if (code.includes(targetCount)) {
  code = code.replace(targetCount, replaceCount);
}

// Add renderSubjectsView() after fixed slot addition
const targetAdd = `          renderFixedView();

          this.closeModal('fixed-modal');`;
const replaceAdd = targetAdd + `\n          renderSubjectsView();`;

if (code.includes(targetAdd)) {
  code = code.replace(targetAdd, replaceAdd);
}

// Add renderSubjectsView() after fixed slot removal
const targetRemove = `        sem.fixedPlacements.splice(i, 1);

        saveState();

        renderFixedView();`;
const replaceRemove = targetRemove + `\n        renderSubjectsView();`;

if (code.includes(targetRemove)) {
  code = code.replace(targetRemove, replaceRemove);
}

fs.writeFileSync('index.html', code);
console.log('Fixed leftover counts dynamically');
