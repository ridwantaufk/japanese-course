"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import confetti from "canvas-confetti";
import { playAudioWithFallback } from "@/lib/tts";
import FuriganaText from "./FuriganaText";
import {
  X,
  Volume2,
  Check,
  XCircle,
  Trophy,
  Brain,
  BrainCircuit,
  Zap,
  MessageSquare,
  Shuffle,
  Target,
  Timer,
  Star,
  ChevronRight,
  Sparkles,
  RotateCcw,
  Flame,
  Award,
  TrendingUp,
  BookOpen,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const QUIZ_MODES = [
  {
    id: "flash",
    name: "Flash Cards",
    icon: Sparkles,
    description: "Quick memorization with instant feedback",
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: "multipleChoice",
    name: "Multiple Choice",
    icon: Target,
    description: "Choose the correct meaning from 4 options",
    color: "from-purple-500 to-pink-500",
  },
  {
    id: "typing",
    name: "Type Answer",
    icon: Brain,
    description: "Type the correct word or meaning",
    color: "from-green-500 to-emerald-500",
  },
  {
    id: "audio",
    name: "Audio Quiz",
    icon: Volume2,
    description: "Listen and identify the word",
    color: "from-orange-500 to-red-500",
  },
  {
    id: "matching",
    name: "Match Pairs",
    icon: Shuffle,
    description: "Match words with their meanings",
    color: "from-indigo-500 to-purple-500",
  },
  {
    id: "fillBlank",
    name: "Fill in the Blank",
    icon: MessageSquare,
    description: "Complete sentences with correct words",
    color: "from-teal-500 to-cyan-500",
  },
  {
    id: "speed",
    name: "Speed Challenge",
    icon: Zap,
    description: "Answer as many as you can in 60 seconds",
    color: "from-yellow-500 to-orange-500",
  },
  {
    id: "mixed",
    name: "Mixed Mode",
    icon: Trophy,
    description: "Random combination of all quiz types",
    color: "from-pink-500 to-rose-500",
  },
];

export default function InteractiveVocabularyQuiz({ vocabularyData, level }) {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMode, setSelectedMode] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [showAnswer, setShowAnswer] = useState(false);
  const [inputValue, setInputValue] = useState("");
  
  // Speed Challenge
  const [timeLeft, setTimeLeft] = useState(60);
  const [timerActive, setTimerActive] = useState(false);
  
  // Matching Game
  const [selectedPairs, setSelectedPairs] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [matchingItems, setMatchingItems] = useState([]);
  
  // Review
  const [showReview, setShowReview] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleFinishQuiz = useCallback(() => {
    setTimerActive(false);
    setShowReview(true);
    
    if (score / (selectedMode?.id === "matching" ? matchingItems.length / 2 : questions.length) >= 0.8) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [score, selectedMode, matchingItems.length, questions.length]);

  // Speed Challenge Timer
  useEffect(() => {
    if (timerActive && timeLeft > 0 && selectedMode?.id === "speed") {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && timerActive) {
      const timer = setTimeout(() => handleFinishQuiz(), 0);
      return () => clearTimeout(timer);
    }
  }, [timerActive, timeLeft, selectedMode, handleFinishQuiz]);

  const playAudio = useCallback(async (text, url) => {
    try {
      // Cancel any ongoing speech before starting new one
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      await playAudioWithFallback(url, text, { lang: 'ja-JP', rate: 0.85 });
    } catch (e) {
      // Ignore interrupted errors as they're expected when user clicks rapidly
      if (!e.message?.includes('interrupted')) {
        console.error('Audio playback failed:', e);
      }
    }
  }, []);

  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const generateQuestions = useCallback((mode, count = 20) => {
    if (!vocabularyData || vocabularyData.length === 0) return [];
    
    const shuffled = shuffleArray(vocabularyData);
    const selected = shuffled.slice(0, Math.min(count, shuffled.length));
    
    const questionList = selected.map((vocab, idx) => {
      const questionType = mode === "mixed" 
        ? QUIZ_MODES[Math.floor(Math.random() * (QUIZ_MODES.length - 1))].id
        : mode;
      
      let question = {
        id: idx,
        vocab,
        type: questionType,
        correctAnswer: null,
        options: [],
      };

      // Generate based on type
      if (questionType === "flash") {
        question.correctAnswer = vocab.meaning_id || vocab.meaning_en;
        question.showWord = Math.random() > 0.5; // Randomize direction
      } else if (questionType === "multipleChoice") {
        const otherVocabs = shuffleArray(vocabularyData.filter(v => v.id !== vocab.id)).slice(0, 3);
        const allOptions = shuffleArray([
          { text: vocab.meaning_id || vocab.meaning_en, correct: true },
          ...otherVocabs.map(v => ({ text: v.meaning_id || v.meaning_en, correct: false })),
        ]);
        question.options = allOptions;
        question.correctAnswer = vocab.meaning_id || vocab.meaning_en;
      } else if (questionType === "typing") {
        question.correctAnswer = Math.random() > 0.5 ? vocab.word : (vocab.meaning_id || vocab.meaning_en);
        question.typingMode = question.correctAnswer === vocab.word ? "word" : "meaning";
      } else if (questionType === "audio") {
        const otherVocabs = shuffleArray(vocabularyData.filter(v => v.id !== vocab.id)).slice(0, 3);
        const allOptions = shuffleArray([
          { text: vocab.word, correct: true },
          ...otherVocabs.map(v => ({ text: v.word, correct: false })),
        ]);
        question.options = allOptions;
        question.correctAnswer = vocab.word;
      } else if (questionType === "fillBlank") {
        // Use example sentence if available, or create simple sentence
        question.correctAnswer = vocab.word;
        question.sentence = `_____ は ${vocab.meaning_id || vocab.meaning_en} です。`;
      }

      return question;
    });

    return questionList;
  }, [vocabularyData]);

  const generateMatchingGame = useCallback(() => {
    if (!vocabularyData || vocabularyData.length === 0) return [];
    
    const selected = shuffleArray(vocabularyData).slice(0, 6);
    const words = selected.map((v, i) => ({
      id: `word-${i}`,
      text: v.word,
      type: "word",
      pairId: i,
      vocab: v,
    }));
    const meanings = selected.map((v, i) => ({
      id: `meaning-${i}`,
      text: v.meaning_id || v.meaning_en,
      type: "meaning",
      pairId: i,
    }));
    
    return shuffleArray([...words, ...meanings]);
  }, [vocabularyData]);

  const startQuiz = (mode) => {
    setSelectedMode(mode);
    setIsPlaying(true);
    setCurrentIndex(0);
    setUserAnswers([]);
    setShowAnswer(false);
    setInputValue("");
    setScore(0);
    setShowReview(false);
    
    if (mode.id === "matching") {
      const items = generateMatchingGame();
      setMatchingItems(items);
      setSelectedPairs([]);
      setMatchedPairs([]);
    } else {
      const qs = generateQuestions(mode.id);
      setQuestions(qs);
    }
    
    if (mode.id === "speed") {
      setTimeLeft(60);
      setTimerActive(true);
    } else {
      setTimerActive(false);
    }
  };

  const handleAnswer = (answer, isCorrect) => {
    const newAnswers = [...userAnswers, { 
      question: questions[currentIndex], 
      userAnswer: answer, 
      correct: isCorrect,
    }];
    setUserAnswers(newAnswers);
    
    if (isCorrect) {
      setScore(score + 1);
      confetti({
        particleCount: 30,
        spread: 50,
        origin: { y: 0.6 },
      });
    }
    
    if (selectedMode?.id === "flash" || selectedMode?.id === "speed") {
      // Auto advance for flash and speed
      setTimeout(() => {
        if (currentIndex < questions.length - 1) {
          setCurrentIndex(currentIndex + 1);
          setShowAnswer(false);
          setInputValue("");
        } else {
          handleFinishQuiz();
        }
      }, 600);
    } else {
      setShowAnswer(true);
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowAnswer(false);
      setInputValue("");
    } else {
      handleFinishQuiz();
    }
  };

  const handleMatchingClick = (item) => {
    if (matchedPairs.includes(item.pairId)) return;
    
    if (selectedPairs.length === 0) {
      setSelectedPairs([item]);
    } else if (selectedPairs.length === 1) {
      const first = selectedPairs[0];
      if (first.id === item.id) {
        setSelectedPairs([]);
        return;
      }
      
      if (first.pairId === item.pairId) {
        // Correct match
        setMatchedPairs([...matchedPairs, item.pairId]);
        setSelectedPairs([]);
        setScore(score + 1);
        confetti({
          particleCount: 30,
          spread: 50,
          origin: { y: 0.6 },
        });
        
        if (matchedPairs.length + 1 === matchingItems.length / 2) {
          setTimeout(handleFinishQuiz, 1000);
        }
      } else {
        // Wrong match
        setSelectedPairs([first, item]);
        setTimeout(() => setSelectedPairs([]), 800);
      }
    }
  };

  const handleRestart = () => {
    startQuiz(selectedMode);
  };

  const handleClose = () => {
    setIsPlaying(false);
    setSelectedMode(null);
    setTimerActive(false);
    setShowReview(false);
  };

  const renderQuestion = () => {
    if (!questions[currentIndex]) return null;
    const q = questions[currentIndex];
    const { vocab, type } = q;

    // Flash Cards
    if (type === "flash") {
      return (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center max-w-2xl">
            <div 
              className="mb-8 p-12 rounded-3xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-4 border-indigo-200 dark:border-indigo-800 cursor-pointer hover:scale-105 transition-transform"
              onClick={() => setShowAnswer(!showAnswer)}
            >
              {!showAnswer ? (
                <>
                  {q.showWord ? (
                    <>
                      <div className="text-6xl font-black text-indigo-900 dark:text-indigo-100 mb-4">
                        {vocab.word}
                      </div>
                      <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                        {vocab.reading}
                      </div>
                      {vocab.romaji && (
                        <div className="text-lg font-mono text-indigo-500 dark:text-indigo-500 mt-2">
                          {vocab.romaji}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-4xl font-black text-indigo-900 dark:text-indigo-100">
                      {vocab.meaning_id || vocab.meaning_en}
                    </div>
                  )}
                  <div className="mt-6 text-sm text-indigo-600 dark:text-indigo-400 font-medium">
                    Click to reveal answer
                  </div>
                </>
              ) : (
                <>
                  {q.showWord ? (
                    <div className="text-4xl font-black text-purple-900 dark:text-purple-100">
                      {vocab.meaning_id || vocab.meaning_en}
                    </div>
                  ) : (
                    <>
                      <div className="text-6xl font-black text-purple-900 dark:text-purple-100 mb-4">
                        {vocab.word}
                      </div>
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {vocab.reading}
                      </div>
                      {vocab.romaji && (
                        <div className="text-lg font-mono text-purple-500 dark:text-purple-500 mt-2">
                          {vocab.romaji}
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </div>

            {showAnswer && (
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => handleAnswer(vocab.meaning_id || vocab.meaning_en, false)}
                  className="px-8 py-4 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-bold flex items-center gap-2 transition-colors"
                >
                  <XCircle size={24} />
                  Wrong
                </button>
                <button
                  onClick={() => handleAnswer(vocab.meaning_id || vocab.meaning_en, true)}
                  className="px-8 py-4 rounded-2xl bg-green-500 hover:bg-green-600 text-white font-bold flex items-center gap-2 transition-colors"
                >
                  <Check size={24} />
                  Correct
                </button>
              </div>
            )}
          </div>
        </div>
      );
    }

    // Multiple Choice
    if (type === "multipleChoice") {
      return (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center max-w-3xl w-full">
            <div className="mb-8 p-8 rounded-3xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-4 border-purple-200 dark:border-purple-800">
              <div className="text-5xl font-black text-purple-900 dark:text-purple-100 mb-4">
                {vocab.word}
              </div>
              <div className="text-xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                {vocab.reading}
              </div>
              {vocab.romaji && (
                <div className="text-base font-mono text-purple-500 dark:text-purple-500">
                  {vocab.romaji}
                </div>
              )}
              <button
                onClick={() => playAudio(vocab.word, vocab.audio_url)}
                className="mt-4 px-4 py-2 rounded-full bg-purple-200 dark:bg-purple-800 hover:bg-purple-300 dark:hover:bg-purple-700 text-purple-900 dark:text-purple-100 font-bold inline-flex items-center gap-2 transition-colors"
              >
                <Volume2 size={18} />
                Play Audio
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {q.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => !showAnswer && handleAnswer(opt.text, opt.correct)}
                  disabled={showAnswer}
                  className={cn(
                    "p-6 rounded-2xl border-2 font-bold text-lg transition-all text-left",
                    !showAnswer && "hover:scale-105 hover:shadow-lg",
                    showAnswer && opt.correct && "bg-green-100 dark:bg-green-900/30 border-green-500 dark:border-green-400",
                    showAnswer && !opt.correct && userAnswers[userAnswers.length - 1]?.userAnswer === opt.text && "bg-red-100 dark:bg-red-900/30 border-red-500 dark:border-red-400",
                    !showAnswer && "bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 hover:border-purple-500 dark:hover:border-purple-400"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-slate-900 dark:text-white">{opt.text}</span>
                    {showAnswer && opt.correct && <Check className="text-green-600 dark:text-green-400" size={24} />}
                    {showAnswer && !opt.correct && userAnswers[userAnswers.length - 1]?.userAnswer === opt.text && <XCircle className="text-red-600 dark:text-red-400" size={24} />}
                  </div>
                </button>
              ))}
            </div>

            {showAnswer && (
              <button
                onClick={handleNextQuestion}
                className="mt-6 px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold flex items-center gap-2 mx-auto transition-colors"
              >
                Next Question
                <ChevronRight size={20} />
              </button>
            )}
          </div>
        </div>
      );
    }

    // Typing
    if (type === "typing") {
      const handleSubmit = (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;
        
        const correct = inputValue.trim().toLowerCase() === q.correctAnswer.toLowerCase();
        handleAnswer(inputValue, correct);
      };

      return (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center max-w-2xl w-full">
            <div className="mb-8 p-8 rounded-3xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-4 border-green-200 dark:border-green-800">
              {q.typingMode === "word" ? (
                <>
                  <div className="text-lg font-bold text-green-600 dark:text-green-400 mb-4">
                    Type the Japanese word for:
                  </div>
                  <div className="text-4xl font-black text-green-900 dark:text-green-100">
                    {vocab.meaning_id || vocab.meaning_en}
                  </div>
                </>
              ) : (
                <>
                  <div className="text-lg font-bold text-green-600 dark:text-green-400 mb-4">
                    Type the meaning for:
                  </div>
                  <div className="text-5xl font-black text-green-900 dark:text-green-100 mb-3">
                    {vocab.word}
                  </div>
                  <div className="text-xl font-bold text-green-600 dark:text-green-400">
                    {vocab.reading}
                  </div>
                  {vocab.romaji && (
                    <div className="text-base font-mono text-green-500 dark:text-green-500 mt-2">
                      {vocab.romaji}
                    </div>
                  )}
                </>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={showAnswer}
                placeholder="Type your answer..."
                className="w-full px-6 py-4 text-xl rounded-2xl border-2 border-green-300 dark:border-green-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-green-500 dark:focus:border-green-400 disabled:opacity-50"
                autoFocus
              />
              
              {!showAnswer ? (
                <button
                  type="submit"
                  disabled={!inputValue.trim()}
                  className="w-full px-8 py-4 rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold transition-colors"
                >
                  Submit Answer
                </button>
              ) : (
                <div className="space-y-4">
                  <div className={cn(
                    "p-4 rounded-xl border-2 text-lg font-bold",
                    userAnswers[userAnswers.length - 1]?.correct 
                      ? "bg-green-100 dark:bg-green-900/30 border-green-500 text-green-900 dark:text-green-100"
                      : "bg-red-100 dark:bg-red-900/30 border-red-500 text-red-900 dark:text-red-100"
                  )}>
                    {userAnswers[userAnswers.length - 1]?.correct ? "Correct! ✓" : `Wrong. Correct answer: ${q.correctAnswer}`}
                  </div>
                  <button
                    onClick={handleNextQuestion}
                    className="w-full px-8 py-4 rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold flex items-center justify-center gap-2 transition-colors"
                  >
                    Next Question
                    <ChevronRight size={20} />
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      );
    }

    // Audio Quiz
    if (type === "audio") {
      return (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center max-w-3xl w-full">
            <div className="mb-8 p-12 rounded-3xl bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-4 border-orange-200 dark:border-orange-800">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-6">
                Listen and select the word you hear
              </div>
              <button
                onClick={() => playAudio(vocab.word, vocab.audio_url)}
                className="px-8 py-6 rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold inline-flex items-center gap-3 transition-colors text-xl"
              >
                <Volume2 size={32} />
                Play Audio
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {q.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => !showAnswer && handleAnswer(opt.text, opt.correct)}
                  disabled={showAnswer}
                  className={cn(
                    "p-6 rounded-2xl border-2 font-bold text-2xl transition-all",
                    !showAnswer && "hover:scale-105 hover:shadow-lg",
                    showAnswer && opt.correct && "bg-green-100 dark:bg-green-900/30 border-green-500 dark:border-green-400",
                    showAnswer && !opt.correct && userAnswers[userAnswers.length - 1]?.userAnswer === opt.text && "bg-red-100 dark:bg-red-900/30 border-red-500 dark:border-red-400",
                    !showAnswer && "bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 hover:border-orange-500 dark:hover:border-orange-400"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-slate-900 dark:text-white">{opt.text}</span>
                    {showAnswer && opt.correct && <Check className="text-green-600 dark:text-green-400" size={24} />}
                    {showAnswer && !opt.correct && userAnswers[userAnswers.length - 1]?.userAnswer === opt.text && <XCircle className="text-red-600 dark:text-red-400" size={24} />}
                  </div>
                </button>
              ))}
            </div>

            {showAnswer && (
              <button
                onClick={handleNextQuestion}
                className="mt-6 px-8 py-4 rounded-2xl bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold flex items-center gap-2 mx-auto transition-colors"
              >
                Next Question
                <ChevronRight size={20} />
              </button>
            )}
          </div>
        </div>
      );
    }

    // Fill in the Blank
    if (type === "fillBlank") {
      const handleSubmit = (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;
        
        const correct = inputValue.trim().toLowerCase() === q.correctAnswer.toLowerCase();
        handleAnswer(inputValue, correct);
      };

      return (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center max-w-3xl w-full">
            <div className="mb-8 p-8 rounded-3xl bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 border-4 border-teal-200 dark:border-teal-800">
              <div className="text-lg font-bold text-teal-600 dark:text-teal-400 mb-6">
                Fill in the blank:
              </div>
              <div className="text-3xl font-black text-teal-900 dark:text-teal-100 mb-4">
                {q.sentence.split('_____')[0]}
                <span className="inline-block w-48 h-2 bg-teal-300 dark:bg-teal-700 mx-2 align-middle"></span>
                {q.sentence.split('_____')[1]}
              </div>
              <div className="text-base text-teal-600 dark:text-teal-400">
                Meaning: {vocab.meaning_id || vocab.meaning_en}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={showAnswer}
                placeholder="Type the missing word..."
                className="w-full px-6 py-4 text-xl rounded-2xl border-2 border-teal-300 dark:border-teal-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-teal-500 dark:focus:border-teal-400 disabled:opacity-50"
                autoFocus
              />
              
              {!showAnswer ? (
                <button
                  type="submit"
                  disabled={!inputValue.trim()}
                  className="w-full px-8 py-4 rounded-2xl bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold transition-colors"
                >
                  Submit Answer
                </button>
              ) : (
                <div className="space-y-4">
                  <div className={cn(
                    "p-4 rounded-xl border-2 text-lg font-bold",
                    userAnswers[userAnswers.length - 1]?.correct 
                      ? "bg-green-100 dark:bg-green-900/30 border-green-500 text-green-900 dark:text-green-100"
                      : "bg-red-100 dark:bg-red-900/30 border-red-500 text-red-900 dark:text-red-100"
                  )}>
                    {userAnswers[userAnswers.length - 1]?.correct ? "Correct! ✓" : `Wrong. Correct answer: ${q.correctAnswer}`}
                  </div>
                  <button
                    onClick={handleNextQuestion}
                    className="w-full px-8 py-4 rounded-2xl bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-bold flex items-center justify-center gap-2 transition-colors"
                  >
                    Next Question
                    <ChevronRight size={20} />
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      );
    }

    return null;
  };

  if (!mounted) return null;

  const modalContent = (
    <>
      {/* Mode Selection Modal */}
      {isOpen && !isPlaying && !selectedMode && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-md p-4 animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="w-full max-w-5xl max-h-[90vh] flex flex-col bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-8 text-center text-white">
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 rounded-full bg-white/10 p-2 hover:bg-white/20 transition-colors"
              >
                <X size={20} />
              </button>
              <Trophy className="w-16 h-16 mx-auto mb-4" />
              <h2 className="text-4xl font-black mb-2">Choose Quiz Mode</h2>
              <p className="text-lg opacity-90">Select your preferred learning style</p>
            </div>

            <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {QUIZ_MODES.map((mode) => {
                  const Icon = mode.icon;
                  return (
                    <button
                      key={mode.id}
                      onClick={() => startQuiz(mode)}
                      className="group p-6 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 hover:border-transparent hover:shadow-2xl transition-all text-left relative overflow-hidden"
                    >
                      <div className={cn(
                        "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity",
                        mode.color
                      )} />
                      <div className="relative">
                        <div className={cn(
                          "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center mb-4",
                          mode.color
                        )}>
                          <Icon className="text-white" size={24} />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">
                          {mode.name}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {mode.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Quiz Playing Modal */}
      {isPlaying && selectedMode && !showReview && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-md p-0 sm:p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              if (window.confirm('Are you sure you want to quit this quiz?')) {
                handleClose();
              }
            }
          }}
        >
          <div
            className="w-full h-[100dvh] sm:h-auto sm:max-h-[95vh] max-w-6xl flex flex-col bg-white dark:bg-slate-800 sm:rounded-3xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-4 sm:p-6 text-white shrink-0">
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to quit this quiz?')) {
                    handleClose();
                  }
                }}
                className="absolute top-4 right-4 rounded-full bg-white/10 p-2 hover:bg-white/20 transition-colors"
              >
                <X size={20} />
              </button>

              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black mb-1">{selectedMode.name}</h2>
                  <p className="text-sm sm:text-base opacity-90">Level: {level}</p>
                </div>
                
                {selectedMode.id !== "matching" && (
                  <div className="text-right">
                    {selectedMode.id === "speed" && timerActive && (
                      <div className="flex items-center gap-2 mb-2">
                        <Timer size={20} />
                        <span className="text-3xl font-black">{timeLeft}s</span>
                      </div>
                    )}
                    <div className="text-lg font-bold">
                      {selectedMode.id === "matching" 
                        ? `${matchedPairs.length} / ${matchingItems.length / 2}`
                        : `${currentIndex + 1} / ${questions.length}`
                      }
                    </div>
                    <div className="text-sm opacity-75">Score: {score}</div>
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              {selectedMode.id !== "matching" && (
                <div className="mt-4 h-2 bg-white/20 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-white rounded-full transition-all duration-300"
                    style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                  />
                </div>
              )}
            </div>

            {/* Content */}
            {selectedMode.id === "matching" ? (
              <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
                <div className="max-w-4xl mx-auto">
                  <h3 className="text-2xl font-black text-center text-slate-900 dark:text-white mb-8">
                    Match words with their meanings
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {matchingItems.map((item) => {
                      const isSelected = selectedPairs.some(p => p.id === item.id);
                      const isMatched = matchedPairs.includes(item.pairId);
                      const isWrong = selectedPairs.length === 2 && selectedPairs.some(p => p.id === item.id) && selectedPairs[0].pairId !== selectedPairs[1].pairId;

                      return (
                        <button
                          key={item.id}
                          onClick={() => handleMatchingClick(item)}
                          disabled={isMatched}
                          className={cn(
                            "p-6 rounded-2xl border-2 font-bold text-lg transition-all",
                            isMatched && "bg-green-100 dark:bg-green-900/30 border-green-500 opacity-50 cursor-not-allowed",
                            isSelected && !isWrong && "bg-indigo-100 dark:bg-indigo-900/30 border-indigo-500 scale-105",
                            isWrong && "bg-red-100 dark:bg-red-900/30 border-red-500 animate-shake",
                            !isMatched && !isSelected && "bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 hover:border-indigo-500 hover:scale-105"
                          )}
                        >
                          <div className="text-slate-900 dark:text-white">
                            {item.type === "word" ? (
                              <>
                                <div className="text-3xl mb-2">{item.text}</div>
                                <div className="text-base text-indigo-600 dark:text-indigo-400">
                                  {item.vocab.reading}
                                </div>
                              </>
                            ) : (
                              <div className="text-xl">{item.text}</div>
                            )}
                          </div>
                          {isMatched && <Check className="text-green-600 dark:text-green-400 mx-auto mt-2" size={24} />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              renderQuestion()
            )}
          </div>
        </div>,
        document.body
      )}

      {/* Review Modal */}
      {showReview && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-md p-4 animate-in fade-in duration-200"
          onClick={(e) => e.target === e.currentTarget && handleClose()}
        >
          <div
            className="w-full max-w-4xl max-h-[90vh] flex flex-col bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-8 text-center text-white">
              <Trophy className="w-20 h-20 mx-auto mb-4" />
              <h2 className="text-4xl font-black mb-2">Quiz Complete!</h2>
              <p className="text-xl opacity-90">
                You scored {score} / {selectedMode?.id === "matching" ? matchingItems.length / 2 : questions.length}
              </p>
              <div className="text-3xl font-black mt-2">
                {Math.round((score / (selectedMode?.id === "matching" ? matchingItems.length / 2 : questions.length)) * 100)}%
              </div>
            </div>

            <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-2 gap-4 mb-8">
                <button
                  onClick={handleRestart}
                  className="px-6 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  <RotateCcw size={20} />
                  Try Again
                </button>
                <button
                  onClick={handleClose}
                  className="px-6 py-4 rounded-2xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-white font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  <X size={20} />
                  Close
                </button>
              </div>

              {selectedMode?.id !== "matching" && userAnswers.length > 0 && (
                <div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4">
                    Review Your Answers
                  </h3>
                  <div className="space-y-3">
                    {userAnswers.map((answer, i) => (
                      <div
                        key={i}
                        className={cn(
                          "p-4 rounded-xl border-2",
                          answer.correct
                            ? "bg-green-50 dark:bg-green-900/20 border-green-500 dark:border-green-400"
                            : "bg-red-50 dark:bg-red-900/20 border-red-500 dark:border-red-400"
                        )}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-2xl font-black text-slate-900 dark:text-white">
                                {answer.question.vocab.word}
                              </span>
                              <span className="text-base font-medium text-slate-600 dark:text-slate-400">
                                {answer.question.vocab.reading}
                              </span>
                            </div>
                            <div className="text-sm text-slate-700 dark:text-slate-300 font-medium mb-1">
                              Correct: {answer.question.correctAnswer}
                            </div>
                            {!answer.correct && (
                              <div className="text-sm text-red-700 dark:text-red-300 font-medium">
                                Your answer: {answer.userAnswer}
                              </div>
                            )}
                          </div>
                          <div className="flex-shrink-0">
                            {answer.correct ? (
                              <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                                <Check className="text-white" size={24} />
                              </div>
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center">
                                <XCircle className="text-white" size={24} />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white font-bold flex items-center gap-2 transition-all hover:scale-105 shadow-lg"
      >
        <BrainCircuit size={20} />
        Start Quiz
      </button>
      {modalContent}
    </>
  );
}
