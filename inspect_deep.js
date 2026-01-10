const { Client } = require('pg');

const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'japanese_course',
  password: 'root',
  port: 5432,
});

async function deepInspect() {
  try {
    await client.connect();
    console.log("=== DEEP INSPECTION ===");

    // 1. Reading
    console.log("\n[READING]");
    const readingRes = await client.query(`
        SELECT id, title_id, japanese_text, meaning_id 
        FROM reading_texts 
        LIMIT 1
    `);
    if (readingRes.rows.length > 0) {
        const r = readingRes.rows[0];
        console.log("Sample Text:", r.title_id);
        console.log("Raw JP:", r.japanese_text ? r.japanese_text.substring(0, 50) + '...' : 'NULL');
        // Check for sentences
        const sentRes = await client.query(`SELECT COUNT(*) FROM reading_sentences WHERE reading_text_id = $1`, [r.id]);
        console.log("Linked Sentences:", sentRes.rows[0].count);
    }

    // 2. Conversation
    console.log("\n[CONVERSATION]");
    const convRes = await client.query(`
        SELECT cl.id, cl.word_breakdown 
        FROM conversation_lines cl 
        WHERE cl.word_breakdown IS NOT NULL 
        LIMIT 1
    `);
    if (convRes.rows.length > 0) {
        console.log("Word Breakdown Sample:", JSON.stringify(convRes.rows[0].word_breakdown, null, 2));
    } else {
        console.log("No Word Breakdown found in conversation_lines.");
    }

    // 3. JLPT Questions
    console.log("\n[JLPT QUESTIONS]");
    const qRes = await client.query(`
        SELECT s.exam_id, s.id as section_id, COUNT(q.id) as q_count
        FROM jlpt_exam_sections s
        LEFT JOIN jlpt_exam_questions q ON s.id = q.section_id
        GROUP BY s.exam_id, s.id
        HAVING COUNT(q.id) > 0
        LIMIT 5
    `);
    console.table(qRes.rows);

  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

deepInspect();
