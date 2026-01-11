import { Suspense } from 'react';
import { query } from '@/lib/db';
import KanjiList from '@/components/learning/KanjiList';
import { Loader2 } from 'lucide-react';

async function getKanji() {
  try {
    const res = await query('SELECT * FROM kanji ORDER BY id ASC');
    return res.rows;
  } catch (e) {
    console.error(e);
    return [];
  }
}

export default async function KanjiPage() {
  const data = await getKanji();
  
  return (
    <Suspense fallback={
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    }>
      <KanjiList initialData={data} />
    </Suspense>
  );
}