"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Trophy,
  Check,
  RefreshCw,
  Play,
  Zap,
  Target,
  Brain,
  Flame,
  Volume2,
  Sparkles,
  ChevronRight,
  Clock,
  Award,
  TrendingUp,
  Eye,
  EyeOff,
  Shuffle,
  RotateCw,
  Pencil,
  MousePointer2,
  Keyboard,
  MessageSquare,
  Lightbulb,
  Star,
  BookOpen,
  Info,
  Move,
} from "lucide-react";
import { cn } from "@/lib/utils";
import confetti from "canvas-confetti";

const QUIZ_MODES = {
  FLASH: {
    id: "flash",
    name: "Flash Cards",
    desc: "Quick memory drill",
    icon: Zap,
  },
  MEMORY: {
    id: "memory",
    name: "Memory Match",
    desc: "Match kanji with meanings",
    icon: Brain,
  },
  DRAG: {
    id: "drag",
    name: "Drag & Match",
    desc: "Drag to correct answers",
    icon: Move,
  },
  SPEED: {
    id: "speed",
    name: "Speed Challenge",
    desc: "Race against time",
    icon: Target,
  },
  WRITING: {
    id: "writing",
    name: "Writing Practice",
    desc: "Draw & memorize",
    icon: Pencil,
  },
  STORY: {
    id: "story",
    name: "Story Mode",
    desc: "Context & sentences",
    icon: MessageSquare,
  },
  MIXED: {
    id: "mixed",
    name: "Mixed Challenge",
    desc: "All techniques combined",
    icon: Sparkles,
  },
};

const DIFFICULTY_LEVELS = {
  EASY: { id: "easy", name: "Easy", color: "emerald", time: 15 },
  MEDIUM: { id: "medium", name: "Medium", color: "yellow", time: 10 },
  HARD: { id: "hard", name: "Hard", color: "red", time: 7 },
};

