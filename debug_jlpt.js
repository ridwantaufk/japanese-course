const { Client } = require('pg');

const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'japanese_course',
  password: 'root',
  port: 5432,
});

async function checkExamRelations() {
  try {
    await client.connect();
    console.log("Checking JLPT Relations...");

    // 1. Check Schema of Sections
    const colRes = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'jlpt_exam_sections'
    `);
    console.log("Columns in jlpt_exam_sections:", colRes.rows.map(r => r.column_name));

    // 2. Check an exam that HAS sections
    const joinRes = await client.query(`
        SELECT e.id as exam_id, e.title_id, COUNT(s.id) as section_count
        FROM jlpt_exams e
        LEFT JOIN jlpt_exam_sections s ON e.id = s.exam_id
        GROUP BY e.id, e.title_id
        ORDER BY section_count DESC
        LIMIT 5;
    `);
    console.log("\nTop 5 Exams with Sections:");
    console.table(joinRes.rows);

    // 3. Check the specific problematic exam (if ID is 31 or similar)
    // Let's check exams with 0 sections
    const emptyRes = await client.query(`
        SELECT e.id as exam_id, e.title_id
        FROM jlpt_exams e
        LEFT JOIN jlpt_exam_sections s ON e.id = s.exam_id
        WHERE s.id IS NULL
        LIMIT 5;
    `);
    console.log("\nExams with NO Sections (Problematic):");
    console.table(emptyRes.rows);

  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.end();
  }
}

checkExamRelations();
