'use client';

import { useState } from 'react';
import FuriganaText from '@/components/learning/FuriganaText';
import { User, UserCircle2, Volume2, Info } from 'lucide-react';
import { formatTitle } from '@/lib/learningUtils';

// Client Component Wrapper
export default function ConversationViewer({ conversation }) {
  const [activeWord, setActiveWord] = useState(null);
  const [playingAudio, setPlayingAudio] = useState(null);
  const speakers = [...new Set(conversation.lines.map(l => l.speaker_name))];

  const playAudio = (audioUrl, lineId) => {
    if (!audioUrl) {
      // Fallback to Web Speech API
      const line = conversation.lines.find(l => l.id === lineId);
      if (line && 'speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(line.japanese_text);
        utterance.lang = 'ja-JP';
        window.speechSynthesis.speak(utterance);
      }
      return;
    }
    
    setPlayingAudio(lineId);
    const audio = new Audio(audioUrl);
    audio.play().catch(e => console.warn('Audio playback error:', e));
    audio.onended = () => setPlayingAudio(null);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center space-y-2">
        <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold dark:bg-indigo-900/30 dark:text-indigo-300">
          {conversation.jlpt_level}
        </span>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white capitalize">
          {formatTitle(conversation.title_id)}
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
                  
                  {/* Audio Button */}
                  <button
                    onClick={() => playAudio(line.audio_url, line.id)}
                    className={`absolute top-2 right-2 p-1.5 rounded-full transition-all hover:scale-110 ${
                      playingAudio === line.id 
                        ? 'bg-pink-500 text-white animate-pulse' 
                        : isLeft ? 'bg-slate-100 text-slate-600 hover:bg-pink-100 hover:text-pink-600' : 'bg-indigo-500 text-white hover:bg-pink-500'
                    }`}
                  >
                    <Volume2 size={16} />
                  </button>

                  {/* Main Text with Furigana */}
                  <FuriganaText 
                    text={line.japanese_text} 
                    furigana={line.furigana}
                    romaji={line.romaji}
                    wordBreakdown={line.word_breakdown}
                    showRomaji={false}
                    className="text-lg font-medium leading-relaxed block mb-2 pr-8" 
                  />
                  
                  {/* Romaji Display */}
                  {line.romaji && (
                    <div className={`text-xs font-mono mt-1 ${isLeft ? 'text-slate-400' : 'text-indigo-200'}`}>
                      {line.romaji}
                    </div>
                  )}
                  
                  {/* Word Breakdown Trigger */}
                  {line.word_breakdown && line.word_breakdown.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {line.word_breakdown.map((wb, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveWord(activeWord === wb ? null : wb)}
                          className={`text-xs px-2.5 py-1 rounded-full font-medium transition-all ${
                            isLeft 
                              ? 'bg-slate-100 text-slate-700 hover:bg-indigo-100 hover:text-indigo-700' 
                              : 'bg-indigo-500 text-indigo-100 hover:bg-pink-500 hover:text-white'
                          }`}
                        >
                          {wb.word}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Translation */}
                  {line.meaning_id && (
                    <p className={`text-sm ${isLeft ? 'text-slate-500' : 'text-indigo-100'} border-t ${isLeft ? 'border-slate-100' : 'border-indigo-500'} pt-2 mt-3`}>
                      <span className="font-semibold">ID:</span> {line.meaning_id}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Word Detail Popup (Fixed at bottom) */}
        {activeWord && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-md bg-slate-900/95 text-white backdrop-blur-xl p-5 rounded-2xl shadow-2xl animate-in slide-in-from-bottom-4 zoom-in-95 border border-white/10">
            <button 
              onClick={() => setActiveWord(null)} 
              className="absolute top-3 right-3 p-1.5 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="text-center">
              <p className="text-3xl font-black mb-2">{activeWord.word}</p>
              {activeWord.reading && (
                <p className="text-base font-medium text-pink-300 mb-1">{activeWord.reading}</p>
              )}
              {activeWord.romaji && (
                <p className="text-sm font-mono text-slate-400 mb-3">{activeWord.romaji}</p>
              )}
              <div className="h-px w-16 bg-white/30 mx-auto mb-3"></div>
              <p className="text-base font-medium leading-relaxed">{activeWord.meaning}</p>
              {activeWord.part_of_speech && (
                <p className="text-xs text-slate-400 mt-2 italic">({activeWord.part_of_speech})</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}