'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Trophy, Check, RefreshCw, Play, Settings, Keyboard, MousePointer2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function KanaQuizModal({ hiragana, katakana }) {
  const [isOpen, setIsOpen] = useState(false);
  const [phase, setPhase] = useState('menu'); // menu, config, game, result
  
  // Configuration
  const [config, setConfig] = useState({
    mode: 'mixed', // hiragana, katakana, mixed
    type: 'choice', // choice, input
    direction: 'random', // k2r (Kana->Romaji), r2k (Romaji->Kana), random
    count: 10,
    length: 1, // 1=Char, 2-4=Word, 5-8=Sentence
  });

  const [customCount, setCustomCount] = useState(10);

  // Game State
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null); // For Choice
  const [inputAnswer, setInputAnswer] = useState(''); // For Input
  const [isAnswered, setIsAnswered] = useState(false);
  const [feedback, setFeedback] = useState(null); // correct, incorrect

  const inputRef = useRef(null);

  // Focus input when moving to next question in input mode
  useEffect(() => {
    if (phase === 'game' && config.type === 'input' && !isAnswered && inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentIndex, phase, config.type, isAnswered]);

  const generateQuestions = (cfg) => {
    let pool = [];
    if (cfg.mode === 'hiragana' || cfg.mode === 'mixed') pool = [...pool, ...hiragana];
    if (cfg.mode === 'katakana' || cfg.mode === 'mixed') pool = [...pool, ...katakana];

    // Shuffle pool
    const shuffledPool = [...pool].sort(() => Math.random() - 0.5);
    
    const finalQuestions = [];
    
    for (let i = 0; i < cfg.count; i++) {
      // Create a "Question" unit
      // If length > 1, we combine multiple chars
      const chunkLength = cfg.length === 1 ? 1 : Math.floor(Math.random() * (cfg.length === 'word' ? 3 : 5)) + 2; 
      // If simple char mode, just take 1. If 'word' (2-4), 'sentence' (5-9) - mapped in UI
      
      const targets = [];
      for (let j = 0; j < (cfg.length === 1 ? 1 : chunkLength); j++) {
         const randomChar = shuffledPool[Math.floor(Math.random() * shuffledPool.length)];
         targets.push(randomChar);
      }

      const questionText = targets.map(t => t.character).join('');
      const answerText = targets.map(t => t.romaji).join(''); // simple concatenation for now

      // Determine direction
      let dir = cfg.direction;
      if (dir === 'random') dir = Math.random() > 0.5 ? 'k2r' : 'r2k';

      // Options for Multiple Choice (only valid if length === 1, otherwise input is forced or we generate fake options)
      // For multi-char strings, generating believable distractors is hard, so we might force Input mode or just pick random other strings.
      // Let's support Choice for length=1 only, or simple randoms for length>1.
      
      let options = [];
      if (cfg.type === 'choice') {
        // Correct Option
        const correctOpt = { id: 'correct', label: dir === 'k2r' ? answerText : questionText };
        
        // Distractors
        const dists = [];
        while(dists.length < 3) {
           const dTargets = [];
           for (let k = 0; k < targets.length; k++) {
              dTargets.push(shuffledPool[Math.floor(Math.random() * shuffledPool.length)]);
           }
           const dQ = dTargets.map(t => t.character).join('');
           const dA = dTargets.map(t => t.romaji).join('');
           const label = dir === 'k2r' ? dA : dQ;
           
           if (label !== correctOpt.label && !dists.find(d => d.label === label)) {
             dists.push({ id: `dist_${dists.length}`, label });
           }
        }
        options = [correctOpt, ...dists].sort(() => Math.random() - 0.5);
      }

      finalQuestions.push({
        targets, // Array of char objects
        display: dir === 'k2r' ? questionText : answerText,
        answer: dir === 'k2r' ? answerText : questionText,
        direction: dir,
        options // Only for choice
      });
    }

    return finalQuestions;
  };

  const startQuickGame = () => {
    const quickConfig = { mode: 'mixed', type: 'choice', direction: 'random', count: 10, length: 1 };
    setConfig(quickConfig);
    setQuestions(generateQuestions(quickConfig));
    resetGameState();
    setPhase('game');
  };

  const startCustomGame = () => {
    // Validate custom count
    const finalCount = parseInt(customCount) || 10;
    const finalConfig = { ...config, count: finalCount };
    setQuestions(generateQuestions(finalConfig));
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

  const handleChoiceAnswer = (optionLabel) => {
    if (isAnswered) return;
    setIsAnswered(true);
    
    const currentQ = questions[currentIndex];
    const isCorrect = optionLabel === currentQ.answer;

    if (isCorrect) setScore(s => s + 1);
    setSelectedAnswer(optionLabel); // We store the label matched

    setTimeout(() => nextQuestion(), 1000);
  };

  const handleInputSubmit = (e) => {
    e.preventDefault();
    if (isAnswered) return;
    
    const currentQ = questions[currentIndex];
    const userVal = inputAnswer.trim().toLowerCase();
    const correctVal = currentQ.answer.toLowerCase();

    // Loose equality for Romaji (trim spaces)
    const isCorrect = userVal === correctVal;

    setIsAnswered(true);
    setFeedback(isCorrect ? 'correct' : 'incorrect');
    if (isCorrect) setScore(s => s + 1);

    setTimeout(() => nextQuestion(), 1500);
  };

  const nextQuestion = () => {
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

  // --- Render Helpers ---

  if (!isOpen) {
    return (
       <button
        onClick={() => setIsOpen(true)}
        className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-slate-900 px-8 py-4 font-bold text-white shadow-xl transition-all hover:scale-105 hover:bg-slate-800 dark:bg-white dark:text-slate-900"
      >
        <span className="relative z-10 flex items-center gap-2">
          <Play size={20} fill="currentColor" />
          Start Quiz
        </span>
        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-20 transition-transform duration-500 group-hover:translate-x-0" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-[#0f172a] dark:border dark:border-white/10 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 p-4 dark:border-white/5 bg-slate-50/50 dark:bg-white/5">
          <h3 className="font-bold text-slate-800 dark:text-white">
            {phase === 'menu' && 'Quiz Menu'}
            {phase === 'config' && 'Custom Challenge'}
            {phase === 'game' && `Question ${currentIndex + 1}/${questions.length}`}
            {phase === 'result' && 'Quiz Results'}
          </h3>
          <button 
            onClick={resetToMenu}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-600 dark:hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          
          {/* MENU PHASE */}
          {phase === 'menu' && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                  <Settings size={40} />
                </div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">Choose Your Challenge</h2>
                <p className="text-slate-500 dark:text-slate-400">Select a preset or customize your experience.</p>
              </div>

              <div className="grid gap-4">
                <button 
                  onClick={startQuickGame}
                  className="flex items-center gap-4 rounded-2xl border-2 border-indigo-100 bg-white p-4 transition-all hover:border-indigo-500 hover:shadow-lg dark:border-white/10 dark:bg-white/5 dark:hover:border-indigo-400 text-left group"
                >
                  <div className="rounded-full bg-indigo-100 p-3 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-300">
                    <Play size={24} fill="currentColor" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">Quick Start</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">10 Questions, Mixed Kana, Multiple Choice.</p>
                  </div>
                </button>

                <button 
                  onClick={() => setPhase('config')}
                  className="flex items-center gap-4 rounded-2xl border-2 border-slate-100 bg-white p-4 transition-all hover:border-slate-400 hover:shadow-lg dark:border-white/10 dark:bg-white/5 dark:hover:border-slate-400 text-left group"
                >
                  <div className="rounded-full bg-slate-100 p-3 text-slate-600 dark:bg-white/10 dark:text-slate-300">
                    <Settings size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-slate-600 dark:group-hover:text-slate-200">Custom Quiz</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Customize count, mode, type (typing/choice), and more.</p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* CONFIG PHASE */}
          {phase === 'config' && (
            <div className="space-y-6">
              {/* Content Mode */}
              <div className="space-y-3">
                <label className="text-sm font-bold uppercase tracking-wider text-slate-400">Content</label>
                <div className="grid grid-cols-3 gap-2">
                  {['hiragana', 'katakana', 'mixed'].map(m => (
                    <button
                      key={m}
                      onClick={() => setConfig({ ...config, mode: m })}
                      className={cn(
                        "rounded-xl border-2 py-2 font-bold capitalize transition-all",
                        config.mode === m 
                          ? "border-pink-500 bg-pink-50 text-pink-700 dark:bg-pink-900/20 dark:text-pink-400" 
                          : "border-slate-100 bg-white text-slate-500 hover:border-slate-300 dark:border-white/10 dark:bg-white/5 dark:text-slate-400"
                      )}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Type */}
              <div className="space-y-3">
                <label className="text-sm font-bold uppercase tracking-wider text-slate-400">Answer Style</label>
                <div className="grid grid-cols-2 gap-2">
                   <button
                      onClick={() => setConfig({ ...config, type: 'choice' })}
                      className={cn(
                        "flex items-center justify-center gap-2 rounded-xl border-2 py-3 font-bold transition-all",
                        config.type === 'choice'
                          ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400" 
                          : "border-slate-100 bg-white text-slate-500 hover:border-slate-300 dark:border-white/10 dark:bg-white/5 dark:text-slate-400"
                      )}
                    >
                      <MousePointer2 size={18} /> Choice
                    </button>
                    <button
                      onClick={() => setConfig({ ...config, type: 'input' })}
                      className={cn(
                        "flex items-center justify-center gap-2 rounded-xl border-2 py-3 font-bold transition-all",
                        config.type === 'input'
                          ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400" 
                          : "border-slate-100 bg-white text-slate-500 hover:border-slate-300 dark:border-white/10 dark:bg-white/5 dark:text-slate-400"
                      )}
                    >
                      <Keyboard size={18} /> Typing
                    </button>
                </div>
              </div>

               {/* Direction */}
               <div className="space-y-3">
                <label className="text-sm font-bold uppercase tracking-wider text-slate-400">Direction</label>
                <div className="grid grid-cols-3 gap-2 text-xs sm:text-sm">
                   {[
                     { id: 'k2r', label: 'Kana → Romaji' }, 
                     { id: 'r2k', label: 'Romaji → Kana' },
                     { id: 'random', label: 'Mixed' }
                    ].map(d => (
                    <button
                      key={d.id}
                      onClick={() => setConfig({ ...config, direction: d.id })}
                      className={cn(
                        "rounded-xl border-2 py-2 font-bold transition-all",
                        config.direction === d.id 
                          ? "border-orange-500 bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400" 
                          : "border-slate-100 bg-white text-slate-500 hover:border-slate-300 dark:border-white/10 dark:bg-white/5 dark:text-slate-400"
                      )}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

               {/* Difficulty / Length */}
               <div className="space-y-3">
                <label className="text-sm font-bold uppercase tracking-wider text-slate-400">Length</label>
                <div className="grid grid-cols-3 gap-2">
                   {[
                     { id: 1, label: 'Char (1)' }, 
                     { id: 'word', label: 'Word (2-4)' },
                     { id: 'sentence', label: 'Sentence (5+)' }
                    ].map(l => (
                    <button
                      key={l.id}
                      onClick={() => setConfig({ ...config, length: l.id })}
                      className={cn(
                        "rounded-xl border-2 py-2 font-bold transition-all",
                        config.length === l.id 
                          ? "border-teal-500 bg-teal-50 text-teal-700 dark:bg-teal-900/20 dark:text-teal-400" 
                          : "border-slate-100 bg-white text-slate-500 hover:border-slate-300 dark:border-white/10 dark:bg-white/5 dark:text-slate-400"
                      )}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Count */}
              <div className="space-y-3">
                <label className="text-sm font-bold uppercase tracking-wider text-slate-400">Question Count</label>
                <div className="flex flex-wrap gap-2">
                  {[10, 20, 50, 100].map(c => (
                    <button
                      key={c}
                      onClick={() => { setConfig({ ...config, count: c }); setCustomCount(c); }}
                      className={cn(
                        "flex-1 min-w-[60px] rounded-xl border-2 py-2 font-bold transition-all",
                        config.count === c 
                          ? "border-slate-800 bg-slate-800 text-white dark:bg-white dark:text-slate-900" 
                          : "border-slate-100 bg-white text-slate-500 hover:border-slate-300 dark:border-white/10 dark:bg-white/5 dark:text-slate-400"
                      )}
                    >
                      {c}
                    </button>
                  ))}
                  <div className="flex-1 min-w-[80px] relative">
                     <input 
                      type="number"
                      min="1"
                      max="500"
                      value={customCount}
                      onChange={(e) => {
                         const val = parseInt(e.target.value);
                         setCustomCount(val);
                         setConfig({ ...config, count: val });
                      }}
                      className={cn(
                        "w-full rounded-xl border-2 bg-transparent py-2 px-2 text-center font-bold focus:outline-none focus:ring-2 focus:ring-slate-500",
                         ![10, 20, 50, 100].includes(config.count)
                          ? "border-slate-800 text-slate-900 dark:border-white dark:text-white"
                          : "border-slate-100 text-slate-500 dark:border-white/10 dark:text-slate-400"
                      )}
                     />
                  </div>
                </div>
              </div>

              <div className="pt-4">
                 <button
                  onClick={startCustomGame}
                  className="w-full rounded-xl bg-slate-900 py-4 font-bold text-white shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98] dark:bg-white dark:text-slate-900"
                 >
                   Start Challenge
                 </button>
              </div>
            </div>
          )}

          {/* GAME PHASE */}
          {phase === 'game' && questions[currentIndex] && (
            <div className="space-y-8 py-4">
              <div className="text-center">
                 <p className="mb-4 text-sm font-bold uppercase tracking-widest text-slate-400">
                    {questions[currentIndex].direction === 'k2r' ? 'Type/Select Romaji' : 'Identify Character'}
                 </p>
                 <div className="flex min-h-[160px] flex-col items-center justify-center rounded-3xl bg-slate-50 p-6 dark:bg-white/5">
                    <span className={cn(
                      "font-black text-slate-900 dark:text-white transition-all break-all",
                      questions[currentIndex].display.length > 4 ? "text-4xl" : "text-7xl"
                    )}>
                       {questions[currentIndex].display}
                    </span>
                 </div>
              </div>

              {/* INPUT MODE */}
              {config.type === 'input' && (
                <form onSubmit={handleInputSubmit} className="space-y-4">
                  <div className="relative">
                    <input
                      ref={inputRef}
                      type="text"
                      autoComplete="off"
                      autoFocus
                      disabled={isAnswered}
                      value={inputAnswer}
                      onChange={(e) => setInputAnswer(e.target.value)}
                      placeholder={questions[currentIndex].direction === 'k2r' ? "Type answer..." : "Type Japanese..."}
                      className={cn(
                        "w-full rounded-2xl border-2 px-6 py-4 text-center text-2xl font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/20 disabled:opacity-70 dark:bg-black/20 dark:text-white",
                        !isAnswered && "border-slate-200 focus:border-indigo-500 dark:border-white/10 dark:focus:border-indigo-400",
                        isAnswered && feedback === 'correct' && "border-green-500 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400",
                        isAnswered && feedback === 'incorrect' && "border-red-500 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                      )}
                    />
                    {isAnswered && feedback === 'correct' && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-green-600 dark:text-green-400">
                        <Check size={28} />
                      </div>
                    )}
                    {isAnswered && feedback === 'incorrect' && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-red-600 dark:text-red-400">
                        <X size={28} />
                      </div>
                    )}
                  </div>
                  
                  {isAnswered && feedback === 'incorrect' && (
                    <div className="animate-in slide-in-from-top-2 text-center">
                      <p className="text-sm font-bold text-slate-400">Correct Answer:</p>
                      <p className="text-xl font-bold text-slate-900 dark:text-white">{questions[currentIndex].answer}</p>
                    </div>
                  )}

                  {!isAnswered && (
                    <button type="submit" className="w-full rounded-xl bg-indigo-600 py-4 font-bold text-white shadow-lg hover:bg-indigo-700">
                      Check Answer
                    </button>
                  )}
                </form>
              )}

              {/* CHOICE MODE */}
              {config.type === 'choice' && (
                 <div className="grid grid-cols-2 gap-3">
                   {questions[currentIndex].options.map((opt) => {
                      const isCorrect = opt.label === questions[currentIndex].answer;
                      const isSelected = selectedAnswer === opt.label;
                      
                      let btnClass = "relative flex flex-col items-center justify-center rounded-xl border-2 p-4 transition-all ";
                      if (isAnswered) {
                         if (isCorrect) btnClass += "border-green-500 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400";
                         else if (isSelected) btnClass += "border-red-500 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 opacity-50";
                         else btnClass += "border-slate-100 bg-slate-50 opacity-50 dark:border-white/5 dark:bg-white/5";
                      } else {
                         btnClass += "cursor-pointer border-slate-100 bg-white hover:border-indigo-500 hover:shadow-md dark:border-white/10 dark:bg-white/5 dark:hover:border-indigo-400";
                      }

                      return (
                        <button key={opt.id} disabled={isAnswered} onClick={() => handleChoiceAnswer(opt.label)} className={btnClass}>
                           <span className="text-xl font-bold dark:text-white">{opt.label}</span>
                        </button>
                      );
                   })}
                 </div>
              )}
            </div>
          )}

          {/* RESULT PHASE */}
          {phase === 'result' && (
             <div className="text-center space-y-6 py-4">
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-yellow-100 text-yellow-500 dark:bg-yellow-900/30">
                <Trophy size={48} />
              </div>
              <div>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white">
                  {Math.round((score / questions.length) * 100)}% Score
                </h2>
                <p className="text-slate-500 dark:text-slate-400">
                  You got {score} out of {questions.length} correct!
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                 <button
                  onClick={() => setPhase('menu')}
                  className="rounded-xl border-2 border-slate-200 bg-transparent py-4 font-bold text-slate-700 transition-colors hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
                >
                  Main Menu
                </button>
                <button
                  onClick={() => {
                     setQuestions(generateQuestions(config));
                     resetGameState();
                     setPhase('game');
                  }}
                  className="rounded-xl bg-slate-900 py-4 font-bold text-white transition-transform hover:scale-[1.02] active:scale-[0.98] dark:bg-white dark:text-slate-900"
                >
                  <div className="flex items-center justify-center gap-2">
                    <RefreshCw size={20} />
                    Try Again
                  </div>
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