export default function InteractiveKanjiQuiz({ kanjiData, level }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [phase, setPhase] = useState("menu"); // menu, game, result

  const [config, setConfig] = useState({
    mode: "flash",
    difficulty: "medium",
    count: 10,
    showHints: true,
    playSound: true,
  });

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [combo, setCombo] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);

  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const [timerActive, setTimerActive] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const [memoryCards, setMemoryCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);

  const [userProgress, setUserProgress] = useState({});
  const [hintsUsed, setHintsUsed] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [showFurigana, setShowFurigana] = useState(true);

  // Drag and drop states
  const [dragItems, setDragItems] = useState([]);
  const [dragTargets, setDragTargets] = useState([]);
  const [draggedItem, setDraggedItem] = useState(null);
  const [droppedPairs, setDroppedPairs] = useState({});

  const [showReview, setShowReview] = useState(false);
  const timerRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    setMounted(true);
    // Load progress from localStorage
    const saved = localStorage.getItem(`kanji_progress_${level}`);
    if (saved) setUserProgress(JSON.parse(saved));
  }, [level]);

  // Scroll lock when modal is open
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

  useEffect(() => {
    if (phase === "game" && config.difficulty !== "easy") {
      setTimerActive(true);
      setTimeLeft(DIFFICULTY_LEVELS[config.difficulty.toUpperCase()].time);
    }
  }, [currentIndex, phase, config.difficulty]);

  const playSound = (type) => {
    if (!config.playSound) return;
    const sounds = {
      correct: "/sounds/correct.mp3",
      wrong: "/sounds/wrong.mp3",
      complete: "/sounds/complete.mp3",
      tick: "/sounds/tick.mp3",
    };
    if (audioRef.current) {
      audioRef.current.src = sounds[type] || "";
      audioRef.current.play().catch(() => {});
    }
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  const handleTimeout = () => {
    setTimerActive(false);
    setFeedback("timeout");
    setStreak(0);
    setCombo(0);
    playSound("wrong");

    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex((i) => i + 1);
        setFeedback(null);
        setShowHint(false);
      } else {
        setPhase("result");
      }
    }, 2000);
  };

  useEffect(() => {
    if (timerActive && timeLeft > 0) {
      timerRef.current = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    } else if (timerActive && timeLeft === 0) {
      handleTimeout();
    }
    return () => clearTimeout(timerRef.current);
  }, [timerActive, timeLeft]);

  const generateFlashQuestions = () => {
    const pool = [...kanjiData]
      .sort(() => Math.random() - 0.5)
      .slice(0, config.count);
    return pool.map((k) => {
      const questionType = Math.random() > 0.5 ? "meaning" : "reading";
      const correctAnswer =
        questionType === "meaning"
          ? k.meaning_id || k.meaning_en
          : [...(k.onyomi || []), ...(k.kunyomi || [])][0]?.reading || "N/A";

      // Generate distractors
      const distractors = [];
      let attempts = 0;
      while (distractors.length < 3 && attempts < 30) {
        attempts++;
        const random = kanjiData[Math.floor(Math.random() * kanjiData.length)];
        if (random.id === k.id) continue;

        const distractor =
          questionType === "meaning"
            ? random.meaning_id || random.meaning_en
            : [...(random.onyomi || []), ...(random.kunyomi || [])][0]
                ?.reading || "N/A";

        if (
          distractor &&
          !distractors.includes(distractor) &&
          distractor !== correctAnswer
        ) {
          distractors.push(distractor);
        }
      }

      const options = [correctAnswer, ...distractors].sort(
        () => Math.random() - 0.5
      );

      return {
        kanji: k,
        type: questionType,
        question: k.character,
        correctAnswer,
        options,
        hint:
          questionType === "meaning"
            ? `Category: ${k.category || "General"}`
            : `Type: ${k.word_type || "Various"}`,
        mnemonic: generateMnemonic(k),
      };
    });
  };

  const generateMnemonic = (kanji) => {
    // Simple mnemonic generator based on kanji properties
    const mnemonics = [
      `Remember: ${kanji.character} has ${kanji.stroke_count} strokes`,
      `Think of: ${kanji.category || "concept"} when you see ${
        kanji.character
      }`,
      `${kanji.character} appears in common words about ${kanji.meaning_id}`,
      `Radical hint: Look for ${kanji.radical || "the key component"}`,
    ];
    return mnemonics[Math.floor(Math.random() * mnemonics.length)];
  };

  const generateMemoryCards = () => {
    const pool = [...kanjiData]
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.min(6, kanjiData.length));
    const cards = [];

    pool.forEach((k) => {
      const firstReading = [...(k.onyomi || []), ...(k.kunyomi || [])][0];
      cards.push({
        id: `${k.id}-kanji`,
        content: k.character,
        type: "kanji",
        matchId: k.id,
        reading: firstReading?.reading || firstReading?.kana || '',
        romaji: firstReading?.romaji || '',
      });
      cards.push({
        id: `${k.id}-meaning`,
        content: k.meaning_id || k.meaning_en,
        type: "meaning",
        matchId: k.id,
      });
    });

    return cards.sort(() => Math.random() - 0.5);
  };

  const startGame = () => {
    if (config.mode === "memory") {
      setMemoryCards(generateMemoryCards());
      setFlippedCards([]);
      setMatchedPairs([]);
    } else if (config.mode === "drag") {
      generateDragQuestions();
    } else if (config.mode === "mixed") {
      // Mixed mode: randomly select between flash, memory, and drag
      const modes = ["flash", "memory", "drag"];
      const randomMode = modes[Math.floor(Math.random() * modes.length)];
      setConfig(prev => ({ ...prev, mode: randomMode }));
      return; // Will re-trigger with new mode
    } else {
      // For flash, speed, writing, story modes
      setQuestions(generateFlashQuestions());
    }

    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setCombo(0);
    setTotalPoints(0);
    setFeedback(null);
    setHintsUsed(0);
    setShowHint(false);
    setPhase("game");
  };

  const handleAnswer = (answer) => {
    const q = questions[currentIndex];
    const isCorrect = answer === q.correctAnswer;

    // Save user answer
    setQuestions(prev => prev.map((question, idx) => 
      idx === currentIndex 
        ? { ...question, userAnswer: answer }
        : question
    ));

    setTimerActive(false);
    setSelectedAnswer(answer);
    setFeedback(isCorrect ? "correct" : "incorrect");

    if (isCorrect) {
      playSound("correct");
      const newStreak = streak + 1;
      const comboMultiplier = Math.floor(newStreak / 3) + 1;
      const basePoints =
        config.difficulty === "hard"
          ? 15
          : config.difficulty === "medium"
          ? 10
          : 5;
      const timeBonus = timeLeft > 0 ? Math.floor(timeLeft / 2) : 0;
      const hintPenalty = showHint ? -2 : 0;
      const points = Math.max(
        basePoints * comboMultiplier + timeBonus + hintPenalty,
        5
      );

      setScore((s) => s + 1);
      setStreak(newStreak);
      setMaxStreak((m) => Math.max(m, newStreak));
      setCombo(comboMultiplier);
      setTotalPoints((p) => p + points);

      if (newStreak % 5 === 0) triggerConfetti();

      // Update progress
      setUserProgress((prev) => {
        const progress = { ...prev };
        const key = q.kanji.id;
        const timestamp = Date.now();
        progress[key] = {
          lastSeen: timestamp,
          correct: (progress[key]?.correct || 0) + 1,
          total: (progress[key]?.total || 0) + 1,
          level: Math.min((progress[key]?.level || 0) + 1, 5),
        };
        localStorage.setItem(
          `kanji_progress_${level}`,
          JSON.stringify(progress)
        );
        return progress;
      });
    } else {
      playSound("wrong");
      setStreak(0);
      setCombo(0);

      // Update progress
      setUserProgress((prev) => {
        const progress = { ...prev };
        const key = q.kanji.id;
        const timestamp = Date.now();
        progress[key] = {
          lastSeen: timestamp,
          correct: progress[key]?.correct || 0,
          total: (progress[key]?.total || 0) + 1,
          level: Math.max((progress[key]?.level || 0) - 1, 0),
        };
        localStorage.setItem(
          `kanji_progress_${level}`,
          JSON.stringify(progress)
        );
        return progress;
      });
    }

    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex((i) => i + 1);
        setFeedback(null);
        setSelectedAnswer(null);
        setShowHint(false);
        setIsRevealed(false);
      } else {
        playSound("complete");
        setPhase("result");
      }
    }, 2000);
  };

  const handleCardFlip = (cardId) => {
    if (
      flippedCards.length === 2 ||
      flippedCards.includes(cardId) ||
      matchedPairs.includes(cardId)
    )
      return;

    const newFlipped = [...flippedCards, cardId];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      const [first, second] = newFlipped;
      const firstCard = memoryCards.find((c) => c.id === first);
      const secondCard = memoryCards.find((c) => c.id === second);

      if (firstCard.matchId === secondCard.matchId) {
        playSound("correct");
        setMatchedPairs([...matchedPairs, first, second]);
        setScore((s) => s + 1);
        setTotalPoints((p) => p + 20);
        setFlippedCards([]);

        if (matchedPairs.length + 2 === memoryCards.length) {
          setTimeout(() => {
            triggerConfetti();
            setPhase("result");
          }, 1000);
        }
      } else {
        playSound("wrong");
        setTimeout(() => setFlippedCards([]), 1000);
      }
    }
  };

  const useHint = () => {
    if (!showHint && config.showHints) {
      setShowHint(true);
      setHintsUsed((h) => h + 1);
    }
  };

  const generateDragQuestions = () => {
    const pool = [...kanjiData]
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.min(6, config.count));
    const items = pool.map((k) => {
      const firstReading = [...(k.onyomi || []), ...(k.kunyomi || [])][0];
      return {
        id: k.id,
        kanji: k.character,
        correct: k.meaning_id || k.meaning_en,
        reading: firstReading?.reading || firstReading?.kana || '',
        romaji: firstReading?.romaji || '',
      };
    });

    const targets = [...items]
      .sort(() => Math.random() - 0.5)
      .map((item) => ({
        id: `target-${item.id}`,
        kanjiId: item.id,
        text: item.correct,
      }));

    setDragItems(items);
    setDragTargets(targets);
    setDroppedPairs({});
  };

  const handleDragStart = (e, item) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e, target) => {
    e.preventDefault();
    if (!draggedItem) return;

    const isCorrect = draggedItem.id === target.kanjiId;

    if (isCorrect) {
      playSound("correct");
      setDroppedPairs((prev) => ({ ...prev, [target.id]: draggedItem }));
      setScore((s) => s + 1);
      setTotalPoints((p) => p + 20);

      // Check if all matched
      if (Object.keys(droppedPairs).length + 1 === dragTargets.length) {
        setTimeout(() => {
          triggerConfetti();
          setPhase("result");
        }, 500);
      }
    } else {
      playSound("wrong");
      // Flash red animation
      e.target.classList.add("shake");
      setTimeout(() => e.target.classList.remove("shake"), 500);
    }

    setDraggedItem(null);
  };

  const resetToMenu = () => {
    setIsOpen(false);
    setPhase("menu");
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="group relative inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-8 py-4 text-sm font-black text-white shadow-xl shadow-purple-500/30 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/40 transition-all duration-300 cursor-pointer overflow-hidden"
      >
        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
        <Brain size={24} className="relative z-10 animate-pulse" />
        <span className="relative z-10">Interactive {level} Quiz</span>
        <Sparkles size={18} className="relative z-10" />
      </button>
    );
  }

  if (!mounted) return null;

  const currentQ = questions[currentIndex];
  const progress =
    config.mode === "memory"
      ? (matchedPairs.length / memoryCards.length) * 100
      : ((currentIndex + (feedback ? 1 : 0)) / questions.length) * 100;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-md p-0 sm:p-4 animate-in fade-in duration-300">
      <audio ref={audioRef} />

      <div className="w-full h-[100dvh] sm:h-auto sm:max-h-[95vh] max-w-4xl flex flex-col bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-800 shadow-2xl sm:rounded-[3rem] overflow-hidden">
        {/* Header */}
        <div className="shrink-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 relative overflow-hidden">
          {/* Animated background */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent animate-shimmer"></div>
          </div>

          <div className="relative flex items-center justify-between p-4 sm:px-8">
            <div className="flex items-center gap-4">
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/80">
                  JLPT {level}
                </span>
                <h3 className="font-black text-white text-lg">
                  {phase === "game" && config.mode !== "memory"
                    ? `Q ${currentIndex + 1}/${questions.length}`
                    : "Kanji Mastery"}
                </h3>
              </div>

              {phase === "game" && (
                <div className="flex items-center gap-3">
                  {streak > 0 && (
                    <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm">
                      <Flame size={14} className="text-orange-300" />
                      <span className="text-xs font-black text-white">
                        {streak}x
                      </span>
                    </div>
                  )}
                  {combo > 1 && (
                    <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-400/30 backdrop-blur-sm border border-yellow-300/50">
                      <Zap size={14} className="text-yellow-200" />
                      <span className="text-xs font-black text-white">
                        x{combo}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {phase === "game" && (
                <button
                  onClick={() => setShowFurigana(!showFurigana)}
                  className="flex items-center gap-1 px-3 py-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white text-xs font-bold cursor-pointer transition-all"
                  title="Toggle Furigana"
                >
                  {showFurigana ? <Eye size={14} /> : <EyeOff size={14} />}
                  <span className="hidden sm:inline">ふりがな</span>
                </button>
              )}
              {phase === "game" &&
                timerActive &&
                config.difficulty !== "easy" && (
                  <div
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-sm border-2",
                      timeLeft <= 3
                        ? "bg-red-500/30 border-red-300/50 animate-pulse"
                        : "bg-white/20 border-white/30"
                    )}
                  >
                    <Clock size={16} className="text-white" />
                    <span className="text-sm font-black text-white">
                      {timeLeft}s
                    </span>
                  </div>
                )}

              <button
                onClick={resetToMenu}
                className="p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white cursor-pointer transition-all"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {phase === "game" && (
            <div className="relative h-2 w-full bg-black/20">
              <div
                className="absolute h-full bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 transition-all duration-500"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 bg-white/30 animate-shimmer"></div>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 custom-scrollbar">
          {/* MENU PHASE */}
          {phase === "menu" && (
            <div className="space-y-8 animate-in zoom-in-95 duration-300">
              {/* Hero */}
              <div className="text-center space-y-4">
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-purple-500 blur-3xl opacity-40 rounded-full animate-pulse"></div>
                  <div className="relative h-32 w-32 mx-auto flex items-center justify-center rounded-[2rem] bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 text-white shadow-2xl">
                    <Brain size={64} />
                  </div>
                </div>
                <h2 className="text-4xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
                  Master {kanjiData.length} Kanji
                </h2>
                <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  科学的に証明された記憶法で漢字を完璧にマスター
                </p>
              </div>

              {/* Quiz Modes */}
              <div>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 text-center">
                  Choose Your Training Method
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {Object.values(QUIZ_MODES).map((mode) => {
                    const Icon = mode.icon;
                    return (
                      <button
                        key={mode.id}
                        onClick={() => setConfig({ ...config, mode: mode.id })}
                        className={cn(
                          "group p-4 rounded-2xl border-2 transition-all cursor-pointer text-left",
                          config.mode === mode.id
                            ? "border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 shadow-lg"
                            : "border-slate-200 dark:border-white/10 hover:border-purple-300 dark:hover:border-purple-500/50"
                        )}
                      >
                        <Icon
                          size={24}
                          className={cn(
                            "mb-2 transition-transform group-hover:scale-110",
                            config.mode === mode.id
                              ? "text-purple-600"
                              : "text-slate-400"
                          )}
                        />
                        <p
                          className={cn(
                            "font-black text-sm",
                            config.mode === mode.id
                              ? "text-purple-900 dark:text-purple-300"
                              : "text-slate-700 dark:text-slate-300"
                          )}
                        >
                          {mode.name}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1">
                          {mode.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Difficulty */}
              <div>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 text-center">
                  Select Difficulty Level
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {Object.values(DIFFICULTY_LEVELS).map((diff) => (
                    <button
                      key={diff.id}
                      onClick={() =>
                        setConfig({ ...config, difficulty: diff.id })
                      }
                      className={cn(
                        "p-4 rounded-2xl border-2 transition-all cursor-pointer",
                        config.difficulty === diff.id
                          ? `border-${diff.color}-500 bg-${diff.color}-50 dark:bg-${diff.color}-900/20`
                          : "border-slate-200 dark:border-white/10"
                      )}
                    >
                      <p
                        className={cn(
                          "font-black",
                          config.difficulty === diff.id
                            ? `text-${diff.color}-600`
                            : "text-slate-600 dark:text-slate-400"
                        )}
                      >
                        {diff.name}
                      </p>
                      {diff.id !== "easy" && (
                        <p className="text-[10px] text-slate-400 mt-1">
                          {diff.time}s timer
                        </p>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Settings */}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-white/5">
                  <div className="flex items-center gap-3">
                    <Lightbulb size={18} className="text-yellow-500" />
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      Show Hints
                    </span>
                  </div>
                  <button
                    onClick={() =>
                      setConfig({ ...config, showHints: !config.showHints })
                    }
                    className={cn(
                      "relative h-7 w-12 rounded-full transition-colors cursor-pointer",
                      config.showHints
                        ? "bg-purple-500"
                        : "bg-slate-300 dark:bg-slate-600"
                    )}
                  >
                    <span
                      className={cn(
                        "absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow-sm transition-transform",
                        config.showHints ? "translate-x-5" : ""
                      )}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-white/5">
                  <div className="flex items-center gap-3">
                    <Volume2 size={18} className="text-blue-500" />
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      Sound Effects
                    </span>
                  </div>
                  <button
                    onClick={() =>
                      setConfig({ ...config, playSound: !config.playSound })
                    }
                    className={cn(
                      "relative h-7 w-12 rounded-full transition-colors cursor-pointer",
                      config.playSound
                        ? "bg-purple-500"
                        : "bg-slate-300 dark:bg-slate-600"
                    )}
                  >
                    <span
                      className={cn(
                        "absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow-sm transition-transform",
                        config.playSound ? "translate-x-5" : ""
                      )}
                    />
                  </button>
                </div>
              </div>

              {/* Start Button */}
              <button
                onClick={startGame}
                className="w-full rounded-3xl bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 py-6 font-black text-white shadow-2xl shadow-purple-500/50 hover:scale-[1.02] hover:shadow-3xl active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-3 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                <Play size={24} className="relative z-10" fill="currentColor" />
                <span className="relative z-10">Start Training</span>
                <Sparkles size={20} className="relative z-10" />
              </button>
            </div>
          )}

          {/* GAME PHASE - FLASH MODE */}
          {phase === "game" && config.mode === "flash" && currentQ && (
            <div className="space-y-6 animate-in slide-in-from-bottom-6 duration-500">
              {/* Stats Bar */}
              <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-slate-50 to-white dark:from-white/5 dark:to-white/10 border border-slate-100 dark:border-white/10">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Score
                    </span>
                    <span className="text-xl font-black text-purple-600">
                      {score}
                    </span>
                  </div>
                  <div className="h-8 w-px bg-slate-200 dark:bg-white/10"></div>
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Points
                    </span>
                    <span className="text-xl font-black text-orange-600">
                      {totalPoints}
                    </span>
                  </div>
                  <div className="h-8 w-px bg-slate-200 dark:bg-white/10"></div>
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Best
                    </span>
                    <span className="text-xl font-black text-pink-600">
                      {maxStreak}
                    </span>
                  </div>
                </div>

                {config.showHints && !showHint && (
                  <button
                    onClick={useHint}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 text-xs font-bold hover:bg-yellow-200 dark:hover:bg-yellow-900/30 transition-colors cursor-pointer"
                  >
                    <Lightbulb size={14} />
                    Hint
                  </button>
                )}
              </div>

              {!feedback ? (
                <div className="space-y-8">
                  {/* Question Display */}
                  <div className="text-center space-y-6">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 text-[10px] font-black uppercase tracking-[0.2em] text-purple-700 dark:text-purple-300">
                      {currentQ.type === "meaning"
                        ? "意味を選ぶ"
                        : "読み方を選ぶ"}
                    </div>

                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-[3rem] blur-2xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
                      <div className="relative h-64 flex flex-col items-center justify-center rounded-[3rem] bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 shadow-2xl px-8">
                        <span className="text-9xl font-black bg-gradient-to-br from-slate-900 via-purple-900 to-pink-900 bg-clip-text text-transparent dark:from-white dark:via-purple-200 dark:to-pink-200 drop-shadow-2xl animate-in zoom-in duration-300">
                          {currentQ.question}
                        </span>
                        {showFurigana && currentQ.kanji && (
                          <div className="mt-4 space-y-2 text-center">
                            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                              {[...(currentQ.kanji.onyomi || []), ...(currentQ.kanji.kunyomi || [])][0]?.reading || ''}
                            </div>
                            <div className="text-sm font-mono text-slate-500 dark:text-slate-400">
                              ({[...(currentQ.kanji.onyomi || []), ...(currentQ.kanji.kunyomi || [])][0]?.romaji || ''})
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {showHint && (
                      <div className="animate-in slide-in-from-top-4 duration-300 p-4 rounded-2xl bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-700/50">
                        <p className="text-sm font-bold text-yellow-800 dark:text-yellow-200 flex items-center gap-2 justify-center">
                          <Lightbulb size={16} />
                          {currentQ.hint}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Answer Options */}
                  <div className="grid grid-cols-1 gap-3">
                    {currentQ.options.map((opt, i) => (
                      <button
                        key={i}
                        onClick={() => handleAnswer(opt)}
                        className="group w-full p-6 rounded-3xl border-3 border-slate-200 dark:border-white/10 text-left font-bold text-lg hover:border-purple-500 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 dark:hover:from-purple-900/20 dark:hover:to-pink-900/20 transition-all cursor-pointer flex items-center justify-between shadow-sm hover:shadow-xl"
                      >
                        <span className="text-slate-800 dark:text-slate-200">
                          {opt}
                        </span>
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-xs font-black text-slate-400 group-hover:bg-purple-100 group-hover:text-purple-600 dark:group-hover:bg-purple-900/30 transition-all">
                            {i + 1}
                          </div>
                          <ChevronRight
                            size={20}
                            className="text-slate-300 group-hover:text-purple-500 group-hover:translate-x-1 transition-all"
                          />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                /* Feedback Card */
                <div className="animate-in zoom-in-95 duration-300 space-y-6">
                  <div
                    className={cn(
                      "relative p-10 rounded-[3rem] text-center border-4 overflow-hidden",
                      feedback === "correct"
                        ? "border-emerald-400 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20"
                        : feedback === "timeout"
                        ? "border-orange-400 bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20"
                        : "border-red-400 bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20"
                    )}
                  >
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent animate-shimmer"></div>
                    </div>

                    <div className="relative flex justify-center mb-6">
                      {feedback === "correct" ? (
                        <div className="relative">
                          <div className="absolute inset-0 bg-emerald-500 blur-2xl opacity-50 rounded-full animate-pulse"></div>
                          <Check
                            size={64}
                            className="relative text-emerald-500 animate-bounce"
                            strokeWidth={3}
                          />
                        </div>
                      ) : feedback === "timeout" ? (
                        <Clock
                          size={64}
                          className="text-orange-500"
                          strokeWidth={3}
                        />
                      ) : (
                        <X size={64} className="text-red-500" strokeWidth={3} />
                      )}
                    </div>

                    <h4
                      className={cn(
                        "text-3xl font-black mb-2",
                        feedback === "correct"
                          ? "text-emerald-600 dark:text-emerald-400"
                          : feedback === "timeout"
                          ? "text-orange-600 dark:text-orange-400"
                          : "text-red-600 dark:text-red-400"
                      )}
                    >
                      {feedback === "correct"
                        ? "素晴らしい！"
                        : feedback === "timeout"
                        ? "時間切れ！"
                        : "もう一度！"}
                    </h4>

                    <p className="text-slate-600 dark:text-slate-300 text-lg font-bold mb-4">
                      {feedback === "timeout"
                        ? "Time ran out!"
                        : feedback === "correct"
                        ? `+${Math.floor(
                            totalPoints / Math.max(score, 1)
                          )} points! `
                        : "Keep practicing!"}
                    </p>

                    {combo > 1 && feedback === "correct" && (
                      <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-yellow-400 text-yellow-900 font-black text-sm animate-bounce">
                        <Zap size={18} fill="currentColor" />
                        {combo}x COMBO!
                      </div>
                    )}
                  </div>

                  {/* Kanji Detail Card */}
                  <div className="bg-white dark:bg-slate-800/50 rounded-[3rem] border-2 border-slate-100 dark:border-white/10 p-8 space-y-6 shadow-xl">
                    <div className="flex items-center gap-6 border-b border-slate-100 dark:border-white/5 pb-6">
                      <div className="text-7xl font-black text-slate-900 dark:text-white">
                        {currentQ.kanji.character}
                      </div>
                      <div className="flex-1">
                        <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                          Meaning
                        </h5>
                        <p className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                          {currentQ.kanji.meaning_id ||
                            currentQ.kanji.meaning_en}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <h5 className="text-[10px] font-black uppercase tracking-widest text-purple-500 mb-3 flex items-center gap-2">
                          <BookOpen size={12} /> Onyomi (音読み)
                        </h5>
                        <div className="flex flex-wrap gap-2">
                          {currentQ.kanji.onyomi?.map((on, i) => (
                            <div
                              key={i}
                              className="px-3 py-2 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-100 dark:border-purple-800/50"
                            >
                              <div className="flex flex-col">
                                <span className="text-sm font-bold text-purple-700 dark:text-purple-300">
                                  {on.reading || on.kana}
                                </span>
                                {showFurigana && on.romaji && (
                                  <span className="text-[9px] text-purple-400 font-mono">
                                    ({on.romaji})
                                  </span>
                                )}
                              </div>
                            </div>
                          )) || (
                            <span className="text-slate-400 text-sm">-</span>
                          )}
                        </div>
                      </div>
                      <div>
                        <h5 className="text-[10px] font-black uppercase tracking-widest text-pink-500 mb-3 flex items-center gap-2">
                          <BookOpen size={12} /> Kunyomi (訓読み)
                        </h5>
                        <div className="flex flex-wrap gap-2">
                          {currentQ.kanji.kunyomi?.map((kun, i) => (
                            <div
                              key={i}
                              className="px-3 py-2 bg-pink-50 dark:bg-pink-900/20 rounded-xl border border-pink-100 dark:border-pink-800/50"
                            >
                              <div className="flex flex-col">
                                <span className="text-sm font-bold text-pink-700 dark:text-pink-300">
                                  {kun.reading || kun.kana}
                                </span>
                                {showFurigana && kun.romaji && (
                                  <span className="text-[9px] text-pink-400 font-mono">
                                    ({kun.romaji})
                                  </span>
                                )}
                              </div>
                            </div>
                          )) || (
                            <span className="text-slate-400 text-sm">-</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Mnemonic */}
                    <div className="p-4 rounded-2xl bg-linear-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-100 dark:border-blue-800/50">
                      <p className="text-sm text-blue-800 dark:text-blue-200 font-medium flex items-center gap-2">
                        <Brain size={16} className="text-blue-500" />
                        <span className="font-black">Memory Tip:</span>{" "}
                        {currentQ.mnemonic}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* GAME PHASE - DRAG & MATCH MODE */}
          {phase === "game" && config.mode === "drag" && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="text-center">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
                  Drag & Match
                </h3>
                <p className="text-slate-500 dark:text-slate-400">
                  Drag kanji to matching meanings
                </p>
                <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 dark:bg-purple-900/30">
                  <Trophy size={16} className="text-purple-600" />
                  <span className="text-sm font-black text-purple-600 dark:text-purple-400">
                    {Object.keys(droppedPairs).length} / {dragTargets.length}{" "}
                    Matched
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Draggable Kanji */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 text-center">
                    Kanji
                  </h4>
                  <div className="space-y-3">
                    {dragItems.map((item) => {
                      const isUsed = Object.values(droppedPairs).some(
                        (p) => p?.id === item.id
                      );
                      return (
                        <div
                          key={item.id}
                          draggable={!isUsed}
                          onDragStart={(e) => handleDragStart(e, item)}
                          className={cn(
                            "p-6 rounded-3xl border-4 text-center transition-all cursor-move",
                            isUsed
                              ? "border-emerald-300 bg-emerald-50 dark:bg-emerald-900/20 opacity-50 cursor-not-allowed"
                              : "border-purple-300 bg-white dark:bg-slate-800 hover:border-purple-500 hover:shadow-xl hover:scale-105"
                          )}
                        >
                          <div className="text-5xl font-black text-slate-900 dark:text-white mb-2">
                            {item.kanji}
                          </div>
                          {showFurigana && item.reading && (
                            <div className="space-y-1">
                              <div className="text-sm font-bold text-purple-600 dark:text-purple-400">
                                {item.reading}
                              </div>
                              <div className="text-xs font-mono text-slate-400">
                                ({item.romaji})
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Drop Targets */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 text-center">
                    Meanings
                  </h4>
                  <div className="space-y-3">
                    {dragTargets.map((target) => {
                      const dropped = droppedPairs[target.id];
                      return (
                        <div
                          key={target.id}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, target)}
                          className={cn(
                            "p-6 rounded-3xl border-4 min-h-[120px] flex items-center justify-center text-center transition-all",
                            dropped
                              ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20"
                              : "border-dashed border-pink-300 bg-pink-50/30 dark:bg-pink-900/10 hover:border-pink-500 hover:bg-pink-50 dark:hover:bg-pink-900/20"
                          )}
                        >
                          {dropped ? (
                            <div className="space-y-2">
                              <div className="text-4xl font-black text-emerald-600">
                                {dropped.kanji}
                              </div>
                              <div className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                {target.text}
                              </div>
                              <Check
                                size={24}
                                className="text-emerald-500 mx-auto"
                              />
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <Move
                                size={32}
                                className="text-pink-300 mx-auto"
                              />
                              <p className="text-lg font-bold text-slate-700 dark:text-slate-300">
                                {target.text}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* GAME PHASE - MEMORY MATCH MODE */}
          {phase === "game" && config.mode === "memory" && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="text-center">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
                  Memory Match
                </h3>
                <p className="text-slate-500 dark:text-slate-400">
                  Find matching kanji and meanings
                </p>
                <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 dark:bg-purple-900/30">
                  <Trophy size={16} className="text-purple-600" />
                  <span className="text-sm font-black text-purple-600 dark:text-purple-400">
                    {matchedPairs.length / 2} / {memoryCards.length / 2} Pairs
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                {memoryCards.map((card) => {
                  const isFlipped =
                    flippedCards.includes(card.id) ||
                    matchedPairs.includes(card.id);
                  const isMatched = matchedPairs.includes(card.id);

                  return (
                    <button
                      key={card.id}
                      onClick={() => handleCardFlip(card.id)}
                      disabled={isMatched}
                      className={cn(
                        "aspect-square rounded-3xl border-4 transition-all duration-500 cursor-pointer relative overflow-hidden",
                        isFlipped
                          ? isMatched
                            ? "border-emerald-400 bg-gradient-to-br from-emerald-100 to-green-100 dark:from-emerald-900/30 dark:to-green-900/30 shadow-lg"
                            : "border-purple-400 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 shadow-xl"
                          : "border-slate-200 dark:border-white/10 bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-700 hover:border-purple-300 dark:hover:border-purple-500 hover:shadow-lg"
                      )}
                      style={{
                        transform: isFlipped
                          ? "rotateY(0deg)"
                          : "rotateY(180deg)",
                        transformStyle: "preserve-3d",
                      }}
                    >
                      <div
                        className="absolute inset-0 flex items-center justify-center p-4"
                        style={{ backfaceVisibility: "hidden" }}
                      >
                        {isFlipped ? (
                          <div className="text-center">
                            <div
                              className={cn(
                                "font-black",
                                card.type === "kanji"
                                  ? "text-5xl text-slate-900 dark:text-white"
                                  : "text-sm leading-tight text-slate-700 dark:text-slate-300"
                              )}
                            >
                              {card.content}
                            </div>
                            {card.type === "kanji" && showFurigana && card.reading && (
                              <div className="mt-2 space-y-1">
                                <div className="text-xs font-bold text-purple-600 dark:text-purple-400">
                                  {card.reading}
                                </div>
                                <div className="text-[10px] font-mono text-slate-400">
                                  ({card.romaji})
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-4xl text-purple-300 dark:text-purple-700">
                            ?
                          </div>
                        )}
                      </div>

                      {isMatched && (
                        <div className="absolute inset-0 flex items-center justify-center bg-emerald-500/10 backdrop-blur-sm">
                          <Check
                            size={32}
                            className="text-emerald-500"
                            strokeWidth={4}
                          />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* RESULT PHASE */}
          {phase === "result" && (
            <div className="text-center space-y-10 py-10 animate-in zoom-in duration-500">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 blur-3xl opacity-50 rounded-full animate-pulse"></div>
                <Trophy
                  size={120}
                  className="relative text-transparent bg-gradient-to-br from-yellow-400 via-orange-400 to-pink-400 bg-clip-text drop-shadow-2xl animate-bounce"
                  style={{ WebkitTextStroke: "2px #f59e0b" }}
                />
              </div>

              <div className="space-y-4">
                <h2 className="text-6xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
                  {Math.round(
                    (score /
                      (config.mode === "memory"
                        ? memoryCards.length / 2
                        : questions.length)) *
                      100
                  )}
                  %
                </h2>
                <p className="text-2xl font-bold text-slate-700 dark:text-slate-300">
                  Mastered {score}{" "}
                  {config.mode === "memory" ? "pairs" : "kanji"}!
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto mt-8">
                  <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-200 dark:border-purple-800">
                    <div className="text-3xl font-black text-purple-600">
                      {totalPoints}
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-purple-400 mt-1">
                      Points
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-200 dark:border-orange-800">
                    <div className="text-3xl font-black text-orange-600">
                      {maxStreak}
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-orange-400 mt-1">
                      Best Streak
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-pink-50 dark:bg-pink-900/20 border-2 border-pink-200 dark:border-pink-800">
                    <div className="text-3xl font-black text-pink-600">
                      {score}
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-pink-400 mt-1">
                      Correct
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800">
                    <div className="text-3xl font-black text-blue-600">
                      {hintsUsed}
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-blue-400 mt-1">
                      Hints Used
                    </div>
                  </div>
                </div>
              </div>

              {/* Onyomi/Kunyomi Usage Guide */}
              <div className="max-w-2xl mx-auto mt-8">
                <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border-2 border-amber-200 dark:border-amber-800/50">
                  <div className="flex items-start gap-3">
                    <Info
                      size={20}
                      className="text-amber-600 mt-0.5 flex-shrink-0"
                    />
                    <div className="text-sm text-amber-900 dark:text-amber-200 space-y-2">
                      <p className="font-black text-base">📚 Kapan Menggunakan Onyomi & Kunyomi?</p>
                      <p>
                        <strong className="text-purple-600 dark:text-purple-400">
                          Onyomi (音読み)
                        </strong>: Digunakan dalam{" "}
                        <strong>kata majemuk</strong> (2+ kanji). Contoh:
                        学校 (がっこう - sekolah)
                      </p>
                      <p>
                        <strong className="text-pink-600 dark:text-pink-400">
                          Kunyomi (訓読み)
                        </strong>: Digunakan saat kanji{" "}
                        <strong>berdiri sendiri</strong> atau dengan
                        hiragana. Contoh: 学ぶ (まなぶ - belajar)
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
                <button
                  onClick={() => setShowReview(true)}
                  className="rounded-3xl border-3 border-slate-200 dark:border-white/10 py-4 font-bold text-slate-600 dark:text-white hover:bg-slate-50 dark:hover:bg-white/5 transition-all cursor-pointer text-sm"
                >
                  📝 Pembahasan
                </button>
                <button
                  onClick={() => setPhase("menu")}
                  className="rounded-3xl border-3 border-slate-200 dark:border-white/10 py-4 font-bold text-slate-600 dark:text-white hover:bg-slate-50 dark:hover:bg-white/5 transition-all cursor-pointer text-sm"
                >
                  Change Mode
                </button>
                <button
                  onClick={startGame}
                  className="rounded-3xl bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 py-4 font-bold text-white shadow-xl shadow-purple-500/30 hover:scale-105 transition-all cursor-pointer text-sm"
                >
                  Play Again
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Review Modal */}
      {showReview && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="w-full max-w-4xl max-h-[90vh] bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">📝 Pembahasan Soal</h2>
                <button
                  onClick={() => setShowReview(false)}
                  className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400"
                >
                  <X size={24} />
                </button>
              </div>
            </div>
            
            <div className="p-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="space-y-6">
                {config.mode === "memory" ? (
                  <div className="text-center py-8">
                    <p className="text-slate-600 dark:text-slate-400">
                      Mode Memory Match tidak memiliki pembahasan soal karena bersifat acak.
                    </p>
                  </div>
                ) : (
                  questions.map((question, index) => {
                    const userAnswer = question.userAnswer || null;
                    const isCorrect = userAnswer === question.correctAnswer;
                    
                    return (
                      <div key={index} className="border border-slate-200 dark:border-slate-700 rounded-2xl p-6">
                        <div className="flex items-start gap-4">
                          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            isCorrect 
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                              : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                          }`}>
                            {index + 1}
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <span className="text-3xl font-bold text-slate-800 dark:text-white">
                                {question.kanji.character}
                              </span>
                              {showFurigana && question.kanji && (
                                <div className="flex flex-col gap-1">
                                  <span className="text-sm font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 px-2 py-1 rounded">
                                    {[...(question.kanji.onyomi || []), ...(question.kanji.kunyomi || [])][0]?.reading || ''}
                                  </span>
                                  <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                                    ({[...(question.kanji.onyomi || []), ...(question.kanji.kunyomi || [])][0]?.romaji || ''})
                                  </span>
                                </div>
                              )}
                            </div>
                            
                            <p className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-4">
                              {question.question}
                            </p>
                            
                            <div className="space-y-2">
                              {question.options.map((option, optIndex) => (
                                <div 
                                  key={optIndex}
                                  className={`p-3 rounded-xl border-2 ${
                                    option === question.correctAnswer
                                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                      : option === userAnswer && !isCorrect
                                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                      : 'border-slate-200 dark:border-slate-700'
                                  }`}
                                >
                                  <div className="flex items-center gap-3">
                                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                                      option === question.correctAnswer
                                        ? 'bg-green-500 text-white'
                                        : option === userAnswer && !isCorrect
                                        ? 'bg-red-500 text-white'
                                        : 'bg-slate-300 dark:bg-slate-600 text-slate-600 dark:text-slate-400'
                                    }`}>
                                      {String.fromCharCode(65 + optIndex)}
                                    </span>
                                    <span className={`${
                                      option === question.correctAnswer
                                        ? 'text-green-700 dark:text-green-400 font-medium'
                                        : option === userAnswer && !isCorrect
                                        ? 'text-red-700 dark:text-red-400'
                                        : 'text-slate-600 dark:text-slate-400'
                                    }`}>
                                      {option}
                                    </span>
                                    {option === question.correctAnswer && (
                                      <span className="ml-auto text-green-600 dark:text-green-400">
                                        ✓ Jawaban Benar
                                      </span>
                                    )}
                                    {option === userAnswer && !isCorrect && (
                                      <span className="ml-auto text-red-600 dark:text-red-400">
                                        ✗ Jawaban Anda
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                            
                            {question.explanation && (
                              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                                <div className="flex items-start gap-2">
                                  <Lightbulb className="text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" size={16} />
                                  <div>
                                    <p className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">
                                      Penjelasan:
                                    </p>
                                    <p className="text-sm text-blue-700 dark:text-blue-400">
                                      {question.explanation}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-10px);
          }
          75% {
            transform: translateX(10px);
          }
        }
        .shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </div>,
    document.body
  );
}
