const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  password: 'root',
  host: 'localhost',
  port: 5432,
  database: 'japanese_course'
});

// Contoh kalimat berkualitas tinggi untuk kanji N5
const n5Examples = {
  '日': [
    {
      japanese_text: '今日は良い天気ですね。',
      furigana: 'きょうはよいてんきですね。',
      romaji: 'kyou wa yoi tenki desu ne.',
      meaning_id: 'Cuaca hari ini bagus ya.',
      word_breakdown: [
        { word: '今日', reading: 'きょう', meaning: 'hari ini' },
        { word: '良い', reading: 'よい', meaning: 'bagus' },
        { word: '天気', reading: 'てんき', meaning: 'cuaca' }
      ]
    },
    {
      japanese_text: '日曜日に映画を見ます。',
      furigana: 'にちようびにえいがをみます。',
      romaji: 'nichiyoubi ni eiga wo mimasu.',
      meaning_id: 'Menonton film pada hari Minggu.',
      word_breakdown: [
        { word: '日曜日', reading: 'にちようび', meaning: 'hari Minggu' },
        { word: '映画', reading: 'えいが', meaning: 'film' },
        { word: '見ます', reading: 'みます', meaning: 'menonton' }
      ]
    }
  ],
  '月': [
    {
      japanese_text: '月が綺麗ですね。',
      furigana: 'つきがきれいですね。',
      romaji: 'tsuki ga kirei desu ne.',
      meaning_id: 'Bulannya indah ya.',
      word_breakdown: [
        { word: '月', reading: 'つき', meaning: 'bulan' },
        { word: '綺麗', reading: 'きれい', meaning: 'indah' }
      ]
    },
    {
      japanese_text: '来月日本に行きます。',
      furigana: 'らいげつにほんにいきます。',
      romaji: 'raigetsu nihon ni ikimasu.',
      meaning_id: 'Bulan depan pergi ke Jepang.',
      word_breakdown: [
        { word: '来月', reading: 'らいげつ', meaning: 'bulan depan' },
        { word: '日本', reading: 'にほん', meaning: 'Jepang' },
        { word: '行きます', reading: 'いきます', meaning: 'pergi' }
      ]
    }
  ],
  '火': [
    {
      japanese_text: '火曜日は忙しいです。',
      furigana: 'かようびはいそがしいです。',
      romaji: 'kayoubi wa isogashii desu.',
      meaning_id: 'Hari Selasa sibuk.',
      word_breakdown: [
        { word: '火曜日', reading: 'かようび', meaning: 'hari Selasa' },
        { word: '忙しい', reading: 'いそがしい', meaning: 'sibuk' }
      ]
    },
    {
      japanese_text: '火に気をつけてください。',
      furigana: 'ひにきをつけてください。',
      romaji: 'hi ni ki wo tsukete kudasai.',
      meaning_id: 'Tolong hati-hati dengan api.',
      word_breakdown: [
        { word: '火', reading: 'ひ', meaning: 'api' },
        { word: '気をつけて', reading: 'きをつけて', meaning: 'hati-hati' }
      ]
    }
  ],
  '水': [
    {
      japanese_text: '水を一杯ください。',
      furigana: 'みずをいっぱいください。',
      romaji: 'mizu wo ippai kudasai.',
      meaning_id: 'Tolong beri satu gelas air.',
      word_breakdown: [
        { word: '水', reading: 'みず', meaning: 'air' },
        { word: '一杯', reading: 'いっぱい', meaning: 'satu gelas' }
      ]
    },
    {
      japanese_text: '水曜日は休みです。',
      furigana: 'すいようびはやすみです。',
      romaji: 'suiyoubi wa yasumi desu.',
      meaning_id: 'Hari Rabu libur.',
      word_breakdown: [
        { word: '水曜日', reading: 'すいようび', meaning: 'hari Rabu' },
        { word: '休み', reading: 'やすみ', meaning: 'libur' }
      ]
    }
  ],
  '木': [
    {
      japanese_text: '庭に大きな木があります。',
      furigana: 'にわにおおきなきがあります。',
      romaji: 'niwa ni ookina ki ga arimasu.',
      meaning_id: 'Ada pohon besar di halaman.',
      word_breakdown: [
        { word: '庭', reading: 'にわ', meaning: 'halaman' },
        { word: '大きな', reading: 'おおきな', meaning: 'besar' },
        { word: '木', reading: 'き', meaning: 'pohon' }
      ]
    },
    {
      japanese_text: '木曜日に会議があります。',
      furigana: 'もくようびにかいぎがあります。',
      romaji: 'mokuyoubi ni kaigi ga arimasu.',
      meaning_id: 'Ada rapat pada hari Kamis.',
      word_breakdown: [
        { word: '木曜日', reading: 'もくようび', meaning: 'hari Kamis' },
        { word: '会議', reading: 'かいぎ', meaning: 'rapat' }
      ]
    }
  ],
  '金': [
    {
      japanese_text: '金曜日は友達と遊びます。',
      furigana: 'きんようびはともだちとあそびます。',
      romaji: 'kinyoubi wa tomodachi to asobimasu.',
      meaning_id: 'Hari Jumat bermain dengan teman.',
      word_breakdown: [
        { word: '金曜日', reading: 'きんようび', meaning: 'hari Jumat' },
        { word: '友達', reading: 'ともだち', meaning: 'teman' },
        { word: '遊びます', reading: 'あそびます', meaning: 'bermain' }
      ]
    },
    {
      japanese_text: 'お金が足りません。',
      furigana: 'おかねがたりません。',
      romaji: 'okane ga tarimasen.',
      meaning_id: 'Uangnya tidak cukup.',
      word_breakdown: [
        { word: 'お金', reading: 'おかね', meaning: 'uang' },
        { word: '足りません', reading: 'たりません', meaning: 'tidak cukup' }
      ]
    }
  ],
  '土': [
    {
      japanese_text: '土曜日はゆっくり休みます。',
      furigana: 'どようびはゆっくりやすみます。',
      romaji: 'doyoubi wa yukkuri yasumimasu.',
      meaning_id: 'Hari Sabtu istirahat dengan santai.',
      word_breakdown: [
        { word: '土曜日', reading: 'どようび', meaning: 'hari Sabtu' },
        { word: 'ゆっくり', reading: 'ゆっくり', meaning: 'santai' },
        { word: '休みます', reading: 'やすみます', meaning: 'istirahat' }
      ]
    },
    {
      japanese_text: '土が湿っています。',
      furigana: 'つちがしめっています。',
      romaji: 'tsuchi ga shimetteimasu.',
      meaning_id: 'Tanahnya lembab.',
      word_breakdown: [
        { word: '土', reading: 'つち', meaning: 'tanah' },
        { word: '湿っています', reading: 'しめっています', meaning: 'lembab' }
      ]
    }
  ],
  '人': [
    {
      japanese_text: 'あの人は日本人です。',
      furigana: 'あのひとはにほんじんです。',
      romaji: 'ano hito wa nihonjin desu.',
      meaning_id: 'Orang itu orang Jepang.',
      word_breakdown: [
        { word: 'あの人', reading: 'あのひと', meaning: 'orang itu' },
        { word: '日本人', reading: 'にほんじん', meaning: 'orang Jepang' }
      ]
    },
    {
      japanese_text: '駅に人が多いです。',
      furigana: 'えきにひとがおおいです。',
      romaji: 'eki ni hito ga ooi desu.',
      meaning_id: 'Banyak orang di stasiun.',
      word_breakdown: [
        { word: '駅', reading: 'えき', meaning: 'stasiun' },
        { word: '人', reading: 'ひと', meaning: 'orang' },
        { word: '多い', reading: 'おおい', meaning: 'banyak' }
      ]
    }
  ],
  '一': [
    {
      japanese_text: '一つ買いました。',
      furigana: 'ひとつかいました。',
      romaji: 'hitotsu kaimashita.',
      meaning_id: 'Saya membeli satu.',
      word_breakdown: [
        { word: '一つ', reading: 'ひとつ', meaning: 'satu buah' },
        { word: '買いました', reading: 'かいました', meaning: 'membeli' }
      ]
    },
    {
      japanese_text: '一番好きな食べ物は寿司です。',
      furigana: 'いちばんすきなたべものはすしです。',
      romaji: 'ichiban suki na tabemono wa sushi desu.',
      meaning_id: 'Makanan favorit adalah sushi.',
      word_breakdown: [
        { word: '一番', reading: 'いちばん', meaning: 'paling' },
        { word: '好きな', reading: 'すきな', meaning: 'favorit' },
        { word: '食べ物', reading: 'たべもの', meaning: 'makanan' },
        { word: '寿司', reading: 'すし', meaning: 'sushi' }
      ]
    }
  ],
  '二': [
    {
      japanese_text: '二人で行きましょう。',
      furigana: 'ふたりでいきましょう。',
      romaji: 'futari de ikimashou.',
      meaning_id: 'Mari pergi berdua.',
      word_breakdown: [
        { word: '二人', reading: 'ふたり', meaning: 'dua orang' },
        { word: '行きましょう', reading: 'いきましょう', meaning: 'mari pergi' }
      ]
    },
    {
      japanese_text: '二月は寒いです。',
      furigana: 'にがつはさむいです。',
      romaji: 'nigatsu wa samui desu.',
      meaning_id: 'Bulan Februari dingin.',
      word_breakdown: [
        { word: '二月', reading: 'にがつ', meaning: 'Februari' },
        { word: '寒い', reading: 'さむい', meaning: 'dingin' }
      ]
    }
  ],
  '三': [
    {
      japanese_text: '三日間東京にいました。',
      furigana: 'みっかかんとうきょうにいました。',
      romaji: 'mikka kan toukyou ni imashita.',
      meaning_id: 'Saya berada di Tokyo selama tiga hari.',
      word_breakdown: [
        { word: '三日間', reading: 'みっかかん', meaning: 'tiga hari' },
        { word: '東京', reading: 'とうきょう', meaning: 'Tokyo' },
        { word: 'いました', reading: 'いました', meaning: 'berada' }
      ]
    },
    {
      japanese_text: 'りんごを三つください。',
      furigana: 'りんごをみっつください。',
      romaji: 'ringo wo mittsu kudasai.',
      meaning_id: 'Tolong beri tiga buah apel.',
      word_breakdown: [
        { word: 'りんご', reading: 'りんご', meaning: 'apel' },
        { word: '三つ', reading: 'みっつ', meaning: 'tiga buah' }
      ]
    }
  ],
  '四': [
    {
      japanese_text: '四人家族です。',
      furigana: 'よにんかぞくです。',
      romaji: 'yonin kazoku desu.',
      meaning_id: 'Keluarga beranggotakan empat orang.',
      word_breakdown: [
        { word: '四人', reading: 'よにん', meaning: 'empat orang' },
        { word: '家族', reading: 'かぞく', meaning: 'keluarga' }
      ]
    },
    {
      japanese_text: '四月に桜が咲きます。',
      furigana: 'しがつにさくらがさきます。',
      romaji: 'shigatsu ni sakura ga sakimasu.',
      meaning_id: 'Bunga sakura mekar di bulan April.',
      word_breakdown: [
        { word: '四月', reading: 'しがつ', meaning: 'April' },
        { word: '桜', reading: 'さくら', meaning: 'sakura' },
        { word: '咲きます', reading: 'さきます', meaning: 'mekar' }
      ]
    }
  ],
  '五': [
    {
      japanese_text: '五時に会いましょう。',
      furigana: 'ごじにあいましょう。',
      romaji: 'goji ni aimashou.',
      meaning_id: 'Mari bertemu jam lima.',
      word_breakdown: [
        { word: '五時', reading: 'ごじ', meaning: 'jam lima' },
        { word: '会いましょう', reading: 'あいましょう', meaning: 'mari bertemu' }
      ]
    },
    {
      japanese_text: '五月は暖かいです。',
      furigana: 'ごがつはあたたかいです。',
      romaji: 'gogatsu wa atatakai desu.',
      meaning_id: 'Bulan Mei hangat.',
      word_breakdown: [
        { word: '五月', reading: 'ごがつ', meaning: 'Mei' },
        { word: '暖かい', reading: 'あたたかい', meaning: 'hangat' }
      ]
    }
  ],
  '六': [
    {
      japanese_text: '六月は雨が多いです。',
      furigana: 'ろくがつはあめがおおいです。',
      romaji: 'rokugatsu wa ame ga ooi desu.',
      meaning_id: 'Bulan Juni banyak hujan.',
      word_breakdown: [
        { word: '六月', reading: 'ろくがつ', meaning: 'Juni' },
        { word: '雨', reading: 'あめ', meaning: 'hujan' },
        { word: '多い', reading: 'おおい', meaning: 'banyak' }
      ]
    },
    {
      japanese_text: '六時に起きます。',
      furigana: 'ろくじにおきます。',
      romaji: 'rokuji ni okimasu.',
      meaning_id: 'Bangun jam enam.',
      word_breakdown: [
        { word: '六時', reading: 'ろくじ', meaning: 'jam enam' },
        { word: '起きます', reading: 'おきます', meaning: 'bangun' }
      ]
    }
  ],
  '七': [
    {
      japanese_text: '七月は夏休みです。',
      furigana: 'しちがつはなつやすみです。',
      romaji: 'shichigatsu wa natsuyasumi desu.',
      meaning_id: 'Bulan Juli adalah liburan musim panas.',
      word_breakdown: [
        { word: '七月', reading: 'しちがつ', meaning: 'Juli' },
        { word: '夏休み', reading: 'なつやすみ', meaning: 'liburan musim panas' }
      ]
    },
    {
      japanese_text: '七時に夕飯を食べます。',
      furigana: 'しちじにゆうはんをたべます。',
      romaji: 'shichiji ni yuuhan wo tabemasu.',
      meaning_id: 'Makan malam jam tujuh.',
      word_breakdown: [
        { word: '七時', reading: 'しちじ', meaning: 'jam tujuh' },
        { word: '夕飯', reading: 'ゆうはん', meaning: 'makan malam' },
        { word: '食べます', reading: 'たべます', meaning: 'makan' }
      ]
    }
  ],
  '八': [
    {
      japanese_text: '八月は暑いです。',
      furigana: 'はちがつはあついです。',
      romaji: 'hachigatsu wa atsui desu.',
      meaning_id: 'Bulan Agustus panas.',
      word_breakdown: [
        { word: '八月', reading: 'はちがつ', meaning: 'Agustus' },
        { word: '暑い', reading: 'あつい', meaning: 'panas' }
      ]
    },
    {
      japanese_text: '八時から仕事です。',
      furigana: 'はちじからしごとです。',
      romaji: 'hachiji kara shigoto desu.',
      meaning_id: 'Kerja mulai jam delapan.',
      word_breakdown: [
        { word: '八時', reading: 'はちじ', meaning: 'jam delapan' },
        { word: 'から', reading: 'から', meaning: 'dari/mulai' },
        { word: '仕事', reading: 'しごと', meaning: 'kerja' }
      ]
    }
  ],
  '九': [
    {
      japanese_text: '九月に学校が始まります。',
      furigana: 'くがつにがっこうがはじまります。',
      romaji: 'kugatsu ni gakkou ga hajimarimasu.',
      meaning_id: 'Sekolah dimulai di bulan September.',
      word_breakdown: [
        { word: '九月', reading: 'くがつ', meaning: 'September' },
        { word: '学校', reading: 'がっこう', meaning: 'sekolah' },
        { word: '始まります', reading: 'はじまります', meaning: 'dimulai' }
      ]
    },
    {
      japanese_text: '九時に寝ます。',
      furigana: 'くじにねます。',
      romaji: 'kuji ni nemasu.',
      meaning_id: 'Tidur jam sembilan.',
      word_breakdown: [
        { word: '九時', reading: 'くじ', meaning: 'jam sembilan' },
        { word: '寝ます', reading: 'ねます', meaning: 'tidur' }
      ]
    }
  ],
  '十': [
    {
      japanese_text: '十月は秋です。',
      furigana: 'じゅうがつはあきです。',
      romaji: 'juugatsu wa aki desu.',
      meaning_id: 'Bulan Oktober adalah musim gugur.',
      word_breakdown: [
        { word: '十月', reading: 'じゅうがつ', meaning: 'Oktober' },
        { word: '秋', reading: 'あき', meaning: 'musim gugur' }
      ]
    },
    {
      japanese_text: '十分休んでください。',
      furigana: 'じゅうぶんやすんでください。',
      romaji: 'juubun yasunde kudasai.',
      meaning_id: 'Silakan istirahat yang cukup.',
      word_breakdown: [
        { word: '十分', reading: 'じゅうぶん', meaning: 'cukup' },
        { word: '休んで', reading: 'やすんで', meaning: 'istirahat' }
      ]
    }
  ],
  '百': [
    {
      japanese_text: '百円ショップで買いました。',
      furigana: 'ひゃくえんショップでかいました。',
      romaji: 'hyakuen shoppu de kaimashita.',
      meaning_id: 'Saya beli di toko serba seratus yen.',
      word_breakdown: [
        { word: '百円', reading: 'ひゃくえん', meaning: 'seratus yen' },
        { word: 'ショップ', reading: 'ショップ', meaning: 'toko' },
        { word: '買いました', reading: 'かいました', meaning: 'membeli' }
      ]
    },
    {
      japanese_text: '百点を取りました。',
      furigana: 'ひゃくてんをとりました。',
      romaji: 'hyakuten wo torimashita.',
      meaning_id: 'Saya mendapat nilai seratus.',
      word_breakdown: [
        { word: '百点', reading: 'ひゃくてん', meaning: 'seratus poin' },
        { word: '取りました', reading: 'とりました', meaning: 'mendapat' }
      ]
    }
  ],
  '千': [
    {
      japanese_text: '千円貸してください。',
      furigana: 'せんえんかしてください。',
      romaji: 'sen en kashite kudasai.',
      meaning_id: 'Tolong pinjamkan seribu yen.',
      word_breakdown: [
        { word: '千円', reading: 'せんえん', meaning: 'seribu yen' },
        { word: '貸して', reading: 'かして', meaning: 'pinjamkan' }
      ]
    },
    {
      japanese_text: '千人以上来ました。',
      furigana: 'せんにんいじょうきました。',
      romaji: 'sennin ijou kimashita.',
      meaning_id: 'Lebih dari seribu orang datang.',
      word_breakdown: [
        { word: '千人', reading: 'せんにん', meaning: 'seribu orang' },
        { word: '以上', reading: 'いじょう', meaning: 'lebih dari' },
        { word: '来ました', reading: 'きました', meaning: 'datang' }
      ]
    }
  ],
  '万': [
    {
      japanese_text: '一万円払いました。',
      furigana: 'いちまんえんはらいました。',
      romaji: 'ichiman en haraimashita.',
      meaning_id: 'Saya membayar sepuluh ribu yen.',
      word_breakdown: [
        { word: '一万円', reading: 'いちまんえん', meaning: 'sepuluh ribu yen' },
        { word: '払いました', reading: 'はらいました', meaning: 'membayar' }
      ]
    },
    {
      japanese_text: '万が一のために準備します。',
      furigana: 'まんがいちのためにじゅんびします。',
      romaji: 'man ga ichi no tame ni junbi shimasu.',
      meaning_id: 'Mempersiapkan untuk berjaga-jaga.',
      word_breakdown: [
        { word: '万が一', reading: 'まんがいち', meaning: 'seandainya' },
        { word: 'ために', reading: 'ために', meaning: 'untuk' },
        { word: '準備します', reading: 'じゅんびします', meaning: 'mempersiapkan' }
      ]
    }
  ],
  '円': [
    {
      japanese_text: '五百円あります。',
      furigana: 'ごひゃくえんあります。',
      romaji: 'gohyaku en arimasu.',
      meaning_id: 'Ada lima ratus yen.',
      word_breakdown: [
        { word: '五百円', reading: 'ごひゃくえん', meaning: 'lima ratus yen' }
      ]
    },
    {
      japanese_text: 'これは円いです。',
      furigana: 'これはまるいです。',
      romaji: 'kore wa marui desu.',
      meaning_id: 'Ini bundar.',
      word_breakdown: [
        { word: '円い', reading: 'まるい', meaning: 'bundar' }
      ]
    }
  ],
  '年': [
    {
      japanese_text: '今年は忙しいです。',
      furigana: 'ことしはいそがしいです。',
      romaji: 'kotoshi wa isogashii desu.',
      meaning_id: 'Tahun ini sibuk.',
      word_breakdown: [
        { word: '今年', reading: 'ことし', meaning: 'tahun ini' },
        { word: '忙しい', reading: 'いそがしい', meaning: 'sibuk' }
      ]
    },
    {
      japanese_text: '来年結婚します。',
      furigana: 'らいねんけっこんします。',
      romaji: 'rainen kekkon shimasu.',
      meaning_id: 'Tahun depan menikah.',
      word_breakdown: [
        { word: '来年', reading: 'らいねん', meaning: 'tahun depan' },
        { word: '結婚します', reading: 'けっこんします', meaning: 'menikah' }
      ]
    }
  ],
  '中': [
    {
      japanese_text: '箱の中に何がありますか。',
      furigana: 'はこのなかになにがありますか。',
      romaji: 'hako no naka ni nani ga arimasu ka.',
      meaning_id: 'Ada apa di dalam kotak?',
      word_breakdown: [
        { word: '箱', reading: 'はこ', meaning: 'kotak' },
        { word: '中', reading: 'なか', meaning: 'dalam' },
        { word: '何', reading: 'なに', meaning: 'apa' }
      ]
    },
    {
      japanese_text: '勉強中です。',
      furigana: 'べんきょうちゅうです。',
      romaji: 'benkyou chuu desu.',
      meaning_id: 'Sedang belajar.',
      word_breakdown: [
        { word: '勉強', reading: 'べんきょう', meaning: 'belajar' },
        { word: '中', reading: 'ちゅう', meaning: 'sedang' }
      ]
    }
  ],
  '上': [
    {
      japanese_text: '机の上に本があります。',
      furigana: 'つくえのうえにほんがあります。',
      romaji: 'tsukue no ue ni hon ga arimasu.',
      meaning_id: 'Ada buku di atas meja.',
      word_breakdown: [
        { word: '机', reading: 'つくえ', meaning: 'meja' },
        { word: '上', reading: 'うえ', meaning: 'atas' },
        { word: '本', reading: 'ほん', meaning: 'buku' }
      ]
    },
    {
      japanese_text: '階段を上ります。',
      furigana: 'かいだんをのぼります。',
      romaji: 'kaidan wo noborimasu.',
      meaning_id: 'Naik tangga.',
      word_breakdown: [
        { word: '階段', reading: 'かいだん', meaning: 'tangga' },
        { word: '上ります', reading: 'のぼります', meaning: 'naik' }
      ]
    }
  ],
  '下': [
    {
      japanese_text: '椅子の下に猫がいます。',
      furigana: 'いすのしたにねこがいます。',
      romaji: 'isu no shita ni neko ga imasu.',
      meaning_id: 'Ada kucing di bawah kursi.',
      word_breakdown: [
        { word: '椅子', reading: 'いす', meaning: 'kursi' },
        { word: '下', reading: 'した', meaning: 'bawah' },
        { word: '猫', reading: 'ねこ', meaning: 'kucing' }
      ]
    },
    {
      japanese_text: '山を下ります。',
      furigana: 'やまをくだります。',
      romaji: 'yama wo kudarimasu.',
      meaning_id: 'Turun gunung.',
      word_breakdown: [
        { word: '山', reading: 'やま', meaning: 'gunung' },
        { word: '下ります', reading: 'くだります', meaning: 'turun' }
      ]
    }
  ],
  '左': [
    {
      japanese_text: '左に曲がってください。',
      furigana: 'ひだりにまがってください。',
      romaji: 'hidari ni magatte kudasai.',
      meaning_id: 'Tolong belok kiri.',
      word_breakdown: [
        { word: '左', reading: 'ひだり', meaning: 'kiri' },
        { word: '曲がって', reading: 'まがって', meaning: 'belok' }
      ]
    },
    {
      japanese_text: '左手に駅があります。',
      furigana: 'ひだりてにえきがあります。',
      romaji: 'hidarite ni eki ga arimasu.',
      meaning_id: 'Ada stasiun di sebelah kiri.',
      word_breakdown: [
        { word: '左手', reading: 'ひだりて', meaning: 'sebelah kiri' },
        { word: '駅', reading: 'えき', meaning: 'stasiun' }
      ]
    }
  ],
  '右': [
    {
      japanese_text: '右に曲がります。',
      furigana: 'みぎにまがります。',
      romaji: 'migi ni magarimasu.',
      meaning_id: 'Belok kanan.',
      word_breakdown: [
        { word: '右', reading: 'みぎ', meaning: 'kanan' },
        { word: '曲がります', reading: 'まがります', meaning: 'belok' }
      ]
    },
    {
      japanese_text: '右手にコンビニがあります。',
      furigana: 'みぎてにコンビニがあります。',
      romaji: 'migite ni konbini ga arimasu.',
      meaning_id: 'Ada minimarket di sebelah kanan.',
      word_breakdown: [
        { word: '右手', reading: 'みぎて', meaning: 'sebelah kanan' },
        { word: 'コンビニ', reading: 'コンビニ', meaning: 'minimarket' }
      ]
    }
  ],
  '半': [
    {
      japanese_text: '三時半に会いましょう。',
      furigana: 'さんじはんにあいましょう。',
      romaji: 'sanji han ni aimashou.',
      meaning_id: 'Mari bertemu jam tiga setengah.',
      word_breakdown: [
        { word: '三時半', reading: 'さんじはん', meaning: 'jam tiga setengah' },
        { word: '会いましょう', reading: 'あいましょう', meaning: 'mari bertemu' }
      ]
    },
    {
      japanese_text: '半分食べました。',
      furigana: 'はんぶんたべました。',
      romaji: 'hanbun tabemashita.',
      meaning_id: 'Sudah makan setengah.',
      word_breakdown: [
        { word: '半分', reading: 'はんぶん', meaning: 'setengah' },
        { word: '食べました', reading: 'たべました', meaning: 'makan' }
      ]
    }
  ],
  '分': [
    {
      japanese_text: '十分待ってください。',
      furigana: 'じゅっぷんまってください。',
      romaji: 'juppun matte kudasai.',
      meaning_id: 'Tolong tunggu sepuluh menit.',
      word_breakdown: [
        { word: '十分', reading: 'じゅっぷん', meaning: 'sepuluh menit' },
        { word: '待って', reading: 'まって', meaning: 'tunggu' }
      ]
    },
    {
      japanese_text: 'よく分かりました。',
      furigana: 'よくわかりました。',
      romaji: 'yoku wakarimashita.',
      meaning_id: 'Saya sudah mengerti dengan baik.',
      word_breakdown: [
        { word: 'よく', reading: 'よく', meaning: 'dengan baik' },
        { word: '分かりました', reading: 'わかりました', meaning: 'mengerti' }
      ]
    }
  ],
  '時': [
    {
      japanese_text: '何時ですか。',
      furigana: 'なんじですか。',
      romaji: 'nanji desu ka.',
      meaning_id: 'Jam berapa?',
      word_breakdown: [
        { word: '何時', reading: 'なんじ', meaning: 'jam berapa' }
      ]
    },
    {
      japanese_text: '子供の時は元気でした。',
      furigana: 'こどものときはげんきでした。',
      romaji: 'kodomo no toki wa genki deshita.',
      meaning_id: 'Waktu kecil saya sehat.',
      word_breakdown: [
        { word: '子供', reading: 'こども', meaning: 'anak-anak' },
        { word: '時', reading: 'とき', meaning: 'waktu' },
        { word: '元気', reading: 'げんき', meaning: 'sehat' }
      ]
    }
  ],
  '週': [
    {
      japanese_text: '来週会いましょう。',
      furigana: 'らいしゅうあいましょう。',
      romaji: 'raishuu aimashou.',
      meaning_id: 'Mari bertemu minggu depan.',
      word_breakdown: [
        { word: '来週', reading: 'らいしゅう', meaning: 'minggu depan' },
        { word: '会いましょう', reading: 'あいましょう', meaning: 'mari bertemu' }
      ]
    },
    {
      japanese_text: '毎週日曜日に掃除します。',
      furigana: 'まいしゅうにちようびにそうじします。',
      romaji: 'maishuu nichiyoubi ni souji shimasu.',
      meaning_id: 'Setiap minggu hari Minggu bersih-bersih.',
      word_breakdown: [
        { word: '毎週', reading: 'まいしゅう', meaning: 'setiap minggu' },
        { word: '日曜日', reading: 'にちようび', meaning: 'hari Minggu' },
        { word: '掃除します', reading: 'そうじします', meaning: 'bersih-bersih' }
      ]
    }
  ],
  '今': [
    {
      japanese_text: '今何時ですか。',
      furigana: 'いまなんじですか。',
      romaji: 'ima nanji desu ka.',
      meaning_id: 'Sekarang jam berapa?',
      word_breakdown: [
        { word: '今', reading: 'いま', meaning: 'sekarang' },
        { word: '何時', reading: 'なんじ', meaning: 'jam berapa' }
      ]
    },
    {
      japanese_text: '今日は寒いです。',
      furigana: 'きょうはさむいです。',
      romaji: 'kyou wa samui desu.',
      meaning_id: 'Hari ini dingin.',
      word_breakdown: [
        { word: '今日', reading: 'きょう', meaning: 'hari ini' },
        { word: '寒い', reading: 'さむい', meaning: 'dingin' }
      ]
    }
  ],
  '毎': [
    {
      japanese_text: '毎日勉強します。',
      furigana: 'まいにちべんきょうします。',
      romaji: 'mainichi benkyou shimasu.',
      meaning_id: 'Belajar setiap hari.',
      word_breakdown: [
        { word: '毎日', reading: 'まいにち', meaning: 'setiap hari' },
        { word: '勉強します', reading: 'べんきょうします', meaning: 'belajar' }
      ]
    },
    {
      japanese_text: '毎朝コーヒーを飲みます。',
      furigana: 'まいあさコーヒーをのみます。',
      romaji: 'maiasa koohii wo nomimasu.',
      meaning_id: 'Minum kopi setiap pagi.',
      word_breakdown: [
        { word: '毎朝', reading: 'まいあさ', meaning: 'setiap pagi' },
        { word: 'コーヒー', reading: 'コーヒー', meaning: 'kopi' },
        { word: '飲みます', reading: 'のみます', meaning: 'minum' }
      ]
    }
  ],
  '先': [
    {
      japanese_text: '先生は優しいです。',
      furigana: 'せんせいはやさしいです。',
      romaji: 'sensei wa yasashii desu.',
      meaning_id: 'Guru itu baik hati.',
      word_breakdown: [
        { word: '先生', reading: 'せんせい', meaning: 'guru' },
        { word: '優しい', reading: 'やさしい', meaning: 'baik hati' }
      ]
    },
    {
      japanese_text: '先に行ってください。',
      furigana: 'さきにいってください。',
      romaji: 'saki ni itte kudasai.',
      meaning_id: 'Silakan pergi duluan.',
      word_breakdown: [
        { word: '先', reading: 'さき', meaning: 'duluan' },
        { word: '行って', reading: 'いって', meaning: 'pergi' }
      ]
    }
  ],
  '後': [
    {
      japanese_text: '食事の後で話しましょう。',
      furigana: 'しょくじのあとではなしましょう。',
      romaji: 'shokuji no ato de hanashimashou.',
      meaning_id: 'Mari bicara setelah makan.',
      word_breakdown: [
        { word: '食事', reading: 'しょくじ', meaning: 'makan' },
        { word: '後', reading: 'あと', meaning: 'setelah' },
        { word: '話しましょう', reading: 'はなしましょう', meaning: 'mari bicara' }
      ]
    },
    {
      japanese_text: '後ろに人がいます。',
      furigana: 'うしろにひとがいます。',
      romaji: 'ushiro ni hito ga imasu.',
      meaning_id: 'Ada orang di belakang.',
      word_breakdown: [
        { word: '後ろ', reading: 'うしろ', meaning: 'belakang' },
        { word: '人', reading: 'ひと', meaning: 'orang' }
      ]
    }
  ],
  '前': [
    {
      japanese_text: '駅の前で会いましょう。',
      furigana: 'えきのまえであいましょう。',
      romaji: 'eki no mae de aimashou.',
      meaning_id: 'Mari bertemu di depan stasiun.',
      word_breakdown: [
        { word: '駅', reading: 'えき', meaning: 'stasiun' },
        { word: '前', reading: 'まえ', meaning: 'depan' },
        { word: '会いましょう', reading: 'あいましょう', meaning: 'mari bertemu' }
      ]
    },
    {
      japanese_text: '十年前に来ました。',
      furigana: 'じゅうねんまえにきました。',
      romaji: 'juunen mae ni kimashita.',
      meaning_id: 'Datang sepuluh tahun yang lalu.',
      word_breakdown: [
        { word: '十年前', reading: 'じゅうねんまえ', meaning: 'sepuluh tahun lalu' },
        { word: '来ました', reading: 'きました', meaning: 'datang' }
      ]
    }
  ],
  '北': [
    {
      japanese_text: '北海道は寒いです。',
      furigana: 'ほっかいどうはさむいです。',
      romaji: 'hokkaidou wa samui desu.',
      meaning_id: 'Hokkaido dingin.',
      word_breakdown: [
        { word: '北海道', reading: 'ほっかいどう', meaning: 'Hokkaido' },
        { word: '寒い', reading: 'さむい', meaning: 'dingin' }
      ]
    },
    {
      japanese_text: '北に向かいます。',
      furigana: 'きたにむかいます。',
      romaji: 'kita ni mukaimasu.',
      meaning_id: 'Menuju ke utara.',
      word_breakdown: [
        { word: '北', reading: 'きた', meaning: 'utara' },
        { word: '向かいます', reading: 'むかいます', meaning: 'menuju' }
      ]
    }
  ],
  '南': [
    {
      japanese_text: '南の方が暖かいです。',
      furigana: 'みなみのほうがあたたかいです。',
      romaji: 'minami no hou ga atatakai desu.',
      meaning_id: 'Bagian selatan lebih hangat.',
      word_breakdown: [
        { word: '南', reading: 'みなみ', meaning: 'selatan' },
        { word: '方', reading: 'ほう', meaning: 'bagian' },
        { word: '暖かい', reading: 'あたたかい', meaning: 'hangat' }
      ]
    },
    {
      japanese_text: '南口で待っています。',
      furigana: 'みなみぐちでまっています。',
      romaji: 'minamiguchi de matteimasu.',
      meaning_id: 'Menunggu di pintu selatan.',
      word_breakdown: [
        { word: '南口', reading: 'みなみぐち', meaning: 'pintu selatan' },
        { word: '待っています', reading: 'まっています', meaning: 'menunggu' }
      ]
    }
  ],
  '西': [
    {
      japanese_text: '西に富士山が見えます。',
      furigana: 'にしにふじさんがみえます。',
      romaji: 'nishi ni fujisan ga miemasu.',
      meaning_id: 'Gunung Fuji terlihat di barat.',
      word_breakdown: [
        { word: '西', reading: 'にし', meaning: 'barat' },
        { word: '富士山', reading: 'ふじさん', meaning: 'Gunung Fuji' },
        { word: '見えます', reading: 'みえます', meaning: 'terlihat' }
      ]
    },
    {
      japanese_text: '西口に行ってください。',
      furigana: 'にしぐちにいってください。',
      romaji: 'nishiguchi ni itte kudasai.',
      meaning_id: 'Silakan pergi ke pintu barat.',
      word_breakdown: [
        { word: '西口', reading: 'にしぐち', meaning: 'pintu barat' },
        { word: '行って', reading: 'いって', meaning: 'pergi' }
      ]
    }
  ],
  '東': [
    {
      japanese_text: '東京に住んでいます。',
      furigana: 'とうきょうにすんでいます。',
      romaji: 'toukyou ni sundeimasu.',
      meaning_id: 'Tinggal di Tokyo.',
      word_breakdown: [
        { word: '東京', reading: 'とうきょう', meaning: 'Tokyo' },
        { word: '住んでいます', reading: 'すんでいます', meaning: 'tinggal' }
      ]
    },
    {
      japanese_text: '東口で会いましょう。',
      furigana: 'ひがしぐちであいましょう。',
      romaji: 'higashiguchi de aimashou.',
      meaning_id: 'Mari bertemu di pintu timur.',
      word_breakdown: [
        { word: '東口', reading: 'ひがしぐち', meaning: 'pintu timur' },
        { word: '会いましょう', reading: 'あいましょう', meaning: 'mari bertemu' }
      ]
    }
  ],
  '女': [
    {
      japanese_text: '女の人が三人います。',
      furigana: 'おんなのひとがさんにんいます。',
      romaji: 'onna no hito ga san nin imasu.',
      meaning_id: 'Ada tiga orang perempuan.',
      word_breakdown: [
        { word: '女の人', reading: 'おんなのひと', meaning: 'perempuan' },
        { word: '三人', reading: 'さんにん', meaning: 'tiga orang' }
      ]
    },
    {
      japanese_text: '彼女は学生です。',
      furigana: 'かのじょはがくせいです。',
      romaji: 'kanojo wa gakusei desu.',
      meaning_id: 'Dia (perempuan) adalah pelajar.',
      word_breakdown: [
        { word: '彼女', reading: 'かのじょ', meaning: 'dia (perempuan)' },
        { word: '学生', reading: 'がくせい', meaning: 'pelajar' }
      ]
    }
  ],
  '男': [
    {
      japanese_text: '男の子が走っています。',
      furigana: 'おとこのこがはしっています。',
      romaji: 'otoko no ko ga hashitteimasu.',
      meaning_id: 'Anak laki-laki sedang berlari.',
      word_breakdown: [
        { word: '男の子', reading: 'おとこのこ', meaning: 'anak laki-laki' },
        { word: '走っています', reading: 'はしっています', meaning: 'sedang berlari' }
      ]
    },
    {
      japanese_text: '彼は男らしいです。',
      furigana: 'かれはおとこらしいです。',
      romaji: 'kare wa otokorashii desu.',
      meaning_id: 'Dia (laki-laki) maskulin.',
      word_breakdown: [
        { word: '彼', reading: 'かれ', meaning: 'dia (laki-laki)' },
        { word: '男らしい', reading: 'おとこらしい', meaning: 'maskulin' }
      ]
    }
  ],
  '父': [
    {
      japanese_text: '父は会社員です。',
      furigana: 'ちちはかいしゃいんです。',
      romaji: 'chichi wa kaishain desu.',
      meaning_id: 'Ayah saya karyawan perusahaan.',
      word_breakdown: [
        { word: '父', reading: 'ちち', meaning: 'ayah (saya)' },
        { word: '会社員', reading: 'かいしゃいん', meaning: 'karyawan perusahaan' }
      ]
    },
    {
      japanese_text: 'お父さんは元気ですか。',
      furigana: 'おとうさんはげんきですか。',
      romaji: 'otousan wa genki desu ka.',
      meaning_id: 'Apakah ayah Anda sehat?',
      word_breakdown: [
        { word: 'お父さん', reading: 'おとうさん', meaning: 'ayah (Anda)' },
        { word: '元気', reading: 'げんき', meaning: 'sehat' }
      ]
    }
  ],
  '母': [
    {
      japanese_text: '母は料理が上手です。',
      furigana: 'ははりょうりがじょうずです。',
      romaji: 'haha wa ryouri ga jouzu desu.',
      meaning_id: 'Ibu saya pandai memasak.',
      word_breakdown: [
        { word: '母', reading: 'はは', meaning: 'ibu (saya)' },
        { word: '料理', reading: 'りょうり', meaning: 'masakan' },
        { word: '上手', reading: 'じょうず', meaning: 'pandai' }
      ]
    },
    {
      japanese_text: 'お母さんに電話しました。',
      furigana: 'おかあさんにでんわしました。',
      romaji: 'okaasan ni denwa shimashita.',
      meaning_id: 'Saya menelepon ibu.',
      word_breakdown: [
        { word: 'お母さん', reading: 'おかあさん', meaning: 'ibu (Anda)' },
        { word: '電話しました', reading: 'でんわしました', meaning: 'menelepon' }
      ]
    }
  ],
  '友': [
    {
      japanese_text: '友達と遊びます。',
      furigana: 'ともだちとあそびます。',
      romaji: 'tomodachi to asobimasu.',
      meaning_id: 'Bermain dengan teman.',
      word_breakdown: [
        { word: '友達', reading: 'ともだち', meaning: 'teman' },
        { word: '遊びます', reading: 'あそびます', meaning: 'bermain' }
      ]
    },
    {
      japanese_text: '親友が来ました。',
      furigana: 'しんゆうがきました。',
      romaji: 'shinyuu ga kimashita.',
      meaning_id: 'Sahabat datang.',
      word_breakdown: [
        { word: '親友', reading: 'しんゆう', meaning: 'sahabat' },
        { word: '来ました', reading: 'きました', meaning: 'datang' }
      ]
    }
  ],
  '名': [
    {
      japanese_text: '名前は何ですか。',
      furigana: 'なまえはなんですか。',
      romaji: 'namae wa nan desu ka.',
      meaning_id: 'Siapa namanya?',
      word_breakdown: [
        { word: '名前', reading: 'なまえ', meaning: 'nama' },
        { word: '何', reading: 'なん', meaning: 'apa' }
      ]
    },
    {
      japanese_text: '有名な歌手です。',
      furigana: 'ゆうめいなかしゅです。',
      romaji: 'yuumei na kashu desu.',
      meaning_id: 'Penyanyi terkenal.',
      word_breakdown: [
        { word: '有名', reading: 'ゆうめい', meaning: 'terkenal' },
        { word: '歌手', reading: 'かしゅ', meaning: 'penyanyi' }
      ]
    }
  ],
  '何': [
    {
      japanese_text: '何を食べますか。',
      furigana: 'なにをたべますか。',
      romaji: 'nani wo tabemasu ka.',
      meaning_id: 'Makan apa?',
      word_breakdown: [
        { word: '何', reading: 'なに', meaning: 'apa' },
        { word: '食べます', reading: 'たべます', meaning: 'makan' }
      ]
    },
    {
      japanese_text: '何時に起きますか。',
      furigana: 'なんじにおきますか。',
      romaji: 'nanji ni okimasu ka.',
      meaning_id: 'Jam berapa bangun?',
      word_breakdown: [
        { word: '何時', reading: 'なんじ', meaning: 'jam berapa' },
        { word: '起きます', reading: 'おきます', meaning: 'bangun' }
      ]
    }
  ],
  '休': [
    {
      japanese_text: '明日は休みです。',
      furigana: 'あしたはやすみです。',
      romaji: 'ashita wa yasumi desu.',
      meaning_id: 'Besok libur.',
      word_breakdown: [
        { word: '明日', reading: 'あした', meaning: 'besok' },
        { word: '休み', reading: 'やすみ', meaning: 'libur' }
      ]
    },
    {
      japanese_text: 'ちょっと休みましょう。',
      furigana: 'ちょっとやすみましょう。',
      romaji: 'chotto yasumimashou.',
      meaning_id: 'Mari istirahat sebentar.',
      word_breakdown: [
        { word: 'ちょっと', reading: 'ちょっと', meaning: 'sebentar' },
        { word: '休みましょう', reading: 'やすみましょう', meaning: 'mari istirahat' }
      ]
    }
  ],
  '国': [
    {
      japanese_text: '日本は美しい国です。',
      furigana: 'にほんはうつくしいくにです。',
      romaji: 'nihon wa utsukushii kuni desu.',
      meaning_id: 'Jepang adalah negara yang indah.',
      word_breakdown: [
        { word: '日本', reading: 'にほん', meaning: 'Jepang' },
        { word: '美しい', reading: 'うつくしい', meaning: 'indah' },
        { word: '国', reading: 'くに', meaning: 'negara' }
      ]
    },
    {
      japanese_text: '外国に行きたいです。',
      furigana: 'がいこくにいきたいです。',
      romaji: 'gaikoku ni ikitai desu.',
      meaning_id: 'Ingin pergi ke luar negeri.',
      word_breakdown: [
        { word: '外国', reading: 'がいこく', meaning: 'luar negeri' },
        { word: '行きたい', reading: 'いきたい', meaning: 'ingin pergi' }
      ]
    }
  ],
  '校': [
    {
      japanese_text: '学校に行きます。',
      furigana: 'がっこうにいきます。',
      romaji: 'gakkou ni ikimasu.',
      meaning_id: 'Pergi ke sekolah.',
      word_breakdown: [
        { word: '学校', reading: 'がっこう', meaning: 'sekolah' },
        { word: '行きます', reading: 'いきます', meaning: 'pergi' }
      ]
    },
    {
      japanese_text: '高校生です。',
      furigana: 'こうこうせいです。',
      romaji: 'koukousei desu.',
      meaning_id: 'Siswa SMA.',
      word_breakdown: [
        { word: '高校生', reading: 'こうこうせい', meaning: 'siswa SMA' }
      ]
    }
  ],
  '店': [
    {
      japanese_text: 'あの店で買いました。',
      furigana: 'あのみせでかいました。',
      romaji: 'ano mise de kaimashita.',
      meaning_id: 'Membeli di toko itu.',
      word_breakdown: [
        { word: 'あの', reading: 'あの', meaning: 'itu' },
        { word: '店', reading: 'みせ', meaning: 'toko' },
        { word: '買いました', reading: 'かいました', meaning: 'membeli' }
      ]
    },
    {
      japanese_text: '喫茶店で休みます。',
      furigana: 'きっさてんでやすみます。',
      romaji: 'kissaten de yasumimasu.',
      meaning_id: 'Istirahat di kedai kopi.',
      word_breakdown: [
        { word: '喫茶店', reading: 'きっさてん', meaning: 'kedai kopi' },
        { word: '休みます', reading: 'やすみます', meaning: 'istirahat' }
      ]
    }
  ],
  '駅': [
    {
      japanese_text: '駅まで歩きます。',
      furigana: 'えきまであるきます。',
      romaji: 'eki made arukimasu.',
      meaning_id: 'Jalan kaki sampai stasiun.',
      word_breakdown: [
        { word: '駅', reading: 'えき', meaning: 'stasiun' },
        { word: 'まで', reading: 'まで', meaning: 'sampai' },
        { word: '歩きます', reading: 'あるきます', meaning: 'jalan kaki' }
      ]
    },
    {
      japanese_text: '新宿駅で会いましょう。',
      furigana: 'しんじゅくえきであいましょう。',
      romaji: 'shinjuku eki de aimashou.',
      meaning_id: 'Mari bertemu di Stasiun Shinjuku.',
      word_breakdown: [
        { word: '新宿駅', reading: 'しんじゅくえき', meaning: 'Stasiun Shinjuku' },
        { word: '会いましょう', reading: 'あいましょう', meaning: 'mari bertemu' }
      ]
    }
  ],
  '会': [
    {
      japanese_text: '友達に会いました。',
      furigana: 'ともだちにあいました。',
      romaji: 'tomodachi ni aimashita.',
      meaning_id: 'Bertemu teman.',
      word_breakdown: [
        { word: '友達', reading: 'ともだち', meaning: 'teman' },
        { word: '会いました', reading: 'あいました', meaning: 'bertemu' }
      ]
    },
    {
      japanese_text: '会社で働いています。',
      furigana: 'かいしゃではたらいています。',
      romaji: 'kaisha de hataraiteimasu.',
      meaning_id: 'Bekerja di perusahaan.',
      word_breakdown: [
        { word: '会社', reading: 'かいしゃ', meaning: 'perusahaan' },
        { word: '働いています', reading: 'はたらいています', meaning: 'bekerja' }
      ]
    }
  ],
  '山': [
    {
      japanese_text: '山に登ります。',
      furigana: 'やまにのぼります。',
      romaji: 'yama ni noborimasu.',
      meaning_id: 'Mendaki gunung.',
      word_breakdown: [
        { word: '山', reading: 'やま', meaning: 'gunung' },
        { word: '登ります', reading: 'のぼります', meaning: 'mendaki' }
      ]
    },
    {
      japanese_text: '富士山はきれいです。',
      furigana: 'ふじさんはきれいです。',
      romaji: 'fujisan wa kirei desu.',
      meaning_id: 'Gunung Fuji indah.',
      word_breakdown: [
        { word: '富士山', reading: 'ふじさん', meaning: 'Gunung Fuji' },
        { word: 'きれい', reading: 'きれい', meaning: 'indah' }
      ]
    }
  ],
  '川': [
    {
      japanese_text: '川で魚を捕りました。',
      furigana: 'かわでさかなをとりました。',
      romaji: 'kawa de sakana wo torimashita.',
      meaning_id: 'Menangkap ikan di sungai.',
      word_breakdown: [
        { word: '川', reading: 'かわ', meaning: 'sungai' },
        { word: '魚', reading: 'さかな', meaning: 'ikan' },
        { word: '捕りました', reading: 'とりました', meaning: 'menangkap' }
      ]
    },
    {
      japanese_text: 'この川は深いです。',
      furigana: 'このかわはふかいです。',
      romaji: 'kono kawa wa fukai desu.',
      meaning_id: 'Sungai ini dalam.',
      word_breakdown: [
        { word: 'この', reading: 'この', meaning: 'ini' },
        { word: '川', reading: 'かわ', meaning: 'sungai' },
        { word: '深い', reading: 'ふかい', meaning: 'dalam' }
      ]
    }
  ],
  '行': [
    {
      japanese_text: '学校に行きます。',
      furigana: 'がっこうにいきます。',
      romaji: 'gakkou ni ikimasu.',
      meaning_id: 'Pergi ke sekolah.',
      word_breakdown: [
        { word: '学校', reading: 'がっこう', meaning: 'sekolah' },
        { word: '行きます', reading: 'いきます', meaning: 'pergi' }
      ]
    },
    {
      japanese_text: '銀行で働いています。',
      furigana: 'ぎんこうではたらいています。',
      romaji: 'ginkou de hataraiteimasu.',
      meaning_id: 'Bekerja di bank.',
      word_breakdown: [
        { word: '銀行', reading: 'ぎんこう', meaning: 'bank' },
        { word: '働いています', reading: 'はたらいています', meaning: 'bekerja' }
      ]
    }
  ],
  '来': [
    {
      japanese_text: '明日来てください。',
      furigana: 'あしたきてください。',
      romaji: 'ashita kite kudasai.',
      meaning_id: 'Tolong datang besok.',
      word_breakdown: [
        { word: '明日', reading: 'あした', meaning: 'besok' },
        { word: '来て', reading: 'きて', meaning: 'datang' }
      ]
    },
    {
      japanese_text: '来週会いましょう。',
      furigana: 'らいしゅうあいましょう。',
      romaji: 'raishuu aimashou.',
      meaning_id: 'Mari bertemu minggu depan.',
      word_breakdown: [
        { word: '来週', reading: 'らいしゅう', meaning: 'minggu depan' },
        { word: '会いましょう', reading: 'あいましょう', meaning: 'mari bertemu' }
      ]
    }
  ],
  '見': [
    {
      japanese_text: 'テレビを見ます。',
      furigana: 'テレビをみます。',
      romaji: 'terebi wo mimasu.',
      meaning_id: 'Menonton televisi.',
      word_breakdown: [
        { word: 'テレビ', reading: 'テレビ', meaning: 'televisi' },
        { word: '見ます', reading: 'みます', meaning: 'menonton' }
      ]
    },
    {
      japanese_text: '意見を聞かせてください。',
      furigana: 'いけんをきかせてください。',
      romaji: 'iken wo kikasete kudasai.',
      meaning_id: 'Tolong katakan pendapat Anda.',
      word_breakdown: [
        { word: '意見', reading: 'いけん', meaning: 'pendapat' },
        { word: '聞かせて', reading: 'きかせて', meaning: 'katakan' }
      ]
    }
  ],
  '聞': [
    {
      japanese_text: '音楽を聞きます。',
      furigana: 'おんがくをききます。',
      romaji: 'ongaku wo kikimasu.',
      meaning_id: 'Mendengarkan musik.',
      word_breakdown: [
        { word: '音楽', reading: 'おんがく', meaning: 'musik' },
        { word: '聞きます', reading: 'ききます', meaning: 'mendengarkan' }
      ]
    },
    {
      japanese_text: '質問を聞いてください。',
      furigana: 'しつもんをきいてください。',
      romaji: 'shitsumon wo kiite kudasai.',
      meaning_id: 'Tolong dengarkan pertanyaan.',
      word_breakdown: [
        { word: '質問', reading: 'しつもん', meaning: 'pertanyaan' },
        { word: '聞いて', reading: 'きいて', meaning: 'dengarkan' }
      ]
    }
  ],
  '読': [
    {
      japanese_text: '本を読みます。',
      furigana: 'ほんをよみます。',
      romaji: 'hon wo yomimasu.',
      meaning_id: 'Membaca buku.',
      word_breakdown: [
        { word: '本', reading: 'ほん', meaning: 'buku' },
        { word: '読みます', reading: 'よみます', meaning: 'membaca' }
      ]
    },
    {
      japanese_text: '新聞を読んでいます。',
      furigana: 'しんぶんをよんでいます。',
      romaji: 'shinbun wo yondeimasu.',
      meaning_id: 'Sedang membaca koran.',
      word_breakdown: [
        { word: '新聞', reading: 'しんぶん', meaning: 'koran' },
        { word: '読んでいます', reading: 'よんでいます', meaning: 'sedang membaca' }
      ]
    }
  ],
  '書': [
    {
      japanese_text: '手紙を書きます。',
      furigana: 'てがみをかきます。',
      romaji: 'tegami wo kakimasu.',
      meaning_id: 'Menulis surat.',
      word_breakdown: [
        { word: '手紙', reading: 'てがみ', meaning: 'surat' },
        { word: '書きます', reading: 'かきます', meaning: 'menulis' }
      ]
    },
    {
      japanese_text: '辞書で調べます。',
      furigana: 'じしょでしらべます。',
      romaji: 'jisho de shirabemasu.',
      meaning_id: 'Mencari di kamus.',
      word_breakdown: [
        { word: '辞書', reading: 'じしょ', meaning: 'kamus' },
        { word: '調べます', reading: 'しらべます', meaning: 'mencari' }
      ]
    }
  ],
  '話': [
    {
      japanese_text: '日本語を話します。',
      furigana: 'にほんごをはなします。',
      romaji: 'nihongo wo hanashimasu.',
      meaning_id: 'Berbicara bahasa Jepang.',
      word_breakdown: [
        { word: '日本語', reading: 'にほんご', meaning: 'bahasa Jepang' },
        { word: '話します', reading: 'はなします', meaning: 'berbicara' }
      ]
    },
    {
      japanese_text: '面白い話ですね。',
      furigana: 'おもしろいはなしですね。',
      romaji: 'omoshiroi hanashi desu ne.',
      meaning_id: 'Cerita yang menarik ya.',
      word_breakdown: [
        { word: '面白い', reading: 'おもしろい', meaning: 'menarik' },
        { word: '話', reading: 'はなし', meaning: 'cerita' }
      ]
    }
  ],
  '食': [
    {
      japanese_text: '朝ご飯を食べます。',
      furigana: 'あさごはんをたべます。',
      romaji: 'asagohan wo tabemasu.',
      meaning_id: 'Makan sarapan.',
      word_breakdown: [
        { word: '朝ご飯', reading: 'あさごはん', meaning: 'sarapan' },
        { word: '食べます', reading: 'たべます', meaning: 'makan' }
      ]
    },
    {
      japanese_text: '食事をしましょう。',
      furigana: 'しょくじをしましょう。',
      romaji: 'shokuji wo shimashou.',
      meaning_id: 'Mari makan.',
      word_breakdown: [
        { word: '食事', reading: 'しょくじ', meaning: 'makan' }
      ]
    }
  ],
  '飲': [
    {
      japanese_text: '水を飲みます。',
      furigana: 'みずをのみます。',
      romaji: 'mizu wo nomimasu.',
      meaning_id: 'Minum air.',
      word_breakdown: [
        { word: '水', reading: 'みず', meaning: 'air' },
        { word: '飲みます', reading: 'のみます', meaning: 'minum' }
      ]
    },
    {
      japanese_text: 'お酒を飲みますか。',
      furigana: 'おさけをのみますか。',
      romaji: 'osake wo nomimasu ka.',
      meaning_id: 'Apakah minum sake?',
      word_breakdown: [
        { word: 'お酒', reading: 'おさけ', meaning: 'sake/alkohol' },
        { word: '飲みます', reading: 'のみます', meaning: 'minum' }
      ]
    }
  ],
  '入': [
    {
      japanese_text: '部屋に入ります。',
      furigana: 'へやにはいります。',
      romaji: 'heya ni hairimasu.',
      meaning_id: 'Masuk ke kamar.',
      word_breakdown: [
        { word: '部屋', reading: 'へや', meaning: 'kamar' },
        { word: '入ります', reading: 'はいります', meaning: 'masuk' }
      ]
    },
    {
      japanese_text: '大学に入りました。',
      furigana: 'だいがくにはいりました。',
      romaji: 'daigaku ni hairimashita.',
      meaning_id: 'Masuk universitas.',
      word_breakdown: [
        { word: '大学', reading: 'だいがく', meaning: 'universitas' },
        { word: '入りました', reading: 'はいりました', meaning: 'masuk' }
      ]
    }
  ],
  '出': [
    {
      japanese_text: '外に出ます。',
      furigana: 'そとにでます。',
      romaji: 'soto ni demasu.',
      meaning_id: 'Keluar ke luar.',
      word_breakdown: [
        { word: '外', reading: 'そと', meaning: 'luar' },
        { word: '出ます', reading: 'でます', meaning: 'keluar' }
      ]
    },
    {
      japanese_text: '宿題を出してください。',
      furigana: 'しゅくだいをだしてください。',
      romaji: 'shukudai wo dashite kudasai.',
      meaning_id: 'Tolong serahkan PR.',
      word_breakdown: [
        { word: '宿題', reading: 'しゅくだい', meaning: 'PR' },
        { word: '出して', reading: 'だして', meaning: 'serahkan' }
      ]
    }
  ],
  '言': [
    {
      japanese_text: '何も言いません。',
      furigana: 'なにもいいません。',
      romaji: 'nani mo iimasen.',
      meaning_id: 'Tidak mengatakan apa-apa.',
      word_breakdown: [
        { word: '何も', reading: 'なにも', meaning: 'apa-apa' },
        { word: '言いません', reading: 'いいません', meaning: 'tidak mengatakan' }
      ]
    },
    {
      japanese_text: '方言が分かりません。',
      furigana: 'ほうげんがわかりません。',
      romaji: 'hougen ga wakarimasen.',
      meaning_id: 'Tidak mengerti dialek.',
      word_breakdown: [
        { word: '方言', reading: 'ほうげん', meaning: 'dialek' },
        { word: '分かりません', reading: 'わかりません', meaning: 'tidak mengerti' }
      ]
    }
  ],
  '生': [
    {
      japanese_text: '学生です。',
      furigana: 'がくせいです。',
      romaji: 'gakusei desu.',
      meaning_id: 'Pelajar.',
      word_breakdown: [
        { word: '学生', reading: 'がくせい', meaning: 'pelajar' }
      ]
    },
    {
      japanese_text: '生まれは東京です。',
      furigana: 'うまれはとうきょうです。',
      romaji: 'umare wa toukyou desu.',
      meaning_id: 'Lahir di Tokyo.',
      word_breakdown: [
        { word: '生まれ', reading: 'うまれ', meaning: 'lahir' },
        { word: '東京', reading: 'とうきょう', meaning: 'Tokyo' }
      ]
    }
  ],
  '高': [
    {
      japanese_text: 'この山は高いです。',
      furigana: 'このやまはたかいです。',
      romaji: 'kono yama wa takai desu.',
      meaning_id: 'Gunung ini tinggi.',
      word_breakdown: [
        { word: 'この', reading: 'この', meaning: 'ini' },
        { word: '山', reading: 'やま', meaning: 'gunung' },
        { word: '高い', reading: 'たかい', meaning: 'tinggi' }
      ]
    },
    {
      japanese_text: '高校で勉強します。',
      furigana: 'こうこうでべんきょうします。',
      romaji: 'koukou de benkyou shimasu.',
      meaning_id: 'Belajar di SMA.',
      word_breakdown: [
        { word: '高校', reading: 'こうこう', meaning: 'SMA' },
        { word: '勉強します', reading: 'べんきょうします', meaning: 'belajar' }
      ]
    }
  ],
  '安': [
    {
      japanese_text: 'この店は安いです。',
      furigana: 'このみせはやすいです。',
      romaji: 'kono mise wa yasui desu.',
      meaning_id: 'Toko ini murah.',
      word_breakdown: [
        { word: 'この', reading: 'この', meaning: 'ini' },
        { word: '店', reading: 'みせ', meaning: 'toko' },
        { word: '安い', reading: 'やすい', meaning: 'murah' }
      ]
    },
    {
      japanese_text: '安心してください。',
      furigana: 'あんしんしてください。',
      romaji: 'anshin shite kudasai.',
      meaning_id: 'Tolong tenang.',
      word_breakdown: [
        { word: '安心', reading: 'あんしん', meaning: 'tenang' },
        { word: 'して', reading: 'して', meaning: 'lakukan' }
      ]
    }
  ],
  '新': [
    {
      japanese_text: '新しい車を買いました。',
      furigana: 'あたらしいくるまをかいました。',
      romaji: 'atarashii kuruma wo kaimashita.',
      meaning_id: 'Membeli mobil baru.',
      word_breakdown: [
        { word: '新しい', reading: 'あたらしい', meaning: 'baru' },
        { word: '車', reading: 'くるま', meaning: 'mobil' },
        { word: '買いました', reading: 'かいました', meaning: 'membeli' }
      ]
    },
    {
      japanese_text: '新聞を読みます。',
      furigana: 'しんぶんをよみます。',
      romaji: 'shinbun wo yomimasu.',
      meaning_id: 'Membaca koran.',
      word_breakdown: [
        { word: '新聞', reading: 'しんぶん', meaning: 'koran' },
        { word: '読みます', reading: 'よみます', meaning: 'membaca' }
      ]
    }
  ],
  '古': [
    {
      japanese_text: '古い家です。',
      furigana: 'ふるいいえです。',
      romaji: 'furui ie desu.',
      meaning_id: 'Rumah lama.',
      word_breakdown: [
        { word: '古い', reading: 'ふるい', meaning: 'lama' },
        { word: '家', reading: 'いえ', meaning: 'rumah' }
      ]
    },
    {
      japanese_text: '中古の本を買います。',
      furigana: 'ちゅうこのほんをかいます。',
      romaji: 'chuuko no hon wo kaimasu.',
      meaning_id: 'Membeli buku bekas.',
      word_breakdown: [
        { word: '中古', reading: 'ちゅうこ', meaning: 'bekas' },
        { word: '本', reading: 'ほん', meaning: 'buku' },
        { word: '買います', reading: 'かいます', meaning: 'membeli' }
      ]
    }
  ],
  '長': [
    {
      japanese_text: '髪が長いです。',
      furigana: 'かみがながいです。',
      romaji: 'kami ga nagai desu.',
      meaning_id: 'Rambut panjang.',
      word_breakdown: [
        { word: '髪', reading: 'かみ', meaning: 'rambut' },
        { word: '長い', reading: 'ながい', meaning: 'panjang' }
      ]
    },
    {
      japanese_text: '社長に会いました。',
      furigana: 'しゃちょうにあいました。',
      romaji: 'shachou ni aimashita.',
      meaning_id: 'Bertemu direktur.',
      word_breakdown: [
        { word: '社長', reading: 'しゃちょう', meaning: 'direktur' },
        { word: '会いました', reading: 'あいました', meaning: 'bertemu' }
      ]
    }
  ],
  '多': [
    {
      japanese_text: '人が多いです。',
      furigana: 'ひとがおおいです。',
      romaji: 'hito ga ooi desu.',
      meaning_id: 'Banyak orang.',
      word_breakdown: [
        { word: '人', reading: 'ひと', meaning: 'orang' },
        { word: '多い', reading: 'おおい', meaning: 'banyak' }
      ]
    },
    {
      japanese_text: '多分明日来ます。',
      furigana: 'たぶんあしたきます。',
      romaji: 'tabun ashita kimasu.',
      meaning_id: 'Mungkin besok datang.',
      word_breakdown: [
        { word: '多分', reading: 'たぶん', meaning: 'mungkin' },
        { word: '明日', reading: 'あした', meaning: 'besok' },
        { word: '来ます', reading: 'きます', meaning: 'datang' }
      ]
    }
  ],
  '少': [
    {
      japanese_text: '少し待ってください。',
      furigana: 'すこしまってください。',
      romaji: 'sukoshi matte kudasai.',
      meaning_id: 'Tolong tunggu sebentar.',
      word_breakdown: [
        { word: '少し', reading: 'すこし', meaning: 'sebentar' },
        { word: '待って', reading: 'まって', meaning: 'tunggu' }
      ]
    },
    {
      japanese_text: '人が少ないです。',
      furigana: 'ひとがすくないです。',
      romaji: 'hito ga sukunai desu.',
      meaning_id: 'Sedikit orang.',
      word_breakdown: [
        { word: '人', reading: 'ひと', meaning: 'orang' },
        { word: '少ない', reading: 'すくない', meaning: 'sedikit' }
      ]
    }
  ],
  '白': [
    {
      japanese_text: '白い猫がいます。',
      furigana: 'しろいねこがいます。',
      romaji: 'shiroi neko ga imasu.',
      meaning_id: 'Ada kucing putih.',
      word_breakdown: [
        { word: '白い', reading: 'しろい', meaning: 'putih' },
        { word: '猫', reading: 'ねこ', meaning: 'kucing' }
      ]
    },
    {
      japanese_text: '面白い映画です。',
      furigana: 'おもしろいえいがです。',
      romaji: 'omoshiroi eiga desu.',
      meaning_id: 'Film yang menarik.',
      word_breakdown: [
        { word: '面白い', reading: 'おもしろい', meaning: 'menarik' },
        { word: '映画', reading: 'えいが', meaning: 'film' }
      ]
    }
  ],
  '電': [
    {
      japanese_text: '電車で行きます。',
      furigana: 'でんしゃでいきます。',
      romaji: 'densha de ikimasu.',
      meaning_id: 'Pergi dengan kereta.',
      word_breakdown: [
        { word: '電車', reading: 'でんしゃ', meaning: 'kereta' },
        { word: '行きます', reading: 'いきます', meaning: 'pergi' }
      ]
    },
    {
      japanese_text: '電話をかけます。',
      furigana: 'でんわをかけます。',
      romaji: 'denwa wo kakemasu.',
      meaning_id: 'Menelepon.',
      word_breakdown: [
        { word: '電話', reading: 'でんわ', meaning: 'telepon' },
        { word: 'かけます', reading: 'かけます', meaning: 'menelepon' }
      ]
    }
  ],
  '車': [
    {
      japanese_text: '車で来ました。',
      furigana: 'くるまできました。',
      romaji: 'kuruma de kimashita.',
      meaning_id: 'Datang dengan mobil.',
      word_breakdown: [
        { word: '車', reading: 'くるま', meaning: 'mobil' },
        { word: '来ました', reading: 'きました', meaning: 'datang' }
      ]
    },
    {
      japanese_text: '自転車に乗ります。',
      furigana: 'じてんしゃにのります。',
      romaji: 'jitensha ni norimasu.',
      meaning_id: 'Naik sepeda.',
      word_breakdown: [
        { word: '自転車', reading: 'じてんしゃ', meaning: 'sepeda' },
        { word: '乗ります', reading: 'のります', meaning: 'naik' }
      ]
    }
  ],
  '天': [
    {
      japanese_text: '今日は天気がいいです。',
      furigana: 'きょうはてんきがいいです。',
      romaji: 'kyou wa tenki ga ii desu.',
      meaning_id: 'Cuaca hari ini bagus.',
      word_breakdown: [
        { word: '今日', reading: 'きょう', meaning: 'hari ini' },
        { word: '天気', reading: 'てんき', meaning: 'cuaca' },
        { word: 'いい', reading: 'いい', meaning: 'bagus' }
      ]
    },
    {
      japanese_text: '天国のような場所です。',
      furigana: 'てんごくのようなばしょです。',
      romaji: 'tengoku no you na basho desu.',
      meaning_id: 'Tempat seperti surga.',
      word_breakdown: [
        { word: '天国', reading: 'てんごく', meaning: 'surga' },
        { word: 'ような', reading: 'ような', meaning: 'seperti' },
        { word: '場所', reading: 'ばしょ', meaning: 'tempat' }
      ]
    }
  ],
  '雨': [
    {
      japanese_text: '雨が降っています。',
      furigana: 'あめがふっています。',
      romaji: 'ame ga futteimasu.',
      meaning_id: 'Sedang hujan.',
      word_breakdown: [
        { word: '雨', reading: 'あめ', meaning: 'hujan' },
        { word: '降っています', reading: 'ふっています', meaning: 'sedang turun' }
      ]
    },
    {
      japanese_text: '梅雨の季節です。',
      furigana: 'つゆのきせつです。',
      romaji: 'tsuyu no kisetsu desu.',
      meaning_id: 'Musim hujan.',
      word_breakdown: [
        { word: '梅雨', reading: 'つゆ', meaning: 'musim hujan' },
        { word: '季節', reading: 'きせつ', meaning: 'musim' }
      ]
    }
  ],
  '花': [
    {
      japanese_text: 'きれいな花ですね。',
      furigana: 'きれいなはなですね。',
      romaji: 'kirei na hana desu ne.',
      meaning_id: 'Bunga yang indah ya.',
      word_breakdown: [
        { word: 'きれいな', reading: 'きれいな', meaning: 'indah' },
        { word: '花', reading: 'はな', meaning: 'bunga' }
      ]
    },
    {
      japanese_text: '花火を見ます。',
      furigana: 'はなびをみます。',
      romaji: 'hanabi wo mimasu.',
      meaning_id: 'Melihat kembang api.',
      word_breakdown: [
        { word: '花火', reading: 'はなび', meaning: 'kembang api' },
        { word: '見ます', reading: 'みます', meaning: 'melihat' }
      ]
    }
  ],
  '語': [
    {
      japanese_text: '日本語を勉強します。',
      furigana: 'にほんごをべんきょうします。',
      romaji: 'nihongo wo benkyou shimasu.',
      meaning_id: 'Belajar bahasa Jepang.',
      word_breakdown: [
        { word: '日本語', reading: 'にほんご', meaning: 'bahasa Jepang' },
        { word: '勉強します', reading: 'べんきょうします', meaning: 'belajar' }
      ]
    },
    {
      japanese_text: '英語が話せます。',
      furigana: 'えいごがはなせます。',
      romaji: 'eigo ga hanasemasu.',
      meaning_id: 'Bisa berbicara bahasa Inggris.',
      word_breakdown: [
        { word: '英語', reading: 'えいご', meaning: 'bahasa Inggris' },
        { word: '話せます', reading: 'はなせます', meaning: 'bisa berbicara' }
      ]
    }
  ],
  '本': [
    {
      japanese_text: '本を読みます。',
      furigana: 'ほんをよみます。',
      romaji: 'hon wo yomimasu.',
      meaning_id: 'Membaca buku.',
      word_breakdown: [
        { word: '本', reading: 'ほん', meaning: 'buku' },
        { word: '読みます', reading: 'よみます', meaning: 'membaca' }
      ]
    },
    {
      japanese_text: '日本に行きたいです。',
      furigana: 'にほんにいきたいです。',
      romaji: 'nihon ni ikitai desu.',
      meaning_id: 'Ingin pergi ke Jepang.',
      word_breakdown: [
        { word: '日本', reading: 'にほん', meaning: 'Jepang' },
        { word: '行きたい', reading: 'いきたい', meaning: 'ingin pergi' }
      ]
    }
  ],
  '手': [
    {
      japanese_text: '手を洗います。',
      furigana: 'てをあらいます。',
      romaji: 'te wo araimasu.',
      meaning_id: 'Mencuci tangan.',
      word_breakdown: [
        { word: '手', reading: 'て', meaning: 'tangan' },
        { word: '洗います', reading: 'あらいます', meaning: 'mencuci' }
      ]
    },
    {
      japanese_text: '上手に歌います。',
      furigana: 'じょうずにうたいます。',
      romaji: 'jouzu ni utaimasu.',
      meaning_id: 'Bernyanyi dengan baik.',
      word_breakdown: [
        { word: '上手', reading: 'じょうず', meaning: 'baik/pandai' },
        { word: '歌います', reading: 'うたいます', meaning: 'bernyanyi' }
      ]
    }
  ],
  '足': [
    {
      japanese_text: '足が痛いです。',
      furigana: 'あしがいたいです。',
      romaji: 'ashi ga itai desu.',
      meaning_id: 'Kaki sakit.',
      word_breakdown: [
        { word: '足', reading: 'あし', meaning: 'kaki' },
        { word: '痛い', reading: 'いたい', meaning: 'sakit' }
      ]
    },
    {
      japanese_text: '不足しています。',
      furigana: 'ふそくしています。',
      romaji: 'fusoku shiteimasu.',
      meaning_id: 'Sedang kekurangan.',
      word_breakdown: [
        { word: '不足', reading: 'ふそく', meaning: 'kekurangan' },
        { word: 'しています', reading: 'しています', meaning: 'sedang' }
      ]
    }
  ],
  '目': [
    {
      japanese_text: '目が大きいです。',
      furigana: 'めがおおきいです。',
      romaji: 'me ga ookii desu.',
      meaning_id: 'Mata besar.',
      word_breakdown: [
        { word: '目', reading: 'め', meaning: 'mata' },
        { word: '大きい', reading: 'おおきい', meaning: 'besar' }
      ]
    },
    {
      japanese_text: '注目してください。',
      furigana: 'ちゅうもくしてください。',
      romaji: 'chuumoku shite kudasai.',
      meaning_id: 'Tolong perhatikan.',
      word_breakdown: [
        { word: '注目', reading: 'ちゅうもく', meaning: 'perhatikan' },
        { word: 'して', reading: 'して', meaning: 'lakukan' }
      ]
    }
  ]
};

