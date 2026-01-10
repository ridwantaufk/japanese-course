const { Client } = require('pg');

const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'japanese_course',
  password: 'root',
  port: 5432,
});

async function inspectContent() {
  try {
    await client.connect();
    console.log("Connected. Checking row counts...");

    const tables = [
      'users', 
      'kanji', 'kanji_examples', 
      'vocabulary', 'vocabulary_examples', 
      'grammar', 'grammar_examples', 
      'conversations', 'conversation_lines', 
      'reading_texts', 'reading_sentences',
      'quiz_sets', 'quiz_questions',
      'jlpt_exams', 'jlpt_exam_sections', 'jlpt_exam_questions',
      'hiragana', 'katakana'
    ];

    for (const table of tables) {
      try {
        const res = await client.query(`SELECT COUNT(*) FROM ${table}`);
        const count = parseInt(res.rows[0].count);
        console.log(`${table.padEnd(25)}: ${count} rows`);
        
        if (count > 0 && count < 3) {
             const sample = await client.query(`SELECT * FROM ${table} LIMIT 1`);
             console.log(`  Sample:`, JSON.stringify(sample.rows[0]).substring(0, 100) + '...');
        }

      } catch (err) {
        console.log(`${table.padEnd(25)}: ERROR/NOT FOUND`);
      }
    }

  } catch (err) {
    console.error("Connection error:", err);
  } finally {
    await client.end();
  }
}

inspectContent();