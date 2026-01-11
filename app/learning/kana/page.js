import { query } from '@/lib/db';
import KanaChart from '@/components/learning/KanaChart';
import KanaQuizModal from '@/components/learning/KanaQuizModal';

async function getData() {
  const hiragana = (await query('SELECT * FROM hiragana ORDER BY id ASC')).rows;
  const katakana = (await query('SELECT * FROM katakana ORDER BY id ASC')).rows;
  
  // Fetch vocabulary
  const vocabulary = (await query(`
    SELECT id, word, hiragana, katakana, romaji, meaning_id, meaning_en 
    FROM vocabulary 
    WHERE (hiragana IS NOT NULL OR katakana IS NOT NULL) 
    AND romaji IS NOT NULL
    AND romaji ~ '^[\\x00-\\x7F]+$'
    AND length(romaji) > 1
    AND romaji ~ '[a-zA-Z0-9]{2,}'
    ORDER BY random() 
    LIMIT 300
  `)).rows;

  // Fetch sentences
  const sentences = (await query(`
    SELECT id, sentence, romaji, difficulty, type, meaning_id, meaning_en 
    FROM kana_sentences 
    ORDER BY random()
  `)).rows;

  return { hiragana, katakana, vocabulary, sentences };
}

export default async function KanaPage() {
  const { hiragana, katakana, vocabulary, sentences } = await getData();

  return (
    <div className="mx-auto max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center">
        <h1 className="text-4xl font-black text-slate-900 dark:text-white sm:text-5xl">
          Kana Chart
        </h1>
        <p className="mt-4 text-lg text-slate-500 dark:text-slate-400">
          The foundation of Japanese. Click on a character to hear its pronunciation.
        </p>
      </div>

      <div className="flex justify-center">
        <KanaQuizModal 
          hiragana={hiragana} 
          katakana={katakana} 
          vocabulary={vocabulary} 
          sentences={sentences} 
        />
      </div>

      <KanaChart hiragana={hiragana} katakana={katakana} />
    </div>
  );
}