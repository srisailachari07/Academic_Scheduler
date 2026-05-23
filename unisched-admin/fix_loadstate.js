const fs=require('fs'); let c=fs.readFileSync('index.html','utf8'); c=c.replace(/INITIAL_DEFAULT_PERIODS/g, 'PERIODS'); fs.writeFileSync('index.html', c);
