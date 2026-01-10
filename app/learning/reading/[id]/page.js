import { query } from '@/lib/db';
import { notFound } from 'next/navigation';
import FuriganaText from '@/components/learning/FuriganaText';

async function getReading(id) {
  try {
    const res = await query('SELECT * FROM reading_texts WHERE id = $1', [id]);
    return res.rows[0];
  } catch (e) {
    return null;
  }
}

export default async function ReadingDetail({ params }) {
  const { id } = await params;
  const text = await getReading(id);

  if (!text) return notFound();

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center space-y-4 border-b border-slate-200 dark:border-white/10 pb-8">
        <span className="px-3 py-1 rounded-full bg-pink-100 text-pink-700 text-xs font-bold dark:bg-pink-900/30 dark:text-pink-300">
          {text.jlpt_level}
        </span>
        <h1 className="text-4xl font-black text-slate-900 dark:text-white">{text.title_id}</h1>
        <h2 className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{text.title_ja}</h2>
      </div>

      <div className="prose prose-lg dark:prose-invert mx-auto bg-white dark:bg-[#0f172a] p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-white/5">
        {/* Simple rendering. Ideally, we need structured sentence data. 
            If japanese_text is raw string, we just display it. 
            If we have structured sentences, we use FuriganaText.
            Assuming raw text for now or simple component usage if structured data unavailable.
        */}
        <div className="text-2xl leading-loose font-serif text-slate-800 dark:text-slate-200">
           {/* If text has furigana structure stored, we need to parse it. 
               For now, displaying raw text. In future, use a parser or reading_sentences table. */}
           {text.japanese_text}
        </div>
        
        <div className="mt-8 pt-8 border-t border-slate-100 dark:border-white/5">
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4">Translation</h3>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            {text.meaning_id}
          </p>
        </div>
      </div>
    </div>
  );
}