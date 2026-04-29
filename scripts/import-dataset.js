const XLSX = require('xlsx');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');

async function main() {
  console.log('🔄 Starting dataset import...\n');

  // 1. Read the Excel file
  const filePath = path.join(__dirname, '..', 'datasets', '7KPlus-Final-Datasets.xlsx');
  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(sheet);

  console.log(`📊 Found ${data.length} rows in Excel file.`);

  // 2. Connect to database
  const adapter = new PrismaBetterSqlite3({ url: 'file:./dev.db' });
  const prisma = new PrismaClient({ adapter });

  // 3. Clear existing dataset entries (fresh import)
  const existingCount = await prisma.datasetEntry.count();
  if (existingCount > 0) {
    console.log(`🗑️  Clearing ${existingCount} existing entries...`);
    await prisma.datasetEntry.deleteMany();
  }

  // 4. Import rows in batches
  const BATCH_SIZE = 500;
  let imported = 0;
  let skipped = 0;

  for (let i = 0; i < data.length; i += BATCH_SIZE) {
    const batch = data.slice(i, i + BATCH_SIZE);
    const records = [];

    for (const row of batch) {
      const english = (row['English'] || '').toString().trim();
      const tagalog = (row['Tagalog'] || '').toString().trim();
      const teduray = (row['Teduray'] || '').toString().trim();

      // Skip empty rows
      if (!english && !tagalog && !teduray) {
        skipped++;
        continue;
      }

      records.push({
        english,
        tagalog,
        teduray,
        englishNormalized: english.toLowerCase().replace(/[^\w\s]/g, '').trim(),
        tagalogNormalized: tagalog.toLowerCase().replace(/[^\w\s]/g, '').trim(),
        tedurayNormalized: teduray.toLowerCase().replace(/[^\w\s]/g, '').trim(),
      });
    }

    if (records.length > 0) {
      await prisma.datasetEntry.createMany({ data: records });
      imported += records.length;
    }

    const percent = Math.round(((i + batch.length) / data.length) * 100);
    process.stdout.write(`\r⏳ Progress: ${percent}% (${imported} imported, ${skipped} skipped)`);
  }

  console.log(`\n\n✅ Import complete!`);
  console.log(`   📥 Imported: ${imported} entries`);
  console.log(`   ⏭️  Skipped: ${skipped} empty rows`);

  // 5. Verify
  const totalCount = await prisma.datasetEntry.count();
  console.log(`   📦 Total entries in database: ${totalCount}`);

  // Show a sample
  const sample = await prisma.datasetEntry.findFirst();
  if (sample) {
    console.log(`\n📝 Sample entry:`);
    console.log(`   English: ${sample.english}`);
    console.log(`   Tagalog: ${sample.tagalog}`);
    console.log(`   Teduray: ${sample.teduray}`);
  }

  await prisma.$disconnect();
}

main().catch(e => {
  console.error('❌ Import failed:', e);
  process.exit(1);
});
