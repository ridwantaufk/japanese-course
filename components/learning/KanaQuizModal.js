'use client';

import { useState, useEffect } from 'react';
import { X, Trophy, Check, RefreshCw, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function KanaQuizModal({ hiragana, katakana }) {
  const [isOpen, setIsOpen] = useState(false);
  const [gameMode, setGameMode] = useState(null); // 'hiragana', 'katakana', 'mixed'
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);

  const generateQuestions = (mode) => {
    let pool = [];
    if (mode === 'hiragana' || mode === 'mixed') pool = [...pool, ...hiragana];
    if (mode === 'katakana' || mode === 'mixed') pool = [...pool, ...katakana];

    // Shuffle pool
    pool = pool.sort(() => Math.random() - 0.5);

    // Take top 20 or all if less
    const questionCount = Math.min(20, pool.length);
    const selectedChars = pool.slice(0, questionCount);

    return selectedChars.map(correctChar => {
      // Decide question type: 0 = Character -> Romaji, 1 = Romaji -> Character
      const type = Math.random() > 0.5 ? 0 : 1;
      
      // Get 3 distractors
      const distractors = pool
        .filter(c => c.id !== correctChar.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
      
      const options = [correctChar, ...distractors].sort(() => Math.random() - 0.5);

      return {
        correct: correctChar,
        type, // 0: Show Char, 1: Show Romaji
        options
      };
    });
  };

  const startGame = (mode) => {
    setGameMode(mode);
    setQuestions(generateQuestions(mode));
    setCurrentIndex(0);
    setScore(0);
    setShowResult(false);
    setIsAnswered(false);
    setSelectedAnswer(null);
    setIsOpen(true);
  };

  const handleAnswer = (option) => {
    if (isAnswered) return;
    
    setSelectedAnswer(option);
    setIsAnswered(true);

    const currentQ = questions[currentIndex];
    const isCorrect = option.id === currentQ.correct.id;

    if (isCorrect) {
      setScore(s => s + 1);
    }

    // Auto advance
    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setIsAnswered(false);
        setSelectedAnswer(null);
      } else {
        setShowResult(true);
      }
    }, 1000);
  };

  const resetGame = () => {
    setIsOpen(false);
    setGameMode(null);
  };

  if (!isOpen && !gameMode) {
    return (
      <div className="flex justify-center gap-4">
         <button
          onClick={() => startGame('hiragana')}
          className="flex items-center gap-2 rounded-full bg-pink-500 px-6 py-3 font-bold text-white shadow-lg transition-transform hover:scale-105 hover:bg-pink-600 active:scale-95"
        >
          <Play size={20} fill="currentColor" />
          Test Hiragana
        </button>
        <button
          onClick={() => startGame('katakana')}
          className="flex items-center gap-2 rounded-full bg-indigo-500 px-6 py-3 font-bold text-white shadow-lg transition-transform hover:scale-105 hover:bg-indigo-600 active:scale-95"
        >
          <Play size={20} fill="currentColor" />
          Test Katakana
        </button>
        <button
          onClick={() => startGame('mixed')}
          className="flex items-center gap-2 rounded-full bg-slate-800 px-6 py-3 font-bold text-white shadow-lg transition-transform hover:scale-105 hover:bg-slate-900 active:scale-95 dark:bg-slate-700"
        >
           <Play size={20} fill="currentColor" />
          Mix Both
        </button>
      </div>
    );
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-[#0f172a] dark:border dark:border-white/10">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 p-4 dark:border-white/5">
          <span className="font-bold text-slate-500 dark:text-slate-400">
            {!showResult ? `Question ${currentIndex + 1}/${questions.length}` : 'Result'}
          </span>
          <button 
            onClick={resetGame}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-white/10"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {showResult ? (
            <div className="text-center space-y-6 py-4">
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-yellow-100 text-yellow-500 dark:bg-yellow-900/30">
                <Trophy size={48} />
              </div>
              <div>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white">
                  Score: {Math.round((score / questions.length) * 100)}%
                </h2>
                <p className="text-slate-500 dark:text-slate-400">
                  You got {score} out of {questions.length} correct!
                </p>
              </div>
              <button
                onClick={() => startGame(gameMode)}
                className="w-full rounded-xl bg-slate-900 py-4 font-bold text-white transition-transform hover:scale-[1.02] active:scale-[0.98] dark:bg-white dark:text-slate-900"
              >
                <div className="flex items-center justify-center gap-2">
                  <RefreshCw size={20} />
                  Try Again
                </div>
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Question Display */}
              <div className="text-center">
                <p className="mb-4 text-sm font-bold uppercase tracking-widest text-slate-400">
                  {questions[currentIndex].type === 0 ? 'What is this sound?' : 'Which character matches?'}
                </p>
                <div className="flex h-32 items-center justify-center rounded-2xl bg-slate-50 text-6xl font-black text-slate-900 dark:bg-white/5 dark:text-white">
                  {questions[currentIndex].type === 0 
                    ? questions[currentIndex].correct.character 
                    : questions[currentIndex].correct.romaji}
                </div>
              </div>

              {/* Options */}
              <div className="grid grid-cols-2 gap-3">
                {questions[currentIndex].options.map((opt) => {
                   const isCorrect = opt.id === questions[currentIndex].correct.id;
                   const isSelected = selectedAnswer?.id === opt.id;
                   
                   let btnClass = "relative flex flex-col items-center justify-center rounded-xl border-2 p-4 transition-all ";
                   
                   if (isAnswered) {
                     if (isCorrect) {
                       btnClass += "border-green-500 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400";
                     } else if (isSelected) {
                       btnClass += "border-red-500 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 opacity-50";
                     } else {
                        btnClass += "border-slate-100 bg-slate-50 opacity-50 dark:border-white/5 dark:bg-white/5";
                     }
                   } else {
                     btnClass += "cursor-pointer border-slate-100 bg-white hover:border-indigo-500 hover:shadow-md dark:border-white/10 dark:bg-white/5 dark:hover:border-indigo-400";
                   }

                   return (
                     <button
                        key={opt.id}
                        disabled={isAnswered}
                        onClick={() => handleAnswer(opt)}
                        className={btnClass}
                     >
                        <span className="text-2xl font-bold dark:text-white">
                          {questions[currentIndex].type === 0 ? opt.romaji : opt.character}
                        </span>
                     </button>
                   );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
