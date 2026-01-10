import Link from 'next/link';
import { query } from '@/lib/db';
import { BookOpen, Calendar, Clock } from 'lucide-react';

async function getReadings() {
  try {
    const res = await query('SELECT * FROM reading_texts ORDER BY id DESC');
    return res.rows;
  } catch (e) {
    return [];
  }
}

export default async function ReadingPage() {
  const readings = await getReadings();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-black text-slate-900 dark:text-white">Reading Practice</h1>
        <p className="text-slate-500 dark:text-slate-400">Improve your comprehension with stories and articles.</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {readings.map((text) => (
          <Link 
            key={text.id} 
            href={`/learning/reading/${text.id}`}
            className="group relative overflow-hidden rounded-3xl bg-white p-6 shadow-md transition-all hover:-translate-y-1 hover:shadow-xl dark:bg-[#0f172a] dark:shadow-none dark:ring-1 dark:ring-white/10"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <BookOpen size={80} />
            </div>
            
            <div className="flex items-center gap-2 mb-4">
              <span className={`px-3 py-1 rounded-full text-xs font-bold bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300`}>
                {text.jlpt_level}
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{text.content_type}</span>
            </div>

            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 line-clamp-2">{text.title_id}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3 mb-6">
              {text.summary_id || 'No summary available.'}
            </p>

            <div className="flex items-center gap-4 text-xs font-medium text-slate-400 border-t border-slate-100 pt-4 dark:border-white/5">
               {text.character_count && (
                 <span className="flex items-center gap-1">{text.character_count} chars</span>
               )}
            </div>
          </Link>
        ))}
      </div>
      
      {readings.length === 0 && (
        <div className="text-center py-20 text-slate-400">No reading texts found.</div>
      )}
    </div>
  );
}