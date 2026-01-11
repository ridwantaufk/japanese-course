const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "japanese_course",
  password: "root",
  port: 5432,
});

// High-quality examples for N2/N1 kanji without examples
const advancedExamples = {
  沈: [
    {
      japanese_text: "船が沈んでしまいました。",
      furigana: "ふねがしずんでしまいました。",
      romaji: "fune ga shizunde shimaimashita.",
      meaning_id: "Kapal telah tenggelam.",
      word_breakdown: [
        { word: "船", reading: "ふね", meaning: "kapal" },
        { word: "沈んで", reading: "しずんで", meaning: "tenggelam" },
        { word: "しまいました", reading: "しまいました", meaning: "telah" },
      ],
    },
    {
      japanese_text: "沈黙が続きました。",
      furigana: "ちんもくがつづきました。",
      romaji: "chinmoku ga tsuzukimashita.",
      meaning_id: "Keheningan berlanjut.",
      word_breakdown: [
        { word: "沈黙", reading: "ちんもく", meaning: "keheningan" },
        { word: "続きました", reading: "つづきました", meaning: "berlanjut" },
      ],
    },
  ],
  爆: [
    {
      japanese_text: "爆発事故が起きました。",
      furigana: "ばくはつじこがおきました。",
      romaji: "bakuhatsu jiko ga okimashita.",
      meaning_id: "Terjadi kecelakaan ledakan.",
      word_breakdown: [
        { word: "爆発", reading: "ばくはつ", meaning: "ledakan" },
        { word: "事故", reading: "じこ", meaning: "kecelakaan" },
        { word: "起きました", reading: "おきました", meaning: "terjadi" },
      ],
    },
    {
      japanese_text: "この店は大爆笑でした。",
      furigana: "このみせはだいばくしょうでした。",
      romaji: "kono mise wa daibakushou deshita.",
      meaning_id: "Toko ini sangat ramai tertawa.",
      word_breakdown: [
        { word: "この", reading: "この", meaning: "ini" },
        { word: "店", reading: "みせ", meaning: "toko" },
        {
          word: "大爆笑",
          reading: "だいばくしょう",
          meaning: "tertawa terbahak-bahak",
        },
      ],
    },
  ],
  片: [
    {
      japanese_text: "片方の靴がありません。",
      furigana: "かたほうのくつがありません。",
      romaji: "katahou no kutsu ga arimasen.",
      meaning_id: "Sebelah sepatu tidak ada.",
      word_breakdown: [
        { word: "片方", reading: "かたほう", meaning: "sebelah/satu sisi" },
        { word: "靴", reading: "くつ", meaning: "sepatu" },
        { word: "ありません", reading: "ありません", meaning: "tidak ada" },
      ],
    },
    {
      japanese_text: "片付けてください。",
      furigana: "かたづけてください。",
      romaji: "katazukete kudasai.",
      meaning_id: "Tolong rapikan.",
      word_breakdown: [
        { word: "片付けて", reading: "かたづけて", meaning: "rapikan" },
        { word: "ください", reading: "ください", meaning: "tolong" },
      ],
    },
  ],
  甘: [
    {
      japanese_text: "このケーキは甘いです。",
      furigana: "このケーキはあまいです。",
      romaji: "kono keeki wa amai desu.",
      meaning_id: "Kue ini manis.",
      word_breakdown: [
        { word: "この", reading: "この", meaning: "ini" },
        { word: "ケーキ", reading: "ケーキ", meaning: "kue" },
        { word: "甘い", reading: "あまい", meaning: "manis" },
      ],
    },
    {
      japanese_text: "甘えてはいけません。",
      furigana: "あまえてはいけません。",
      romaji: "amaete wa ikemasen.",
      meaning_id: "Tidak boleh manja.",
      word_breakdown: [
        { word: "甘えて", reading: "あまえて", meaning: "manja" },
        {
          word: "はいけません",
          reading: "はいけません",
          meaning: "tidak boleh",
        },
      ],
    },
  ],
  砂: [
    {
      japanese_text: "砂浜で遊びました。",
      furigana: "すなはまであそびました。",
      romaji: "sunahama de asobimashita.",
      meaning_id: "Bermain di pantai berpasir.",
      word_breakdown: [
        { word: "砂浜", reading: "すなはま", meaning: "pantai berpasir" },
        { word: "遊びました", reading: "あそびました", meaning: "bermain" },
      ],
    },
    {
      japanese_text: "砂糖を入れてください。",
      furigana: "さとうをいれてください。",
      romaji: "satou wo irete kudasai.",
      meaning_id: "Tolong masukkan gula.",
      word_breakdown: [
        { word: "砂糖", reading: "さとう", meaning: "gula" },
        { word: "入れて", reading: "いれて", meaning: "masukkan" },
      ],
    },
  ],
  硬: [
    {
      japanese_text: "このパンは硬いです。",
      furigana: "このパンはかたいです。",
      romaji: "kono pan wa katai desu.",
      meaning_id: "Roti ini keras.",
      word_breakdown: [
        { word: "この", reading: "この", meaning: "ini" },
        { word: "パン", reading: "パン", meaning: "roti" },
        { word: "硬い", reading: "かたい", meaning: "keras" },
      ],
    },
    {
      japanese_text: "表情が硬くなりました。",
      furigana: "ひょうじょうがかたくなりました。",
      romaji: "hyoujou ga kataku narimashita.",
      meaning_id: "Ekspresi menjadi kaku.",
      word_breakdown: [
        { word: "表情", reading: "ひょうじょう", meaning: "ekspresi" },
        { word: "硬く", reading: "かたく", meaning: "kaku" },
        { word: "なりました", reading: "なりました", meaning: "menjadi" },
      ],
    },
  ],
  依: [
    {
      japanese_text: "依頼を受けました。",
      furigana: "いらいをうけました。",
      romaji: "irai wo ukemashita.",
      meaning_id: "Menerima permintaan.",
      word_breakdown: [
        { word: "依頼", reading: "いらい", meaning: "permintaan" },
        { word: "受けました", reading: "うけました", meaning: "menerima" },
      ],
    },
    {
      japanese_text: "両親に依存しています。",
      furigana: "りょうしんにいぞんしています。",
      romaji: "ryoushin ni izon shiteimasu.",
      meaning_id: "Bergantung pada orang tua.",
      word_breakdown: [
        { word: "両親", reading: "りょうしん", meaning: "orang tua" },
        { word: "依存", reading: "いぞん", meaning: "bergantung" },
        { word: "しています", reading: "しています", meaning: "sedang" },
      ],
    },
  ],
  偉: [
    {
      japanese_text: "偉大な科学者です。",
      furigana: "いだいなかがくしゃです。",
      romaji: "idai na kagakusha desu.",
      meaning_id: "Ilmuwan yang hebat.",
      word_breakdown: [
        { word: "偉大", reading: "いだい", meaning: "hebat" },
        { word: "科学者", reading: "かがくしゃ", meaning: "ilmuwan" },
      ],
    },
    {
      japanese_text: "とても偉い人です。",
      furigana: "とてもえらいひとです。",
      romaji: "totemo erai hito desu.",
      meaning_id: "Orang yang sangat agung.",
      word_breakdown: [
        { word: "とても", reading: "とても", meaning: "sangat" },
        { word: "偉い", reading: "えらい", meaning: "agung" },
        { word: "人", reading: "ひと", meaning: "orang" },
      ],
    },
  ],
  壱: [
    {
      japanese_text: "金額は壱万円です。",
      furigana: "きんがくはいちまんえんです。",
      romaji: "kingaku wa ichiman en desu.",
      meaning_id: "Jumlahnya sepuluh ribu yen.",
      word_breakdown: [
        { word: "金額", reading: "きんがく", meaning: "jumlah uang" },
        {
          word: "壱万円",
          reading: "いちまんえん",
          meaning: "sepuluh ribu yen (legal)",
        },
      ],
    },
    {
      japanese_text: "壱番を選びます。",
      furigana: "いちばんをえらびます。",
      romaji: "ichiban wo erabimasu.",
      meaning_id: "Memilih nomor satu.",
      word_breakdown: [
        { word: "壱番", reading: "いちばん", meaning: "nomor satu (formal)" },
        { word: "選びます", reading: "えらびます", meaning: "memilih" },
      ],
    },
  ],
  威: [
    {
      japanese_text: "威厳のある態度です。",
      furigana: "いげんのあるたいどです。",
      romaji: "igen no aru taido desu.",
      meaning_id: "Sikap yang berwibawa.",
      word_breakdown: [
        { word: "威厳", reading: "いげん", meaning: "wibawa" },
        { word: "のある", reading: "のある", meaning: "yang" },
        { word: "態度", reading: "たいど", meaning: "sikap" },
      ],
    },
    {
      japanese_text: "威力を示しました。",
      furigana: "いりょくをしめしました。",
      romaji: "iryoku wo shimeshimashita.",
      meaning_id: "Menunjukkan kekuatan.",
      word_breakdown: [
        { word: "威力", reading: "いりょく", meaning: "kekuatan/kuasa" },
        { word: "示しました", reading: "しめしました", meaning: "menunjukkan" },
      ],
    },
  ],
  扱: [
    {
      japanese_text: "丁寧に扱ってください。",
      furigana: "ていねいにあつかってください。",
      romaji: "teinei ni atsukatte kudasai.",
      meaning_id: "Tolong tangani dengan hati-hati.",
      word_breakdown: [
        { word: "丁寧に", reading: "ていねいに", meaning: "dengan hati-hati" },
        { word: "扱って", reading: "あつかって", meaning: "tangani" },
      ],
    },
    {
      japanese_text: "取扱説明書を読みます。",
      furigana: "とりあつかいせつめいしょをよみます。",
      romaji: "toriatsukai setsumeisho wo yomimasu.",
      meaning_id: "Membaca manual.",
      word_breakdown: [
        {
          word: "取扱説明書",
          reading: "とりあつかいせつめいしょ",
          meaning: "manual/petunjuk",
        },
        { word: "読みます", reading: "よみます", meaning: "membaca" },
      ],
    },
  ],
  為: [
    {
      japanese_text: "家族のために働きます。",
      furigana: "かぞくのためにはたらきます。",
      romaji: "kazoku no tame ni hatarakimasu.",
      meaning_id: "Bekerja demi keluarga.",
      word_breakdown: [
        { word: "家族", reading: "かぞく", meaning: "keluarga" },
        { word: "のために", reading: "のために", meaning: "demi" },
        { word: "働きます", reading: "はたらきます", meaning: "bekerja" },
      ],
    },
    {
      japanese_text: "行為が問題です。",
      furigana: "こういがもんだいです。",
      romaji: "koui ga mondai desu.",
      meaning_id: "Perbuatannya yang bermasalah.",
      word_breakdown: [
        { word: "行為", reading: "こうい", meaning: "perbuatan" },
        { word: "問題", reading: "もんだい", meaning: "masalah" },
      ],
    },
  ],
  維: [
    {
      japanese_text: "平和を維持します。",
      furigana: "へいわをいじします。",
      romaji: "heiwa wo iji shimasu.",
      meaning_id: "Memelihara perdamaian.",
      word_breakdown: [
        { word: "平和", reading: "へいわ", meaning: "perdamaian" },
        { word: "維持", reading: "いじ", meaning: "memelihara" },
        { word: "します", reading: "します", meaning: "melakukan" },
      ],
    },
    {
      japanese_text: "繊維産業が発展しました。",
      furigana: "せんいさんぎょうがはってんしました。",
      romaji: "sen'i sangyou ga hatten shimashita.",
      meaning_id: "Industri tekstil berkembang.",
      word_breakdown: [
        { word: "繊維", reading: "せんい", meaning: "serat/tekstil" },
        { word: "産業", reading: "さんぎょう", meaning: "industri" },
        {
          word: "発展しました",
          reading: "はってんしました",
          meaning: "berkembang",
        },
      ],
    },
  ],
  緯: [
    {
      japanese_text: "緯度を測定します。",
      furigana: "いどをそくていします。",
      romaji: "ido wo sokutei shimasu.",
      meaning_id: "Mengukur garis lintang.",
      word_breakdown: [
        { word: "緯度", reading: "いど", meaning: "garis lintang" },
        { word: "測定します", reading: "そくていします", meaning: "mengukur" },
      ],
    },
    {
      japanese_text: "経緯を説明します。",
      furigana: "けいいをせつめいします。",
      romaji: "keii wo setsumei shimasu.",
      meaning_id: "Menjelaskan latar belakang.",
      word_breakdown: [
        { word: "経緯", reading: "けいい", meaning: "latar belakang/detail" },
        {
          word: "説明します",
          reading: "せつめいします",
          meaning: "menjelaskan",
        },
      ],
    },
  ],
};

