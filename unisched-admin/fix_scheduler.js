const fs = require('fs');
let code = fs.readFileSync('scheduler.js', 'utf8');

const target = \  instrs.forEach(k => {
    const { lecs, labs } = instrRounds[k];
    const maxLen = Math.max(lecs.length, labs.length);
    for (let i = 0; i < maxLen; i++) {
      if (i < lecs.length) orderedRounds.push(lecs[i]);
      if (i < labs.length) orderedRounds.push(labs[i]);
    }
  });\;

const replacement = \  instrs.forEach(k => {
    const { lecs, labs } = instrRounds[k];
    
    // Group by subject code
    const codes = [...new Set([...lecs, ...labs].map(x => x.code))];
    
    codes.forEach(code => {
      const subjLecs = lecs.filter(x => x.code === code);
      const subjLabs = labs.filter(x => x.code === code);
      
      if (subjLecs.length > 0 && subjLecs.length === subjLabs.length) {
        // Equal number: push all lectures first, then all labs
        orderedRounds.push(...subjLecs);
        orderedRounds.push(...subjLabs);
      } else {
        // Interleave normally
        const maxLen = Math.max(subjLecs.length, subjLabs.length);
        for (let i = 0; i < maxLen; i++) {
          if (i < subjLecs.length) orderedRounds.push(subjLecs[i]);
          if (i < subjLabs.length) orderedRounds.push(subjLabs[i]);
        }
      }
    });
  });\;

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync('scheduler.js', code);
  console.log('Scheduler updated successfully.');
} else {
  console.log('Target block not found in scheduler.js');
}

