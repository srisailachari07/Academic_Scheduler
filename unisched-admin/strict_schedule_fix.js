const fs = require('fs');
let code = fs.readFileSync('scheduler.js', 'utf8');

const targetRegex = /  const orderedRounds = \[\];[\s\S]*?\/\/ Inject some randomness for the Hill Climbing search\n  for \(let i = orderedRounds\.length - 1; i > 0; i--\) {\n    if \(Math\.random\(\) < 0\.1\) {\n      const j = Math\.floor\(Math\.random\(\) \* \(i \+ 1\)\);\n      \[orderedRounds\[i\], orderedRounds\[j\]\] = \[orderedRounds\[j\], orderedRounds\[i\]\];\n    }\n  }/;

const replacement = `  const allLecs = [];
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

  const orderedRounds = [...allLecs, ...allLabs];`;

if (targetRegex.test(code)) {
  code = code.replace(targetRegex, replacement);
  fs.writeFileSync('scheduler.js', code);
  console.log('Scheduler logic updated successfully to strictly prioritize all lectures before any labs.');
} else {
  console.log('Could not find the target code to replace.');
}
