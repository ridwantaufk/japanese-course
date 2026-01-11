'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Trophy, Check, RefreshCw, Play, Settings, Keyboard, MousePointer2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function KanaQuizModal({ hiragana, katakana, vocabulary = [], sentences = [] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [phase, setPhase] = useState('menu'); // menu, config, game, result
  
  // Ensure we are on client to access document.body
  useEffect(() => {
    setMounted(true);
  }, []);

  // Configuration
  const [config, setConfig] = useState({
    mode: 'mixed', // hiragana, katakana, mixed
    type: 'choice', // choice, input
    direction: 'random', // k2r (Kana->Romaji), r2k (Romaji->Kana), random
    count: 10,
    length: 1, // 1=Char, 2-4=Word, 5-8=Sentence
    source: 'random', // random, database (only if length > 1)
    sentenceDifficulty: 'all', // all, short, medium, long, very_long
    autoAdvance: false // true = auto next, false = manual next
  });

  const [customCount, setCustomCount] = useState(10);

  // Game State
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null); // For Choice
  const [inputAnswer, setInputAnswer] = useState(''); // For Input
  const [isAnswered, setIsAnswered] = useState(false);
  const [feedback, setFeedback] = useState(null); // correct, close, incorrect
  const [diffResult, setDiffResult] = useState([]); // Array of {char, status}

  const inputRef = useRef(null);
  const nextButtonRef = useRef(null); // Ref for auto-focusing next button

  // Focus input when moving to next question in input mode
  useEffect(() => {
    if (phase === 'game' && !isAnswered) {
       // Focus input if typing mode
       if (config.type === 'input' && inputRef.current) {
         inputRef.current.focus();
       }
    } else if (phase === 'game' && isAnswered && !config.autoAdvance) {
       // Focus next button if manual mode answered
       if (nextButtonRef.current) {
         nextButtonRef.current.focus();
       }
    }
  }, [currentIndex, phase, config.type, isAnswered, config.autoAdvance]);

  // --- UTILS: LEVENSHTEIN DISTANCE & DIFF ---
  const calculateLevenshtein = (a, b) => {
    const matrix = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            Math.min(
              matrix[i][j - 1] + 1, // insertion
              matrix[i - 1][j] + 1  // deletion
            )
          );
        }
      }
    }
    return matrix[b.length][a.length];
  };

  const generateDiff = (user, correct) => {
    if (!correct) return [{ char: 'Error: No answer data', status: 'missing' }];

    const result = [];
    const maxLength = Math.max(user.length, correct.length);
    
    for(let i=0; i<maxLength; i++) {
        const u = user[i] || '';
        const c = correct[i] || '';
        
        if (c === '') continue; 

        if (u === c) {
            result.push({ char: c, status: 'correct' });
        } else {
            result.push({ char: c, status: 'missing', userChar: u });
        }
    }
    return result;
  };

  const generateQuestions = (cfg) => {
    let charPool = [];
    if (cfg.mode === 'hiragana' || cfg.mode === 'mixed') charPool = [...charPool, ...hiragana];
    if (cfg.mode === 'katakana' || cfg.mode === 'mixed') charPool = [...charPool, ...katakana];
    
    const shuffledPool = [...charPool].sort(() => Math.random() - 0.5);
    
    const finalQuestions = [];
    
    for (let i = 0; i < cfg.count; i++) {
      let targets = [];
      let questionText = '';
      let answerText = '';
      let meaning = '';

      let dir = cfg.direction;
      if (dir === 'random') dir = Math.random() > 0.5 ? 'k2r' : 'r2k';

      // --- GENERATION LOGIC ---
      if (cfg.source === 'sentences' && sentences.length > 0) {
        let sentencePool = [...sentences];
        
        if (cfg.sentenceDifficulty !== 'all') {
          sentencePool = sentencePool.filter(s => s.difficulty === cfg.sentenceDifficulty);
        }

        if (cfg.mode !== 'mixed') {
           const typeFiltered = sentencePool.filter(s => s.type === cfg.mode);
           if (typeFiltered.length > 0) {
             sentencePool = typeFiltered;
           } else {
             const mixedBackup = sentencePool.filter(s => s.type === 'mixed');
             if (mixedBackup.length > 0) sentencePool = mixedBackup;
           }
        }
        
        if (sentencePool.length === 0) sentencePool = sentences; 
        
        const sentence = sentencePool[Math.floor(Math.random() * sentencePool.length)];
        
        questionText = dir === 'k2r' ? sentence.sentence : sentence.romaji;
        answerText = dir === 'k2r' ? sentence.romaji : sentence.sentence;
        meaning = sentence.meaning_id || sentence.meaning_en;

      } else if (cfg.source === 'database' && cfg.length !== 1 && vocabulary.length > 0) {
        const shuffledVocab = [...vocabulary].sort(() => Math.random() - 0.5);
        const vocab = shuffledVocab[i % shuffledVocab.length];
        
        const kanaText = (cfg.mode === 'katakana' && vocab.katakana) ? vocab.katakana : (vocab.hiragana || vocab.word);
        
        questionText = dir === 'k2r' ? kanaText : vocab.romaji;
        answerText = dir === 'k2r' ? vocab.romaji : kanaText;
        meaning = vocab.meaning_id || vocab.meaning_en;

      } else {
        const chunkLength = cfg.length === 1 ? 1 : Math.floor(Math.random() * (cfg.length === 'word' ? 3 : 5)) + 2; 
        
        for (let j = 0; j < (cfg.length === 1 ? 1 : chunkLength); j++) {
           const randomChar = shuffledPool[Math.floor(Math.random() * shuffledPool.length)];
           targets.push(randomChar);
        }

        const qRaw = targets.map(t => t.character).join('');
        const aRaw = targets.map(t => t.romaji).join('');
        
        questionText = dir === 'k2r' ? qRaw : aRaw;
        answerText = dir === 'k2r' ? aRaw : qRaw;
      }

      // Options generation
      let options = [];
      if (cfg.type === 'choice') {
        const correctOpt = { id: 'correct', label: answerText };
        const dists = [];
        let attempts = 0;
        
        while(dists.length < 3 && attempts < 50) {
           attempts++;
           let dLabel = '';
           
           if (cfg.source === 'sentences') {
             const randomS = sentences[Math.floor(Math.random() * sentences.length)];
             dLabel = dir === 'k2r' ? randomS.romaji : randomS.sentence;
           } else if (cfg.source === 'database') {
             const randomV = vocabulary[Math.floor(Math.random() * vocabulary.length)];
             const dKana = (cfg.mode === 'katakana' && randomV.katakana) ? randomV.katakana : (randomV.hiragana || randomV.word);
             dLabel = dir === 'k2r' ? randomV.romaji : dKana;
           } else {
             const dTargets = [];
             const len = answerText.length;
             for (let k = 0; k < len; k++) dTargets.push(shuffledPool[Math.floor(Math.random() * shuffledPool.length)]);
             const dQ = dTargets.map(t => t.character).join('');
             const dA = dTargets.map(t => t.romaji).join('');
             dLabel = dir === 'k2r' ? dA : dQ;
           }
           
           if (dLabel !== correctOpt.label && !dists.find(d => d.label === dLabel)) {
             dists.push({ id: `dist_${dists.length}`, label: dLabel });
           }
        }
        options = [correctOpt, ...dists].sort(() => Math.random() - 0.5);
      }

      finalQuestions.push({
        display: questionText,
        answer: answerText,
        meaning: meaning,
        direction: dir,
        options
      });
    }

    return finalQuestions;
  };

  const startQuickGame = () => {
    const quickConfig = { mode: 'mixed', type: 'choice', direction: 'random', count: 10, length: 1, source: 'random', autoAdvance: false };
    setConfig(quickConfig);
    setQuestions(generateQuestions(quickConfig));
    resetGameState();
    setPhase('game');
  };

  const startCustomGame = () => {
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
    setDiffResult([]);
  };

  const handleChoiceAnswer = (optionLabel) => {
    if (isAnswered) return;
    setIsAnswered(true);
    
    const currentQ = questions[currentIndex];
    const isCorrect = optionLabel === currentQ.answer;

    if (isCorrect) {
        setScore(s => s + 1);
        setFeedback('correct');
    } else {
        setFeedback('incorrect');
    }
    setSelectedAnswer(optionLabel); 

    if (config.autoAdvance) {
       setTimeout(() => nextQuestion(), 1500);
    }
  };

  const handleInputSubmit = (e) => {
    e.preventDefault();
    if (isAnswered) return;
    
    const currentQ = questions[currentIndex];
    const userVal = inputAnswer.trim();

    if (!userVal) return;

    const correctVal = currentQ.answer;
    
    const normalize = (str) => {
      let s = str.toLowerCase();
      // Handle Macrons (Hepburn -> Waapuro)
      s = s.replace(/ā/g, 'aa')
           .replace(/ī/g, 'ii')
           .replace(/ū/g, 'uu')
           .replace(/ē/g, 'ee')
           .replace(/ō/g, 'ou'); // Most common mapping (Tōkyō -> Toukyou)
      
      // Remove punctuation, spaces, and hyphens
      return s.replace(/[.,?!、。？！\s\u3000\-]/g, '');
    };
    
    const toHiragana = (str) => {
      return str.replace(/[\u30a1-\u30f6]/g, function(match) {
        var chr = match.charCodeAt(0) - 0x60;
        return String.fromCharCode(chr);
      });
    };

    const cleanUser = normalize(userVal);
    const cleanCorrect = normalize(correctVal);
    const cleanCorrectHiragana = toHiragana(cleanCorrect);

    // 1. Exact Match Check
    let isExactMatch = (cleanUser === cleanCorrect) || (cleanUser === cleanCorrectHiragana);

    // 1b. Special tolerance for 'ou' vs 'oo' (e.g. Arigatou vs Arigatoo)
    if (!isExactMatch) {
       const userOO = cleanUser.replace(/ou/g, 'oo');
       const correctOO = cleanCorrect.replace(/ou/g, 'oo');
       if (userOO === correctOO) isExactMatch = true;
    }

    const distance = calculateLevenshtein(cleanUser, cleanCorrect);
    const maxLength = Math.max(cleanUser.length, cleanCorrect.length);
    const similarity = 1 - (distance / maxLength); 

    let resultStatus = 'incorrect';
    
    if (isExactMatch || similarity === 1) {
        resultStatus = 'correct';
        setScore(s => s + 1);
    } else if (similarity > 0.8) {
        resultStatus = 'close';
        setScore(s => s + 1); 
    } else {
        resultStatus = 'incorrect';
    }

    setDiffResult(generateDiff(userVal, correctVal)); 

    setIsAnswered(true);
    setFeedback(resultStatus);

    if (config.autoAdvance) {
        const delay = resultStatus === 'correct' ? 1500 : 4000;
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
      setDiffResult([]);
    } else {
      setPhase('result');
    }
  };

  const resetToMenu = () => {
    setIsOpen(false);
    setPhase('menu');
  };

  // --- TRIGGER BUTTON ---
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

  // --- PORTAL CONTENT ---
  // Only render portal when mounted on client to prevent hydration mismatch
  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-0 sm:p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full h-[100dvh] sm:h-auto sm:max-h-[90vh] max-w-xl flex flex-col bg-white shadow-2xl dark:bg-[#0f172a] dark:border dark:border-white/10 sm:rounded-3xl overflow-hidden">
        
        {/* Header - Fixed Height */}
        <div className="flex items-center justify-between border-b border-slate-100 p-4 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 shrink-0 h-16 sm:h-auto">
          <h3 className="font-bold text-slate-800 dark:text-white truncate pr-2 text-lg">
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

        {/* Scrollable Content Area - Flexible Height */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 scroll-smooth scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-white/10 scrollbar-track-transparent">
          
          {/* MENU PHASE */}
          {phase === 'menu' && (
            <div className="space-y-6 py-4">
              <div className="text-center space-y-2">
                <div className="mx-auto flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                  <Settings size={32} className="sm:w-10 sm:h-10" />
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">Choose Your Challenge</h2>
                <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400">Select a preset or customize your experience.</p>
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
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">10 Questions, Mixed Kana, Multiple Choice.</p>
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
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Customize count, mode, type, and more.</p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* CONFIG PHASE */}
          {phase === 'config' && (
            <div className="space-y-6 pb-20 sm:pb-0"> 
              
              {/* Content Mode */}
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-400">Script</label>
                <div className="grid grid-cols-3 gap-2">
                  {['hiragana', 'katakana', 'mixed'].map(m => (
                    <button
                      key={m}
                      onClick={() => setConfig({ ...config, mode: m })}
                      className={cn(
                        "rounded-xl border-2 py-2 text-sm sm:text-base font-bold capitalize transition-all",
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

              {/* Length & Source (Combined Logic) */}
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-400">Content Type</label>
                <div className="grid grid-cols-2 gap-2 text-sm">
                   <button
                      onClick={() => setConfig({ ...config, length: 1, source: 'random', sentenceDifficulty: 'all' })}
                      className={cn(
                        "flex flex-col items-center justify-center gap-1 rounded-xl border-2 py-3 font-bold transition-all",
                        config.length === 1
                          ? "border-teal-500 bg-teal-50 text-teal-700 dark:bg-teal-900/20 dark:text-teal-400" 
                          : "border-slate-100 bg-white text-slate-500 hover:border-slate-300 dark:border-white/10 dark:bg-white/5 dark:text-slate-400"
                      )}
                    >
                      <span>Single Char</span>
                    </button>

                    <button
                      onClick={() => setConfig({ ...config, length: 'word', source: 'database', sentenceDifficulty: 'all' })}
                      className={cn(
                        "flex flex-col items-center justify-center gap-1 rounded-xl border-2 py-3 font-bold transition-all",
                        config.source === 'database'
                          ? "border-teal-500 bg-teal-50 text-teal-700 dark:bg-teal-900/20 dark:text-teal-400" 
                          : "border-slate-100 bg-white text-slate-500 hover:border-slate-300 dark:border-white/10 dark:bg-white/5 dark:text-slate-400"
                      )}
                    >
                      <span>Real Words</span>
                      <span className="text-[10px] font-normal opacity-70">Database</span>
                    </button>

                     <button
                      onClick={() => setConfig({ ...config, length: 'sentence', source: 'sentences', sentenceDifficulty: 'all' })}
                      className={cn(
                        "flex flex-col items-center justify-center gap-1 rounded-xl border-2 py-3 font-bold transition-all",
                        config.source === 'sentences'
                          ? "border-teal-500 bg-teal-50 text-teal-700 dark:bg-teal-900/20 dark:text-teal-400" 
                          : "border-slate-100 bg-white text-slate-500 hover:border-slate-300 dark:border-white/10 dark:bg-white/5 dark:text-slate-400"
                      )}
                    >
                      <span>Sentences</span>
                      <span className="text-[10px] font-normal opacity-70">Database</span>
                    </button>

                     <button
                      onClick={() => setConfig({ ...config, length: 'word', source: 'random', sentenceDifficulty: 'all' })}
                      className={cn(
                        "flex flex-col items-center justify-center gap-1 rounded-xl border-2 py-3 font-bold transition-all",
                        config.length !== 1 && config.source === 'random'
                          ? "border-teal-500 bg-teal-50 text-teal-700 dark:bg-teal-900/20 dark:text-teal-400" 
                          : "border-slate-100 bg-white text-slate-500 hover:border-slate-300 dark:border-white/10 dark:bg-white/5 dark:text-slate-400"
                      )}
                    >
                      <span>Random</span>
                      <span className="text-[10px] font-normal opacity-70">Gibberish</span>
                    </button>
                </div>
              </div>

              {/* Sentence Difficulty Selector */}
              {config.source === 'sentences' && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                  <label className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-400">Sentence Length</label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                    {['all', 'short', 'medium', 'long', 'very_long'].map(d => (
                      <button
                        key={d}
                        onClick={() => setConfig({ ...config, sentenceDifficulty: d })}
                        className={cn(
                          "rounded-lg border-2 py-2 font-bold capitalize transition-all",
                          config.sentenceDifficulty === d 
                            ? "border-purple-500 bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400" 
                            : "border-slate-100 bg-white text-slate-500 hover:border-slate-300 dark:border-white/10 dark:bg-white/5 dark:text-slate-400"
                        )}
                      >
                        {d.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Answer Style */}
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-400">Answer Style</label>
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

              {/* Count */}
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-400">Question Count</label>
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

              {/* Auto Advance Toggle */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10">
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">Auto Advance</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Next question automatically</p>
                </div>
                <button
                  onClick={() => setConfig({ ...config, autoAdvance: !config.autoAdvance })}
                  className={cn(
                    "relative h-8 w-14 rounded-full transition-colors",
                    config.autoAdvance ? "bg-green-500" : "bg-slate-300 dark:bg-white/20"
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-1 left-1 h-6 w-6 rounded-full bg-white shadow-sm transition-transform",
                      config.autoAdvance ? "translate-x-6" : "translate-x-0"
                    )}
                  />
                </button>
              </div>

              <div className="pt-4 pb-10 sm:pb-0">
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
            <div className="space-y-6 sm:space-y-8 py-2">
              <div className="text-center">
                 <p className="mb-2 sm:mb-4 text-xs sm:text-sm font-bold uppercase tracking-widest text-slate-400">
                    {questions[currentIndex].direction === 'k2r' ? 'Type Romaji' : 'Type Kana'}
                 </p>
                 <div className="flex min-h-[120px] sm:min-h-[160px] flex-col items-center justify-center rounded-3xl bg-slate-50 p-4 sm:p-6 dark:bg-white/5">
                    <span className={cn(
                      "font-black text-slate-900 dark:text-white transition-all break-all leading-relaxed",
                      questions[currentIndex].display.length > 30 ? "text-lg sm:text-2xl text-left" : 
                      questions[currentIndex].display.length > 15 ? "text-xl sm:text-3xl" : 
                      questions[currentIndex].display.length > 10 ? "text-2xl sm:text-4xl" : 
                      questions[currentIndex].display.length > 4 ? "text-4xl sm:text-6xl" : "text-6xl sm:text-7xl"
                    )}>
                       {questions[currentIndex].display}
                    </span>
                 </div>
                 
                 {/* Script Hint for R2K */}
                 {questions[currentIndex].direction === 'r2k' && (
                   <div className="flex justify-center gap-2 mt-2">
                      {/[ァ-ン]/.test(questions[currentIndex].answer) && (
                        <span className="px-2 py-1 rounded-md bg-orange-100 text-orange-600 text-xs font-bold dark:bg-orange-900/30 dark:text-orange-400">
                          Contains Katakana
                        </span>
                      )}
                   </div>
                 )}

                 {questions[currentIndex].meaning && (
                   <p className="mt-4 text-sm font-medium text-slate-500 dark:text-slate-400 italic">
                     {questions[currentIndex].meaning}
                   </p>
                 )}
              </div>

              {/* INPUT MODE (TextArea) */}
              {config.type === 'input' && (
                <form onSubmit={handleInputSubmit} className="space-y-4">
                  <div className="relative">
                    <textarea
                      ref={inputRef}
                      autoComplete="off"
                      autoFocus
                      disabled={isAnswered}
                      value={inputAnswer}
                      onChange={(e) => setInputAnswer(e.target.value)}
                      onKeyDown={(e) => {
                        if(e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleInputSubmit(e);
                        }
                      }}
                      placeholder={
                        questions[currentIndex].direction === 'k2r' 
                          ? "Type Romaji..." 
                          : "Type Kana..."
                      }
                      className={cn(
                        "w-full min-h-[100px] resize-y rounded-2xl border-2 px-4 sm:px-6 py-4 text-center text-lg sm:text-xl font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/20 disabled:opacity-70 dark:bg-black/20 dark:text-white",
                        !isAnswered && "border-slate-200 focus:border-indigo-500 dark:border-white/10 dark:focus:border-indigo-400",
                        isAnswered && feedback === 'correct' && "border-green-500 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400",
                        isAnswered && feedback === 'close' && "border-yellow-500 bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400",
                        isAnswered && feedback === 'incorrect' && "border-red-500 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                      )}
                    />
                    
                    {/* Status Icons */}
                    {isAnswered && (
                      <div className="absolute right-4 top-4">
                        {feedback === 'correct' && <Check size={24} className="text-green-600 dark:text-green-400" />}
                        {feedback === 'close' && <AlertCircle size={24} className="text-yellow-600 dark:text-yellow-400" />}
                        {feedback === 'incorrect' && <X size={24} className="text-red-600 dark:text-red-400" />}
                      </div>
                    )}
                  </div>
                  
                  {/* Feedback / Diff Display */}
                  {isAnswered && (feedback === 'incorrect' || feedback === 'close') && (
                    <div className="animate-in slide-in-from-top-2 text-center p-4 bg-slate-50 rounded-xl border border-slate-100 dark:bg-white/5 dark:border-white/5">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                        Correction
                      </p>
                      
                      {/* Diff Visualization */}
                      <div className="text-base sm:text-lg font-bold leading-relaxed break-all">
                        {diffResult.map((item, idx) => (
                            <span 
                                key={idx}
                                className={cn(
                                    item.status === 'correct' ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 px-0.5 rounded"
                                )}
                            >
                                {item.char}
                            </span>
                        ))}
                      </div>
                      
                      {/* Show user input literal for comparison if needed */}
                      {feedback === 'close' && (
                          <p className="mt-2 text-xs sm:text-sm text-yellow-600 dark:text-yellow-400 font-bold">
                              Almost correct! Watch out for small typos.
                          </p>
                      )}
                    </div>
                  )}

                  {!isAnswered ? (
                    <button type="submit" className="w-full rounded-xl bg-indigo-600 py-4 font-bold text-white shadow-lg hover:bg-indigo-700">
                      Check Answer
                    </button>
                  ) : (
                    !config.autoAdvance && (
                      <button 
                        ref={nextButtonRef}
                        type="button" 
                        onClick={nextQuestion} 
                        className="w-full rounded-xl bg-slate-900 py-4 font-bold text-white shadow-lg hover:bg-slate-800 dark:bg-white dark:text-slate-900 animate-in fade-in slide-in-from-bottom-2"
                      >
                        Next Question
                      </button>
                    )
                  )}
                </form>
              )}

              {/* CHOICE MODE */}
              {config.type === 'choice' && (
                 <div className="space-y-4">
                   <div className="grid grid-cols-1 gap-3">
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
                           <span className={cn(
                             "font-bold dark:text-white break-all",
                             opt.label.length > 20 ? "text-base text-left" : "text-xl"
                           )}>{opt.label}</span>
                        </button>
                      );
                   })}
                   </div>
                   
                   {isAnswered && !config.autoAdvance && (
                      <button 
                        ref={nextButtonRef}
                        onClick={nextQuestion} 
                        className="w-full rounded-xl bg-slate-900 py-4 font-bold text-white shadow-lg hover:bg-slate-800 dark:bg-white dark:text-slate-900 animate-in fade-in slide-in-from-bottom-2"
                      >
                        Next Question
                      </button>
                   )}
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
    </div>,
    document.body
  );
}
