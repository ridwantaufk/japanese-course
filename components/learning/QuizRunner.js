"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Check,
  X,
  RefreshCw,
  BrainCircuit,
  Play,
  Clock,
  Award,
  Volume2,
} from "lucide-react";
import FuriganaText from "./FuriganaText";
import { formatTitle } from "@/lib/learningUtils";
import { saveQuizProgress, getQuizProgress } from "@/lib/progressTracking";

export default function QuizRunner({ initialData }) {
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [playingAudio, setPlayingAudio] = useState(null);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [error, setError] = useState(null);

  const playAudio = (audioUrl, id, text) => {
    if (!audioUrl) {
      if (text && "speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "ja-JP";
        window.speechSynthesis.speak(utterance);
      }
      return;
    }

    setPlayingAudio(id);
    const audio = new Audio(audioUrl);
    audio.play().catch((e) => console.warn("Audio error:", e));
    audio.onended = () => setPlayingAudio(null);
  };

  const startQuiz = async (quiz) => {
    setLoadingQuestions(true);
    setError(null);

    try {
      // Fetch real questions from database
      const response = await fetch(`/api/quiz/${quiz.id}/questions`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const questions = data.questions || [];

      if (questions.length === 0) {
        setError(
          "No questions available for this quiz. Please try another one."
        );
        setLoadingQuestions(false);
        return;
      }

      setActiveQuiz({ ...quiz, questions });
      setCurrentQuestionIndex(0);
      setScore(0);
      setShowResult(false);
      setIsAnswered(false);
      setSelectedAnswer(null);
      setLoadingQuestions(false);
    } catch (error) {
      console.error("Failed to fetch quiz questions:", error);
      setError(`Failed to load quiz: ${error.message}`);
      setLoadingQuestions(false);
    }
  };

  const handleAnswer = (option) => {
    if (isAnswered) return;
    setSelectedAnswer(option);
    setIsAnswered(true);

    const correctAnswer =
      activeQuiz.questions[currentQuestionIndex].correct_answer ||
      activeQuiz.questions[currentQuestionIndex].answer;

    if (option === correctAnswer) {
      setScore((s) => s + 1);
    }

    setTimeout(() => {
      if (currentQuestionIndex < activeQuiz.questions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
        setIsAnswered(false);
        setSelectedAnswer(null);
      } else {
        setShowResult(true);
      }
    }, 1500);
  };

  // Group Quizzes by Level -> Type
  const groupedQuizzes = initialData.reduce((acc, quiz) => {
    const level = quiz.jlpt_level || "General";
    if (!acc[level]) acc[level] = [];
    acc[level].push(quiz);
    return acc;
  }, {});

  // Sort levels (N5 -> N1 -> General)
  const sortedLevels = Object.keys(groupedQuizzes).sort((a, b) => {
    const order = { N5: 1, N4: 2, N3: 3, N2: 4, N1: 5, General: 6 };
    return (order[a] || 99) - (order[b] || 99);
  });

  // Loading Modal
  if (loadingQuestions) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20 space-y-6">
        <div className="inline-block p-6 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 animate-pulse">
          <BrainCircuit size={64} />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Loading Questions...
        </h2>
        <p className="text-slate-500 dark:text-slate-400">
          Please wait while we prepare your quiz
        </p>
      </div>
    );
  }

  // Error Display
  if (error) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20 space-y-6">
        <div className="inline-block p-6 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600">
          <X size={64} />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Oops!
        </h2>
        <p className="text-slate-600 dark:text-slate-400">{error}</p>
        <button
          onClick={() => setError(null)}
          className="px-6 py-3 rounded-full bg-slate-900 text-white font-bold hover:bg-slate-800 dark:bg-white dark:text-slate-900"
        >
          Back to Quiz List
        </button>
      </div>
    );
  }

  if (activeQuiz) {
    if (showResult) {
      // Save quiz progress
      saveQuizProgress(activeQuiz.id, score, activeQuiz.questions.length);

      return (
        <div className="max-w-md mx-auto text-center space-y-8 py-12 animate-in zoom-in duration-500">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-yellow-400 blur-2xl opacity-20 rounded-full"></div>
            <Award
              size={120}
              className="relative text-yellow-500 mx-auto drop-shadow-lg"
            />
          </div>

          <div>
            <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-2">
              Quiz Complete!
            </h2>
            <p className="text-slate-500 dark:text-slate-400">
              Great effort taking this challenge.
            </p>
          </div>

          <div className="bg-white dark:bg-[#0f172a] p-8 rounded-3xl shadow-xl border border-slate-100 dark:border-white/5">
            <p className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-2">
              Your Score
            </p>
            <p className="text-6xl font-black text-indigo-600 dark:text-indigo-400">
              {Math.round((score / activeQuiz.questions.length) * 100)}%
            </p>
            <p className="text-slate-500 mt-2 font-medium">
              {score} out of {activeQuiz.questions.length} correct
            </p>
          </div>

          <button
            onClick={() => setActiveQuiz(null)}
            className="px-8 py-4 rounded-full bg-slate-900 text-white font-bold shadow-lg hover:bg-slate-800 hover:scale-105 transition-all dark:bg-white dark:text-slate-900"
          >
            Back to Quiz List
          </button>
        </div>
      );
    }

    const question = activeQuiz.questions[currentQuestionIndex];
    const progress = (currentQuestionIndex / activeQuiz.questions.length) * 100;

    return (
      <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Header */}
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
              {formatTitle(activeQuiz)}
            </h2>
            <span className="text-xs font-bold bg-indigo-100 text-indigo-700 px-2 py-1 rounded-md dark:bg-indigo-900/30 dark:text-indigo-300">
              Question {currentQuestionIndex + 1} of{" "}
              {activeQuiz.questions.length}
            </span>
          </div>
          <div className="text-right">
            <span className="flex items-center gap-1 text-sm font-bold text-slate-500 dark:text-slate-400">
              <Clock size={14} /> {activeQuiz.time_limit_minutes || 10}:00
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden dark:bg-white/10">
          <div
            className="h-full bg-indigo-500 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        {/* Question Card */}
        <div className="bg-white dark:bg-[#0f172a] rounded-3xl p-8 shadow-xl border border-slate-200 dark:border-white/5">
          {/* Context with Audio */}
          {question.context_ja && (
            <div className="mb-6 p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/10">
              <div className="flex justify-between items-start gap-3">
                <div className="flex-1">
                  <FuriganaText
                    text={question.context_ja}
                    furigana={question.context_furigana}
                    romaji={question.context_romaji}
                    wordBreakdown={question.word_breakdown}
                    showRomaji={false}
                    className="text-lg leading-relaxed text-slate-700 dark:text-slate-300 font-serif"
                  />
                  {question.context_romaji && (
                    <p className="text-xs font-mono text-slate-400 dark:text-slate-500 mt-2">
                      {question.context_romaji}
                    </p>
                  )}
                </div>
                {question.audio_url && (
                  <button
                    onClick={() =>
                      playAudio(
                        question.audio_url,
                        question.id,
                        question.context_ja
                      )
                    }
                    className={`flex-shrink-0 p-2 rounded-full transition-all ${
                      playingAudio === question.id
                        ? "bg-pink-500 text-white animate-pulse"
                        : "bg-slate-100 text-slate-600 hover:bg-pink-100 hover:text-pink-600 dark:bg-white/10 dark:text-slate-300"
                    }`}
                  >
                    <Volume2 size={18} />
                  </button>
                )}
              </div>
            </div>
          )}

          <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-8 leading-snug text-center">
            {question.question_ja || question.question_id}
          </h3>
          <div className="grid grid-cols-1 gap-3">
            {(() => {
              // Parse options from database (might be JSONB array or stringified)
              let opts = question.options;
              if (typeof opts === "string") {
                try {
                  opts = JSON.parse(opts);
                } catch (e) {
                  opts = [];
                }
              }
              if (!Array.isArray(opts)) opts = [];

              // Get correct answer
              const correctAnswer = question.correct_answer || question.answer;

              return opts.map((opt, idx) => {
                let btnClass =
                  "relative p-5 rounded-2xl border-2 font-bold text-left transition-all duration-200 ";
                if (isAnswered) {
                  if (opt === correctAnswer)
                    btnClass +=
                      "border-green-500 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 shadow-md transform scale-[1.02]";
                  else if (opt === selectedAnswer)
                    btnClass +=
                      "border-red-500 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400";
                  else
                    btnClass +=
                      "border-slate-100 opacity-50 dark:border-white/5";
                } else {
                  btnClass +=
                    "border-slate-100 bg-slate-50/50 hover:bg-white hover:border-indigo-500 hover:shadow-lg hover:-translate-y-0.5 dark:border-white/5 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10 dark:hover:border-indigo-400";
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(opt)}
                    className={btnClass}
                    disabled={isAnswered}
                  >
                    <div className="flex justify-between items-center">
                      <span>{opt}</span>
                      {isAnswered && opt === correctAnswer && (
                        <Check size={20} />
                      )}
                      {isAnswered &&
                        opt === selectedAnswer &&
                        opt !== correctAnswer && <X size={20} />}
                    </div>
                  </button>
                );
              });
            })()}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-black text-slate-900 dark:text-white">
          Quiz Challenge
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Select a challenge to test your skills.
        </p>
      </div>

      {sortedLevels.map((level) => (
        <div key={level} className="space-y-4">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-black text-slate-800 dark:text-white">
              {level} Challenges
            </h2>
            <div className="h-px flex-1 bg-slate-200 dark:bg-white/10"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {groupedQuizzes[level].map((quiz) => (
              <button
                key={quiz.id}
                onClick={() => startQuiz(quiz)}
                className="group relative overflow-hidden rounded-3xl bg-white p-6 text-left shadow-sm ring-1 ring-slate-200 transition-all hover:-translate-y-1 hover:shadow-xl hover:ring-indigo-400 dark:bg-[#0f172a] dark:ring-white/10 dark:hover:ring-indigo-500"
              >
                <div className="flex justify-between items-start mb-4">
                  <span
                    className={cn(
                      "inline-block px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest",
                      quiz.quiz_type === "Vocabulary"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                        : quiz.quiz_type === "Kanji"
                        ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300"
                        : "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
                    )}
                  >
                    {quiz.quiz_type}
                  </span>
                  {quiz.time_limit_minutes && (
                    <span className="flex items-center gap-1 text-xs font-bold text-slate-400">
                      <Clock size={12} /> {quiz.time_limit_minutes}m
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 pr-8 leading-tight">
                  {quiz.title_ja || quiz.title_en || formatTitle(quiz.title_id)}
                </h3>

                <div className="absolute bottom-4 right-4 h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors dark:bg-white/5">
                  <Play size={16} fill="currentColor" />
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}

      {initialData.length === 0 && (
        <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200 dark:bg-white/5 dark:border-white/10">
          <BrainCircuit size={48} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500 font-medium">No active quizzes found.</p>
        </div>
      )}
    </div>
  );
}
