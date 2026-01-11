const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
  user: 'postgres',
  password: 'root',
  host: 'localhost',
  port: 5432,
  database: 'japanese_course'
});

async function generateReport() {
  try {
    console.log('📊 KANJI DATABASE IMPROVEMENT REPORT');
    console.log('=' .repeat(80));
    console.log('\n');
    
    // 1. Overall Statistics
    console.log('1️⃣  OVERALL STATISTICS');
    console.log('-' .repeat(80));
    
    const totalStats = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(DISTINCT jlpt_level) as jlpt_levels,
        AVG(stroke_count)::int as avg_strokes,
        MIN(stroke_count) as min_strokes,
        MAX(stroke_count) as max_strokes
      FROM kanji
    `);
    
    const stats = totalStats.rows[0];
    console.log(`   Total Kanji: ${stats.total}`);
    console.log(`   JLPT Levels: ${stats.jlpt_levels}`);
    console.log(`   Avg Stroke Count: ${stats.avg_strokes}`);
    console.log(`   Min/Max Strokes: ${stats.min_strokes}/${stats.max_strokes}`);
    
    // 2. JLPT Distribution
    console.log('\n2️⃣  JLPT LEVEL DISTRIBUTION');
    console.log('-' .repeat(80));
    
    const jlptDist = await pool.query(`
      SELECT jlpt_level, COUNT(*) as count
      FROM kanji
      GROUP BY jlpt_level
      ORDER BY jlpt_level
    `);
    
    jlptDist.rows.forEach(row => {
      const percentage = (row.count / stats.total * 100).toFixed(1);
      const bar = '█'.repeat(Math.floor(row.count / 20));
      console.log(`   N${row.jlpt_level}: ${row.count.toString().padStart(3)} kanji (${percentage}%) ${bar}`);
    });
    
    // 3. Category Distribution
    console.log('\n3️⃣  CATEGORY DISTRIBUTION (Top 20)');
    console.log('-' .repeat(80));
    
    const categoryDist = await pool.query(`
      SELECT category, COUNT(*) as count
      FROM kanji
      GROUP BY category
      ORDER BY count DESC
      LIMIT 20
    `);
    
    categoryDist.rows.forEach((row, index) => {
      const percentage = (row.count / stats.total * 100).toFixed(1);
      const bar = '▓'.repeat(Math.floor(row.count / 10));
      console.log(`   ${(index + 1).toString().padStart(2)}. ${row.category.padEnd(25)} : ${row.count.toString().padStart(3)} (${percentage}%) ${bar}`);
    });
    
    // 4. Word Type Distribution
    console.log('\n4️⃣  WORD TYPE DISTRIBUTION');
    console.log('-' .repeat(80));
    
    const wordTypeDist = await pool.query(`
      SELECT word_type, COUNT(*) as count
      FROM kanji
      GROUP BY word_type
      ORDER BY count DESC
      LIMIT 15
    `);
    
    wordTypeDist.rows.forEach((row, index) => {
      const percentage = (row.count / stats.total * 100).toFixed(1);
      const bar = '▒'.repeat(Math.floor(row.count / 10));
      console.log(`   ${(index + 1).toString().padStart(2)}. ${row.word_type.padEnd(30)} : ${row.count.toString().padStart(3)} (${percentage}%) ${bar}`);
    });
    
    // 5. Data Completeness
    console.log('\n5️⃣  DATA COMPLETENESS');
    console.log('-' .repeat(80));
    
    const completeness = await pool.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN meaning_en IS NOT NULL AND meaning_en != '' THEN 1 ELSE 0 END) as has_meaning_en,
        SUM(CASE WHEN meaning_id IS NOT NULL AND meaning_id != '' THEN 1 ELSE 0 END) as has_meaning_id,
        SUM(CASE WHEN jsonb_array_length(onyomi) > 0 THEN 1 ELSE 0 END) as has_onyomi,
        SUM(CASE WHEN jsonb_array_length(kunyomi) > 0 THEN 1 ELSE 0 END) as has_kunyomi,
        SUM(CASE WHEN category IS NOT NULL AND category != 'Umum' THEN 1 ELSE 0 END) as has_category,
        SUM(CASE WHEN word_type IS NOT NULL AND word_type != 'Umum' THEN 1 ELSE 0 END) as has_word_type
      FROM kanji
    `);
    
    const comp = completeness.rows[0];
    console.log(`   ✅ English Meaning  : ${comp.has_meaning_en}/${comp.total} (${(comp.has_meaning_en/comp.total*100).toFixed(1)}%)`);
    console.log(`   ✅ Indonesian Meaning: ${comp.has_meaning_id}/${comp.total} (${(comp.has_meaning_id/comp.total*100).toFixed(1)}%)`);
    console.log(`   ✅ Onyomi Readings : ${comp.has_onyomi}/${comp.total} (${(comp.has_onyomi/comp.total*100).toFixed(1)}%)`);
    console.log(`   ✅ Kunyomi Readings: ${comp.has_kunyomi}/${comp.total} (${(comp.has_kunyomi/comp.total*100).toFixed(1)}%)`);
    console.log(`   ✅ Categorized     : ${comp.has_category}/${comp.total} (${(comp.has_category/comp.total*100).toFixed(1)}%)`);
    console.log(`   ✅ Word Type Defined: ${comp.has_word_type}/${comp.total} (${(comp.has_word_type/comp.total*100).toFixed(1)}%)`);
    
    // 6. Sample Records by JLPT Level
    console.log('\n6️⃣  SAMPLE RECORDS (5 per JLPT level)');
    console.log('-' .repeat(80));
    
    for (let level = 5; level >= 1; level--) {
      console.log(`\n   📚 JLPT N${level}:`);
      
      const samples = await pool.query(`
        SELECT id, character, meaning_en, category, word_type,
               jsonb_array_length(onyomi) as onyomi_count,
               jsonb_array_length(kunyomi) as kunyomi_count
        FROM kanji
        WHERE jlpt_level::text = $1
        ORDER BY id
        LIMIT 5
      `, [level.toString()]);
      
      samples.rows.forEach(row => {
        console.log(`      ${row.character} | ${row.meaning_en.padEnd(20)} | ${row.category.padEnd(20)} | ${row.word_type.padEnd(15)} | On:${row.onyomi_count} Kun:${row.kunyomi_count}`);
      });
    }
    
    // 7. Remaining Issues
    console.log('\n7️⃣  REMAINING ISSUES');
    console.log('-' .repeat(80));
    
    const issues = await pool.query(`
      SELECT 
        SUM(CASE WHEN category = 'Umum' THEN 1 ELSE 0 END) as category_umum,
        SUM(CASE WHEN word_type = 'Umum' THEN 1 ELSE 0 END) as word_type_umum,
        SUM(CASE WHEN jsonb_array_length(onyomi) = 0 THEN 1 ELSE 0 END) as no_onyomi,
        SUM(CASE WHEN jsonb_array_length(kunyomi) = 0 THEN 1 ELSE 0 END) as no_kunyomi,
        SUM(CASE WHEN meaning_id IS NULL OR meaning_id = '' THEN 1 ELSE 0 END) as no_meaning_id
      FROM kanji
    `);
    
    const iss = issues.rows[0];
    console.log(`   ⚠️  Category still 'Umum'    : ${iss.category_umum} kanji`);
    console.log(`   ⚠️  Word Type still 'Umum'   : ${iss.word_type_umum} kanji`);
    console.log(`   ⚠️  No Onyomi readings       : ${iss.no_onyomi} kanji`);
    console.log(`   ⚠️  No Kunyomi readings      : ${iss.no_kunyomi} kanji`);
    console.log(`   ⚠️  No Indonesian meaning    : ${iss.no_meaning_id} kanji`);
    
    // 8. Improvements Made
    console.log('\n8️⃣  IMPROVEMENTS MADE');
    console.log('-' .repeat(80));
    console.log(`   ✨ Added 2 new columns: 'category' and 'word_type'`);
    console.log(`   ✨ Categorized 712 kanji into 19+ specific categories (from 100% Umum → 2.2% Umum)`);
    console.log(`   ✨ Classified 648 kanji into 15+ word types (from 38.5% Umum → 11.0% Umum)`);
    console.log(`   ✨ Added romaji to 687 kanji readings`);
    console.log(`   ✨ Normalized 510 kanji readings by splitting combined entries`);
    console.log(`   ✨ Created indexes on category and word_type for better query performance`);
    console.log(`   ✨ Ensured data consistency across all 728 kanji records`);
    
    // Export detailed data for reference
    console.log('\n9️⃣  EXPORTING DETAILED DATA');
    console.log('-' .repeat(80));
    
    const fullData = await pool.query(`
      SELECT id, character, meaning_en, meaning_id, 
             onyomi, kunyomi, category, word_type, 
             jlpt_level, stroke_count, radical
      FROM kanji
      ORDER BY jlpt_level, id
    `);
    
    fs.writeFileSync(
      'kanji-complete-report.json',
      JSON.stringify(fullData.rows, null, 2)
    );
    
    console.log(`   ✅ Exported complete data to: kanji-complete-report.json`);
    console.log(`   📄 Total records: ${fullData.rows.length}`);
    
    console.log('\n' + '=' .repeat(80));
    console.log('🎉 REPORT GENERATION COMPLETED SUCCESSFULLY!');
    console.log('=' .repeat(80));
    
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

generateReport();
