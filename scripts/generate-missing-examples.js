const { Pool } = require("pg");
const fs = require("fs");

const pool = new Pool({
  user: "postgres",
  password: "root",
  host: "localhost",
  port: 5432,
  database: "japanese_course",
});

// Helper untuk convert hiragana ke romaji
function toRomaji(text) {
  const map = {
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
    っ: "",
    ゃ: "ya",
    ゅ: "yu",
    ょ: "yo",
    ァ: "a",
    ィ: "i",
    ゥ: "u",
    ェ: "e",
    ォ: "o",
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
    ッ: "",
    ャ: "ya",
    ュ: "yu",
    ョ: "yo",
    "、": ", ",
    "。": ". ",
    "「": '"',
    "」": '"',
    です: "desu",
    ます: "masu",
    でした: "deshita",
    ました: "mashita",
    している: "shiteiru",
  };

  let result = "";
  let i = 0;
  while (i < text.length) {
    let found = false;
    // Try 3-char, then 2-char, then 1-char
    for (let len = 3; len >= 1; len--) {
      if (i + len <= text.length) {
        const substr = text.substring(i, i + len);
        if (map[substr]) {
          result += map[substr];
          i += len;
          found = true;
          break;
        }
      }
    }
    if (!found) {
      result += text[i];
      i++;
    }
  }
  return result;
}

// Template contoh kalimat berdasarkan kategori dan jenis kata
function generateExamples(kanji, meaning, category, wordType, onyomi, kunyomi) {
  const char = kanji;
  const examples = [];

  // Ambil reading pertama
  const on = onyomi && onyomi.length > 0 ? onyomi[0] : null;
  const kun = kunyomi && kunyomi.length > 0 ? kunyomi[0] : null;

  // Generate based on specific kanji patterns
  const examplePatterns = {
    // Angka
    一: [
      {
        jp: "一人で行きます。",
        furi: "ひとりでいきます。",
        id: "Saya pergi sendiri.",
        type: "kunyomi",
      },
      {
        jp: "一番好きです。",
        furi: "いちばんすきです。",
        id: "Yang paling suka.",
        type: "onyomi",
      },
    ],
    二: [
      {
        jp: "二人で食べました。",
        furi: "ふたりでたべました。",
        id: "Kami berdua makan.",
        type: "kunyomi",
      },
      {
        jp: "二月です。",
        furi: "にがつです。",
        id: "Bulan Februari.",
        type: "onyomi",
      },
    ],
    三: [
      {
        jp: "三つください。",
        furi: "みっつください。",
        id: "Tolong tiga buah.",
        type: "kunyomi",
      },
      {
        jp: "三日間です。",
        furi: "みっかかんです。",
        id: "Selama tiga hari.",
        type: "onyomi",
      },
    ],
    四: [
      {
        jp: "四人家族です。",
        furi: "よにんかぞくです。",
        id: "Keluarga beranggotakan 4 orang.",
        type: "onyomi",
      },
      {
        jp: "四つあります。",
        furi: "よっつあります。",
        id: "Ada empat buah.",
        type: "kunyomi",
      },
    ],
    五: [
      {
        jp: "五時に会いましょう。",
        furi: "ごじにあいましょう。",
        id: "Mari bertemu jam 5.",
        type: "onyomi",
      },
      {
        jp: "五つ買いました。",
        furi: "いつつかいました。",
        id: "Saya membeli lima buah.",
        type: "kunyomi",
      },
    ],
    日: [
      {
        jp: "今日は暑いです。",
        furi: "きょうはあついです。",
        id: "Hari ini panas.",
        type: "kun+special",
      },
      {
        jp: "日曜日です。",
        furi: "にちようびです。",
        id: "Hari Minggu.",
        type: "onyomi",
      },
    ],
    月: [
      {
        jp: "月が綺麗です。",
        furi: "つきがきれいです。",
        id: "Bulannya indah.",
        type: "kunyomi",
      },
      {
        jp: "一月です。",
        furi: "いちがつです。",
        id: "Bulan Januari.",
        type: "onyomi",
      },
    ],
    火: [
      {
        jp: "火が熱い。",
        furi: "ひがあつい。",
        id: "Apinya panas.",
        type: "kunyomi",
      },
      {
        jp: "火曜日です。",
        furi: "かようびです。",
        id: "Hari Selasa.",
        type: "onyomi",
      },
    ],
    水: [
      {
        jp: "水を飲みます。",
        furi: "みずをのみます。",
        id: "Minum air.",
        type: "kunyomi",
      },
      {
        jp: "水曜日です。",
        furi: "すいようびです。",
        id: "Hari Rabu.",
        type: "onyomi",
      },
    ],
    木: [
      {
        jp: "木が大きいです。",
        furi: "きがおおきいです。",
        id: "Pohonnya besar.",
        type: "kunyomi",
      },
      {
        jp: "木曜日です。",
        furi: "もくようびです。",
        id: "Hari Kamis.",
        type: "onyomi",
      },
    ],
    土: [
      {
        jp: "土が黒いです。",
        furi: "つちがくろいです。",
        id: "Tanahnya hitam.",
        type: "kunyomi",
      },
      {
        jp: "土曜日です。",
        furi: "どようびです。",
        id: "Hari Sabtu.",
        type: "onyomi",
      },
    ],
    人: [
      {
        jp: "人が多いです。",
        furi: "ひとがおおいです。",
        id: "Orangnya banyak.",
        type: "kunyomi",
      },
      {
        jp: "日本人です。",
        furi: "にほんじんです。",
        id: "Orang Jepang.",
        type: "onyomi",
      },
    ],
  };

  // Kalau ada pattern spesifik, pakai itu
  if (examplePatterns[char]) {
    return examplePatterns[char].map((ex) => ({
      japanese_text: ex.jp,
      furigana: ex.furi,
      romaji: toRomaji(ex.furi),
      meaning_id: ex.id,
      word_breakdown: [],
    }));
  }

  // Generic patterns based on word type and readings
  if (kun && kun.reading) {
    const kunReading = kun.reading;
    const kunRomaji = kun.romaji || toRomaji(kunReading);

    examples.push({
      japanese_text: `この${char}は${meaning.split(",")[0].trim()}です。`,
      furigana: `この${kunReading}は${meaning.split(",")[0].trim()}です。`,
      romaji: `kono ${kunRomaji} wa ${meaning
        .split(",")[0]
        .trim()
        .toLowerCase()} desu.`,
      meaning_id: `Ini adalah ${meaning.split(",")[0].trim().toLowerCase()}.`,
      word_breakdown: [],
    });
  }

  if (on && on.reading && examples.length < 2) {
    const onReading = on.reading;
    const onRomaji = on.romaji || toRomaji(onReading);

    examples.push({
      japanese_text: `${char}について勉強します。`,
      furigana: `${onReading}についてべんきょうします。`,
      romaji: `${onRomaji} nitsuite benkyou shimasu.`,
      meaning_id: `Belajar tentang ${meaning
        .split(",")[0]
        .trim()
        .toLowerCase()}.`,
      word_breakdown: [],
    });
  }

  // If still need more examples
  while (examples.length < 2) {
    examples.push({
      japanese_text: `${char}を使います。`,
      furigana: `${char}をつかいます。`,
      romaji: `${meaning.split(",")[0].trim().toLowerCase()} wo tsukaimasu.`,
      meaning_id: `Menggunakan ${meaning.split(",")[0].trim().toLowerCase()}.`,
      word_breakdown: [],
    });
  }

  return examples.slice(0, 2);
}

