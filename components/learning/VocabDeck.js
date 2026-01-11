'use client';

import { useState, useEffect, useMemo } from 'react';
import LevelSelector from './LevelSelector';
import FuriganaText from './FuriganaText';
import { Volume2, RotateCcw, Check, X, Trophy, Play, Settings2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function VocabDeck({ initialData }) {
  const [level, setLevel] = useState('N5');
  
  // Session State
  const [mode, setMode] = useState('setup'); // setup, study, summary
  const [queue, setQueue] = useState([]); // Cards to study
  const [currentCard, setCurrentCard] = useState(null);
  const [isFlipped, setIsFlipped] = useState(false);
  
  // Stats
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);

  // Filter Data Source
  const levelData = useMemo(() => {
    return initialData.filter(v => String(v.jlpt_level || '').toUpperCase().trim() === level);
  }, [initialData, level]);

  // --- ACTIONS ---

  const startSession = (count = 10) => {
    // Shuffle and pick N cards
    const shuffled = [...levelData].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, count);
    
    setQueue(selected);
    setCurrentCard(selected[0]);
    setCorrectCount(0);
    setWrongCount(0);
    setIsFlipped(false);
    setMode('study');
  };

  const handleGrade = (isCorrect) => {
    // 1. Update Stats
    if (isCorrect) setCorrectCount(prev => prev + 1);
    else setWrongCount(prev => prev + 1);

    // 2. Manage Queue
    // If correct, remove from queue. If wrong, re-queue it at the end (Spaced Repetition Lite)
    const remainingQueue = queue.slice(1);
    
    if (!isCorrect) {
      remainingQueue.push(currentCard); // Re-insert at end
    }

    // 3. Move to next
    if (remainingQueue.length === 0) {
      setMode('summary');
    } else {
      setQueue(remainingQueue);
      setCurrentCard(remainingQueue[0]);
      setIsFlipped(false);
    }
  };

  const playAudio = (e) => {
    e?.stopPropagation();
    if (currentCard?.audio_url) new Audio(currentCard.audio_url).play().catch(() => {});
  };

  // Auto-play audio on flip
  useEffect(() => {
    if (isFlipped && currentCard) {
      playAudio();
    }
  }, [isFlipped, currentCard]);


  // --- RENDERERS ---

  // 1. SETUP MODE
  if (mode === 'setup') {
    return (
      <div className="max-w-2xl mx-auto text-center space-y-8 animate-in fade-in zoom-in duration-500">
        <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2">Vocabulary Training</h1>
            <p className="text-slate-500 dark:text-slate-400">Choose your level and start an active recall session.</p>
        </div>

        <LevelSelector currentLevel={level} onSelect={setLevel} />

        <div className="bg-white dark:bg-[#0f172a] rounded-3xl p-8 shadow-xl border border-slate-200 dark:border-white/5">
            <p className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-6">Available Words: {levelData.length}</p>
            
            {levelData.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[10, 20, 50].map(count => (
                        <button 
                            key={count}
                            onClick={() => startSession(count)}
                            className="group flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-slate-100 hover:border-indigo-500 hover:bg-indigo-50 dark:border-white/10 dark:hover:bg-indigo-900/20 transition-all"
                        >
                            <span className="text-3xl font-black text-slate-700 dark:text-white group-hover:text-indigo-600 mb-1">{count}</span>
                            <span className="text-xs font-bold text-slate-400 uppercase">Words</span>
                        </button>
                    ))}
                </div>
            ) : (
                <p className="text-slate-400">No vocabulary found for this level.</p>
            )}
        </div>
      </div>
    );
  }

  // 2. SUMMARY MODE
  if (mode === 'summary') {
    const accuracy = Math.round((correctCount / (correctCount + wrongCount)) * 100) || 0;
    return (
        <div className="max-w-md mx-auto text-center space-y-8 py-12 animate-in zoom-in duration-500">
            <div className="relative inline-block">
                <div className="absolute inset-0 bg-yellow-400 blur-3xl opacity-20 rounded-full"></div>
                <Trophy size={100} className="relative text-yellow-500 mx-auto drop-shadow-lg" />
            </div>
            
            <div>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Session Complete!</h2>
                <p className="text-slate-500 dark:text-slate-400">You've reviewed all cards in this set.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-2xl border border-green-100 dark:border-green-900/50">
                    <p className="text-3xl font-black text-green-600">{correctCount}</p>
                    <p className="text-xs font-bold text-green-700 uppercase">Mastered</p>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-2xl border border-red-100 dark:border-red-900/50">
                    <p className="text-3xl font-black text-red-600">{wrongCount}</p>
                    <p className="text-xs font-bold text-red-700 uppercase">Need Review</p>
                </div>
            </div>

            <button 
                onClick={() => setMode('setup')}
                className="flex items-center justify-center gap-2 w-full px-8 py-4 rounded-full bg-slate-900 text-white font-bold shadow-lg hover:bg-slate-800 hover:scale-105 transition-all dark:bg-white dark:text-slate-900"
            >
                <RotateCcw size={18} /> Start New Session
            </button>
        </div>
    );
  }

  // 3. STUDY MODE (Flashcard)
  const totalCards = correctCount + queue.length; // Approximate total for progress bar
  const progress = ((correctCount) / totalCards) * 100; // Only counts mastered cards

  return (
    <div className="space-y-8 max-w-xl mx-auto">
      {/* Header Stats */}
      <div className="flex justify-between items-end px-4">
        <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded-md">{level}</span>
                Study Session
            </h2>
        </div>
        <div className="text-right">
            <span className="text-sm font-bold text-slate-400">{queue.length} cards left</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden dark:bg-white/10 mx-4">
         <div className="h-full bg-green-500 transition-all duration-500 ease-out" style={{ width: `${(correctCount / (correctCount + queue.length + (wrongCount > 0 ? 0 : 0))) * 100}%` }}></div>
      </div>

      {/* The Card */}
      <div className="relative h-[450px] w-full perspective-1000 group">
          <div 
            className={cn(
              "relative h-full w-full transition-all duration-500 transform-style-3d shadow-2xl rounded-[2rem]",
              isFlipped ? "rotate-y-180" : ""
            )}
          >
            {/* FRONT (Question) */}
            <div className="absolute inset-0 backface-hidden flex flex-col items-center justify-center rounded-[2rem] bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 p-8">
              <span className="absolute top-8 text-xs font-bold uppercase tracking-widest text-slate-400 bg-slate-100 dark:bg-white/5 px-3 py-1 rounded-full">
                Word
              </span>
              
              <div className="text-7xl font-black text-slate-800 dark:text-white mb-4 text-center">
                {currentCard.word}
              </div>
              
              {/* Romaji hint */}
              {currentCard.romaji && (
                <div className="text-xl font-mono text-slate-400 dark:text-slate-500 mb-6">
                  {currentCard.romaji}
                </div>
              )}
              
              <button 
                onClick={() => setIsFlipped(true)}
                className="mt-8 px-8 py-3 rounded-full bg-slate-900 text-white font-bold hover:bg-slate-800 hover:scale-105 transition-all dark:bg-white dark:text-slate-900"
              >
                Reveal Answer
              </button>
            </div>

            {/* BACK (Answer & Grading) */}
            <div className="absolute inset-0 backface-hidden rotate-y-180 flex flex-col items-center justify-between rounded-[2rem] bg-gradient-to-br from-indigo-600 to-violet-700 text-white p-8">
              
              <div className="flex-1 flex flex-col items-center justify-center w-full">
                <div className="text-center space-y-4">
                    <FuriganaText 
                      text={currentCard.word} 
                      furigana={currentCard.furigana}
                      romaji={currentCard.romaji}
                      wordBreakdown={currentCard.word_breakdown}
                      showRomaji={false}
                      className="text-5xl font-bold block drop-shadow-md" 
                    />
                    <div className="flex items-center justify-center gap-2 opacity-90 font-mono bg-black/20 px-4 py-2 rounded-full text-sm">
                        {currentCard.romaji}
                        <button onClick={playAudio} className="hover:text-pink-300 transition-colors"><Volume2 size={16} /></button>
                    </div>
                    
                    <div className="h-px w-20 bg-white/30 mx-auto my-4"></div>
                    
                    <p className="text-2xl font-bold leading-relaxed">
                        {currentCard.meaning_id}
                    </p>
                    <p className="text-sm opacity-70 italic">{currentCard.word_category}</p>
                    
                    {/* Word Breakdown if available */}
                    {currentCard.word_breakdown && currentCard.word_breakdown.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-white/20">
                        <p className="text-xs uppercase tracking-wider opacity-60 mb-2">Word Parts</p>
                        <div className="flex flex-wrap justify-center gap-2">
                          {currentCard.word_breakdown.map((wb, idx) => (
                            <span key={idx} className="text-xs bg-white/10 px-3 py-1 rounded-full">
                              {wb.word} = {wb.meaning}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              </div>

              {/* Grading Buttons */}
              <div className="w-full grid grid-cols-2 gap-4 mt-6">
                <button 
                    onClick={(e) => { e.stopPropagation(); handleGrade(false); }}
                    className="flex flex-col items-center justify-center gap-1 p-4 rounded-2xl bg-red-500/20 hover:bg-red-500 hover:text-white border border-red-400/30 transition-all active:scale-95"
                >
                    <X size={24} className="mb-1" />
                    <span className="text-xs font-black uppercase tracking-wider">Lupa / Sulit</span>
                </button>
                <button 
                    onClick={(e) => { e.stopPropagation(); handleGrade(true); }}
                    className="flex flex-col items-center justify-center gap-1 p-4 rounded-2xl bg-emerald-500/20 hover:bg-emerald-500 hover:text-white border border-emerald-400/30 transition-all active:scale-95"
                >
                    <Check size={24} className="mb-1" />
                    <span className="text-xs font-black uppercase tracking-wider">Ingat / Mudah</span>
                </button>
              </div>

            </div>
          </div>
      </div>
      
      <p className="text-center text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">
        {isFlipped ? "Grade yourself honestly" : "Think of the meaning first"}
      </p>

    </div>
  );
}