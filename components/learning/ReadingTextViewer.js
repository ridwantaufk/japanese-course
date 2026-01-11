'use client';

import { useState } from 'react';
import FuriganaText from '@/components/learning/FuriganaText';
import { Volume2, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';

export default function ReadingTextViewer({ text }) {
  const [playingAudio, setPlayingAudio] = useState(false);
  const [showTranslation, setShowTranslation] = useState(true);

  const playAudio = () => {
    if (!text.audio_url) {
      // Fallback to Web Speech API
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text.japanese_text);
        utterance.lang = 'ja-JP';
        window.speechSynthesis.speak(utterance);
      }
      return;
    }
    
    setPlayingAudio(true);
    const audio = new Audio(text.audio_url);
    audio.play().catch(e => console.warn('Audio playback error:', e));
    audio.onended = () => setPlayingAudio(false);
  };

  // Parse sentence_breakdown if available (JSONB array)
  const sentences = text.sentence_breakdown && Array.isArray(text.sentence_breakdown) 
    ? text.sentence_breakdown 
    : null;

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="text-center space-y-4 border-b border-slate-200 dark:border-white/10 pb-8">
        <span className="px-3 py-1 rounded-full bg-pink-100 text-pink-700 text-xs font-bold dark:bg-pink-900/30 dark:text-pink-300">
          {text.jlpt_level}
        </span>
        <h1 className="text-4xl font-black text-slate-900 dark:text-white">{text.title_id}</h1>
        {text.title_ja && (
          <h2 className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{text.title_ja}</h2>
        )}
        
        {/* Audio Button */}
        <button
          onClick={playAudio}
          className={`inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all shadow-lg hover:scale-105 ${
            playingAudio 
              ? 'bg-pink-500 text-white animate-pulse' 
              : 'bg-indigo-600 text-white hover:bg-indigo-700'
          }`}
        >
          <Volume2 size={20} />
          {playingAudio ? 'Playing...' : 'Listen to Reading'}
        </button>
      </div>

      {/* Reading Content */}
      <div className="bg-white dark:bg-[#0f172a] p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-white/5">
        
        {sentences ? (
          // Structured sentence rendering with word breakdown
          <div className="space-y-6">
            {sentences.map((sentence, idx) => (
              <div key={idx} className="pb-6 border-b border-slate-100 dark:border-white/10 last:border-0">
                <FuriganaText
                  text={sentence.japanese_text}
                  furigana={sentence.furigana}
                  romaji={sentence.romaji}
                  wordBreakdown={sentence.word_breakdown}
                  showRomaji={false}
                  className="text-2xl leading-loose font-serif text-slate-800 dark:text-slate-200 mb-3"
                />
                
                {/* Romaji */}
                {sentence.romaji && (
                  <p className="text-sm font-mono text-slate-400 dark:text-slate-500 mb-2">
                    {sentence.romaji}
                  </p>
                )}
                
                {/* Translation */}
                {sentence.meaning_id && showTranslation && (
                  <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed italic">
                    {sentence.meaning_id}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          // Fallback: Simple text rendering
          <div>
            <div className="text-2xl leading-loose font-serif text-slate-800 dark:text-slate-200 mb-6">
              {text.japanese_text}
            </div>
            
            {text.romaji && (
              <div className="text-base font-mono text-slate-400 dark:text-slate-500 mb-6 pb-6 border-b border-slate-100 dark:border-white/10">
                {text.romaji}
              </div>
            )}
          </div>
        )}
        
        {/* Overall Translation Section */}
        <div className="mt-8 pt-8 border-t border-slate-100 dark:border-white/5">
          <button
            onClick={() => setShowTranslation(!showTranslation)}
            className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 mb-4 transition-colors"
          >
            <BookOpen size={16} />
            Indonesian Translation
            {showTranslation ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          
          {showTranslation && (
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              {text.meaning_id}
            </p>
          )}
        </div>
        
        {/* Summary if available */}
        {text.summary_id && (
          <div className="mt-6 p-4 bg-slate-50 dark:bg-white/5 rounded-xl">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Summary</p>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {text.summary_id}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
