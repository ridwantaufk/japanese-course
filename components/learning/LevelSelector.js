'use client';

import { cn } from '@/lib/utils';

export default function LevelSelector({ currentLevel, onSelect }) {
  const levels = ['N5', 'N4', 'N3', 'N2', 'N1'];
  
  const colors = {
    'N5': 'bg-emerald-500 text-white shadow-emerald-500/30',
    'N4': 'bg-teal-500 text-white shadow-teal-500/30',
    'N3': 'bg-cyan-500 text-white shadow-cyan-500/30',
    'N2': 'bg-blue-500 text-white shadow-blue-500/30',
    'N1': 'bg-indigo-500 text-white shadow-indigo-500/30',
  };

  return (
    <div className="flex flex-wrap justify-center gap-3">
      {levels.map((level) => (
        <button
          key={level}
          onClick={() => onSelect(level)}
          className={cn(
            "px-6 py-2 rounded-full text-sm font-bold transition-all transform hover:scale-105 active:scale-95 shadow-lg",
            currentLevel === level 
              ? colors[level]
              : "bg-white text-slate-500 hover:bg-slate-50 dark:bg-white/5 dark:text-slate-400 dark:hover:bg-white/10"
          )}
        >
          {level}
        </button>
      ))}
    </div>
  );
}