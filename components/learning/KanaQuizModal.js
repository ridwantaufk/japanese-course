"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Trophy,
  Check,
  RefreshCw,
  Play,
  Zap,
  Brain,
  Target,
  Sparkles,
  Clock,
  MousePointer2,
  Move,
  Link2,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ===== PRESET QUIZ MODES =====
const QUIZ_PRESETS = [
  {
    id: "quick-hiragana",
    icon: Zap,
    title: "Quick Hiragana",
    subtitle: "10 questions • Multiple Choice",
    color: "blue",
    config: {
      mode: "hiragana",
      type: "choice",
      direction: "k2r",
      count: 10,
      source: "chars",
      timeLimit: null,
    },
  },
  {
    id: "quick-katakana",
    icon: Zap,
    title: "Quick Katakana",
    subtitle: "10 questions • Multiple Choice",
    color: "orange",
    config: {
      mode: "katakana",
      type: "choice",
      direction: "k2r",
      count: 10,
      source: "chars",
      timeLimit: null,
    },
  },
  {
    id: "mixed-power",
    icon: Target,
    title: "Mixed Challenge",
    subtitle: "20 questions • Both Scripts",
    color: "purple",
    config: {
      mode: "mixed",
      type: "choice",
      direction: "random",
      count: 20,
      source: "chars",
      timeLimit: null,
    },
  },
  {
    id: "word-practice",
    icon: Brain,
    title: "Word Practice",
    subtitle: "15 real words • Mixed",
    color: "teal",
    config: {
      mode: "mixed",
      type: "choice",
      direction: "random",
      count: 15,
      source: "vocab",
      timeLimit: null,
    },
  },
  {
    id: "speed-drill",
    icon: Clock,
    title: "Speed Drill",
    subtitle: "50 questions • Timed",
    color: "red",
    config: {
      mode: "mixed",
      type: "choice",
      direction: "random",
      count: 50,
      source: "chars",
      timeLimit: 300, // 5 minutes
    },
  },
  {
    id: "sentence-master",
    icon: Sparkles,
    title: "Sentence Master",
    subtitle: "10 sentences • Advanced",
    color: "pink",
    config: {
      mode: "mixed",
      type: "choice",
      direction: "k2r",
      count: 10,
      source: "sentences",
      timeLimit: null,
    },
  },
  {
    id: "drag-drop-fun",
    icon: Move,
    title: "Drag & Drop",
    subtitle: "10 questions • Interactive",
    color: "green",
    config: {
      mode: "mixed",
      type: "drag",
      direction: "k2r",
      count: 10,
      source: "chars",
      timeLimit: null,
    },
  },
  {
    id: "match-pairs",
    icon: Link2,
    title: "Match Pairs",
    subtitle: "8 pairs • Connect",
    color: "indigo",
    config: {
      mode: "mixed",
      type: "match",
      direction: "k2r",
      count: 8,
      source: "chars",
      timeLimit: null,
    },
  },
];

