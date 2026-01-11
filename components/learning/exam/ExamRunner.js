'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Timer, CheckCircle, ChevronRight, ChevronLeft, Flag, Volume2 } from 'lucide-react';
import FuriganaText from '@/components/learning/FuriganaText';

export default function ExamRunner({ exam, sections }) {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { questionId: answer }
  const [timeLeft, setTimeLeft] = useState(exam.total_time * 60); // seconds
  const [isFinished, setIsFinished] = useState(false);
  const [playingAudio, setPlayingAudio] = useState(null);

  const currentSection = sections[currentSectionIndex];
  const questions = currentSection.questions || [];

  const playAudio = (audioUrl, id, text) => {
    if (!audioUrl) {
      if (text && 'speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'ja-JP';
        window.speechSynthesis.speak(utterance);
      }
      return;
    }
    
    setPlayingAudio(id);
    const audio = new Audio(audioUrl);
    audio.play().catch(e => console.warn('Audio error:', e));
    audio.onended = () => setPlayingAudio(null);
  };

  // Timer Logic
  useEffect(() => {
    if (isFinished) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          finishExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isFinished]);

  const finishExam = () => {
    setIsFinished(true);
    // Submit logic here
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleAnswer = (qId, val) => {
    if (isFinished) return;
    setAnswers(prev => ({ ...prev, [qId]: val }));
  };

  // --- RESULT VIEW ---
  if (isFinished) {
    // Calculate basic score
    let rawScore = 0;
    let totalQs = 0;
    sections.forEach(s => {
        s.questions.forEach(q => {
            totalQs++;
            if (answers[q.id] === q.correct_answer) rawScore++;
        });
    });

    return (
      <div className="max-w-2xl mx-auto text-center py-20 space-y-8 animate-in zoom-in duration-500">
        <div className="inline-block p-6 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 mb-4">
          <Flag size={64} />
        </div>
        <h1 className="text-4xl font-black text-slate-900 dark:text-white">Exam Completed!</h1>
        <p className="text-lg text-slate-500 dark:text-slate-400">
          You scored <span className="font-bold text-indigo-500">{rawScore} / {totalQs}</span> correct answers.
        </p>
        <div className="flex justify-center gap-4">
            <button onClick={() => window.location.reload()} className="px-6 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 font-bold dark:border-white/10 dark:hover:bg-white/5">Retake</button>
            <button onClick={() => window.location.href='/learning/jlpt'} className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-lg">Back to List</button>
        </div>
      </div>
    );
  }

  // --- EXAM VIEW ---
  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] dark:bg-[#020617]">
      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-slate-900 text-white px-6 py-4 flex justify-between items-center shadow-md">
        <div>
            <h2 className="font-bold text-lg">{exam.title_id}</h2>
            <p className="text-xs text-slate-400">Section {currentSectionIndex + 1}: {currentSection.section_name_id}</p>
        </div>
        <div className={`flex items-center gap-2 font-mono text-xl font-bold ${timeLeft < 300 ? 'text-red-400 animate-pulse' : 'text-emerald-400'}`}>
            <Timer size={20} />
            {formatTime(timeLeft)}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 pt-24 pb-32 max-w-4xl mx-auto w-full px-4 space-y-8">
        
        {/* Section Instructions */}
        {currentSection.instructions_id && (
            <div className="bg-white dark:bg-[#0f172a] border-l-4 border-indigo-500 p-6 rounded-r-xl shadow-sm text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                <strong className="block text-indigo-600 dark:text-indigo-400 mb-2 uppercase text-xs tracking-wider">Instructions</strong>
                {currentSection.instructions_id}
            </div>
        )}

        {/* Questions */}
        <div className="space-y-6">
            {questions.map((q, idx) => {
                // Parse options if string (some imports might save as stringified json)
                let opts = q.options;
                if (typeof opts === 'string') {
                    try { opts = JSON.parse(opts); } catch(e) { opts = []; }
                }
                if (!Array.isArray(opts)) opts = [];

                return (
                    <div key={q.id} className="bg-white dark:bg-[#0f172a] p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-white/5">
                        <div className="flex gap-4 mb-6">
                            <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 text-sm font-bold text-slate-600 dark:text-white">{q.question_number}</span>
                            <div className="flex-1">
                                {/* Context / Text with Audio */}
                                {q.context_ja && (
                                  <div className="mb-4 p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/10">
                                    <div className="flex justify-between items-start gap-3">
                                      <div className="flex-1">
                                        <FuriganaText
                                          text={q.context_ja}
                                          furigana={q.context_furigana}
                                          romaji={q.context_romaji}
                                          wordBreakdown={q.word_breakdown}
                                          showRomaji={false}
                                          className="text-lg leading-relaxed text-slate-700 dark:text-slate-300 font-serif"
                                        />
                                        {q.context_romaji && (
                                          <p className="text-xs font-mono text-slate-400 dark:text-slate-500 mt-2">
                                            {q.context_romaji}
                                          </p>
                                        )}
                                      </div>
                                      {q.audio_url && (
                                        <button
                                          onClick={() => playAudio(q.audio_url, q.id, q.context_ja)}
                                          className={`flex-shrink-0 p-2 rounded-full transition-all ${
                                            playingAudio === q.id 
                                              ? 'bg-pink-500 text-white animate-pulse' 
                                              : 'bg-slate-100 text-slate-600 hover:bg-pink-100 hover:text-pink-600 dark:bg-white/10 dark:text-slate-300'
                                          }`}
                                        >
                                          <Volume2 size={18} />
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                )}
                                
                                {/* Question Prompt */}
                                <p className="text-lg font-bold text-slate-900 dark:text-white">
                                    {q.question_ja || q.question_id}
                                </p>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 ml-0 sm:ml-12">
                            {opts.map((opt, i) => {
                                const isSelected = answers[q.id] === opt; // Store raw value or index? usually value for simple match
                                // Actually better to store index if options are text. But legacy data might differ.
                                // Let's assume options is array of strings.
                                return (
                                    <button 
                                        key={i}
                                        onClick={() => handleAnswer(q.id, opt)}
                                        className={cn(
                                            "p-4 rounded-xl border-2 text-left text-sm font-medium transition-all",
                                            isSelected 
                                                ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-500" 
                                                : "border-slate-100 bg-slate-50 hover:bg-white hover:border-indigo-300 dark:bg-white/5 dark:border-white/5 dark:hover:bg-white/10 dark:text-slate-300"
                                        )}
                                    >
                                        <span className="font-bold mr-3 opacity-50">{i+1}</span> {opt}
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                );
            })}
            
            {questions.length === 0 && (
                <div className="text-center py-10 text-slate-400">No questions in this section.</div>
            )}
        </div>

      </div>

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-[#0f172a] border-t border-slate-200 dark:border-white/5 p-4 flex justify-between items-center z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        <button 
            disabled={currentSectionIndex === 0}
            onClick={() => {
                setCurrentSectionIndex(prev => prev - 1);
                window.scrollTo(0,0);
            }}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-30 dark:text-slate-300 dark:hover:bg-white/5"
        >
            <ChevronLeft size={20} /> Prev Section
        </button>

        <div className="flex gap-1.5 overflow-x-auto max-w-[200px] px-2 hide-scrollbar">
            {sections.map((_, i) => (
                <div key={i} className={`h-2.5 w-2.5 rounded-full flex-shrink-0 transition-colors ${i === currentSectionIndex ? 'bg-indigo-600 scale-125' : 'bg-slate-200 dark:bg-white/10'}`} />
            ))}
        </div>

        {currentSectionIndex < sections.length - 1 ? (
            <button 
                onClick={() => {
                    setCurrentSectionIndex(prev => prev + 1);
                    window.scrollTo(0,0);
                }}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 dark:bg-white dark:text-slate-900"
            >
                Next Section <ChevronRight size={20} />
            </button>
        ) : (
            <button 
                onClick={finishExam}
                className="flex items-center gap-2 px-8 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 shadow-lg shadow-red-500/30 transition-all hover:scale-105"
            >
                Finish Exam <CheckCircle size={20} />
            </button>
        )}
      </div>
    </div>
  );
}