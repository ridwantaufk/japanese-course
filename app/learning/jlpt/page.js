import Link from 'next/link';
import { query } from '@/lib/db';
import { GraduationCap, Timer, FileText } from 'lucide-react';

async function getExams() {
  try {
    // Only fetch exams that actually have sections
    const res = await query(`
      SELECT e.*, COUNT(s.id) as section_count
      FROM jlpt_exams e
      INNER JOIN jlpt_exam_sections s ON e.id = s.exam_id
      WHERE e.is_active = true
      GROUP BY e.id
      ORDER BY e.exam_year DESC, e.jlpt_level ASC
    `);
    return res.rows;
  } catch (e) {
    return [];
  }
}

export default async function JLPTPage() {
  const exams = await getExams();

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-black text-slate-900 dark:text-white">JLPT Simulation</h1>
        <p className="text-slate-500 dark:text-slate-400">Full-length practice exams to gauge your readiness.</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {exams.map((exam) => (
          <Link 
            key={exam.id} 
            href={`/learning/jlpt/${exam.id}`}
            className="group relative overflow-hidden rounded-3xl bg-white p-8 shadow-lg shadow-slate-200/50 transition-all hover:-translate-y-1 hover:shadow-xl dark:bg-[#0f172a] dark:shadow-none dark:ring-1 dark:ring-white/10"
          >
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
              <GraduationCap size={100} />
            </div>
            
            <span className="inline-block px-4 py-1.5 rounded-full bg-slate-900 text-white text-xs font-bold mb-6 dark:bg-white dark:text-slate-900">
              {exam.jlpt_level || 'General'}
            </span>

            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 line-clamp-2">{exam.title_id || 'Practice Test'}</h3>
            <p className="text-sm font-medium text-slate-400 mb-8">{exam.exam_year ? `Year ${exam.exam_year}` : 'Practice Exam'}</p>

            <div className="flex items-center gap-6 text-sm font-bold text-slate-500 border-t border-slate-100 pt-6 dark:border-white/5 dark:text-slate-400">
               <span className="flex items-center gap-2"><Timer size={16} /> {exam.total_time} min</span>
               <span className="flex items-center gap-2"><FileText size={16} /> {exam.section_count} Sections</span>
            </div>
          </Link>
        ))}
      </div>
      
      {exams.length === 0 && (
        <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200 dark:bg-white/5 dark:border-white/10">
            <GraduationCap size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500 font-medium">No complete exams available.</p>
        </div>
      )}
    </div>
  );
}