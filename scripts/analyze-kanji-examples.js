const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  password: "root",
  host: "localhost",
  port: 5432,
  database: "japanese_course",
});

async function analyzeExamples() {
  try {
    console.log("🔍 Analyzing kanji examples...\n");

    // Check which kanji don't have examples
    const missingExamples = await pool.query(`
      SELECT k.id, k.character, k.meaning_en, k.jlpt_level, 
             k.onyomi, k.kunyomi
      FROM kanji k
      LEFT JOIN kanji_examples ke ON k.id = ke.kanji_id
      WHERE ke.id IS NULL
      ORDER BY k.jlpt_level, k.id
    `);

    console.log(`📊 Kanji WITHOUT examples: ${missingExamples.rows.length}`);

    // Check which kanji have less than 2 examples
    const needMoreExamples = await pool.query(`
      SELECT k.id, k.character, k.meaning_en, k.jlpt_level,
             COUNT(ke.id) as example_count
      FROM kanji k
      LEFT JOIN kanji_examples ke ON k.id = ke.kanji_id
      GROUP BY k.id, k.character, k.meaning_en, k.jlpt_level
      HAVING COUNT(ke.id) < 2
      ORDER BY k.jlpt_level, k.id
    `);

    console.log(
      `📊 Kanji with LESS THAN 2 examples: ${needMoreExamples.rows.length}`
    );

    // Distribution by JLPT level
    console.log("\n📋 Distribution of missing/incomplete examples:");
    console.log("=".repeat(60));

    const distribution = await pool.query(`
      SELECT 
        k.jlpt_level,
        COUNT(DISTINCT k.id) as total_kanji,
        COUNT(DISTINCT ke.kanji_id) as with_examples,
        COUNT(DISTINCT k.id) - COUNT(DISTINCT ke.kanji_id) as without_examples,
        COUNT(ke.id) as total_examples
      FROM kanji k
      LEFT JOIN kanji_examples ke ON k.id = ke.kanji_id
      GROUP BY k.jlpt_level
      ORDER BY k.jlpt_level
    `);

    distribution.rows.forEach((row) => {
      const coverage = ((row.with_examples / row.total_kanji) * 100).toFixed(1);
      console.log(`\nN${row.jlpt_level}:`);
      console.log(`  Total kanji: ${row.total_kanji}`);
      console.log(`  With examples: ${row.with_examples} (${coverage}%)`);
      console.log(`  Without examples: ${row.without_examples}`);
      console.log(`  Total examples: ${row.total_examples}`);
    });

    // Sample of missing examples
    console.log("\n\n📝 Sample kanji WITHOUT examples (first 20):");
    console.log("=".repeat(60));

    missingExamples.rows.slice(0, 20).forEach((row) => {
      console.log(
        `${row.character} (ID: ${row.id}) - ${row.meaning_en} [N${row.jlpt_level}]`
      );
    });

    // Export full list
    const fs = require("fs");
    fs.writeFileSync(
      "kanji-missing-examples.json",
      JSON.stringify(missingExamples.rows, null, 2)
    );

    console.log(
      `\n✅ Exported ${missingExamples.rows.length} kanji without examples to kanji-missing-examples.json`
    );

    // Export kanji needing more examples
    fs.writeFileSync(
      "kanji-need-more-examples.json",
      JSON.stringify(needMoreExamples.rows, null, 2)
    );

    console.log(
      `✅ Exported ${needMoreExamples.rows.length} kanji needing more examples to kanji-need-more-examples.json`
    );
  } catch (error) {
    console.error("❌ Error:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

analyzeExamples();
