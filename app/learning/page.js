import Link from 'next/link';
import { query } from '@/lib/db';
import { BookOpen, GraduationCap, Languages, BrainCircuit, LayoutGrid, ArrowRight, Star } from 'lucide-react';

async function getStats() {
  try {
    const kanjiCount = (await query('SELECT COUNT(*) FROM kanji')).rows[0].count;
    const vocabCount = (await query('SELECT COUNT(*) FROM vocabulary')).rows[0].count;
    const grammarCount = (await query('SELECT COUNT(*) FROM grammar')).rows[0].count;
    return { kanji: kanjiCount, vocab: vocabCount, grammar: grammarCount };
  } catch (e) {
    return { kanji: 0, vocab: 0, grammar: 0 };
  }
}

export default async function LearningDashboard() {
  const stats = await getStats();

  const modules = [
    { 
      title: 'Kana Mastery', 
      desc: 'Master the 46 Hiragana & Katakana basics.', 
      href: '/learning/kana', 
      icon: Languages, 
      color: 'from-pink-500 to-rose-500', 
      count: '46 Characters' 
    },
    { 
      title: 'Kanji Library', 
      desc: 'Learn characters from N5 to N1 levels.', 
      href: '/learning/kanji', 
      icon: LayoutGrid, 
      color: 'from-orange-500 to-amber-500', 
      count: `${stats.kanji} Characters` 
    },
    { 
      title: 'Vocabulary', 
      desc: 'Expand your word bank for daily conversation.', 
      href: '/learning/vocabulary', 
      icon: BookOpen, 
      color: 'from-emerald-500 to-teal-500', 
      count: `${stats.vocab} Words` 
    },
    { 
      title: 'Grammar', 
      desc: 'Understand sentence structures and rules.', 
      href: '/learning/grammar', 
      icon: GraduationCap, 
      color: 'from-blue-500 to-indigo-500', 
      count: `${stats.grammar} Points` 
    },
    { 
      title: 'Quiz Challenge', 
      desc: 'Test your knowledge and track progress.', 
      href: '/learning/quiz', 
      icon: BrainCircuit, 
      color: 'from-violet-500 to-purple-500', 
      count: 'Unlimited' 
    },
  ];

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 px-6 py-12 sm:px-12 sm:py-16 shadow-2xl">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1528360983277-13d9012356ee?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent"></div>
        
        <div className="relative z-10 max-w-2xl">
          <div className="mb-4 inline-flex items-center rounded-full bg-pink-500/20 px-3 py-1 text-xs font-bold text-pink-300 backdrop-blur-md border border-pink-500/30">
            <Star size={12} className="mr-1 fill-pink-300" /> Start Learning Today
          </div>
          <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl">
            Master Japanese <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-orange-400">The Fun Way</span>
          </h1>
          <p className="mt-4 text-lg text-slate-300">
            Comprehensive resources from Hiragana to N1 Kanji. No login required, just pure learning.
          </p>
          <div className="mt-8 flex gap-4">
            <Link href="/learning/kana" className="rounded-full bg-white px-6 py-3 text-sm font-bold text-slate-900 transition-transform hover:scale-105 hover:bg-slate-100">
              Start with Kana
            </Link>
            <Link href="/learning/kanji" className="rounded-full bg-white/10 px-6 py-3 text-sm font-bold text-white backdrop-blur-md transition-all hover:bg-white/20 border border-white/10">
              Explore Kanji
            </Link>
          </div>
        </div>
      </div>

      {/* Modules Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {modules.map((mod) => (
          <Link 
            key={mod.title} 
            href={mod.href}
            className="group relative overflow-hidden rounded-3xl bg-white p-6 shadow-lg shadow-slate-200/50 transition-all hover:-translate-y-1 hover:shadow-xl dark:bg-[#0f172a] dark:shadow-none dark:ring-1 dark:ring-white/10"
          >
            <div className={`absolute right-[-20px] top-[-20px] h-32 w-32 rounded-full bg-gradient-to-br ${mod.color} opacity-10 blur-2xl transition-opacity group-hover:opacity-20`}></div>
            
            <div className="relative flex h-full flex-col justify-between">
              <div>
                <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${mod.color} text-white shadow-md`}>
                  <mod.icon size={24} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{mod.title}</h3>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{mod.desc}</p>
              </div>
              
              <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-white/5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{mod.count}</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 text-slate-400 transition-colors group-hover:bg-slate-900 group-hover:text-white dark:bg-white/5 dark:group-hover:bg-white dark:group-hover:text-slate-900">
                  <ArrowRight size={14} />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}