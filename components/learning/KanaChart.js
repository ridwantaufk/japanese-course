'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Volume2 } from 'lucide-react';

export default function KanaChart({ hiragana, katakana }) {
  const [activeTab, setActiveTab] = useState('hiragana');
  const data = activeTab === 'hiragana' ? hiragana : katakana;

  // Group by row (a, ka, sa, ta, na...) for standard layout
  // We can assume standard ordering or just grid flow. Grid flow is easier.
  
  const playAudio = (url) => {
    if (!url) return;
    const audio = new Audio(url);
    audio.play().catch(e => console.log('Audio play error', e));
  };

  return (
    <div className="space-y-8">
      {/* Tabs */}
      <div className="flex justify-center">
        <div className="inline-flex rounded-full bg-slate-100 p-1 dark:bg-white/5">
          {['hiragana', 'katakana'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "rounded-full px-8 py-2 text-sm font-bold capitalize transition-all",
                activeTab === tab 
                  ? "bg-white text-slate-900 shadow-md dark:bg-slate-800 dark:text-white" 
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-5 gap-4 sm:gap-6">
        {data.map((char) => (
          <div 
            key={char.id}
            onClick={() => playAudio(char.audio_url)}
            className="group relative aspect-square cursor-pointer flex flex-col items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 transition-all hover:-translate-y-1 hover:shadow-lg hover:ring-pink-400/50 dark:bg-[#0f172a] dark:ring-white/10 dark:hover:ring-pink-500/50"
          >
            <span className="text-4xl font-black text-slate-800 dark:text-white sm:text-5xl">
              {char.character}
            </span>
            <span className="mt-2 text-sm font-medium text-slate-400 group-hover:text-pink-500 dark:text-slate-500 transition-colors">
              {char.romaji}
            </span>
            
            {/* Audio Indicator */}
            {char.audio_url && (
              <div className="absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100">
                <Volume2 size={16} className="text-pink-400" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}