async function insertN5Examples() {
  try {
    console.log('🚀 Inserting high-quality N5 kanji examples...\n');
    
    // Get N5 kanji without examples
    const n5Kanji = await pool.query(`
      SELECT k.id, k.character
      FROM kanji k
      LEFT JOIN kanji_examples ke ON k.id = ke.kanji_id
      WHERE k.jlpt_level::text = 'N5' AND ke.id IS NULL
      ORDER BY k.id
    `);
    
    console.log(`📝 Found ${n5Kanji.rows.length} N5 kanji without examples\n`);
    
    let inserted = 0;
    let skipped = 0;
    
    for (const kanji of n5Kanji.rows) {
      const examples = n5Examples[kanji.character];
      
      if (!examples) {
        console.log(`⚠️  No examples defined for: ${kanji.character}`);
        skipped++;
        continue;
      }
      
      for (let i = 0; i < examples.length; i++) {
        const ex = examples[i];
        
        await pool.query(`
          INSERT INTO kanji_examples 
          (kanji_id, example_order, japanese_text, furigana, romaji, meaning_id, word_breakdown)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [
          kanji.id,
          i + 1,
          ex.japanese_text,
          ex.furigana,
          ex.romaji,
          ex.meaning_id,
          JSON.stringify(ex.word_breakdown)
        ]);
        
        inserted++;
      }
      
      if (inserted % 10 === 0) {
        console.log(`   ✓ Inserted ${inserted} examples...`);
      }
    }
    
    console.log(`\n✅ Successfully inserted ${inserted} examples for ${(inserted/2)} kanji!`);
    if (skipped > 0) {
      console.log(`⚠️  Skipped ${skipped} kanji (no examples defined yet)`);
    }
    
    // Verify
    const count = await pool.query(`
      SELECT COUNT(*) as total
      FROM kanji_examples ke
      JOIN kanji k ON ke.kanji_id = k.id
      WHERE k.jlpt_level::text = 'N5'
    `);
    
    console.log(`\n📊 Total N5 examples in database: ${count.rows[0].total}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

insertN5Examples();
