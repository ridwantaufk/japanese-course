import { query } from '@/lib/db';
import { notFound } from 'next/navigation';
import FuriganaText from '@/components/learning/FuriganaText';
import ReadingTextViewer from '@/components/learning/ReadingTextViewer';

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

  return <ReadingTextViewer text={text} />;
}