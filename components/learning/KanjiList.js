"use client";

import { useState, useEffect, useMemo } from "react";
import LevelSelector from "./LevelSelector";
import { X, Volume2, Book, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import FuriganaText from "./FuriganaText";

export default function KanjiList({ initialData }) {
  const [level, setLevel] = useState("N5");
  const [selectedKanji, setSelectedKanji] = useState(null);
  const [examples, setExamples] = useState([]);
  const [loadingExamples, setLoadingExamples] = useState(false);

  // Filter Data
  const filteredData = useMemo(() => {
    return initialData.filter(
      (k) =>
        String(k.jlpt_level || "")
          .toUpperCase()
          .trim() === level
    );
  }, [initialData, level]);

  // Fetch Examples when Kanji is selected
  useEffect(() => {
    let mounted = true;

    const loadExamples = async () => {
      if (!selectedKanji) {
        if (mounted) setExamples([]);
        return;
      }

      setLoadingExamples(true);
      try {
        const res = await fetch(
          `/api/admin/kanji_examples?kanji_id=${selectedKanji.id}`
        );
        const data = await res.json();
        if (mounted) {
          setExamples(data.data || []);
          setLoadingExamples(false);
        }
      } catch (err) {
        console.error("Failed to fetch examples", err);
        if (mounted) {
          setExamples([]);
          setLoadingExamples(false);
        }
      }
    };

    loadExamples();

    return () => {
      mounted = false;
    };
  }, [selectedKanji]);

  // Audio Logic with Fallback
  const playAudio = (text, url) => {
    if (url) {
      new Audio(url).play().catch((e) => console.warn("Audio file error", e));
    } else {
      // Web Speech API Fallback
      if ("speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "ja-JP";
        window.speechSynthesis.speak(utterance);
      } else {
        alert("Audio not available");
      }
    }
  };

  const renderReading = (reading) => {
    if (!reading) return null;
    if (typeof reading === "object")
      return reading.reading || reading.kana || JSON.stringify(reading);
    return reading;
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-black text-slate-900 dark:text-white">
          Kanji Library
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Select your JLPT level to start learning.
        </p>
        <LevelSelector currentLevel={level} onSelect={setLevel} />
      </div>

      {/* Kanji Grid */}
      <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
        {filteredData.map((k) => (
          <button
            key={k.id}
            onClick={() => setSelectedKanji(k)}
            className="group relative aspect-square flex flex-col items-center justify-center rounded-3xl bg-white shadow-sm ring-1 ring-slate-200 transition-all hover:-translate-y-1 hover:shadow-xl hover:ring-indigo-400 dark:bg-[#0f172a] dark:ring-white/10 dark:hover:ring-indigo-500"
          >
            <span className="text-5xl font-black text-slate-800 dark:text-white mb-2">
              {k.character}
            </span>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider truncate px-2 max-w-full">
              {k.meaning_id || k.meaning_en}
            </span>
            <div className="absolute top-3 right-3 text-[10px] font-bold text-slate-300 dark:text-slate-600">
              {k.stroke_count}s
            </div>
          </button>
        ))}
      </div>

      {filteredData.length === 0 && (
        <div className="text-center py-20 text-slate-400">
          No Kanji found for level {level}.
        </div>
      )}

      {/* Detail Modal */}
      {selectedKanji && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl bg-white dark:bg-[#0f172a] shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="relative bg-gradient-to-br from-indigo-600 to-violet-700 p-8 text-center text-white shrink-0">
              <button
                onClick={() => setSelectedKanji(null)}
                className="absolute top-4 right-4 rounded-full bg-white/10 p-2 hover:bg-white/20 transition-colors"
              >
                <X size={20} />
              </button>

              <div className="text-8xl font-black mb-2">
                {selectedKanji.character}
              </div>
              <h2 className="text-2xl font-bold capitalize">
                {selectedKanji.meaning_id || selectedKanji.meaning_en}
              </h2>

              <div className="mt-4 flex justify-center gap-4 text-sm font-medium text-white/80">
                <span className="bg-white/10 px-3 py-1 rounded-full">
                  {selectedKanji.jlpt_level}
                </span>
                <span className="bg-white/10 px-3 py-1 rounded-full">
                  {selectedKanji.stroke_count} Strokes
                </span>
              </div>

              <button
                onClick={() =>
                  playAudio(selectedKanji.character, selectedKanji.audio_url)
                }
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-white text-indigo-700 px-6 py-2 text-sm font-bold shadow-lg hover:bg-indigo-50 transition-all"
              >
                <Volume2 size={16} /> Listen
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-8 space-y-8 overflow-y-auto custom-scrollbar">
              {/* Readings */}
              <div className="grid grid-cols-2 gap-8 border-b border-slate-100 dark:border-white/5 pb-8">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">
                    Onyomi (Chinese)
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedKanji.onyomi && selectedKanji.onyomi.length > 0 ? (
                      selectedKanji.onyomi.map((on, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-200 font-bold"
                        >
                          {renderReading(on)}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-400 text-sm">-</span>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">
                    Kunyomi (Japanese)
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedKanji.kunyomi &&
                    selectedKanji.kunyomi.length > 0 ? (
                      selectedKanji.kunyomi.map((kun, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-200 font-bold"
                        >
                          {renderReading(kun)}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-400 text-sm">-</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Examples Section (New) */}
              <div>
                <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800 dark:text-white mb-4">
                  <Book size={20} className="text-indigo-500" />
                  Vocabulary Examples
                </h3>

                {loadingExamples ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="animate-spin text-indigo-500" />
                  </div>
                ) : examples.length > 0 ? (
                  <div className="grid gap-3">
                    {examples.map((ex, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 hover:border-indigo-200 transition-colors cursor-pointer"
                        onClick={() =>
                          playAudio(ex.japanese_text, ex.audio_url)
                        }
                      >
                        <div>
                          <FuriganaText
                            text={ex.japanese_text}
                            furigana={ex.furigana}
                            className="text-lg font-bold text-slate-800 dark:text-white"
                          />
                          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            {ex.meaning_id}
                          </p>
                        </div>
                        <Volume2 size={16} className="text-slate-300" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-slate-400 text-sm bg-slate-50 dark:bg-white/5 rounded-xl border border-dashed border-slate-200 dark:border-white/10">
                    No examples available for this Kanji yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
