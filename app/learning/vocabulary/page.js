import { query } from '@/lib/db';
import VocabDeck from '@/components/learning/VocabDeck';

async function getVocab() {
  try {
    const res = await query('SELECT * FROM vocabulary ORDER BY id ASC');
    return res.rows;
  } catch (e) {
    return [];
  }
}

export default async function VocabularyPage() {
  const data = await getVocab();
  return <VocabDeck initialData={data} />;
}