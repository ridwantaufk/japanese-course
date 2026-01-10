'use client';

import { useState } from 'react';
import FuriganaText from '@/components/learning/FuriganaText';
import { User, UserCircle2, Info } from 'lucide-react';

// Client Component Wrapper
export default function ConversationViewer({ conversation }) {
  const [activeWord, setActiveWord] = useState(null);
  const speakers = [...new Set(conversation.lines.map(l => l.speaker_name))];

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center space-y-2">
        <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold dark:bg-indigo-900/30 dark:text-indigo-300">
          {conversation.jlpt_level}
        </span>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white capitalize">
          {conversation.title_id.replace(/_/g, ' ')}
        </h1>
        <p className="text-slate-500 dark:text-slate-400">{conversation.description_id}</p>
      </div>

      <div className="space-y-6 bg-slate-50 dark:bg-[#0f172a]/50 p-6 rounded-3xl border border-slate-200 dark:border-white/5 relative">
        {conversation.lines.map((line) => {
          const isLeft = line.speaker_name === speakers[0];
          
          return (
            <div key={line.id} className={`flex gap-4 ${isLeft ? '' : 'flex-row-reverse'}`}>
              <div className="flex-shrink-0 flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isLeft ? 'bg-pink-100 text-pink-600' : 'bg-indigo-100 text-indigo-600'}`}>
                  {isLeft ? <UserCircle2 /> : <User />}
                </div>
                <span className="text-[10px] font-bold mt-1 text-slate-400">{line.speaker_name}</span>
              </div>
              
              <div className={`flex flex-col max-w-[80%] ${isLeft ? 'items-start' : 'items-end'}`}>
                <div className={`p-4 rounded-2xl relative ${isLeft ? 'bg-white text-slate-800 rounded-tl-none shadow-sm' : 'bg-indigo-600 text-white rounded-tr-none shadow-md'}`}>
                  
                  {/* Main Text */}
                  <FuriganaText text={line.japanese_text} furigana={line.furigana} className="text-lg font-medium leading-relaxed block mb-2" />
                  
                  {/* Word Breakdown Trigger */}
                  {line.word_breakdown && line.word_breakdown.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {line.word_breakdown.map((wb, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveWord(activeWord === wb ? null : wb)}
                          className={`text-xs px-2 py-0.5 rounded-full transition-colors ${
                            isLeft 
                              ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' 
                              : 'bg-indigo-500 text-indigo-100 hover:bg-indigo-400'
                          }`}
                        >
                          {wb.word}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Translation */}
                  {line.meaning_id && (
                    <p className={`text-xs ${isLeft ? 'text-slate-400' : 'text-indigo-200'} border-t ${isLeft ? 'border-slate-100' : 'border-indigo-500'} pt-2 mt-2`}>
                      {line.meaning_id}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Word Detail Popup (Fixed at bottom) */}
        {activeWord && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-sm bg-slate-900/90 text-white backdrop-blur-xl p-4 rounded-2xl shadow-2xl animate-in slide-in-from-bottom-4 zoom-in-95">
            <button onClick={() => setActiveWord(null)} className="absolute top-2 right-2 p-1 bg-white/10 rounded-full hover:bg-white/20"><User size={12} /></button>
            <div className="text-center">
              <p className="text-2xl font-black mb-1">{activeWord.word}</p>
              <p className="text-sm font-medium text-indigo-300 mb-2">{activeWord.reading}</p>
              <div className="h-px w-12 bg-white/20 mx-auto mb-2"></div>
              <p className="text-sm">{activeWord.meaning}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}