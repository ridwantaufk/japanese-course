"use client";

import { useState } from "react";
import LevelSelector from "./LevelSelector";
import { ChevronDown, ChevronUp, BookOpen, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import FuriganaText from "./FuriganaText";

export default function GrammarList({ initialData }) {
  const [level, setLevel] = useState("N5");
  const [expandedId, setExpandedId] = useState(null);
  const [playingAudio, setPlayingAudio] = useState(null);

  const filteredData = initialData.filter(
    (g) =>
      String(g.jlpt_level || "")
        .toUpperCase()
        .trim() === level
  );

  const playAudio = (audioUrl, id, text) => {
    if (!audioUrl) {
      // Fallback to Web Speech API
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

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-black text-slate-900 dark:text-white">
          Grammar
        </h1>
        <LevelSelector currentLevel={level} onSelect={setLevel} />
      </div>

      <div className="space-y-4">
        {filteredData.map((g) => (
          <div
            key={g.id}
            className="rounded-2xl bg-white dark:bg-[#0f172a] shadow-sm border border-slate-200 dark:border-white/10 overflow-hidden transition-all"
          >
            <button
              onClick={() => setExpandedId(expandedId === g.id ? null : g.id)}
              className="w-full flex items-center justify-between p-6 text-left hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                    {g.pattern}
                  </h3>
                  {g.audio_url && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        playAudio(g.audio_url, `pattern-${g.id}`, g.pattern);
                      }}
                      className={`p-1.5 rounded-full transition-all hover:scale-110 ${
                        playingAudio === `pattern-${g.id}`
                          ? "bg-pink-500 text-white animate-pulse"
                          : "bg-slate-100 text-slate-600 hover:bg-pink-100 hover:text-pink-600 dark:bg-white/10 dark:text-slate-300"
                      }`}
                    >
                      <Volume2 size={16} />
                    </button>
                  )}
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  {g.title_id}
                </p>
              </div>
              {expandedId === g.id ? <ChevronUp /> : <ChevronDown />}
            </button>

            {expandedId === g.id && (
              <div className="p-6 pt-0 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-black/20">
                <div className="mt-4 space-y-4">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
                      Structure
                    </h4>
                    <p className="font-mono text-sm bg-white dark:bg-black/40 p-3 rounded-lg border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300">
                      {g.structure}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
                      Explanation
                    </h4>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                      {g.explanation_id}
                    </p>
                  </div>

                  {/* Example Sentences */}
                  {g.example_sentence && (
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
                        Examples
                      </h4>
                      <div className="space-y-3">
                        <div className="bg-white dark:bg-black/40 p-4 rounded-xl border border-slate-200 dark:border-white/10">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <FuriganaText
                                text={g.example_sentence}
                                furigana={g.example_furigana}
                                romaji={g.example_romaji}
                                wordBreakdown={g.example_word_breakdown}
                                showRomaji={false}
                                className="text-lg font-medium text-slate-800 dark:text-white mb-2"
                              />
                              {g.example_romaji && (
                                <p className="text-xs font-mono text-slate-400 dark:text-slate-500 mb-2">
                                  {g.example_romaji}
                                </p>
                              )}
                              {g.example_meaning_id && (
                                <p className="text-sm text-slate-600 dark:text-slate-400 italic">
                                  {g.example_meaning_id}
                                </p>
                              )}
                            </div>
                            {g.example_audio_url && (
                              <button
                                onClick={() =>
                                  playAudio(
                                    g.example_audio_url,
                                    `example-${g.id}`,
                                    g.example_sentence
                                  )
                                }
                                className={`flex-shrink-0 p-2 rounded-full transition-all ${
                                  playingAudio === `example-${g.id}`
                                    ? "bg-pink-500 text-white animate-pulse"
                                    : "bg-slate-100 text-slate-600 hover:bg-pink-100 hover:text-pink-600 dark:bg-white/10 dark:text-slate-300"
                                }`}
                              >
                                <Volume2 size={18} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