export default function KanaQuizModal({
  hiragana,
  katakana,
  vocabulary = [],
  sentences = [],
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [phase, setPhase] = useState("menu"); // menu, game, result
  const [config, setConfig] = useState(null);

  // Game State
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);

  // Drag & Drop State
  const [dragItems, setDragItems] = useState([]);
  const [droppedItem, setDroppedItem] = useState(null);
  const [dragOverSlot, setDragOverSlot] = useState(false);

  // Match State
  const [matchPairs, setMatchPairs] = useState({ left: [], right: [] });
  const [selectedLeft, setSelectedLeft] = useState(null);
  const [selectedRight, setSelectedRight] = useState(null);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [wrongAttempts, setWrongAttempts] = useState([]);

  const nextButtonRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Timer effect
  useEffect(() => {
    if (phase === "game" && config?.timeLimit && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setPhase("result");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [phase, config?.timeLimit, timeLeft]);

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

  // ===== QUESTION GENERATION =====
  const generateQuestions = (cfg) => {
    let pool = [];

    // Build character pool
    if (cfg.mode === "hiragana" || cfg.mode === "mixed")
      pool = [...pool, ...hiragana];
    if (cfg.mode === "katakana" || cfg.mode === "mixed")
      pool = [...pool, ...katakana];

    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const finalQuestions = [];

    for (let i = 0; i < cfg.count; i++) {
      let questionText = "";
      let answerText = "";
      let meaning = "";
      let distractors = [];

      const dir =
        cfg.direction === "random"
          ? Math.random() > 0.5
            ? "k2r"
            : "r2k"
          : cfg.direction;

      if (cfg.source === "sentences" && sentences.length > 0) {
        const sentence =
          sentences[Math.floor(Math.random() * sentences.length)];
        questionText = dir === "k2r" ? sentence.sentence : sentence.romaji;
        answerText = dir === "k2r" ? sentence.romaji : sentence.sentence;
        meaning = sentence.meaning_en || sentence.meaning_id;

        // Generate distractors from other sentences
        const otherSentences = sentences
          .filter((s) => s.id !== sentence.id)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3);
        distractors = otherSentences.map((s) =>
          dir === "k2r" ? s.romaji : s.sentence
        );
      } else if (cfg.source === "vocab" && vocabulary.length > 0) {
        const vocab = vocabulary[i % vocabulary.length];
        const kanaText =
          cfg.mode === "katakana" && vocab.katakana
            ? vocab.katakana
            : vocab.hiragana || vocab.word;

        questionText = dir === "k2r" ? kanaText : vocab.romaji;
        answerText = dir === "k2r" ? vocab.romaji : kanaText;
        meaning = vocab.meaning_en || vocab.meaning_id;

        // Generate distractors from other vocab
        const otherVocab = vocabulary
          .filter((v) => v.id !== vocab.id)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3);
        distractors = otherVocab.map((v) => {
          const vKana =
            cfg.mode === "katakana" && v.katakana
              ? v.katakana
              : v.hiragana || v.word;
          return dir === "k2r" ? v.romaji : vKana;
        });
      } else {
        // Single character
        const char = shuffled[i % shuffled.length];
        questionText = dir === "k2r" ? char.character : char.romaji;
        answerText = dir === "k2r" ? char.romaji : char.character;

        // Generate 3 random distractors
        const otherChars = shuffled
          .filter((c) => c.id !== char.id)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3);
        distractors = otherChars.map((c) =>
          dir === "k2r" ? c.romaji : c.character
        );
      }

      // Create options for choice/drag modes
      const options = [answerText, ...distractors.slice(0, 3)]
        .filter((v, i, a) => a.indexOf(v) === i) // Remove duplicates
        .sort(() => Math.random() - 0.5)
        .map((label, idx) => ({ id: `opt_${idx}`, label }));

      finalQuestions.push({
        id: `q_${i}`,
        display: questionText,
        answer: answerText,
        meaning,
        direction: dir,
        options,
      });
    }

    return finalQuestions;
  };

  // ===== START QUIZ =====
  const startQuiz = (preset) => {
    const cfg = preset.config;
    setConfig(cfg);

    if (cfg.type === "match") {
      // Generate match pairs (special handling)
      generateMatchPairs(cfg);
    } else {
      setQuestions(generateQuestions(cfg));
    }

    resetGameState();

    if (cfg.timeLimit) {
      setTimeLeft(cfg.timeLimit);
      setStartTime(Date.now());
    }

    setPhase("game");
  };

  // ===== MATCH PAIRS GENERATION =====
  const generateMatchPairs = (cfg) => {
    let pool = [];
    if (cfg.mode === "hiragana" || cfg.mode === "mixed")
      pool = [...pool, ...hiragana];
    if (cfg.mode === "katakana" || cfg.mode === "mixed")
      pool = [...pool, ...katakana];

    const selected = [...pool]
      .sort(() => Math.random() - 0.5)
      .slice(0, cfg.count);

    const left = selected.map((char, idx) => ({
      id: `left_${idx}`,
      text: char.character,
      matchId: idx,
    }));

    const right = selected
      .map((char, idx) => ({
        id: `right_${idx}`,
        text: char.romaji,
        matchId: idx,
      }))
      .sort(() => Math.random() - 0.5); // Shuffle right side

    setMatchPairs({ left, right });
  };

  // ===== DRAG & DROP SETUP =====
  const setupDragDrop = () => {
    if (!questions[currentIndex]) return;
    const q = questions[currentIndex];
    setDragItems([...q.options].sort(() => Math.random() - 0.5));
    setDroppedItem(null);
    setDragOverSlot(false);
  };

  useEffect(() => {
    if (
      phase === "game" &&
      config?.type === "drag" &&
      questions[currentIndex]
    ) {
      setupDragDrop();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, phase, config?.type, questions]);

  // ===== RESET GAME STATE =====
  const resetGameState = () => {
    setCurrentIndex(0);
    setScore(0);
    setIsAnswered(false);
    setSelectedAnswer(null);
    setFeedback(null);
    setSelectedLeft(null);
    setSelectedRight(null);
    setMatchedPairs([]);
    setWrongAttempts([]);
  };

  // ===== ANSWER HANDLERS =====
  const handleChoiceAnswer = (optionLabel) => {
    if (isAnswered) return;
    setIsAnswered(true);

    const currentQ = questions[currentIndex];
    const isCorrect = optionLabel === currentQ.answer;

    if (isCorrect) {
      setScore((s) => s + 1);
      setFeedback("correct");
    } else {
      setFeedback("incorrect");
    }
    setSelectedAnswer(optionLabel);

    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        nextQuestion();
      } else {
        setPhase("result");
      }
    }, 1500);
  };

  const handleDragStart = (e, item) => {
    e.dataTransfer.setData("text/plain", JSON.stringify(item));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOverSlot(true);
  };

  const handleDragLeave = () => {
    setDragOverSlot(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOverSlot(false);

    if (isAnswered) return;

    const item = JSON.parse(e.dataTransfer.getData("text/plain"));
    setDroppedItem(item);
    setIsAnswered(true);

    const currentQ = questions[currentIndex];
    const isCorrect = item.label === currentQ.answer;

    if (isCorrect) {
      setScore((s) => s + 1);
      setFeedback("correct");
    } else {
      setFeedback("incorrect");
    }

    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        nextQuestion();
      } else {
        setPhase("result");
      }
    }, 1500);
  };

  const handleMatchClick = (side, item) => {
    if (matchedPairs.some((p) => p.leftId === item.id || p.rightId === item.id))
      return;

    if (side === "left") {
      if (selectedLeft?.id === item.id) {
        setSelectedLeft(null);
      } else {
        setSelectedLeft(item);
        if (selectedRight) {
          checkMatch(item, selectedRight);
        }
      }
    } else {
      if (selectedRight?.id === item.id) {
        setSelectedRight(null);
      } else {
        setSelectedRight(item);
        if (selectedLeft) {
          checkMatch(selectedLeft, item);
        }
      }
    }
  };

  const checkMatch = (leftItem, rightItem) => {
    if (leftItem.matchId === rightItem.matchId) {
      // Correct match!
      setMatchedPairs((prev) => [
        ...prev,
        { leftId: leftItem.id, rightId: rightItem.id },
      ]);
      setScore((s) => s + 1);
      setSelectedLeft(null);
      setSelectedRight(null);

      // Check if all matched
      if (matchedPairs.length + 1 === matchPairs.left.length) {
        setTimeout(() => setPhase("result"), 1000);
      }
    } else {
      // Wrong match
      setWrongAttempts((prev) => [
        ...prev,
        { leftId: leftItem.id, rightId: rightItem.id },
      ]);
      setTimeout(() => {
        setWrongAttempts([]);
        setSelectedLeft(null);
        setSelectedRight(null);
      }, 800);
    }
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setIsAnswered(false);
      setSelectedAnswer(null);
      setFeedback(null);
    } else {
      setPhase("result");
    }
  };

  const resetToMenu = () => {
    setIsOpen(false);
    setPhase("menu");
    setConfig(null);
  };

  // Format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Color helper
  const getColorClasses = (color, variant = "default") => {
    const colors = {
      blue: {
        default: "from-blue-500 to-blue-600",
        light:
          "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-300",
        text: "text-blue-600 dark:text-blue-400",
      },
      orange: {
        default: "from-orange-500 to-orange-600",
        light:
          "bg-orange-50 border-orange-200 text-orange-700 dark:bg-orange-900/20 dark:border-orange-700 dark:text-orange-300",
        text: "text-orange-600 dark:text-orange-400",
      },
      purple: {
        default: "from-purple-500 to-purple-600",
        light:
          "bg-purple-50 border-purple-200 text-purple-700 dark:bg-purple-900/20 dark:border-purple-700 dark:text-purple-300",
        text: "text-purple-600 dark:text-purple-400",
      },
      teal: {
        default: "from-teal-500 to-teal-600",
        light:
          "bg-teal-50 border-teal-200 text-teal-700 dark:bg-teal-900/20 dark:border-teal-700 dark:text-teal-300",
        text: "text-teal-600 dark:text-teal-400",
      },
      red: {
        default: "from-red-500 to-red-600",
        light:
          "bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-700 dark:text-red-300",
        text: "text-red-600 dark:text-red-400",
      },
      pink: {
        default: "from-pink-500 to-pink-600",
        light:
          "bg-pink-50 border-pink-200 text-pink-700 dark:bg-pink-900/20 dark:border-pink-700 dark:text-pink-300",
        text: "text-pink-600 dark:text-pink-400",
      },
      green: {
        default: "from-green-500 to-green-600",
        light:
          "bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-700 dark:text-green-300",
        text: "text-green-600 dark:text-green-400",
      },
      indigo: {
        default: "from-indigo-500 to-indigo-600",
        light:
          "bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-900/20 dark:border-indigo-700 dark:text-indigo-300",
        text: "text-indigo-600 dark:text-indigo-400",
      },
    };
    return colors[color]?.[variant] || colors.blue[variant];
  };

  // ===== TRIGGER BUTTON =====
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-4 font-bold text-white shadow-xl transition-all hover:scale-105 hover:shadow-2xl"
      >
        <span className="relative z-10 flex items-center gap-2">
          <Play size={20} fill="currentColor" />
          Start Kana Quiz
        </span>
        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-purple-600 to-pink-600 transition-transform duration-500 group-hover:translate-x-0" />
      </button>
    );
  }

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-0 sm:p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full h-[100dvh] sm:h-auto sm:max-h-[90vh] max-w-4xl flex flex-col bg-white shadow-2xl dark:bg-[#0f172a] dark:border dark:border-white/10 sm:rounded-3xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 p-4 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 shrink-0">
          <div className="flex items-center gap-3">
            <h3 className="font-bold text-slate-800 dark:text-white truncate pr-2 text-lg">
              {phase === "menu" && "Choose Your Quiz"}
              {phase === "game" &&
                config?.type === "match" &&
                `Match Pairs • ${matchedPairs.length}/${matchPairs.left.length}`}
              {phase === "game" &&
                config?.type !== "match" &&
                `Question ${currentIndex + 1}/${questions.length}`}
              {phase === "result" && "Quiz Complete!"}
            </h3>
            {phase === "game" && timeLeft !== null && (
              <div
                className={cn(
                  "flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold",
                  timeLeft < 60
                    ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                )}
              >
                <Clock size={14} />
                {formatTime(timeLeft)}
              </div>
            )}
          </div>
          <button
            onClick={resetToMenu}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-600 dark:hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* MENU PHASE */}
          {phase === "menu" && (
            <div className="space-y-6 py-4">
              <div className="text-center space-y-2 mb-8">
                <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
                  Choose Your Challenge
                </h2>
                <p className="text-slate-500 dark:text-slate-400">
                  Pick a quiz mode and start learning!
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {QUIZ_PRESETS.map((preset) => {
                  const Icon = preset.icon;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => startQuiz(preset)}
                      className="group relative flex flex-col gap-3 p-6 rounded-2xl border-2 border-transparent bg-gradient-to-br transition-all hover:scale-[1.02] hover:shadow-xl text-left overflow-hidden"
                      style={{
                        backgroundImage: `linear-gradient(135deg, var(--tw-gradient-stops))`,
                        "--tw-gradient-from": `${
                          preset.color === "blue"
                            ? "#3b82f6"
                            : preset.color === "orange"
                            ? "#f97316"
                            : preset.color === "purple"
                            ? "#a855f7"
                            : preset.color === "teal"
                            ? "#14b8a6"
                            : preset.color === "red"
                            ? "#ef4444"
                            : preset.color === "pink"
                            ? "#ec4899"
                            : preset.color === "green"
                            ? "#10b981"
                            : "#6366f1"
                        }`,
                        "--tw-gradient-to": `${
                          preset.color === "blue"
                            ? "#2563eb"
                            : preset.color === "orange"
                            ? "#ea580c"
                            : preset.color === "purple"
                            ? "#9333ea"
                            : preset.color === "teal"
                            ? "#0d9488"
                            : preset.color === "red"
                            ? "#dc2626"
                            : preset.color === "pink"
                            ? "#db2777"
                            : preset.color === "green"
                            ? "#059669"
                            : "#4f46e5"
                        }`,
                      }}
                    >
                      <div className="absolute inset-0 bg-white/90 dark:bg-slate-900/90 group-hover:bg-white/80 dark:group-hover:bg-slate-900/80 transition-colors" />

                      <div className="relative flex items-start justify-between">
                        <div
                          className={cn(
                            "rounded-xl p-3 bg-gradient-to-br shadow-lg",
                            `from-${preset.color}-400 to-${preset.color}-600`
                          )}
                          style={{
                            backgroundImage: `linear-gradient(135deg, ${
                              preset.color === "blue"
                                ? "#60a5fa, #2563eb"
                                : preset.color === "orange"
                                ? "#fb923c, #ea580c"
                                : preset.color === "purple"
                                ? "#c084fc, #9333ea"
                                : preset.color === "teal"
                                ? "#2dd4bf, #0d9488"
                                : preset.color === "red"
                                ? "#f87171, #dc2626"
                                : preset.color === "pink"
                                ? "#f472b6, #db2777"
                                : preset.color === "green"
                                ? "#34d399, #059669"
                                : "#818cf8, #4f46e5"
                            })`,
                          }}
                        >
                          <Icon size={24} className="text-white" />
                        </div>
                        <Play
                          size={20}
                          className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors"
                        />
                      </div>

                      <div className="relative">
                        <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                          {preset.title}
                        </h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {preset.subtitle}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* GAME PHASE - MULTIPLE CHOICE */}
          {phase === "game" &&
            config?.type === "choice" &&
            questions[currentIndex] && (
              <div className="space-y-6 py-4">
                <div className="text-center">
                  <div className="flex min-h-[140px] sm:min-h-[180px] flex-col items-center justify-center rounded-3xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-white/5 dark:to-white/10 p-6 shadow-inner">
                    <span
                      className={cn(
                        "font-black text-slate-900 dark:text-white break-all leading-relaxed",
                        questions[currentIndex].display.length > 20
                          ? "text-2xl sm:text-3xl"
                          : questions[currentIndex].display.length > 10
                          ? "text-3xl sm:text-5xl"
                          : "text-5xl sm:text-7xl"
                      )}
                    >
                      {questions[currentIndex].display}
                    </span>
                  </div>

                  {questions[currentIndex].meaning && (
                    <p className="mt-4 text-sm font-medium text-slate-500 dark:text-slate-400 italic">
                      {questions[currentIndex].meaning}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {questions[currentIndex].options.map((opt) => {
                    const isCorrect =
                      opt.label === questions[currentIndex].answer;
                    const isSelected = selectedAnswer === opt.label;

                    let btnClass =
                      "relative flex items-center justify-center rounded-2xl border-2 p-6 transition-all font-bold text-lg ";

                    if (isAnswered) {
                      if (isCorrect) {
                        btnClass +=
                          "border-green-500 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 ring-4 ring-green-500/20";
                      } else if (isSelected) {
                        btnClass +=
                          "border-red-500 bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400 opacity-60";
                      } else {
                        btnClass +=
                          "border-slate-200 bg-slate-50 dark:border-white/5 dark:bg-white/5 opacity-40";
                      }
                    } else {
                      btnClass +=
                        "cursor-pointer border-slate-200 bg-white hover:border-indigo-500 hover:shadow-lg hover:-translate-y-1 dark:border-white/10 dark:bg-white/5 dark:hover:border-indigo-400";
                    }

                    return (
                      <button
                        key={opt.id}
                        disabled={isAnswered}
                        onClick={() => handleChoiceAnswer(opt.label)}
                        className={btnClass}
                      >
                        {opt.label}
                        {isAnswered && isCorrect && (
                          <Check
                            size={24}
                            className="absolute top-3 right-3 text-green-600 dark:text-green-400"
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

          {/* GAME PHASE - DRAG & DROP */}
          {phase === "game" &&
            config?.type === "drag" &&
            questions[currentIndex] && (
              <div className="space-y-6 py-4">
                <div className="text-center">
                  <p className="mb-4 text-sm font-bold uppercase tracking-widest text-slate-400">
                    Drag the correct answer
                  </p>
                  <div className="flex min-h-[140px] sm:min-h-[180px] flex-col items-center justify-center rounded-3xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-6">
                    <span
                      className={cn(
                        "font-black text-slate-900 dark:text-white",
                        questions[currentIndex].display.length > 10
                          ? "text-4xl sm:text-6xl"
                          : "text-6xl sm:text-8xl"
                      )}
                    >
                      {questions[currentIndex].display}
                    </span>
                  </div>
                </div>

                {/* Drop Zone */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={cn(
                    "flex min-h-[100px] items-center justify-center rounded-2xl border-4 border-dashed p-6 transition-all",
                    dragOverSlot &&
                      !isAnswered &&
                      "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 scale-105",
                    !dragOverSlot &&
                      !isAnswered &&
                      "border-slate-300 dark:border-white/20",
                    isAnswered &&
                      feedback === "correct" &&
                      "border-green-500 bg-green-50 dark:bg-green-900/20",
                    isAnswered &&
                      feedback === "incorrect" &&
                      "border-red-500 bg-red-50 dark:bg-red-900/20"
                  )}
                >
                  {droppedItem ? (
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold text-slate-900 dark:text-white">
                        {droppedItem.label}
                      </span>
                      {isAnswered && feedback === "correct" && (
                        <Check size={32} className="text-green-600" />
                      )}
                      {isAnswered && feedback === "incorrect" && (
                        <X size={32} className="text-red-600" />
                      )}
                    </div>
                  ) : (
                    <p className="text-slate-400 font-medium">
                      Drop answer here
                    </p>
                  )}
                </div>

                {/* Draggable Items */}
                {!isAnswered && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {dragItems.map((item) => (
                      <div
                        key={item.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, item)}
                        className="cursor-move rounded-xl border-2 border-slate-200 bg-white p-4 text-center font-bold shadow-sm hover:shadow-lg hover:scale-105 transition-all dark:border-white/10 dark:bg-white/5"
                      >
                        {item.label}
                      </div>
                    ))}
                  </div>
                )}

                {isAnswered && feedback === "incorrect" && (
                  <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
                    <p className="text-sm font-bold text-red-700 dark:text-red-400">
                      Correct answer: {questions[currentIndex].answer}
                    </p>
                  </div>
                )}
              </div>
            )}

          {/* GAME PHASE - MATCH PAIRS */}
          {phase === "game" && config?.type === "match" && (
            <div className="space-y-6 py-4">
              <div className="text-center mb-6">
                <p className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-2">
                  Match the pairs
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Click one item from each side to match them
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 sm:gap-8">
                {/* Left Side */}
                <div className="space-y-3">
                  {matchPairs.left.map((item) => {
                    const isMatched = matchedPairs.some(
                      (p) => p.leftId === item.id
                    );
                    const isSelected = selectedLeft?.id === item.id;
                    const isWrong = wrongAttempts.some(
                      (w) => w.leftId === item.id
                    );

                    return (
                      <button
                        key={item.id}
                        onClick={() => handleMatchClick("left", item)}
                        disabled={isMatched}
                        className={cn(
                          "w-full rounded-xl border-2 p-4 font-bold text-2xl transition-all",
                          isMatched &&
                            "border-green-500 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 opacity-60",
                          isSelected &&
                            !isMatched &&
                            "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 scale-105 ring-4 ring-indigo-500/20",
                          !isSelected &&
                            !isMatched &&
                            "border-slate-200 bg-white dark:border-white/10 dark:bg-white/5 hover:border-slate-400 hover:scale-105",
                          isWrong && "animate-shake border-red-500"
                        )}
                      >
                        {item.text}
                      </button>
                    );
                  })}
                </div>

                {/* Right Side */}
                <div className="space-y-3">
                  {matchPairs.right.map((item) => {
                    const isMatched = matchedPairs.some(
                      (p) => p.rightId === item.id
                    );
                    const isSelected = selectedRight?.id === item.id;
                    const isWrong = wrongAttempts.some(
                      (w) => w.rightId === item.id
                    );

                    return (
                      <button
                        key={item.id}
                        onClick={() => handleMatchClick("right", item)}
                        disabled={isMatched}
                        className={cn(
                          "w-full rounded-xl border-2 p-4 font-bold text-xl transition-all",
                          isMatched &&
                            "border-green-500 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 opacity-60",
                          isSelected &&
                            !isMatched &&
                            "border-pink-500 bg-pink-50 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400 scale-105 ring-4 ring-pink-500/20",
                          !isSelected &&
                            !isMatched &&
                            "border-slate-200 bg-white dark:border-white/10 dark:bg-white/5 hover:border-slate-400 hover:scale-105",
                          isWrong && "animate-shake border-red-500"
                        )}
                      >
                        {item.text}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Progress */}
              <div className="text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 dark:bg-white/10">
                  <span className="text-sm font-bold text-slate-600 dark:text-slate-300">
                    Matched: {matchedPairs.length} / {matchPairs.left.length}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* RESULT PHASE */}
          {phase === "result" && (
            <div className="text-center space-y-6 py-8">
              <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-2xl">
                <Trophy size={64} />
              </div>

              <div>
                <h2 className="text-5xl font-black text-slate-900 dark:text-white mb-2">
                  {config?.type === "match"
                    ? `${matchedPairs.length}/${matchPairs.left.length}`
                    : `${Math.round((score / questions.length) * 100)}%`}
                </h2>
                <p className="text-xl text-slate-600 dark:text-slate-400">
                  {config?.type === "match"
                    ? `You matched ${matchedPairs.length} pairs!`
                    : `${score} out of ${questions.length} correct`}
                </p>

                {timeLeft !== null && config?.timeLimit && (
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    Completed in {formatTime(config.timeLimit - timeLeft)}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                <button
                  onClick={() => setPhase("menu")}
                  className="rounded-xl border-2 border-slate-200 bg-white py-4 font-bold text-slate-700 transition-all hover:bg-slate-50 hover:scale-105 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
                >
                  New Quiz
                </button>
                <button
                  onClick={() => {
                    if (config.type === "match") {
                      generateMatchPairs(config);
                    } else {
                      setQuestions(generateQuestions(config));
                    }
                    resetGameState();
                    if (config.timeLimit) {
                      setTimeLeft(config.timeLimit);
                    }
                    setPhase("game");
                  }}
                  className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 py-4 font-bold text-white transition-all hover:scale-105 shadow-lg hover:shadow-xl"
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

      {/* Add shake animation style */}
      <style jsx>{`
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
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </div>,
    document.body
  );
}
