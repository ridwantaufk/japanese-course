import { query } from '@/lib/db';
import { notFound } from 'next/navigation';
import ExamRunner from '@/components/learning/exam/ExamRunner';

async function getExamData(id) {
  try {
    // 1. Get Exam
    const examRes = await query('SELECT * FROM jlpt_exams WHERE id = $1', [id]);
    if (examRes.rows.length === 0) return null;
    const exam = examRes.rows[0];

    // 2. Get Sections
    const sectionsRes = await query('SELECT * FROM jlpt_exam_sections WHERE exam_id = $1 ORDER BY section_order ASC', [id]);
    const sections = sectionsRes.rows;

    // 3. Get Questions for ALL Sections
    // Optimized: Fetch all questions for this exam's sections in one go
    if (sections.length > 0) {
        const sectionIds = sections.map(s => s.id);
        const questionsRes = await query(`
            SELECT * FROM jlpt_exam_questions 
            WHERE section_id = ANY($1) 
            ORDER BY question_number ASC
        `, [sectionIds]);
        
        // Map questions to their sections
        const questionsBySection = {};
        questionsRes.rows.forEach(q => {
            if (!questionsBySection[q.section_id]) questionsBySection[q.section_id] = [];
            questionsBySection[q.section_id].push(q);
        });

        // Attach questions to section objects
        sections.forEach(s => {
            s.questions = questionsBySection[s.id] || [];
        });
    }

    return { exam, sections };
  } catch (e) {
    console.error(e);
    return null;
  }
}

export default async function ExamPage({ params }) {
  const { id } = await params;
  const data = await getExamData(id);

  if (!data) return notFound();

  // Validate if valid exam (has sections AND questions)
  const totalQuestions = data.sections.reduce((acc, s) => acc + (s.questions?.length || 0), 0);

  if (data.sections.length === 0 || totalQuestions === 0) {
      return (
        <div className="min-h-screen flex items-center justify-center text-center p-8 bg-slate-50 dark:bg-[#020617]">
            <div>
                <h1 className="text-3xl font-black text-slate-300 mb-2">Construction In Progress</h1>
                <p className="text-slate-500 max-w-md mx-auto">
                    The exam <strong>{data.exam.title_id}</strong> structure exists, but the questions haven&apos;t been uploaded to the database yet.
                </p>
            </div>
        </div>
      );
  }

  return <ExamRunner exam={data.exam} sections={data.sections} />;
}