async function generateMissingExamples() {
  try {
    console.log("🚀 Generating missing kanji examples...\n");

    // Load missing kanji
    const missingData = JSON.parse(
      fs.readFileSync("kanji-missing-examples.json", "utf-8")
    );

    console.log(
      `📝 Processing ${missingData.length} kanji without examples...\n`
    );

    let generated = 0;
    let batch = [];

    for (const kanji of missingData) {
      const onyomi = Array.isArray(kanji.onyomi)
        ? kanji.onyomi
        : JSON.parse(kanji.onyomi || "[]");
      const kunyomi = Array.isArray(kanji.kunyomi)
        ? kanji.kunyomi
        : JSON.parse(kanji.kunyomi || "[]");

      const examples = generateExamples(
        kanji.character,
        kanji.meaning_en,
        "General",
        "General",
        onyomi,
        kunyomi
      );

      for (let i = 0; i < examples.length; i++) {
        batch.push({
          kanji_id: kanji.id,
          example_order: i + 1,
          ...examples[i],
        });
      }

      generated++;

      // Insert in batches of 50
      if (batch.length >= 100) {
        await insertBatch(batch);
        console.log(
          `   ✓ Inserted ${generated * 2} examples for ${generated} kanji...`
        );
        batch = [];
      }
    }

    // Insert remaining
    if (batch.length > 0) {
      await insertBatch(batch);
      console.log(`   ✓ Inserted remaining examples`);
    }

    console.log(
      `\n✅ Generated ${generated * 2} examples for ${generated} kanji!`
    );

    // Verify
    const count = await pool.query("SELECT COUNT(*) FROM kanji_examples");
    console.log(`\n📊 Total examples in database: ${count.rows[0].count}`);
  } catch (error) {
    console.error("❌ Error:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

async function insertBatch(batch) {
  const values = [];
  const placeholders = [];

  batch.forEach((item, idx) => {
    const offset = idx * 7;
    placeholders.push(
      `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${
        offset + 5
      }, $${offset + 6}, $${offset + 7})`
    );
    values.push(
      item.kanji_id,
      item.example_order,
      item.japanese_text,
      item.furigana,
      item.romaji,
      item.meaning_id,
      JSON.stringify(item.word_breakdown)
    );
  });

  const query = `
    INSERT INTO kanji_examples 
    (kanji_id, example_order, japanese_text, furigana, romaji, meaning_id, word_breakdown)
    VALUES ${placeholders.join(", ")}
  `;

  await pool.query(query, values);
}

generateMissingExamples();