async function insertAdvancedExamples() {
  const client = await pool.connect();

  try {
    console.log("🚀 Inserting high-quality N2/N1 kanji examples...\n");

    // Get kanji without examples from N2 and N1
    const result = await client.query(`
      SELECT k.id, k.character, k.meaning_id, k.jlpt_level
      FROM kanji k
      LEFT JOIN kanji_examples ke ON k.id = ke.kanji_id
      WHERE ke.id IS NULL AND k.jlpt_level IN ('N2', 'N1')
      ORDER BY k.jlpt_level, k.character
    `);

    const kanjiWithoutExamples = result.rows;
    console.log(
      `📝 Found ${kanjiWithoutExamples.length} N2/N1 kanji without examples\n`
    );

    if (kanjiWithoutExamples.length === 0) {
      console.log("✅ All N2/N1 kanji already have examples!");
      return;
    }

    // Display which kanji need examples
    console.log("Kanji yang perlu contoh:");
    kanjiWithoutExamples.forEach((k) => {
      console.log(`  ${k.character} (${k.jlpt_level}) - ${k.meaning_id}`);
    });
    console.log();

    let insertCount = 0;
    let skippedCount = 0;

    await client.query("BEGIN");

    for (const kanji of kanjiWithoutExamples) {
      const examples = advancedExamples[kanji.character];

      if (!examples || examples.length === 0) {
        console.log(`⚠️  No examples defined for: ${kanji.character}`);
        skippedCount++;
        continue;
      }

      // Insert each example
      for (let i = 0; i < examples.length; i++) {
        const ex = examples[i];
        await client.query(
          `INSERT INTO kanji_examples 
           (kanji_id, example_order, japanese_text, furigana, romaji, meaning_id, word_breakdown)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            kanji.id,
            i + 1,
            ex.japanese_text,
            ex.furigana,
            ex.romaji,
            ex.meaning_id,
            JSON.stringify(ex.word_breakdown),
          ]
        );
        insertCount++;

        if (insertCount % 10 === 0) {
          console.log(`   ✓ Inserted ${insertCount} examples...`);
        }
      }
    }

    await client.query("COMMIT");

    console.log(
      `\n✅ Successfully inserted ${insertCount} examples for ${
        insertCount / 2
      } kanji!`
    );
    if (skippedCount > 0) {
      console.log(
        `⚠️  Skipped ${skippedCount} kanji (no examples defined yet)`
      );
    }

    // Get total count
    const totalResult = await client.query(`
      SELECT COUNT(*) as total
      FROM kanji_examples ke
      JOIN kanji k ON k.id = ke.kanji_id
      WHERE k.jlpt_level IN ('N2', 'N1')
    `);

    console.log(
      `\n📊 Total N2/N1 examples in database: ${totalResult.rows[0].total}`
    );
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("❌ Error inserting examples:", error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

insertAdvancedExamples();
