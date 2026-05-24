const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const injection = `const FIXED_SLOT_DEFS = [
  {code:'YOGA201',  name:'Application of yoga in mind body management YOGA201', instructor:'UNIVERSITY FACULTY', color:'#f8a5c2', textColor:'#1a1a1a', isFixed:true},
  {code:'COIN201',  name:'COIN201', instructor:'UNIVERSITY FACULTY', color:'#748ffc', textColor:'#ffffff', isFixed:true},
  {code:'MODQUIZ',  name:'Module Quiz', instructor:'', color:'#74c0fc', textColor:'#1a1a1a', isFixed:true},
  {code:'SPORTS',   name:'Sports', instructor:'', color:'#69db7c', textColor:'#1a1a1a', isFixed:true},
  {code:'LIBRARY',  name:'Library', instructor:'', color:'#ff922b', textColor:'#ffffff', isFixed:true},
  {code:'MENTOR',   name:'Mentoring', topic:'SC 1:1\\nUniversity allotted slot for interactions', instructor:'', color:'#ffd43b', textColor:'#1a1a1a', isFixed:true},
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
  return [
    { section:s[0]||'Section-1', day:'Mon', periodId:'P7', code:'YOGA201' },
    { section:s[0]||'Section-1', day:'Mon', periodId:'P8', code:'YOGA201' },
    { section:s[1]||'Section-2', day:'Mon', periodId:'P7', code:'YOGA201' },
    { section:s[1]||'Section-2', day:'Mon', periodId:'P8', code:'YOGA201' },
    { section:s[2]||'Section-3', day:'Tue', periodId:'P7', code:'YOGA201' },
    { section:s[2]||'Section-3', day:'Tue', periodId:'P8', code:'YOGA201' },

    { section:s[0]||'Section-1', day:'Tue', periodId:'P7', code:'COIN201' },
    { section:s[0]||'Section-1', day:'Tue', periodId:'P8', code:'COIN201' },
    { section:s[1]||'Section-2', day:'Wed', periodId:'P7', code:'COIN201' },
    { section:s[1]||'Section-2', day:'Wed', periodId:'P8', code:'COIN201' },
    { section:s[2]||'Section-3', day:'Thu', periodId:'P7', code:'COIN201' },
    { section:s[2]||'Section-3', day:'Thu', periodId:'P8', code:'COIN201' },

    { section:s[0]||'Section-1', day:'Fri', periodId:'P4', code:'MODQUIZ' },
    { section:s[1]||'Section-2', day:'Fri', periodId:'P4', code:'MODQUIZ' },
    { section:s[2]||'Section-3', day:'Fri', periodId:'P4', code:'MODQUIZ' },

    { section:s[0]||'Section-1', day:'Wed', periodId:'P7', code:'SPORTS' },
    { section:s[0]||'Section-1', day:'Wed', periodId:'P8', code:'SPORTS' },
    { section:s[1]||'Section-2', day:'Thu', periodId:'P7', code:'SPORTS' },
    { section:s[1]||'Section-2', day:'Thu', periodId:'P8', code:'SPORTS' },
    { section:s[2]||'Section-3', day:'Fri', periodId:'P7', code:'SPORTS' },
    { section:s[2]||'Section-3', day:'Fri', periodId:'P8', code:'SPORTS' },

    { section:s[0]||'Section-1', day:'Thu', periodId:'P7', code:'LIBRARY' },
    { section:s[0]||'Section-1', day:'Thu', periodId:'P8', code:'LIBRARY' },
    { section:s[1]||'Section-2', day:'Tue', periodId:'P7', code:'LIBRARY' },
    { section:s[1]||'Section-2', day:'Tue', periodId:'P8', code:'LIBRARY' },
    { section:s[2]||'Section-3', day:'Wed', periodId:'P7', code:'LIBRARY' },
    { section:s[2]||'Section-3', day:'Wed', periodId:'P8', code:'LIBRARY' },

    { section:s[0]||'Section-1', day:'Fri', periodId:'P7', code:'MENTOR' },
    { section:s[0]||'Section-1', day:'Fri', periodId:'P8', code:'MENTOR' },
    { section:s[1]||'Section-2', day:'Fri', periodId:'P7', code:'MENTOR' },
    { section:s[1]||'Section-2', day:'Fri', periodId:'P8', code:'MENTOR' },
    { section:s[2]||'Section-3', day:'Mon', periodId:'P7', code:'MENTOR' },
    { section:s[2]||'Section-3', day:'Mon', periodId:'P8', code:'MENTOR' }
  ];
}`;

if(!code.includes('const FIXED_SLOT_DEFS')) {
  code = code.replace('const STATE = {', injection + '\n\nconst STATE = {');
  fs.writeFileSync('index.html', code);
  console.log('Defaults injected successfully.');
} else {
  console.log('Defaults already exist.');
}
