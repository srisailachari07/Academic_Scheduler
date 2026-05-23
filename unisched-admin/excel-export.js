const ExcelJS = require('exceljs');

const pastelColors = [
  'FFD1DC', 'FFB6C1', 'FFC0CB', 'FF69B4', 'FFA07A', 'FFA500', 'FFD700', 'FFFFE0', 
  '98FB98', '90EE90', '00FA9A', '00FF7F', '20B2AA', '87CEEB', '87CEFA', 'B0E0E6', 
  'ADD8E6', 'E0FFFF', 'F0FFFF', 'E6E6FA', 'D8BFD8', 'DDA0DD', 'EE82EE', 'DA70D6'
];

async function generateExcelBuffer(sem) {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Timetable', {
    views: [{ showGridLines: false }]
  });

  const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const DAY_NAMES = { 'Mon':'Monday', 'Tue':'Tuesday', 'Wed':'Wednesday', 'Thu':'Thursday', 'Fri':'Friday' };
  const PERIODS = [
    { id: 'P1', label: sem.timings?.P1 ? `${sem.timings.P1.start} - ${sem.timings.P1.end}` : '9:00 - 9:50' },
    { id: 'P2', label: sem.timings?.P2 ? `${sem.timings.P2.start} - ${sem.timings.P2.end}` : '9:50 - 10:40' },
    { id: 'S1', label: sem.timings?.SB1 ? `${sem.timings.SB1.start} - ${sem.timings.SB1.end}` : '10:40 - 10:50', isBreak: true, name: sem.timings?.SB1?.name || 'Short Break' },
    { id: 'P3', label: sem.timings?.P3 ? `${sem.timings.P3.start} - ${sem.timings.P3.end}` : '10:50 - 11:40' },
    { id: 'P4', label: sem.timings?.P4 ? `${sem.timings.P4.start} - ${sem.timings.P4.end}` : '11:40 - 12:30' },
    { id: 'L1', label: sem.timings?.LB ? `${sem.timings.LB.start} - ${sem.timings.LB.end}` : '12:30 - 13:10', isBreak: true, name: sem.timings?.LB?.name || 'Lunch' },
    { id: 'P5', label: sem.timings?.P5 ? `${sem.timings.P5.start} - ${sem.timings.P5.end}` : '13:10 - 14:00' },
    { id: 'P6', label: sem.timings?.P6 ? `${sem.timings.P6.start} - ${sem.timings.P6.end}` : '14:00 - 14:50' },
    { id: 'S2', label: sem.timings?.SB2 ? `${sem.timings.SB2.start} - ${sem.timings.SB2.end}` : '14:50 - 15:00', isBreak: true, name: sem.timings?.SB2?.name || 'Short Break' },
    { id: 'P7', label: sem.timings?.P7 ? `${sem.timings.P7.start} - ${sem.timings.P7.end}` : '15:00 - 15:50' },
    { id: 'P8', label: sem.timings?.P8 ? `${sem.timings.P8.start} - ${sem.timings.P8.end}` : '15:50 - 16:40' }
  ];

  // Map subjects to colors
  const subjectColors = {};
  let colorIdx = 0;
  (sem.subjects || []).forEach(subj => {
    if (!subjectColors[subj.code]) {
      subjectColors[subj.code] = pastelColors[colorIdx % pastelColors.length];
      colorIdx++;
    }
  });

  const allSecs = sem.sections || [];
  
  // Set column widths
  ws.getColumn(1).width = 12; // Day / Section Name
  ws.getColumn(2).width = 10; // Course/Topic/Instructor
  for (let i = 3; i <= 3 + PERIODS.length; i++) {
    ws.getColumn(i).width = 18;
  }

  let currentRow = 1;

  for (const day of DAYS) {
    const dayStartRow = currentRow;
    
    // Day Header row
    ws.getCell(currentRow, 1).value = DAY_NAMES[day];
    ws.getCell(currentRow, 1).font = { bold: true };
    ws.getCell(currentRow, 1).alignment = { vertical: 'middle', horizontal: 'center' };
    
    // Period Headers
    let colIdx = 3;
    for (const p of PERIODS) {
      const cell = ws.getCell(currentRow, colIdx);
      cell.value = p.label;
      cell.font = { bold: true };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = { top: {style:'thin'}, bottom: {style:'thin'}, left: {style:'thin'}, right: {style:'thin'} };
      colIdx++;
    }
    currentRow++;

    // Track rows to merge for breaks
    const sectionStartRow = currentRow;

    for (const sec of allSecs) {
      const secStartRow = currentRow;
      ws.getCell(secStartRow, 1).value = sec;
      ws.getCell(secStartRow, 1).font = { bold: true };
      ws.getCell(secStartRow, 1).alignment = { vertical: 'middle', horizontal: 'center' };
      // Merge Section cell vertically
      ws.mergeCells(secStartRow, 1, secStartRow + 2, 1);
      ws.getCell(secStartRow, 1).border = { top: {style:'thin'}, bottom: {style:'thin'}, left: {style:'thin'}, right: {style:'thin'} };

      ws.getCell(secStartRow, 2).value = 'Course';
      ws.getCell(secStartRow + 1, 2).value = 'Topic';
      ws.getCell(secStartRow + 2, 2).value = 'Instructor';

      for (let i=0; i<3; i++) {
        const cell = ws.getCell(secStartRow + i, 2);
        cell.font = { bold: true };
        cell.border = { top: {style:'thin'}, bottom: {style:'thin'}, left: {style:'thin'}, right: {style:'thin'} };
      }

      let pColIdx = 3;
      for (const p of PERIODS) {
        if (p.isBreak) {
          // Handled later (merge vertically)
          pColIdx++;
          continue;
        }

        const sess = sem.schedule?.[day]?.[sec]?.[p.id];
        let cName = '', cTopic = '', cInstr = '';
        let bgColor = 'FFFFFF';

        if (sess) {
          const subjDef = (sem.subjects||[]).find(s => s.code === sess.code);
          cName = subjDef ? subjDef.name : sess.code;
          cTopic = sess.topic || '';
          cInstr = sess.instructor || '';
          bgColor = subjectColors[sess.code] || 'FFFFFF';
        }

        const cellC = ws.getCell(secStartRow, pColIdx);
        const cellT = ws.getCell(secStartRow + 1, pColIdx);
        const cellI = ws.getCell(secStartRow + 2, pColIdx);

        cellC.value = cName;
        cellT.value = cTopic;
        cellI.value = cInstr;

        [cellC, cellT, cellI].forEach(c => {
          c.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
          c.border = { top: {style:'thin'}, bottom: {style:'thin'}, left: {style:'thin'}, right: {style:'thin'} };
          if (sess) {
            c.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: bgColor }
            };
            if (c === cellC) c.font = { bold: true };
            if (c === cellI) c.font = { bold: true };
          }
        });

        pColIdx++;
      }
      currentRow += 3;
    }

    // Merge breaks
    let bColIdx = 3;
    for (const p of PERIODS) {
      if (p.isBreak) {
        if (allSecs.length > 0) {
          ws.mergeCells(sectionStartRow, bColIdx, currentRow - 1, bColIdx);
          const bCell = ws.getCell(sectionStartRow, bColIdx);
          bCell.value = p.name;
          bCell.alignment = { vertical: 'middle', horizontal: 'center', textRotation: 0 };
          bCell.font = { bold: true };
          bCell.border = { top: {style:'thin'}, bottom: {style:'thin'}, left: {style:'thin'}, right: {style:'thin'} };
        }
      }
      bColIdx++;
    }

    // Empty row before next day
    currentRow++;
  }

  const buffer = await wb.xlsx.writeBuffer();
  return buffer;
}

module.exports = { generateExcelBuffer };
