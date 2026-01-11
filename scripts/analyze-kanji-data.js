const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  password: 'root',
  host: 'localhost',
  port: 5432,
  database: 'japanese_course'
});

async function analyzeKanjiData() {
  try {
    console.log('🔍 Analyzing kanji data for consistency issues...\n');
    
    // Check for missing data in various columns
    const checks = [
      { name: 'Missing onyomi', query: "SELECT COUNT(*) FROM kanji WHERE onyomi IS NULL OR TRIM(onyomi) = ''" },
      { name: 'Missing kunyomi', query: "SELECT COUNT(*) FROM kanji WHERE kunyomi IS NULL OR TRIM(kunyomi) = ''" },
      { name: 'Missing meaning_en', query: "SELECT COUNT(*) FROM kanji WHERE meaning_en IS NULL OR TRIM(meaning_en) = ''" },
      { name: 'Missing meaning_id', query: "SELECT COUNT(*) FROM kanji WHERE meaning_id IS NULL OR TRIM(meaning_id) = ''" },
      { name: 'Category = Umum', query: "SELECT COUNT(*) FROM kanji WHERE category = 'Umum'" },
      { name: 'Word_type = Umum', query: "SELECT COUNT(*) FROM kanji WHERE word_type = 'Umum'" },
      { name: 'Total kanji', query: "SELECT COUNT(*) FROM kanji" },
    ];
    
    console.log('📊 Data Completeness Check:');
    console.log('=' .repeat(60));
    for (const check of checks) {
      const result = await pool.query(check.query);
      console.log(`${check.name}: ${result.rows[0].count}`);
    }
    
    console.log('\n📋 Sample records with issues (first 20):');
    console.log('=' .repeat(60));
    
    const sampleQuery = `
      SELECT id, character, meaning_en, onyomi, kunyomi, category, word_type, jlpt_level
      FROM kanji 
      WHERE category = 'Umum' OR word_type = 'Umum'
      ORDER BY jlpt_level, id
      LIMIT 20
    `;
    
    const samples = await pool.query(sampleQuery);
    samples.rows.forEach(row => {
      console.log(`\nID ${row.id} [${row.character}] JLPT N${row.jlpt_level}`);
      console.log(`  Meaning: ${row.meaning_en}`);
      console.log(`  Onyomi: ${row.onyomi || 'MISSING'}`);
      console.log(`  Kunyomi: ${row.kunyomi || 'MISSING'}`);
      console.log(`  Category: ${row.category}`);
      console.log(`  Word Type: ${row.word_type}`);
    });
    
    // Check JLPT distribution
    console.log('\n\n📊 JLPT Level Distribution:');
    console.log('=' .repeat(60));
    const jlptDist = await pool.query(`
      SELECT jlpt_level, COUNT(*) as total,
        SUM(CASE WHEN category = 'Umum' THEN 1 ELSE 0 END) as umum_category,
        SUM(CASE WHEN word_type = 'Umum' THEN 1 ELSE 0 END) as umum_type
      FROM kanji
      GROUP BY jlpt_level
      ORDER BY jlpt_level
    `);
    
    jlptDist.rows.forEach(row => {
      console.log(`N${row.jlpt_level}: ${row.total} kanji (${row.umum_category} uncategorized, ${row.umum_type} untyped)`);
    });
    
    // Export problematic records to file for analysis
    console.log('\n\n📝 Exporting detailed data for review...');
    const fullData = await pool.query(`
      SELECT id, character, meaning_en, meaning_id, onyomi, kunyomi, 
             category, word_type, jlpt_level, stroke_count, radical
      FROM kanji 
      WHERE category = 'Umum' OR word_type = 'Umum'
      ORDER BY jlpt_level, id
    `);
    
    const fs = require('fs');
    fs.writeFileSync(
      'kanji-needs-improvement.json',
      JSON.stringify(fullData.rows, null, 2)
    );
    
    console.log(`✅ Exported ${fullData.rows.length} records to kanji-needs-improvement.json`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

analyzeKanjiData();
