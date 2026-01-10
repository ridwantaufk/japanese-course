import { query } from '@/lib/db';
import GrammarList from '@/components/learning/GrammarList';

async function getGrammar() {
  try {
    const res = await query('SELECT * FROM grammar ORDER BY id ASC');
    return res.rows;
  } catch (e) {
    return [];
  }
}

export default async function GrammarPage() {
  const data = await getGrammar();
  return <GrammarList initialData={data} />;
}