'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Trophy, Check, RefreshCw, Play, Settings, Keyboard, MousePointer2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function KanjiQuizModal({ kanjiData, level }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [phase, setPhase] = useState('menu'); // menu, config, game, result
  
  // Configuration
  const [config, setConfig] = useState({
    type: 'choice', // choice, input
    mode: 'meaning', // meaning (Kanji->Meaning), reading (Kanji->Kana/Romaji), reverse (Meaning->Kanji)
    count: 10,
    autoAdvance: false
  });

  const [customCount, setCustomCount] = useState(10);

  // Game State
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [inputAnswer, setInputAnswer] = useState('');
  const [isAnswered, setIsAnswered] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const inputRef = useRef(null);
  const nextButtonRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (phase === 'game' && !isAnswered) {
       if (config.type === 'input' && config.mode !== 'reverse' && inputRef.current) {
         inputRef.current.focus();
       }
    } else if (phase === 'game' && isAnswered && !config.autoAdvance) {
       if (nextButtonRef.current) nextButtonRef.current.focus();
    }
  }, [currentIndex, phase, config.type, isAnswered, config.autoAdvance]);

  // --- GENERATE QUESTIONS ---
  const generateQuestions = (cfg) => {
    // Filter kanji by current level (data passed is already filtered usually, but safety check)
    // Actually `kanjiData` is already filtered by the parent page based on level usually.
    // Let's assume kanjiData contains all kanji for the selected level.
    
    const pool = [...kanjiData].sort(() => Math.random() - 0.5);
    const finalQuestions = [];
    const count = Math.min(cfg.count, pool.length);

    for (let i = 0; i < count; i++) {
      const correct = pool[i];
      let questionText = '';
      let answerText = '';
      let displayMeaning = '';
      let options = [];

      // Mode Logic
      if (cfg.mode === 'meaning') {
        questionText = correct.character;
        answerText = correct.meaning_id || correct.meaning_en;
        displayMeaning = ''; // Question IS the character
      } else if (cfg.mode === 'reading') {
        questionText = correct.character;
        // Combine Onyomi/Kunyomi for answer checking
        const readings = [
          ...(correct.onyomi || []).map(r => r.reading),
          ...(correct.onyomi || []).map(r => r.romaji),
          ...(correct.kunyomi || []).map(r => r.reading),
          ...(correct.kunyomi || []).map(r => r.romaji)
        ].filter(Boolean);
        
        answerText = readings[0]; // Primary answer for display
        displayMeaning = correct.meaning_id || correct.meaning_en; // Hint
      } else if (cfg.mode === 'reverse') {
        questionText = correct.meaning_id || correct.meaning_en;
        answerText = correct.character;
        displayMeaning = '';
      }

      // Options Generation (for Choice mode)
      if (cfg.type === 'choice' || cfg.mode === 'reverse') { // Reverse is always choice for Kanji output usually
        const correctOpt = { id: correct.id, label: answerText, original: correct };
        const dists = [];
        let attempts = 0;
        while(dists.length < 3 && attempts < 50) {
          attempts++;
          const rand = kanjiData[Math.floor(Math.random() * kanjiData.length)];
          if (rand.id === correct.id) continue;
          
          let dLabel = '';
          if (cfg.mode === 'meaning') dLabel = rand.meaning_id || rand.meaning_en;
          else if (cfg.mode === 'reading') {
             const r = [...(rand.onyomi||[]), ...(rand.kunyomi||[])][0];
             dLabel = r ? (r.reading || r.romaji) : '???';
          }
          else if (cfg.mode === 'reverse') dLabel = rand.character;

          if (!dists.find(d => d.label === dLabel) && dLabel !== correctOpt.label) {
            dists.push({ id: rand.id, label: dLabel });
          }
        }
        options = [correctOpt, ...dists].sort(() => Math.random() - 0.5);
      }

      finalQuestions.push({
        data: correct,
        display: questionText,
        answer: answerText,
        meaningHint: displayMeaning,
        options,
        validReadings: cfg.mode === 'reading' ? [
          ...(correct.onyomi || []).map(r => r.reading),
          ...(correct.onyomi || []).map(r => r.romaji),
          ...(correct.kunyomi || []).map(r => r.reading),
          ...(correct.kunyomi || []).map(r => r.romaji)
        ] : [answerText]
      });
    }
    return finalQuestions;
  };

  const startGame = () => {
    setQuestions(generateQuestions(config));
    resetGameState();
    setPhase('game');
  };

  const resetGameState = () => {
    setCurrentIndex(0);
    setScore(0);
    setIsAnswered(false);
    setSelectedAnswer(null);
    setInputAnswer('');
    setFeedback(null);
  };

  const checkAnswer = (userVal) => {
    if (isAnswered) return;
    
    const currentQ = questions[currentIndex];
    let isCorrect = false;

    if (config.type === 'choice' || config.mode === 'reverse') {
       isCorrect = userVal === currentQ.answer;
       setSelectedAnswer(userVal);
    } else {
       // Input mode (Reading)
       const normalize = (s) => s.toLowerCase().replace(/[.\s]/g, '');
       const cleanUser = normalize(userVal);
       // Check against all valid readings
       isCorrect = currentQ.validReadings.some(r => normalize(r) === cleanUser);
    }

    if (isCorrect) {
      setScore(s => s + 1);
      setFeedback('correct');
    } else {
      setFeedback('incorrect');
    }
    
    setIsAnswered(true);

    if (config.autoAdvance) {
      const delay = isCorrect ? 1500 : 3000;
      setTimeout(() => nextQuestion(), delay);
    }
  };

  const nextQuestion = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsAnswered(false);
      setSelectedAnswer(null);
      setInputAnswer('');
      setFeedback(null);
    } else {
      setPhase('result');
    }
  };

  const resetToMenu = () => {
    setIsOpen(false);
    setPhase('menu');
  };

  if (!isOpen) {
    return (
       <button
        onClick={() => setIsOpen(true)}
        className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-indigo-600 px-8 py-4 font-bold text-white shadow-xl transition-all hover:scale-105 hover:bg-indigo-700 dark:bg-white dark:text-slate-900"
      >
        <span className="relative z-10 flex items-center gap-2">
          <Play size={20} fill="currentColor" />
          Test {level} Kanji
        </span>
        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-white/20 via-white/10 to-transparent opacity-30 transition-transform duration-500 group-hover:translate-x-0" />
      </button>
    );
  }

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-0 sm:p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full h-[100dvh] sm:h-auto sm:max-h-[90vh] max-w-xl flex flex-col bg-white shadow-2xl dark:bg-[#0f172a] dark:border dark:border-white/10 sm:rounded-3xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 p-4 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 shrink-0 h-16 sm:h-auto">
          <h3 className="font-bold text-slate-800 dark:text-white truncate pr-2 text-lg">
            {phase === 'menu' && `Kanji ${level} Quiz`}
            {phase === 'config' && 'Custom Challenge'}
            {phase === 'game' && `Question ${currentIndex + 1}/${questions.length}`}
            {phase === 'result' && 'Quiz Results'}
          </h3>
          <button onClick={resetToMenu} className="rounded-full p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-600 dark:hover:bg-white/10 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 scroll-smooth custom-scrollbar">
          
          {/* MENU */}
          {phase === 'menu' && (
            <div className="space-y-6 py-4">
              <div className="text-center space-y-2">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                  <Trophy size={32} />
                </div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">Ready to test {level}?</h2>
                <p className="text-sm text-slate-500">Test your mastery of {kanjiData.length} Kanji in this level.</p>
              </div>
              <div className="grid gap-3">
                <button onClick={startGame} className="w-full rounded-xl bg-indigo-600 py-4 font-bold text-white shadow-lg hover:bg-indigo-700">Quick Start (10 Qs)</button>
                <button onClick={() => setPhase('config')} className="w-full rounded-xl border-2 border-slate-200 py-4 font-bold text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5">Custom Settings</button>
              </div>
            </div>
          )}

          {/* CONFIG */}
          {phase === 'config' && (
            <div className="space-y-6 pb-20 sm:pb-0">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Mode</label>
                <div className="grid grid-cols-3 gap-2">
                  {['meaning', 'reading', 'reverse'].map(m => (
                    <button key={m} onClick={() => setConfig({ ...config, mode: m })} className={cn("rounded-xl border-2 py-2 text-sm font-bold capitalize transition-all", config.mode === m ? "border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300" : "border-slate-100 dark:border-white/10")}>
                      {m}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Answer Type</label>
                <div className="grid grid-cols-2 gap-2">
                   <button onClick={() => setConfig({ ...config, type: 'choice' })} className={cn("rounded-xl border-2 py-2 text-sm font-bold capitalize transition-all", config.type === 'choice' ? "border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300" : "border-slate-100 dark:border-white/10")}>Multiple Choice</button>
                   <button disabled={config.mode === 'reverse'} onClick={() => setConfig({ ...config, type: 'input' })} className={cn("rounded-xl border-2 py-2 text-sm font-bold capitalize transition-all", config.type === 'input' ? "border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300" : "border-slate-100 dark:border-white/10", config.mode === 'reverse' && "opacity-50 cursor-not-allowed")}>Typing</button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Questions</label>
                <div className="flex gap-2">
                  {[10, 20, 50].map(c => (
                    <button key={c} onClick={() => { setConfig({ ...config, count: c }); setCustomCount(c); }} className={cn("flex-1 rounded-xl border-2 py-2 font-bold", config.count === c ? "border-slate-900 bg-slate-900 text-white dark:bg-white dark:text-slate-900" : "border-slate-100 dark:border-white/10")}>{c}</button>
                  ))}
                </div>
              </div>
              <button onClick={startGame} className="w-full rounded-xl bg-indigo-600 py-4 font-bold text-white shadow-lg mt-4">Start Quiz</button>
            </div>
          )}

          {/* GAME */}
          {phase === 'game' && questions[currentIndex] && (
            <div className="space-y-8 py-2">
              <div className="text-center">
                <p className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-400">
                  {config.mode === 'meaning' ? 'What is the meaning?' : config.mode === 'reading' ? 'How do you read this?' : 'Which Kanji means?'}
                </p>
                <div className="flex min-h-[160px] flex-col items-center justify-center rounded-3xl bg-slate-50 p-6 dark:bg-white/5">
                  <span className={cn("font-black text-slate-900 dark:text-white transition-all", questions[currentIndex].display.length > 1 ? "text-4xl" : "text-8xl")}>
                    {questions[currentIndex].display}
                  </span>
                </div>
                {questions[currentIndex].meaningHint && (
                  <p className="mt-2 text-sm text-slate-500 font-medium">Hint: {questions[currentIndex].meaningHint}</p>
                )}
              </div>

              {/* INPUT UI */}
              {config.type === 'input' && config.mode !== 'reverse' && (
                <form onSubmit={(e) => { e.preventDefault(); checkAnswer(inputAnswer); }} className="space-y-4">
                  <input
                    ref={inputRef}
                    disabled={isAnswered}
                    value={inputAnswer}
                    onChange={(e) => setInputAnswer(e.target.value)}
                    className={cn(
                      "w-full rounded-xl border-2 px-4 py-4 text-center text-xl font-bold focus:ring-4 focus:ring-indigo-500/20 disabled:opacity-70 dark:bg-black/20 dark:text-white",
                      isAnswered 
                        ? (feedback === 'correct' ? "border-green-500 bg-green-50 text-green-700" : "border-red-500 bg-red-50 text-red-700")
                        : "border-slate-200 focus:border-indigo-500 dark:border-white/10"
                    )}
                    placeholder="Type reading..."
                  />
                  {isAnswered && feedback === 'incorrect' && (
                    <div className="text-center p-4 bg-slate-50 rounded-xl dark:bg-white/5">
                      <p className="text-xs font-bold text-slate-400 uppercase">Correct Answer</p>
                      <p className="text-lg font-bold text-slate-900 dark:text-white">{questions[currentIndex].answer}</p>
                    </div>
                  )}
                  {!isAnswered ? (
                    <button type="submit" className="w-full rounded-xl bg-indigo-600 py-4 font-bold text-white shadow-lg">Check</button>
                  ) : (!config.autoAdvance && (
                    <button ref={nextButtonRef} onClick={nextQuestion} type="button" className="w-full rounded-xl bg-slate-900 py-4 font-bold text-white dark:bg-white dark:text-slate-900">Next</button>
                  ))}
                </form>
              )}

              {/* CHOICE UI */}
              {(config.type === 'choice' || config.mode === 'reverse') && (
                <div className="space-y-3">
                  {questions[currentIndex].options.map((opt) => {
                    const isCorrect = opt.label === questions[currentIndex].answer;
                    const isSelected = selectedAnswer === opt.label;
                    let btnClass = "w-full p-4 rounded-xl border-2 text-left font-bold transition-all ";
                    
                    if (isAnswered) {
                      if (isCorrect) btnClass += "border-green-500 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400";
                      else if (isSelected) btnClass += "border-red-500 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400";
                      else btnClass += "border-slate-100 opacity-50 dark:border-white/5";
                    } else {
                      btnClass += "border-slate-100 hover:border-indigo-500 hover:shadow-md dark:border-white/10 dark:bg-white/5";
                    }

                    return (
                      <button key={opt.id} disabled={isAnswered} onClick={() => checkAnswer(opt.label)} className={btnClass}>
                        {opt.label}
                      </button>
                    );
                  })}
                  {isAnswered && !config.autoAdvance && (
                    <button ref={nextButtonRef} onClick={nextQuestion} className="w-full rounded-xl bg-slate-900 py-4 font-bold text-white mt-4 dark:bg-white dark:text-slate-900">Next Question</button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* RESULT */}
          {phase === 'result' && (
            <div className="text-center space-y-6 py-10">
              <Trophy size={64} className="mx-auto text-yellow-500" />
              <h2 className="text-3xl font-black dark:text-white">{Math.round((score/questions.length)*100)}%</h2>
              <p className="text-slate-500">Correct: {score}/{questions.length}</p>
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setPhase('menu')} className="rounded-xl border-2 py-3 font-bold dark:text-white dark:border-white/10">Menu</button>
                <button onClick={startGame} className="rounded-xl bg-indigo-600 py-3 font-bold text-white">Retry</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
