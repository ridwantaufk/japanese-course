"use client";

import { useState, useEffect, useMemo, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createPortal } from "react-dom";
import LevelSelector from "./LevelSelector";
import { X, Volume2, Book, Loader2, BrainCircuit, Search, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import FuriganaText from "./FuriganaText";
import KanjiQuizModal from "./KanjiQuizModal";

export default function KanjiList({ initialData }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const [isPending, startTransition] = useTransition();
  
  useEffect(() => {
    // Standard pattern for portals, but wrap in a small check or set at the end of the event loop
    // to avoid React 19's synchronous effect warning if possible
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  const currentLevelFromUrl = searchParams.get("level")?.toUpperCase() || "N5";
  const [level, setLevel] = useState(currentLevelFromUrl);
  
  const [selectedKanji, setSelectedKanji] = useState(null);
  const [examples, setExamples] = useState([]);
  const [loadingExamples, setLoadingExamples] = useState(false);
  const [strokeFilter, setStrokeFilter] = useState("all");

  useEffect(() => {
    if (currentLevelFromUrl !== level) {
      startTransition(() => {
        setLevel(currentLevelFromUrl);
      });
    }
  }, [currentLevelFromUrl, level]);

  const handleLevelChange = (newLevel) => {
    const params = new URLSearchParams(searchParams);
    params.set("level", newLevel);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  // Filter Data
  const filteredData = useMemo(() => {
    let data = initialData.filter(
      (k) => String(k.jlpt_level || "").toUpperCase().trim() === level
    );
    if (strokeFilter !== "all") {
      const [min, max] = strokeFilter.split("-").map(Number);
      data = data.filter(k => k.stroke_count >= min && k.stroke_count <= max);
    }
    return data;
  }, [initialData, level, strokeFilter]);

  // Extract unique stroke ranges for filtering
  const strokeRanges = ["all", "1-5", "6-10", "11-15", "16+"];

  useEffect(() => {
    let active = true;
    const loadExamples = async () => {
      if (!selectedKanji) {
        setExamples([]);
        return;
      }
      setLoadingExamples(true);
      try {
        // Try fetching linked examples
        const res = await fetch(`/api/admin/kanji_examples?kanji_id=${selectedKanji.id}`);
        const result = await res.json();
        
        if (active) {
          if (result.data && result.data.length > 0) {
            setExamples(result.data);
          } else {
            // FALLBACK: Search in main vocabulary table for words containing this Kanji
            // We'll create a simple client-side fetch or assuming we have a search endpoint
            const fallbackRes = await fetch(`/api/admin/vocabulary?search=${encodeURIComponent(selectedKanji.character)}&limit=5`);
            const fallbackData = await fallbackRes.json();
            
            // Map vocabulary data to example format
            const mapped = (fallbackData.data || []).map(v => ({
              japanese_text: v.word,
              furigana: v.hiragana || v.katakana,
              meaning_id: v.meaning_id || v.meaning_en,
              audio_url: v.audio_url
            }));
            setExamples(mapped);
          }
          setLoadingExamples(false);
        }
      } catch (err) {
        console.error(err);
        if (active) setLoadingExamples(false);
      }
    };
    loadExamples();
    return () => { active = false; };
  }, [selectedKanji]);

  const playAudio = (text, url) => {
    if (url) {
      const audio = new Audio(url);
      audio.play().catch(() => {
        // If file fails, fallback to speech API
        speak(text);
      });
    } else {
      speak(text);
    }
  };

  const speak = (text) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel(); // Stop current speech
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "ja-JP";
      u.rate = 0.8;
      window.speechSynthesis.speak(u);
    }
  };

  const renderReading = (reading) => {
    if (!reading) return null;
    if (typeof reading === "object") return reading.reading || reading.kana;
    return reading;
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-black text-slate-900 dark:text-white">Kanji Library</h1>
        <p className="text-slate-500 dark:text-slate-400">Master Kanji from N5 to N1 level.</p>
        
        <div className="flex flex-col items-center gap-6">
          <LevelSelector currentLevel={level} onSelect={handleLevelChange} />
          
          {/* Secondary Filters */}
          <div className="flex flex-wrap justify-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-white/5 text-slate-500 text-xs font-bold">
              <Layers size={14} /> Strokes:
            </div>
            {strokeRanges.map(range => (
              <button
                key={range}
                onClick={() => setStrokeFilter(range)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-xs font-bold transition-all border",
                  strokeFilter === range 
                    ? "bg-indigo-600 border-indigo-600 text-white shadow-md"
                    : "bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:border-indigo-400"
                )}
              >
                {range === "16+" ? "16+" : range.toUpperCase()}
              </button>
            ))}
          </div>

          {filteredData.length > 0 && (
            <div className="mt-2">
              <KanjiQuizModal kanjiData={filteredData} level={level} />
            </div>
          )}
        </div>
      </div>

      {/* Kanji Grid with Transition State */}
      <div className={cn(
        "grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4 transition-opacity duration-300",
        isPending ? "opacity-50" : "opacity-100"
      )}>
        {filteredData.map((k) => (
          <button
            key={k.id}
            onClick={() => setSelectedKanji(k)}
            className="group relative aspect-square flex flex-col items-center justify-center rounded-3xl bg-white shadow-sm ring-1 ring-slate-200 transition-all hover:-translate-y-1 hover:shadow-xl hover:ring-indigo-400 dark:bg-[#0f172a] dark:ring-white/10 dark:hover:ring-indigo-500"
          >
            <span className="text-5xl font-black text-slate-800 dark:text-white mb-2 group-hover:scale-110 transition-transform">{k.character}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate px-2 max-w-full">
              {k.meaning_id || k.meaning_en}
            </span>
            <div className="absolute top-3 right-3 text-[10px] font-black text-slate-200 dark:text-slate-800">
              {k.stroke_count}
            </div>
          </button>
        ))}
      </div>

      {filteredData.length === 0 && !isPending && (
        <div className="text-center py-20 bg-slate-50 dark:bg-white/5 rounded-3xl border-2 border-dashed border-slate-200 dark:border-white/10">
          <p className="text-slate-400 font-bold">No Kanji found matching these filters.</p>
          <button onClick={() => setStrokeFilter("all")} className="text-indigo-500 text-sm font-bold mt-2 hover:underline">Reset Filters</button>
        </div>
      )}

      {/* Detail Modal */}
      {selectedKanji && mounted && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="w-full h-[100dvh] sm:h-auto sm:max-h-[90vh] max-w-2xl flex flex-col bg-white dark:bg-[#0f172a] shadow-2xl sm:rounded-3xl overflow-hidden">
            
            <div className="relative bg-gradient-to-br from-indigo-600 to-violet-700 p-6 sm:p-8 text-center text-white shrink-0">
              <button onClick={() => setSelectedKanji(null)} className="absolute top-4 right-4 rounded-full bg-white/10 p-2 hover:bg-white/20 transition-colors">
                <X size={20} />
              </button>
              <div className="text-8xl font-black mb-2 drop-shadow-lg">{selectedKanji.character}</div>
              <h2 className="text-2xl font-bold capitalize">{selectedKanji.meaning_id || selectedKanji.meaning_en}</h2>
              <div className="mt-4 flex justify-center gap-4 text-xs font-bold text-white/70">
                <span className="bg-white/10 px-3 py-1 rounded-lg border border-white/10">{selectedKanji.jlpt_level}</span>
                <span className="bg-white/10 px-3 py-1 rounded-lg border border-white/10">{selectedKanji.stroke_count} Strokes</span>
                {selectedKanji.radical && <span className="bg-white/10 px-3 py-1 rounded-lg border border-white/10">Radical: {selectedKanji.radical}</span>}
              </div>
              <button onClick={() => playAudio(selectedKanji.character, selectedKanji.audio_url)} className="mt-6 inline-flex items-center gap-2 rounded-full bg-white text-indigo-700 px-8 py-3 text-sm font-black shadow-xl hover:scale-105 transition-all active:scale-95">
                <Volume2 size={18} /> Listen Pronunciation
              </button>
            </div>

            <div className="flex-1 p-6 sm:p-8 space-y-8 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 border-b border-slate-100 dark:border-white/5 pb-8">
                <div className="space-y-3">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Onyomi (Reading)</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedKanji.onyomi?.length > 0 ? selectedKanji.onyomi.map((on, i) => (
                      <div key={i} className="flex flex-col bg-slate-50 dark:bg-white/5 p-2 rounded-xl border border-slate-100 dark:border-white/5 min-w-[60px] items-center">
                        <span className="text-indigo-600 dark:text-indigo-400 font-black text-lg">{renderReading(on)}</span>
                        <span className="text-[10px] text-slate-400 font-mono uppercase">{on.romaji}</span>
                      </div>
                    )) : <span className="text-slate-400 text-sm">-</span>}
                  </div>
                </div>
                <div className="space-y-3">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Kunyomi (Reading)</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedKanji.kunyomi?.length > 0 ? selectedKanji.kunyomi.map((kun, i) => (
                      <div key={i} className="flex flex-col bg-slate-50 dark:bg-white/5 p-2 rounded-xl border border-slate-100 dark:border-white/5 min-w-[60px] items-center">
                        <span className="text-emerald-600 dark:text-emerald-400 font-black text-lg">{renderReading(kun)}</span>
                        <span className="text-[10px] text-slate-400 font-mono uppercase">{kun.romaji}</span>
                      </div>
                    )) : <span className="text-slate-400 text-sm">-</span>}
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="flex items-center gap-2 text-lg font-black text-slate-800 dark:text-white">
                    <Book size={20} className="text-indigo-500" /> Vocabulary Examples
                  </h3>
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-white/5 px-2 py-1 rounded">Usage of {selectedKanji.character}</span>
                </div>
                
                {loadingExamples ? (
                  <div className="flex justify-center py-8"><Loader2 className="animate-spin text-indigo-500" /></div>
                ) : examples.length > 0 ? (
                  <div className="grid gap-3">
                    {examples.map((ex, i) => (
                      <div key={i} className="group flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 hover:border-indigo-300 dark:hover:border-indigo-500 transition-all cursor-pointer shadow-sm hover:shadow-md" onClick={() => playAudio(ex.japanese_text, ex.audio_url)}>
                        <div>
                          <FuriganaText text={ex.japanese_text} furigana={ex.furigana} className="text-xl font-bold text-slate-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
                          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">{ex.meaning_id}</p>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-slate-50 dark:bg-white/10 flex items-center justify-center text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-all">
                          <Volume2 size={18} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 bg-slate-50 dark:bg-white/5 rounded-2xl border-2 border-dashed border-slate-200 dark:border-white/10">
                    <Search size={32} className="mx-auto text-slate-300 mb-2" />
                    <p className="text-slate-400 text-sm font-bold">No usage examples found for this Kanji.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
