import { query } from '@/lib/db';
import KanjiList from '@/components/learning/KanjiList';

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
  return <KanjiList initialData={data} />;
}