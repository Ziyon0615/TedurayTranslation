const XLSX = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, '..', 'datasets', '7KPlus-Final-Datasets.xlsx');
const workbook = XLSX.readFile(filePath);

console.log('=== Sheet Names ===');
console.log(workbook.SheetNames);

workbook.SheetNames.forEach(sheetName => {
  const sheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(sheet);
  console.log(`\n=== Sheet: "${sheetName}" ===`);
  console.log(`Total rows: ${data.length}`);
  if (data.length > 0) {
    console.log('Column names:', Object.keys(data[0]));
    console.log('\nFirst 3 rows:');
    data.slice(0, 3).forEach((row, i) => console.log(`Row ${i + 1}:`, JSON.stringify(row)));
  }
});
