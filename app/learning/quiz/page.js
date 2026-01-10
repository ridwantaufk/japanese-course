import { query } from '@/lib/db';
import QuizRunner from '@/components/learning/QuizRunner';

async function getQuizzes() {
  try {
    const res = await query('SELECT * FROM quiz_sets WHERE is_active = true ORDER BY id DESC');
    return res.rows;
  } catch (e) {
    return [];
  }
}

export default async function QuizPage() {
  const data = await getQuizzes();
  return <QuizRunner initialData={data} />;
}