'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Trophy, Check, RefreshCw, Play, Settings, Keyboard, MousePointer2, AlertCircle, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function KanjiQuizModal({ kanjiData, level }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [phase, setPhase] = useState('menu'); // menu, config, game, result
  
  const [config, setConfig] = useState({
    type: 'choice', // choice, input
    mode: 'meaning', // meaning, reading, reverse
    count: 10,
    autoAdvance: false
  });

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
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (phase === 'game' && !isAnswered) {
       if (config.type === 'input' && config.mode !== 'reverse' && inputRef.current) {
         inputRef.current.focus();
       }
    } else if (phase === 'game' && isAnswered && !config.autoAdvance) {
       if (nextButtonRef.current) nextButtonRef.current.focus();
    }
  }, [currentIndex, phase, config.type, isAnswered, config.autoAdvance, config.mode]);

  const generateQuestions = (cfg) => {
    const pool = [...kanjiData].sort(() => Math.random() - 0.5);
    const finalQuestions = [];
    const count = Math.min(cfg.count, pool.length);

    for (let i = 0; i < count; i++) {
      const correct = pool[i];
      let questionText = '';
      let answerLabel = '';
      let answerRomaji = '';
      let displayHint = '';
      let options = [];

      if (cfg.mode === 'meaning') {
        questionText = correct.character;
        answerLabel = correct.meaning_id || correct.meaning_en;
      } else if (cfg.mode === 'reading') {
        questionText = correct.character;
        const mainReading = [...(correct.onyomi || []), ...(correct.kunyomi || [])][0];
        answerLabel = mainReading ? mainReading.reading : '???';
        answerRomaji = mainReading ? mainReading.romaji : '';
        displayHint = correct.meaning_id || correct.meaning_en;
      } else if (cfg.mode === 'reverse') {
        questionText = correct.meaning_id || correct.meaning_en;
        answerLabel = correct.character;
      }

      const correctOpt = { id: correct.id, label: answerLabel, romaji: answerRomaji };
      
      const dists = [];
      let attempts = 0;
      while(dists.length < 3 && attempts < 50) {
        attempts++;
        const rand = kanjiData[Math.floor(Math.random() * kanjiData.length)];
        if (rand.id === correct.id) continue;
        
        let dLabel = '';
        let dRomaji = '';
        if (cfg.mode === 'meaning') dLabel = rand.meaning_id || rand.meaning_en;
        else if (cfg.mode === 'reading') {
           const r = [...(rand.onyomi||[]), ...(rand.kunyomi||[])][0];
           dLabel = r ? r.reading : '???';
           dRomaji = r ? r.romaji : '';
        }
        else if (cfg.mode === 'reverse') dLabel = rand.character;

        if (!dists.find(d => d.label === dLabel) && dLabel !== correctOpt.label) {
          dists.push({ id: rand.id, label: dLabel, romaji: dRomaji });
        }
      }
      options = [correctOpt, ...dists].sort(() => Math.random() - 0.5);

      finalQuestions.push({
        display: questionText,
        answer: answerLabel,
        romaji: answerRomaji,
        hint: displayHint,
        options,
        validReadings: cfg.mode === 'reading' ? [
          ...(correct.onyomi || []).map(r => r.reading),
          ...(correct.onyomi || []).map(r => r.romaji),
          ...(correct.kunyomi || []).map(r => r.reading),
          ...(correct.kunyomi || []).map(r => r.romaji)
        ] : [answerLabel]
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
       const normalize = (s) => s.toLowerCase().replace(/[.\s]/g, '');
       isCorrect = currentQ.validReadings.some(r => normalize(r) === normalize(userVal));
    }

    if (isCorrect) { setScore(s => s + 1); setFeedback('correct'); }
    else { setFeedback('incorrect'); }
    setIsAnswered(true);

    if (config.autoAdvance) setTimeout(() => nextQuestion(), isCorrect ? 1500 : 3000);
  };

  const nextQuestion = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsAnswered(false);
      setSelectedAnswer(null);
      setInputAnswer('');
      setFeedback(null);
    } else { setPhase('result'); }
  };

  const resetToMenu = () => { setIsOpen(false); setPhase('menu'); };

  if (!isOpen) {
    return (
       <button onClick={() => setIsOpen(true)} className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-indigo-600 px-8 py-4 font-bold text-white shadow-xl transition-all hover:scale-105 hover:bg-indigo-700 dark:bg-white dark:text-slate-900">
        <Play size={20} fill="currentColor" /> Test {level} Kanji
        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-white/20 via-white/10 to-transparent opacity-30 transition-transform duration-500 group-hover:translate-x-0" />
      </button>
    );
  }

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-0 sm:p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full h-[100dvh] sm:h-auto sm:max-h-[90vh] max-w-xl flex flex-col bg-white shadow-2xl dark:bg-[#0f172a] dark:border dark:border-white/10 sm:rounded-3xl overflow-hidden">
        
        <div className="flex items-center justify-between border-b border-slate-100 p-4 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 shrink-0">
          <h3 className="font-bold text-slate-800 dark:text-white text-lg">
            {phase === 'menu' ? `Kanji ${level} Quiz` : phase === 'config' ? 'Quiz Settings' : phase === 'game' ? `Question ${currentIndex + 1}/${questions.length}` : 'Results'}
          </h3>
          <button onClick={resetToMenu} className="rounded-full p-2 text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10"><X size={20} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-8 custom-scrollbar">
          {phase === 'menu' && (
            <div className="space-y-8 py-6 text-center">
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 rotate-3 group-hover:rotate-0 transition-transform">
                <Trophy size={48} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">Ready for {level} Challenge?</h2>
                <p className="text-slate-500 mt-2">Test your knowledge of {kanjiData.length} Kanji.</p>
              </div>
              <div className="grid gap-3">
                <button onClick={startGame} className="w-full rounded-2xl bg-indigo-600 py-4 font-bold text-white shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 transition-all active:scale-95">Quick Start (10 Qs)</button>
                <button onClick={() => setPhase('config')} className="w-full rounded-2xl border-2 border-slate-100 py-4 font-bold text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5 transition-all">Custom Settings</button>
              </div>
            </div>
          )}

          {phase === 'config' && (
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Mode</label>
                <div className="grid grid-cols-3 gap-2">
                  {['meaning', 'reading', 'reverse'].map(m => (
                    <button key={m} onClick={() => setConfig({ ...config, mode: m })} className={cn("rounded-xl border-2 py-3 text-sm font-bold capitalize transition-all", config.mode === m ? "border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300" : "border-slate-100 dark:border-white/10 dark:text-slate-400")}>{m}</button>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Answer Type</label>
                <div className="grid grid-cols-2 gap-2">
                   <button onClick={() => setConfig({ ...config, type: 'choice' })} className={cn("rounded-xl border-2 py-3 font-bold transition-all", config.type === 'choice' ? "border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300" : "border-slate-100 dark:border-white/10 dark:text-slate-400")}>Multiple Choice</button>
                   <button disabled={config.mode === 'reverse'} onClick={() => setConfig({ ...config, type: 'input' })} className={cn("rounded-xl border-2 py-3 font-bold transition-all", config.type === 'input' ? "border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300" : "border-slate-100 dark:border-white/10 dark:text-slate-400", config.mode === 'reverse' && "opacity-30 cursor-not-allowed")}>Typing</button>
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Questions</label>
                <div className="grid grid-cols-3 gap-2">
                  {[10, 20, 50].map(c => (
                    <button key={c} onClick={() => setConfig({ ...config, count: c })} className={cn("rounded-xl border-2 py-3 font-bold transition-all", config.count === c ? "border-slate-900 bg-slate-900 text-white dark:bg-white dark:text-slate-900" : "border-slate-100 dark:border-white/10 dark:text-slate-400")}>{c}</button>
                  ))}
                </div>
              </div>
              <button onClick={startGame} className="w-full rounded-2xl bg-indigo-600 py-5 font-bold text-white shadow-xl shadow-indigo-500/20 hover:bg-indigo-700 mt-4 transition-all">Start Challenge</button>
            </div>
          )}

          {phase === 'game' && questions[currentIndex] && (
            <div className="space-y-8 animate-in slide-in-from-bottom-4">
              <div className="text-center">
                <div className="inline-block px-3 py-1 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-4">
                  {config.mode === 'meaning' ? 'Meaning' : config.mode === 'reading' ? 'Reading' : 'Kanji Match'}
                </div>
                <div className="flex min-h-[180px] flex-col items-center justify-center rounded-[2.5rem] bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 p-8 mb-4">
                  <span className={cn("font-black text-slate-900 dark:text-white transition-all", questions[currentIndex].display.length > 5 ? "text-3xl sm:text-4xl" : "text-7xl sm:text-8xl")}>
                    {questions[currentIndex].display}
                  </span>
                </div>
                {questions[currentIndex].hint && (
                  <div className="flex items-center justify-center gap-2 text-slate-400">
                    <AlertCircle size={14} />
                    <p className="text-sm font-medium italic">{questions[currentIndex].hint}</p>
                  </div>
                )}
              </div>

              {config.type === 'input' && config.mode !== 'reverse' ? (
                <form onSubmit={(e) => { e.preventDefault(); checkAnswer(inputAnswer); }} className="space-y-4">
                  <input ref={inputRef} disabled={isAnswered} value={inputAnswer} onChange={(e) => setInputAnswer(e.target.value)} className={cn("w-full rounded-2xl border-2 px-6 py-5 text-center text-2xl font-bold focus:ring-8 focus:ring-indigo-500/10 transition-all", isAnswered ? (feedback === 'correct' ? "border-green-500 bg-green-50 text-green-700" : "border-red-500 bg-red-50 text-red-700") : "border-slate-200 dark:border-white/10 dark:bg-black/20")} placeholder="Type answer..." />
                  {isAnswered && feedback === 'incorrect' && (
                    <div className="bg-slate-900 text-white p-4 rounded-2xl text-center animate-in zoom-in-95">
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-1">Correct Answer</p>
                      <p className="text-xl font-bold">{questions[currentIndex].answer} <span className="opacity-50 font-normal">({questions[currentIndex].romaji})</span></p>
                    </div>
                  )}
                  {!isAnswered ? (
                    <button type="submit" className="w-full rounded-2xl bg-indigo-600 py-4 font-bold text-white shadow-lg shadow-indigo-500/20">Check Answer</button>
                  ) : !config.autoAdvance && (
                    <button ref={nextButtonRef} onClick={nextQuestion} className="w-full rounded-2xl bg-slate-900 py-4 font-bold text-white flex items-center justify-center gap-2">Next Question <ChevronRight size={20} /></button>
                  )}
                </form>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {questions[currentIndex].options.map((opt) => {
                    const isCorrect = opt.label === questions[currentIndex].answer;
                    const isSelected = selectedAnswer === opt.label;
                    let btnClass = "w-full p-5 rounded-2xl border-2 text-left transition-all flex flex-col ";
                    
                    if (isAnswered) {
                      if (isCorrect) btnClass += "border-green-500 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 scale-[1.02] shadow-md z-10";
                      else if (isSelected) btnClass += "border-red-500 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 opacity-70";
                      else btnClass += "border-slate-100 opacity-30 dark:border-white/5";
                    } else {
                      btnClass += "border-slate-100 hover:border-indigo-500 hover:bg-indigo-50/30 hover:shadow-lg dark:border-white/10 dark:bg-white/5 dark:hover:bg-indigo-500/10";
                    }

                    return (
                      <button key={opt.id} disabled={isAnswered} onClick={() => checkAnswer(opt.label)} className={btnClass}>
                        <span className="text-lg font-bold">{opt.label}</span>
                        {opt.romaji && <span className="text-xs opacity-50 font-medium font-mono">{opt.romaji}</span>}
                      </button>
                    );
                  })}
                  {isAnswered && !config.autoAdvance && (
                    <button ref={nextButtonRef} onClick={nextQuestion} className="w-full rounded-2xl bg-slate-900 py-4 font-bold text-white mt-4 flex items-center justify-center gap-2">Next Question <ChevronRight size={20} /></button>
                  )}
                </div>
              )}
            </div>
          )}

          {phase === 'result' && (
            <div className="text-center space-y-8 py-10 animate-in zoom-in">
              <div className="relative inline-block">
                <Trophy size={100} className="text-yellow-500 drop-shadow-xl" />
                <div className="absolute inset-0 bg-yellow-400 blur-3xl opacity-20 -z-10 rounded-full"></div>
              </div>
              <div>
                <h2 className="text-5xl font-black text-slate-900 dark:text-white">{Math.round((score/questions.length)*100)}%</h2>
                <p className="text-slate-500 font-bold mt-2">You got {score} out of {questions.length} correct!</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setPhase('menu')} className="rounded-2xl border-2 border-slate-200 py-4 font-bold text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:text-white transition-all">Back to Menu</button>
                <button onClick={startGame} className="rounded-2xl bg-indigo-600 py-4 font-bold text-white shadow-xl shadow-indigo-500/30 hover:bg-indigo-700 transition-all">Retry Quiz</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}