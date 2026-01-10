import { query } from '@/lib/db';
import { resources } from '@/lib/resources';
import Link from 'next/link';
import { ArrowRight, Database, TrendingUp, Users, FileText } from 'lucide-react';

async function getStats() {
  const stats = {};
  for (const [key, config] of Object.entries(resources)) {
    try {
      // Limit stats to main tables to avoid too many queries on dash
      if (['users', 'vocabulary', 'kanji', 'grammar', 'conversations', 'quiz_sets'].includes(key)) {
         const res = await query(`SELECT COUNT(*) FROM ${config.table}`);
         stats[key] = res.rows[0].count;
      }
    } catch (e) {
      stats[key] = 0;
    }
  }
  return stats;
}

export default async function AdminDashboard() {
  const stats = await getStats();

  const cards = [
    { label: 'Total Users', value: stats.users || 0, key: 'users', icon: Users, color: 'from-blue-500 to-indigo-600' },
    { label: 'Vocabulary', value: stats.vocabulary || 0, key: 'vocabulary', icon: FileText, color: 'from-emerald-500 to-teal-600' },
    { label: 'Kanji', value: stats.kanji || 0, key: 'kanji', icon: FileText, color: 'from-orange-500 to-red-600' },
    { label: 'Grammar', value: stats.grammar || 0, key: 'grammar', icon: FileText, color: 'from-purple-500 to-pink-600' },
    { label: 'Conversations', value: stats.conversations || 0, key: 'conversations', icon: Database, color: 'from-cyan-500 to-blue-600' },
    { label: 'Quizzes', value: stats.quiz_sets || 0, key: 'quiz_sets', icon: Database, color: 'from-yellow-500 to-orange-600' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-400">
          Dashboard
        </h1>
        <p className="text-slate-500 dark:text-slate-400">Overview of your learning content and users.</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <div key={card.key} className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-xl shadow-slate-200/50 transition-all hover:-translate-y-1 hover:shadow-2xl dark:bg-white/5 dark:shadow-none dark:hover:bg-white/10 border border-slate-100 dark:border-white/5">
            <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br ${card.color} opacity-10 blur-2xl transition-opacity group-hover:opacity-20`}></div>
            
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{card.label}</p>
                <p className="mt-2 text-3xl font-bold text-slate-800 dark:text-white">{card.value}</p>
              </div>
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${card.color} text-white shadow-lg`}>
                <card.icon size={24} />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-white/5">
              <Link 
                href={`/admin/${card.key}`} 
                className="flex items-center gap-2 text-sm font-semibold text-indigo-600 transition-colors hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                Manage Data
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white/50 p-6 backdrop-blur-sm dark:border-white/5 dark:bg-white/5">
        <h2 className="mb-4 text-lg font-semibold text-slate-800 dark:text-white">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
            {['users', 'vocabulary', 'conversations'].map(res => (
                <Link 
                    key={res}
                    href={`/admin/${res}/new`}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 hover:text-indigo-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
                >
                    + Add {resources[res].label}
                </Link>
            ))}
        </div>
      </div>
    </div>
  );
}