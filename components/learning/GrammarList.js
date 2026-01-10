'use client';

import { useState } from 'react';
import LevelSelector from './LevelSelector';
import { ChevronDown, ChevronUp, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function GrammarList({ initialData }) {
  const [level, setLevel] = useState('N5');
  const [expandedId, setExpandedId] = useState(null);

  const filteredData = initialData.filter(g => String(g.jlpt_level || '').toUpperCase().trim() === level);

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-black text-slate-900 dark:text-white">Grammar</h1>
        <LevelSelector currentLevel={level} onSelect={setLevel} />
      </div>

      <div className="space-y-4">
        {filteredData.map((g) => (
          <div 
            key={g.id} 
            className="rounded-2xl bg-white dark:bg-[#0f172a] shadow-sm border border-slate-200 dark:border-white/10 overflow-hidden transition-all"
          >
            <button 
              onClick={() => setExpandedId(expandedId === g.id ? null : g.id)}
              className="w-full flex items-center justify-between p-6 text-left hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
            >
              <div>
                <h3 className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{g.pattern}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{g.title_id}</p>
              </div>
              {expandedId === g.id ? <ChevronUp /> : <ChevronDown />}
            </button>

            {expandedId === g.id && (
              <div className="p-6 pt-0 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-black/20">
                <div className="mt-4 space-y-4">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Structure</h4>
                    <p className="font-mono text-sm bg-white dark:bg-black/40 p-3 rounded-lg border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300">
                      {g.structure}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Explanation</h4>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                      {g.explanation_id}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}