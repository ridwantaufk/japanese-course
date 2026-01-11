import { Suspense } from 'react';
import { query } from '@/lib/db';
import VocabularyList from '@/components/learning/VocabularyList';
import { Loader2 } from 'lucide-react';

async function getVocabulary() {
  try {
    const res = await query(`
      SELECT 
        v.id,
        v.word,
        COALESCE(v.furigana, v.hiragana, v.katakana) as reading,
        v.hiragana,
        v.katakana,
        v.furigana,
        v.romaji,
        v.meaning_id,
        v.meaning_en,
        v.jlpt_level,
        v.word_category as word_type,
        v.word_topic as category,
        v.formality,
        v.audio_url,
        v.pitch_accent,
        v.frequency_rank,
        v.is_common,
        v.tags,
        v.usage_notes_id,
        COUNT(ve.id) as example_count
      FROM vocabulary v
      LEFT JOIN vocabulary_examples ve ON v.id = ve.vocabulary_id
      GROUP BY v.id
      ORDER BY v.jlpt_level DESC, v.frequency_rank ASC
    `);
    return res.rows;
  } catch (e) {
    console.error('Error fetching vocabulary:', e);
    return [];
  }
}

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
    </div>
  );
}

export default async function VocabularyPage() {
  const data = await getVocabulary();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Suspense fallback={<LoadingFallback />}>
        <VocabularyList initialData={data} />
      </Suspense>
    </div>
  );
}