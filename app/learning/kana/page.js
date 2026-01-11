import { query } from '@/lib/db';
import KanaChart from '@/components/learning/KanaChart';
import KanaQuizModal from '@/components/learning/KanaQuizModal';

async function getKana() {
  const hiragana = (await query('SELECT * FROM hiragana ORDER BY id ASC')).rows;
  const katakana = (await query('SELECT * FROM katakana ORDER BY id ASC')).rows;
  return { hiragana, katakana };
}

export default async function KanaPage() {
  const { hiragana, katakana } = await getKana();

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
        <KanaQuizModal hiragana={hiragana} katakana={katakana} />
      </div>

      <KanaChart hiragana={hiragana} katakana={katakana} />
    </div>
  );
}