const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
  user: 'postgres',
  password: 'root',
  host: 'localhost',
  port: 5432,
  database: 'japanese_course'
});

// Fungsi untuk konversi hiragana ke romaji
function hiraganaToRomaji(hiragana) {
  const romajiMap = {
    'あ': 'a', 'い': 'i', 'う': 'u', 'え': 'e', 'お': 'o',
    'か': 'ka', 'き': 'ki', 'く': 'ku', 'け': 'ke', 'こ': 'ko',
    'が': 'ga', 'ぎ': 'gi', 'ぐ': 'gu', 'げ': 'ge', 'ご': 'go',
    'さ': 'sa', 'し': 'shi', 'す': 'su', 'せ': 'se', 'そ': 'so',
    'ざ': 'za', 'じ': 'ji', 'ず': 'zu', 'ぜ': 'ze', 'ぞ': 'zo',
    'た': 'ta', 'ち': 'chi', 'つ': 'tsu', 'て': 'te', 'と': 'to',
    'だ': 'da', 'ぢ': 'ji', 'づ': 'zu', 'で': 'de', 'ど': 'do',
    'な': 'na', 'に': 'ni', 'ぬ': 'nu', 'ね': 'ne', 'の': 'no',
    'は': 'ha', 'ひ': 'hi', 'ふ': 'fu', 'へ': 'he', 'ほ': 'ho',
    'ば': 'ba', 'び': 'bi', 'ぶ': 'bu', 'べ': 'be', 'ぼ': 'bo',
    'ぱ': 'pa', 'ぴ': 'pi', 'ぷ': 'pu', 'ぺ': 'pe', 'ぽ': 'po',
    'ま': 'ma', 'み': 'mi', 'む': 'mu', 'め': 'me', 'も': 'mo',
    'や': 'ya', 'ゆ': 'yu', 'よ': 'yo',
    'ら': 'ra', 'り': 'ri', 'る': 'ru', 'れ': 're', 'ろ': 'ro',
    'わ': 'wa', 'ゐ': 'wi', 'ゑ': 'we', 'を': 'wo', 'ん': 'n',
    'きゃ': 'kya', 'きゅ': 'kyu', 'きょ': 'kyo',
    'しゃ': 'sha', 'しゅ': 'shu', 'しょ': 'sho',
    'ちゃ': 'cha', 'ちゅ': 'chu', 'ちょ': 'cho',
    'にゃ': 'nya', 'にゅ': 'nyu', 'にょ': 'nyo',
    'ひゃ': 'hya', 'ひゅ': 'hyu', 'ひょ': 'hyo',
    'みゃ': 'mya', 'みゅ': 'myu', 'みょ': 'myo',
    'りゃ': 'rya', 'りゅ': 'ryu', 'りょ': 'ryo',
    'ぎゃ': 'gya', 'ぎゅ': 'gyu', 'ぎょ': 'gyo',
    'じゃ': 'ja', 'じゅ': 'ju', 'じょ': 'jo',
    'びゃ': 'bya', 'びゅ': 'byu', 'びょ': 'byo',
    'ぴゃ': 'pya', 'ぴゅ': 'pyu', 'ぴょ': 'pyo',
    'ー': '-'
  };

  let result = '';
  let i = 0;
  
  while (i < hiragana.length) {
    // Try two-character combinations first
    if (i < hiragana.length - 1) {
      const twoChar = hiragana.substring(i, i + 2);
      if (romajiMap[twoChar]) {
        result += romajiMap[twoChar];
        i += 2;
        continue;
      }
    }
    
    // Then try single character
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

// Fungsi untuk konversi katakana ke romaji
function katakanaToRomaji(katakana) {
  const romajiMap = {
    'ア': 'a', 'イ': 'i', 'ウ': 'u', 'エ': 'e', 'オ': 'o',
    'カ': 'ka', 'キ': 'ki', 'ク': 'ku', 'ケ': 'ke', 'コ': 'ko',
    'ガ': 'ga', 'ギ': 'gi', 'グ': 'gu', 'ゲ': 'ge', 'ゴ': 'go',
    'サ': 'sa', 'シ': 'shi', 'ス': 'su', 'セ': 'se', 'ソ': 'so',
    'ザ': 'za', 'ジ': 'ji', 'ズ': 'zu', 'ゼ': 'ze', 'ゾ': 'zo',
    'タ': 'ta', 'チ': 'chi', 'ツ': 'tsu', 'テ': 'te', 'ト': 'to',
    'ダ': 'da', 'ヂ': 'ji', 'ヅ': 'zu', 'デ': 'de', 'ド': 'do',
    'ナ': 'na', 'ニ': 'ni', 'ヌ': 'nu', 'ネ': 'ne', 'ノ': 'no',
    'ハ': 'ha', 'ヒ': 'hi', 'フ': 'fu', 'ヘ': 'he', 'ホ': 'ho',
    'バ': 'ba', 'ビ': 'bi', 'ブ': 'bu', 'ベ': 'be', 'ボ': 'bo',
    'パ': 'pa', 'ピ': 'pi', 'プ': 'pu', 'ペ': 'pe', 'ポ': 'po',
    'マ': 'ma', 'ミ': 'mi', 'ム': 'mu', 'メ': 'me', 'モ': 'mo',
    'ヤ': 'ya', 'ユ': 'yu', 'ヨ': 'yo',
    'ラ': 'ra', 'リ': 'ri', 'ル': 'ru', 'レ': 're', 'ロ': 'ro',
    'ワ': 'wa', 'ヰ': 'wi', 'ヱ': 'we', 'ヲ': 'wo', 'ン': 'n',
    'キャ': 'kya', 'キュ': 'kyu', 'キョ': 'kyo',
    'シャ': 'sha', 'シュ': 'shu', 'ショ': 'sho',
    'チャ': 'cha', 'チュ': 'chu', 'チョ': 'cho',
    'ニャ': 'nya', 'ニュ': 'nyu', 'ニョ': 'nyo',
    'ヒャ': 'hya', 'ヒュ': 'hyu', 'ヒョ': 'hyo',
    'ミャ': 'mya', 'ミュ': 'myu', 'ミョ': 'myo',
    'リャ': 'rya', 'リュ': 'ryu', 'リョ': 'ryo',
    'ギャ': 'gya', 'ギュ': 'gyu', 'ギョ': 'gyo',
    'ジャ': 'ja', 'ジュ': 'ju', 'ジョ': 'jo',
    'ビャ': 'bya', 'ビュ': 'byu', 'ビョ': 'byo',
    'ピャ': 'pya', 'ピュ': 'pyu', 'ピョ': 'pyo',
    'ー': '-'
  };

  let result = '';
  let i = 0;
  
  while (i < katakana.length) {
    // Try two-character combinations first
    if (i < katakana.length - 1) {
      const twoChar = katakana.substring(i, i + 2);
      if (romajiMap[twoChar]) {
        result += romajiMap[twoChar];
        i += 2;
        continue;
      }
    }
    
    // Then try single character
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
  if (!text) return '';
  
  // If already contains latin characters, assume it's already romaji
  if (/[a-zA-Z]/.test(text)) {
    return text;
  }
  
  // Check if hiragana or katakana
  const isHiragana = /[\u3040-\u309F]/.test(text);
  const isKatakana = /[\u30A0-\u30FF]/.test(text);
  
  if (isHiragana) {
    return hiraganaToRomaji(text);
  } else if (isKatakana) {
    return katakanaToRomaji(text);
  }
  
  return text;
}

async function fixDataConsistency() {
  try {
    console.log('🔍 Checking data consistency...\n');
    
    // Fetch all kanji
    const result = await pool.query(`
      SELECT id, character, meaning_en, meaning_id, onyomi, kunyomi, 
             category, word_type, jlpt_level, radical, stroke_count
      FROM kanji 
      ORDER BY jlpt_level, id
    `);
    
    console.log(`📚 Total: ${result.rows.length} kanji\n`);
    
    let updates = [];
    let issues = {
      missingMeaningId: 0,
      emptyOnyomi: 0,
      emptyKunyomi: 0,
      needsRomaji: 0,
      fixed: 0
    };
    
    console.log('🔄 Analyzing and fixing data...\n');
    
    for (const kanji of result.rows) {
      let needsUpdate = false;
      let updateFields = {};
      
      // Parse JSONB arrays
      const onyomiArr = Array.isArray(kanji.onyomi) ? kanji.onyomi : 
                        (kanji.onyomi && kanji.onyomi.length > 0 ? JSON.parse(kanji.onyomi) : []);
      const kunyomiArr = Array.isArray(kanji.kunyomi) ? kanji.kunyomi : 
                         (kanji.kunyomi && kanji.kunyomi.length > 0 ? JSON.parse(kanji.kunyomi) : []);
      
      // Check for empty arrays
      if (onyomiArr.length === 0) issues.emptyOnyomi++;
      if (kunyomiArr.length === 0) issues.emptyKunyomi++;
      
      // Check and add romaji to readings
      let onyomiUpdated = false;
      let kunyomiUpdated = false;
      
      const newOnyomi = onyomiArr.map(item => {
        if (typeof item === 'string') {
          // Old format, convert to object with romaji
          onyomiUpdated = true;
          issues.needsRomaji++;
          return {
            kana: item,
            romaji: toRomaji(item)
          };
        } else if (item && !item.romaji) {
          // Has kana but missing romaji
          onyomiUpdated = true;
          issues.needsRomaji++;
          return {
            ...item,
            romaji: toRomaji(item.kana || '')
          };
        }
        return item;
      });
      
      const newKunyomi = kunyomiArr.map(item => {
        if (typeof item === 'string') {
          // Old format, convert to object with romaji
          kunyomiUpdated = true;
          issues.needsRomaji++;
          return {
            kana: item,
            romaji: toRomaji(item)
          };
        } else if (item && !item.romaji) {
          // Has kana but missing romaji
          kunyomiUpdated = true;
          issues.needsRomaji++;
          return {
            ...item,
            romaji: toRomaji(item.kana || '')
          };
        }
        return item;
      });
      
      if (onyomiUpdated) {
        updateFields.onyomi = JSON.stringify(newOnyomi);
        needsUpdate = true;
      }
      
      if (kunyomiUpdated) {
        updateFields.kunyomi = JSON.stringify(newKunyomi);
        needsUpdate = true;
      }
      
      // Check meaning_id
      if (!kanji.meaning_id || kanji.meaning_id.trim() === '') {
        issues.missingMeaningId++;
        if (kanji.meaning_en) {
          // Use first word of English meaning as Indonesian meaning
          updateFields.meaning_id = kanji.meaning_en.split(',')[0].trim();
          needsUpdate = true;
        }
      }
      
      if (needsUpdate) {
        updates.push({
          id: kanji.id,
          character: kanji.character,
          fields: updateFields
        });
        issues.fixed++;
      }
    }
    
    console.log('📊 Issues found:');
    console.log(`   - Missing meaning_id: ${issues.missingMeaningId}`);
    console.log(`   - Empty onyomi: ${issues.emptyOnyomi}`);
    console.log(`   - Empty kunyomi: ${issues.emptyKunyomi}`);
    console.log(`   - Readings needing romaji: ${issues.needsRomaji}`);
    console.log(`   - Total records to fix: ${issues.fixed}\n`);
    
    if (updates.length > 0) {
      console.log('💾 Applying fixes...\n');
      
      for (const update of updates) {
        const fields = [];
        const values = [];
        let paramIndex = 1;
        
        if (update.fields.onyomi) {
          fields.push(`onyomi = $${paramIndex++}::jsonb`);
          values.push(update.fields.onyomi);
        }
        
        if (update.fields.kunyomi) {
          fields.push(`kunyomi = $${paramIndex++}::jsonb`);
          values.push(update.fields.kunyomi);
        }
        
        if (update.fields.meaning_id) {
          fields.push(`meaning_id = $${paramIndex++}`);
          values.push(update.fields.meaning_id);
        }
        
        values.push(update.id);
        
        await pool.query(
          `UPDATE kanji SET ${fields.join(', ')} WHERE id = $${paramIndex}`,
          values
        );
        
        if (updates.indexOf(update) % 50 === 0) {
          console.log(`   ✓ Fixed ${updates.indexOf(update) + 1}/${updates.length}...`);
        }
      }
      
      console.log('\n✅ All fixes applied successfully!');
    } else {
      console.log('✅ No fixes needed - data is already consistent!');
    }
    
    // Show sample of fixed data
    console.log('\n📋 Sample of improved data (first 10 records):');
    console.log('=' .repeat(80));
    
    const samples = await pool.query(`
      SELECT id, character, meaning_en, onyomi, kunyomi, category, word_type
      FROM kanji
      ORDER BY id
      LIMIT 10
    `);
    
    for (const row of samples.rows) {
      console.log(`\n${row.id}. ${row.character}`);
      console.log(`   Meaning: ${row.meaning_en}`);
      console.log(`   Onyomi: ${JSON.stringify(row.onyomi, null, 2).substring(0, 100)}...`);
      console.log(`   Kunyomi: ${JSON.stringify(row.kunyomi, null, 2).substring(0, 100)}...`);
      console.log(`   Category: ${row.category}`);
      console.log(`   Word Type: ${row.word_type}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

fixDataConsistency();
