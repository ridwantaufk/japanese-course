const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  password: "root",
  host: "localhost",
  port: 5432,
  database: "japanese_course",
});

// Fungsi konversi ke romaji (copy dari script sebelumnya)
function hiraganaToRomaji(hiragana) {
  const romajiMap = {
    あ: "a",
    い: "i",
    う: "u",
    え: "e",
    お: "o",
    か: "ka",
    き: "ki",
    く: "ku",
    け: "ke",
    こ: "ko",
    が: "ga",
    ぎ: "gi",
    ぐ: "gu",
    げ: "ge",
    ご: "go",
    さ: "sa",
    し: "shi",
    す: "su",
    せ: "se",
    そ: "so",
    ざ: "za",
    じ: "ji",
    ず: "zu",
    ぜ: "ze",
    ぞ: "zo",
    た: "ta",
    ち: "chi",
    つ: "tsu",
    て: "te",
    と: "to",
    だ: "da",
    ぢ: "ji",
    づ: "zu",
    で: "de",
    ど: "do",
    な: "na",
    に: "ni",
    ぬ: "nu",
    ね: "ne",
    の: "no",
    は: "ha",
    ひ: "hi",
    ふ: "fu",
    へ: "he",
    ほ: "ho",
    ば: "ba",
    び: "bi",
    ぶ: "bu",
    べ: "be",
    ぼ: "bo",
    ぱ: "pa",
    ぴ: "pi",
    ぷ: "pu",
    ぺ: "pe",
    ぽ: "po",
    ま: "ma",
    み: "mi",
    む: "mu",
    め: "me",
    も: "mo",
    や: "ya",
    ゆ: "yu",
    よ: "yo",
    ら: "ra",
    り: "ri",
    る: "ru",
    れ: "re",
    ろ: "ro",
    わ: "wa",
    ゐ: "wi",
    ゑ: "we",
    を: "wo",
    ん: "n",
    きゃ: "kya",
    きゅ: "kyu",
    きょ: "kyo",
    しゃ: "sha",
    しゅ: "shu",
    しょ: "sho",
    ちゃ: "cha",
    ちゅ: "chu",
    ちょ: "cho",
    にゃ: "nya",
    にゅ: "nyu",
    にょ: "nyo",
    ひゃ: "hya",
    ひゅ: "hyu",
    ひょ: "hyo",
    みゃ: "mya",
    みゅ: "myu",
    みょ: "myo",
    りゃ: "rya",
    りゅ: "ryu",
    りょ: "ryo",
    ぎゃ: "gya",
    ぎゅ: "gyu",
    ぎょ: "gyo",
    じゃ: "ja",
    じゅ: "ju",
    じょ: "jo",
    びゃ: "bya",
    びゅ: "byu",
    びょ: "byo",
    ぴゃ: "pya",
    ぴゅ: "pyu",
    ぴょ: "pyo",
    ー: "-",
  };

  let result = "";
  let i = 0;

  while (i < hiragana.length) {
    if (i < hiragana.length - 1) {
      const twoChar = hiragana.substring(i, i + 2);
      if (romajiMap[twoChar]) {
        result += romajiMap[twoChar];
        i += 2;
        continue;
      }
    }

    const oneChar = hiragana[i];
    if (romajiMap[oneChar]) {
      result += romajiMap[oneChar];
    } else {
      result += oneChar;
    }
    i++;
  }

  return result;
}

function katakanaToRomaji(katakana) {
  const romajiMap = {
    ア: "a",
    イ: "i",
    ウ: "u",
    エ: "e",
    オ: "o",
    カ: "ka",
    キ: "ki",
    ク: "ku",
    ケ: "ke",
    コ: "ko",
    ガ: "ga",
    ギ: "gi",
    グ: "gu",
    ゲ: "ge",
    ゴ: "go",
    サ: "sa",
    シ: "shi",
    ス: "su",
    セ: "se",
    ソ: "so",
    ザ: "za",
    ジ: "ji",
    ズ: "zu",
    ゼ: "ze",
    ゾ: "zo",
    タ: "ta",
    チ: "chi",
    ツ: "tsu",
    テ: "te",
    ト: "to",
    ダ: "da",
    ヂ: "ji",
    ヅ: "zu",
    デ: "de",
    ド: "do",
    ナ: "na",
    ニ: "ni",
    ヌ: "nu",
    ネ: "ne",
    ノ: "no",
    ハ: "ha",
    ヒ: "hi",
    フ: "fu",
    ヘ: "he",
    ホ: "ho",
    バ: "ba",
    ビ: "bi",
    ブ: "bu",
    ベ: "be",
    ボ: "bo",
    パ: "pa",
    ピ: "pi",
    プ: "pu",
    ペ: "pe",
    ポ: "po",
    マ: "ma",
    ミ: "mi",
    ム: "mu",
    メ: "me",
    モ: "mo",
    ヤ: "ya",
    ユ: "yu",
    ヨ: "yo",
    ラ: "ra",
    リ: "ri",
    ル: "ru",
    レ: "re",
    ロ: "ro",
    ワ: "wa",
    ヰ: "wi",
    ヱ: "we",
    ヲ: "wo",
    ン: "n",
    キャ: "kya",
    キュ: "kyu",
    キョ: "kyo",
    シャ: "sha",
    シュ: "shu",
    ショ: "sho",
    チャ: "cha",
    チュ: "chu",
    チョ: "cho",
    ニャ: "nya",
    ニュ: "nyu",
    ニョ: "nyo",
    ヒャ: "hya",
    ヒュ: "hyu",
    ヒョ: "hyo",
    ミャ: "mya",
    ミュ: "myu",
    ミョ: "myo",
    リャ: "rya",
    リュ: "ryu",
    リョ: "ryo",
    ギャ: "gya",
    ギュ: "gyu",
    ギョ: "gyo",
    ジャ: "ja",
    ジュ: "ju",
    ジョ: "jo",
    ビャ: "bya",
    ビュ: "byu",
    ビョ: "byo",
    ピャ: "pya",
    ピュ: "pyu",
    ピョ: "pyo",
    ー: "-",
  };

  let result = "";
  let i = 0;

  while (i < katakana.length) {
    if (i < katakana.length - 1) {
      const twoChar = katakana.substring(i, i + 2);
      if (romajiMap[twoChar]) {
        result += romajiMap[twoChar];
        i += 2;
        continue;
      }
    }

    const oneChar = katakana[i];
    if (romajiMap[oneChar]) {
      result += romajiMap[oneChar];
    } else {
      result += oneChar;
    }
    i++;
  }

  return result;
}

