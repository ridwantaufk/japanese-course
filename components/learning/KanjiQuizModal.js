'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Trophy, Check, RefreshCw, Play, Settings, Keyboard, MousePointer2, AlertCircle, ChevronRight, BookOpen, Star, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function KanjiQuizModal({ kanjiData, level }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [phase, setPhase] = useState('menu'); // menu, config, game, result
  
  const [config, setConfig] = useState({
    type: 'choice', 
    mode: 'meaning', // meaning, reading, mixed
    count: 10,
    autoAdvance: false
  });

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [inputAnswer, setInputAnswer] = useState('');
  const [isAnswered, setIsAnswered] = useState(false);
  const [feedback, setFeedback] = useState(null); // correct, incorrect

  const inputRef = useRef(null);
  const nextButtonRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (phase === 'game' && !isAnswered) {
       if (config.type === 'input' && inputRef.current) {
         inputRef.current.focus();
       }
    } else if (phase === 'game' && isAnswered && !config.autoAdvance) {
       if (nextButtonRef.current) nextButtonRef.current.focus();
    }
  }, [currentIndex, phase, config.type, isAnswered, config.autoAdvance]);

  const generateQuestions = (cfg) => {
    const pool = [...kanjiData].sort(() => Math.random() - 0.5);
    const finalQuestions = [];
    const count = Math.min(cfg.count, pool.length);

    for (let i = 0; i < count; i++) {
      const correct = pool[i];
      let questionMode = cfg.mode;
      if (cfg.mode === 'mixed') {
        const modes = ['meaning', 'reading'];
        questionMode = modes[Math.floor(Math.random() * modes.length)];
      }

      let display = '';
      let answer = '';
      let secondaryAnswer = ''; // for reading mode (onyomi/kunyomi)
      
      if (questionMode === 'meaning') {
        display = correct.character;
        answer = correct.meaning_id || correct.meaning_en;
      } else {
        display = correct.character;
        const mainR = [...(correct.onyomi || []), ...(correct.kunyomi || [])][0];
        answer = mainR ? (mainR.reading || mainR.kana) : '???';
        secondaryAnswer = mainR ? mainR.romaji : '';
      }

      // Options
      const correctOpt = { label: answer, romaji: secondaryAnswer };
      const dists = [];
      let attempts = 0;
      while(dists.length < 3 && attempts < 50) {
        attempts++;
        const rand = kanjiData[Math.floor(Math.random() * kanjiData.length)];
        if (rand.id === correct.id) continue;
        
        let dLabel = '';
        let dRomaji = '';
        if (questionMode === 'meaning') {
          dLabel = rand.meaning_id || rand.meaning_en;
        } else {
          const r = [...(rand.onyomi||[]), ...(rand.kunyomi||[])][0];
          dLabel = r ? (r.reading || r.kana) : '???';
          dRomaji = r ? r.romaji : '';
        }

        if (dLabel && !dists.find(d => d.label === dLabel) && dLabel !== answer) {
          dists.push({ label: dLabel, romaji: dRomaji });
        }
      }
      const options = [correctOpt, ...dists].sort(() => Math.random() - 0.5);

      finalQuestions.push({
        kanji: correct,
        mode: questionMode,
        display,
        answer,
        options,
        validReadings: [
          ...(correct.onyomi || []).map(r => r.reading || r.kana),
          ...(correct.onyomi || []).map(r => r.romaji),
          ...(correct.kunyomi || []).map(r => r.reading || r.kana),
          ...(correct.kunyomi || []).map(r => r.romaji)
        ].filter(Boolean)
      });
    }
    return finalQuestions;
  };

  const startGame = () => {
    setQuestions(generateQuestions(config));
    setCurrentIndex(0);
    setScore(0);
    setIsAnswered(false);
    setSelectedAnswer(null);
    setInputAnswer('');
    setPhase('game');
  };

  const checkAnswer = (val) => {
    if (isAnswered) return;
    const q = questions[currentIndex];
    let isCorrect = false;

    if (config.type === 'choice') {
      isCorrect = val === q.answer;
      setSelectedAnswer(val);
    } else {
      const norm = (s) => s.toLowerCase().replace(/[.\s]/g, '');
      isCorrect = q.validReadings.some(r => norm(r) === norm(val));
    }

    if (isCorrect) {
      setScore(s => s + 1);
      setFeedback('correct');
    } else {
      setFeedback('incorrect');
    }
    setIsAnswered(true);

    if (config.autoAdvance) {
      setTimeout(() => nextQuestion(), isCorrect ? 2000 : 4000);
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

  const resetToMenu = () => { setIsOpen(false); setPhase('menu'); };

  if (!isOpen) {
    return (
      <button onClick={() => setIsOpen(true)} className="group relative inline-flex items-center gap-2 rounded-full bg-indigo-600 px-8 py-3.5 text-sm font-black text-white shadow-xl shadow-indigo-500/20 hover:scale-105 hover:bg-indigo-700 transition-all cursor-pointer">
        <BrainCircuit size={20} />
        Start {level} Quiz
      </button>
    );
  }

  if (!mounted) return null;

  const currentQ = questions[currentIndex];
  const progress = ((currentIndex + (isAnswered ? 1 : 0)) / questions.length) * 100;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-0 sm:p-4 animate-in fade-in duration-300">
      <div className="w-full h-[100dvh] sm:h-auto sm:max-h-[95vh] max-w-2xl flex flex-col bg-white dark:bg-[#020617] shadow-2xl sm:rounded-[2.5rem] overflow-hidden border border-white/10">
        
        {/* Top Header & Progress */}
        <div className="shrink-0 bg-white dark:bg-[#020617] border-b border-slate-100 dark:border-white/5">
          <div className="flex items-center justify-between p-4 sm:px-8">
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500">JLPT {level} Kanji</span>
              <h3 className="font-bold text-slate-800 dark:text-white">
                {phase === 'game' ? `Question ${currentIndex + 1} of ${questions.length}` : 'Kanji Challenge'}
              </h3>
            </div>
            <button onClick={resetToMenu} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 cursor-pointer transition-colors"><X size={20} /></button>
          </div>
          {phase === 'game' && (
            <div className="h-1.5 w-full bg-slate-100 dark:bg-white/5">
              <div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: `${progress}%` }}></div>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-6 sm:p-10 custom-scrollbar">
          
          {phase === 'menu' && (
            <div className="space-y-10 py-10 text-center animate-in zoom-in-95 duration-300">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-indigo-500 blur-3xl opacity-20 rounded-full animate-pulse"></div>
                <div className="relative h-32 w-32 mx-auto flex items-center justify-center rounded-[2.5rem] bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-2xl transform -rotate-3">
                  <Star size={60} fill="currentColor" />
                </div>
              </div>
              <div className="space-y-3">
                <h2 className="text-3xl font-black text-slate-900 dark:text-white">Master the Kanji</h2>
                <p className="text-slate-500 max-w-xs mx-auto">Challenge yourself with meanings and readings of {kanjiData.length} characters.</p>
              </div>
              <div className="grid gap-4 max-w-sm mx-auto">
                <button onClick={startGame} className="w-full rounded-2xl bg-indigo-600 py-5 font-black text-white shadow-xl shadow-indigo-500/30 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-3">
                  <Play size={20} fill="currentColor" /> Quick Start (10 Qs)
                </button>
                <button onClick={() => setPhase('config')} className="w-full rounded-2xl border-2 border-slate-100 dark:border-white/10 py-4 font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 transition-all cursor-pointer">
                  Settings & Custom Mode
                </button>
              </div>
            </div>
          )}

          {phase === 'config' && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Quiz Mode</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    {id: 'meaning', label: 'Meanings', desc: 'Identify by Indonesian meaning'},
                    {id: 'reading', label: 'Readings', desc: 'Identify by On/Kun readings'},
                    {id: 'mixed', label: 'Mixed', desc: 'Randomized questions'}
                  ].map(m => (
                    <button key={m.id} onClick={() => setConfig({...config, mode: m.id})} className={cn("p-4 rounded-3xl border-2 text-left transition-all cursor-pointer", config.mode === m.id ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20" : "border-slate-100 dark:border-white/5")}>
                      <p className={cn("font-black", config.mode === m.id ? "text-indigo-600" : "text-slate-700 dark:text-slate-300")}>{m.label}</p>
                      <p className="text-[10px] text-slate-400 mt-1 leading-tight">{m.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Answer Format</label>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => setConfig({...config, type: 'choice'})} className={cn("p-4 rounded-3xl border-2 transition-all cursor-pointer flex items-center gap-3", config.type === 'choice' ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600" : "border-slate-100 dark:border-white/5 text-slate-500")}><MousePointer2 size={18}/> <span className="font-bold">Multiple Choice</span></button>
                  <button onClick={() => setConfig({...config, type: 'input'})} className={cn("p-4 rounded-3xl border-2 transition-all cursor-pointer flex items-center gap-3", config.type === 'input' ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600" : "border-slate-100 dark:border-white/5 text-slate-500")}><Keyboard size={18}/> <span className="font-bold">Typing</span></button>
                </div>
              </div>

              <div className="flex items-center justify-between p-6 rounded-[2rem] bg-slate-50 dark:bg-white/5">
                <div>
                  <p className="font-black text-slate-900 dark:text-white">Auto Advance</p>
                  <p className="text-xs text-slate-500">Skip to next question automatically after answering</p>
                </div>
                <button onClick={() => setConfig({...config, autoAdvance: !config.autoAdvance})} className={cn("relative h-8 w-14 rounded-full transition-colors cursor-pointer", config.autoAdvance ? "bg-emerald-500" : "bg-slate-300 dark:bg-white/20")}><span className={cn("absolute top-1 left-1 h-6 w-6 rounded-full bg-white shadow-sm transition-transform", config.autoAdvance ? "translate-x-6" : "translate-x-0")} /></button>
              </div>

              <button onClick={startGame} className="w-full rounded-3xl bg-slate-900 dark:bg-white py-5 font-black text-white dark:text-slate-900 shadow-2xl hover:scale-[1.02] active:scale-95 transition-all cursor-pointer">Start Challenge</button>
            </div>
          )}

          {phase === 'game' && currentQ && (
            <div className="space-y-8 animate-in slide-in-from-bottom-6 duration-500">
              
              {/* Question Card */}
              {!isAnswered ? (
                <div className="space-y-8">
                  <div className="text-center space-y-6">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 dark:bg-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                      {currentQ.mode === 'meaning' ? 'Find Meaning' : 'Find Reading'}
                    </div>
                    <div className="h-48 sm:h-64 flex items-center justify-center rounded-[3rem] bg-slate-50 dark:bg-white/5 border-2 border-slate-100 dark:border-white/5 shadow-inner">
                      <span className="text-8xl sm:text-9xl font-black text-slate-900 dark:text-white drop-shadow-sm">{currentQ.display}</span>
                    </div>
                  </div>

                  {config.type === 'input' ? (
                    <form onSubmit={(e) => { e.preventDefault(); checkAnswer(inputAnswer); }} className="space-y-4">
                      <input ref={inputRef} value={inputAnswer} onChange={(e) => setInputAnswer(e.target.value)} className="w-full rounded-[2rem] border-2 border-slate-200 dark:border-white/10 bg-transparent px-8 py-6 text-center text-3xl font-black focus:ring-8 focus:ring-indigo-500/10 outline-none transition-all dark:text-white" placeholder="..." />
                      <button type="submit" className="w-full rounded-2xl bg-indigo-600 py-5 font-black text-white shadow-xl shadow-indigo-500/20 cursor-pointer">Check Answer</button>
                    </form>
                  ) : (
                    <div className="grid grid-cols-1 gap-3">
                      {currentQ.options.map((opt, i) => (
                        <button key={i} onClick={() => checkAnswer(opt.label)} className="w-full p-6 rounded-3xl border-2 border-slate-100 dark:border-white/5 text-left font-bold text-lg hover:border-indigo-500 hover:bg-indigo-50/30 dark:hover:bg-indigo-900/20 transition-all cursor-pointer group flex items-center justify-between">
                          <div className="flex flex-col">
                            <span className="text-slate-800 dark:text-slate-200">{opt.label}</span>
                            {opt.romaji && <span className="text-xs text-slate-400 font-mono font-medium uppercase tracking-widest">{opt.romaji}</span>}
                          </div>
                          <div className="h-8 w-8 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center text-xs text-slate-300 group-hover:text-indigo-500">{i+1}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                /* Feedback / Detail Card */
                <div className="animate-in zoom-in-95 duration-300 space-y-6">
                  <div className={cn("p-8 rounded-[3rem] text-center border-4", feedback === 'correct' ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10" : "border-red-500 bg-red-50 dark:bg-red-900/10")}>
                    <div className="flex justify-center mb-4">
                      {feedback === 'correct' ? <Check size={48} className="text-emerald-500" /> : <X size={48} className="text-red-500" />}
                    </div>
                    <h4 className={cn("text-2xl font-black mb-1", feedback === 'correct' ? "text-emerald-600" : "text-red-600")}>
                      {feedback === 'correct' ? 'Perfect Match!' : 'Not Quite...'}
                    </h4>
                    <p className="text-slate-500 text-sm font-medium">The correct answer was <span className="font-black text-slate-900 dark:text-white underline decoration-indigo-500 underline-offset-4">{currentQ.answer}</span></p>
                  </div>

                  {/* Reinforcement Data */}
                  <div className="bg-white dark:bg-white/5 rounded-[3rem] border border-slate-100 dark:border-white/10 p-8 space-y-8 shadow-sm">
                    <div className="flex items-center gap-6 border-b border-slate-100 dark:border-white/5 pb-6">
                      <div className="text-6xl font-black dark:text-white">{currentQ.kanji.character}</div>
                      <div>
                        <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Meaning</h5>
                        <p className="text-xl font-bold text-slate-800 dark:text-slate-200">{currentQ.kanji.meaning_id || currentQ.kanji.meaning_en}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Onyomi</h5>
                        <div className="flex flex-wrap gap-1">
                          {currentQ.kanji.onyomi?.map((on, i) => (
                            <span key={i} className="px-2 py-1 bg-slate-100 dark:bg-white/5 rounded-lg text-xs font-bold dark:text-slate-300">{on.reading || on.kana} <span className="opacity-50 font-normal">({on.romaji})</span></span>
                          )) || '-'}
                        </div>
                      </div>
                      <div>
                        <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Kunyomi</h5>
                        <div className="flex flex-wrap gap-1">
                          {currentQ.kanji.kunyomi?.map((kun, i) => (
                            <span key={i} className="px-2 py-1 bg-slate-100 dark:bg-white/5 rounded-lg text-xs font-bold dark:text-slate-300">{kun.reading || kun.kana} <span className="opacity-50 font-normal">({kun.romaji})</span></span>
                          )) || '-'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {!config.autoAdvance && (
                    <button ref={nextButtonRef} onClick={nextQuestion} className="w-full rounded-3xl bg-slate-900 dark:bg-white py-6 font-black text-white dark:text-slate-900 shadow-2xl flex items-center justify-center gap-3 cursor-pointer">
                      Next Challenge <ChevronRight size={24} />
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {phase === 'result' && (
            <div className="text-center space-y-10 py-10 animate-in zoom-in duration-500">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-yellow-400 blur-3xl opacity-30 rounded-full animate-pulse"></div>
                <Trophy size={120} className="relative text-yellow-500 drop-shadow-2xl" />
              </div>
              <div className="space-y-2">
                <h2 className="text-5xl font-black text-slate-900 dark:text-white">{Math.round((score/questions.length)*100)}%</h2>
                <p className="text-xl font-bold text-slate-500">You mastered {score} out of {questions.length} Kanji!</p>
              </div>
              <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
                <button onClick={() => setPhase('menu')} className="rounded-3xl border-2 border-slate-200 py-4 font-bold text-slate-600 dark:text-white hover:bg-slate-50 dark:hover:bg-white/5 transition-all cursor-pointer">Back to Menu</button>
                <button onClick={startGame} className="rounded-3xl bg-indigo-600 py-4 font-bold text-white shadow-xl shadow-indigo-500/30 hover:bg-indigo-700 transition-all cursor-pointer">Try Again</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}