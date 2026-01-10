'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, LogOut, BookOpen, Users, Languages, ChevronRight, FileText, GraduationCap, BarChart3, Music, BrainCircuit } from 'lucide-react';
import { resources } from '@/lib/resources';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function Sidebar() {
  const pathname = usePathname();

  const menuGroups = {
    'Analytics': ['vw_user_progress_summary', 'vw_content_stats'],
    'User Management': ['users', 'study_sessions', 'user_progress'],
    'Basics & Kanji': ['hiragana', 'katakana', 'kanji', 'kanji_examples', 'kanji_compound'],
    'Vocabulary': ['vocabulary', 'vocabulary_examples'],
    'Grammar': ['grammar', 'grammar_examples'],
    'Reading & Convo': ['conversations', 'conversation_lines', 'reading_texts', 'reading_sentences'],
    'Quizzes & Tests': ['quiz_sets', 'quiz_questions', 'interactive_tests', 'memory_tests', 'translation_tests'],
    'JLPT Exams': ['jlpt_exams', 'jlpt_exam_sections', 'jlpt_reading_passages', 'jlpt_exam_questions'],
    'Assets': ['audio_files'],
  };
  
  const getIcon = (key) => {
    if (key.startsWith('vw_')) return BarChart3;
    if (['users', 'study_sessions', 'user_progress'].includes(key)) return Users;
    if (['hiragana', 'katakana', 'kanji', 'kanji_examples'].includes(key)) return Languages;
    if (key.includes('vocabulary')) return BookOpen;
    if (key.includes('grammar')) return BookOpen;
    if (key.includes('audio')) return Music;
    if (['quiz_sets', 'interactive_tests'].includes(key)) return BrainCircuit;
    if (key.includes('jlpt')) return GraduationCap;
    return FileText;
  };

  return (
    <aside className="relative z-20 hidden h-full w-72 flex-col border-r border-slate-200/50 bg-white/50 backdrop-blur-xl transition-all dark:border-white/5 dark:bg-[#020617]/40 lg:flex">
      {/* Header */}
      <div className="flex h-20 items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-600/20 ring-1 ring-white/20">
            <span className="font-bold text-lg">J</span>
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-800 dark:text-white">J-Learn</span>
        </div>
        <ThemeToggle />
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-8 pr-2 custom-scrollbar">
        {/* Dashboard Link */}
        <div>
          <Link 
            href="/admin" 
            className={cn(
              "group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300",
              pathname === "/admin" 
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/25 ring-1 ring-indigo-500/50" 
                : "text-slate-600 hover:bg-white hover:shadow-md hover:shadow-slate-200/50 hover:text-indigo-600 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:shadow-none dark:hover:text-white"
            )}
          >
            <LayoutDashboard size={20} className={cn(pathname === "/admin" ? "text-indigo-100" : "text-slate-400 group-hover:text-indigo-500 dark:text-slate-500 dark:group-hover:text-white")} />
            Dashboard
          </Link>
        </div>

        {/* Dynamic Resource Links */}
        {Object.entries(menuGroups).map(([groupName, items]) => (
          <div key={groupName} className="animate-in fade-in slide-in-from-left-2 duration-500">
            <h3 className="mb-3 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500/80">
              {groupName}
            </h3>
            <ul className="space-y-1">
              {items.map(key => {
                const config = resources[key];
                if (!config) return null;
                
                const href = `/admin/${key}`;
                const isActive = pathname.startsWith(href);
                const Icon = getIcon(key);

                return (
                  <li key={key}>
                    <Link 
                      href={href} 
                      className={cn(
                        "group flex items-center justify-between rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200",
                        isActive 
                          ? "bg-white text-indigo-700 shadow-sm ring-1 ring-slate-200 dark:bg-white/10 dark:text-white dark:ring-white/10 dark:shadow-none" 
                          : "text-slate-500 hover:bg-white/50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={18} className={cn(isActive ? "text-indigo-600 dark:text-indigo-300" : "text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-white/80")} />
                        <span className="truncate max-w-[130px]">{config.label}</span>
                      </div>
                      {isActive && <ChevronRight size={14} className="text-indigo-400/80 dark:text-white/50" />}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
        
        {/* Spacer */}
        <div className="h-10"></div>
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-100 p-4 dark:border-white/5 bg-gradient-to-t from-white/50 to-transparent dark:from-[#020617]/50">
        <button className="group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-500 transition-all hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-500/10 dark:hover:text-red-400">
          <LogOut size={20} className="text-slate-400 group-hover:text-red-500 dark:text-slate-500 dark:group-hover:text-red-400" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}