function toRomaji(text) {
  if (!text) return "";
  if (/[a-zA-Z]/.test(text)) return text;

  const isHiragana = /[\u3040-\u309F]/.test(text);
  const isKatakana = /[\u30A0-\u30FF]/.test(text);

  if (isHiragana) return hiraganaToRomaji(text);
  if (isKatakana) return katakanaToRomaji(text);

  return text;
}

async function normalizeReadings() {
  try {
    console.log("🔍 Normalizing readings with combined entries...\n");

    const result = await pool.query(`
      SELECT id, character, onyomi, kunyomi, jlpt_level
      FROM kanji 
      ORDER BY id
    `);

    let fixed = 0;

    for (const kanji of result.rows) {
      let needsUpdate = false;
      let newOnyomi = [];
      let newKunyomi = [];

      // Parse onyomi
      const onyomiArr = Array.isArray(kanji.onyomi)
        ? kanji.onyomi
        : kanji.onyomi && kanji.onyomi.length > 0
        ? JSON.parse(kanji.onyomi)
        : [];

      // Split combined readings (e.g., "キン・コン" becomes separate entries)
      for (const item of onyomiArr) {
        if (typeof item === "object" && item.reading) {
          // Check if reading contains separators
          if (item.reading.includes("・") || item.reading.includes("、")) {
            const readings = item.reading.split(/[・、]/).map((r) => r.trim());
            readings.forEach((reading) => {
              if (reading) {
                newOnyomi.push({
                  reading: reading,
                  romaji: toRomaji(reading),
                });
              }
            });
            needsUpdate = true;
          } else if (!item.romaji || item.romaji === "") {
            // Missing or empty romaji
            newOnyomi.push({
              reading: item.reading,
              romaji: toRomaji(item.reading),
            });
            needsUpdate = true;
          } else {
            newOnyomi.push(item);
          }
        }
      }

      // Parse kunyomi
      const kunyomiArr = Array.isArray(kanji.kunyomi)
        ? kanji.kunyomi
        : kanji.kunyomi && kanji.kunyomi.length > 0
        ? JSON.parse(kanji.kunyomi)
        : [];

      for (const item of kunyomiArr) {
        if (typeof item === "object" && item.reading) {
          // Check if reading contains separators
          if (item.reading.includes("・") || item.reading.includes("、")) {
            const readings = item.reading.split(/[・、]/).map((r) => r.trim());
            readings.forEach((reading) => {
              if (reading) {
                newKunyomi.push({
                  reading: reading,
                  romaji: toRomaji(reading),
                });
              }
            });
            needsUpdate = true;
          } else if (!item.romaji || item.romaji === "") {
            // Missing or empty romaji
            newKunyomi.push({
              reading: item.reading,
              romaji: toRomaji(item.reading),
            });
            needsUpdate = true;
          } else {
            newKunyomi.push(item);
          }
        }
      }

      if (needsUpdate && (newOnyomi.length > 0 || newKunyomi.length > 0)) {
        const updates = [];
        const values = [];
        let paramIndex = 1;

        if (newOnyomi.length > 0) {
          updates.push(`onyomi = $${paramIndex++}::jsonb`);
          values.push(JSON.stringify(newOnyomi));
        }

        if (newKunyomi.length > 0) {
          updates.push(`kunyomi = $${paramIndex++}::jsonb`);
          values.push(JSON.stringify(newKunyomi));
        }

        values.push(kanji.id);

        await pool.query(
          `UPDATE kanji SET ${updates.join(", ")} WHERE id = $${paramIndex}`,
          values
        );

        fixed++;

        if (fixed % 50 === 0) {
          console.log(`   ✓ Fixed ${fixed} kanji...`);
        }
      }
    }

    console.log(`\n✅ Normalized ${fixed} kanji readings\n`);

    // Verify improvements
    console.log("📊 Verification - Sample of normalized data:");
    console.log("=".repeat(80));

    const samples = await pool.query(`
      SELECT id, character, meaning_en, onyomi, kunyomi
      FROM kanji
      WHERE id IN (6, 10, 15, 20, 25)
      ORDER BY id
    `);

    for (const row of samples.rows) {
      console.log(`\n${row.character} (ID: ${row.id})`);
      console.log(`   Meaning: ${row.meaning_en}`);

      const on = Array.isArray(row.onyomi)
        ? row.onyomi
        : JSON.parse(row.onyomi || "[]");
      const kun = Array.isArray(row.kunyomi)
        ? row.kunyomi
        : JSON.parse(row.kunyomi || "[]");

      console.log(`   Onyomi (${on.length}):`);
      on.forEach((item) => {
        console.log(`      ${item.reading} (${item.romaji})`);
      });

      console.log(`   Kunyomi (${kun.length}):`);
      kun.forEach((item) => {
        console.log(`      ${item.reading} (${item.romaji})`);
      });
    }
  } catch (error) {
    console.error("❌ Error:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

normalizeReadings();
