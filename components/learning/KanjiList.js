"use client";

import { useState, useEffect, useMemo, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createPortal } from "react-dom";
import LevelSelector from "./LevelSelector";
import { X, Volume2, Book, Loader2, BrainCircuit, Search, Layers, Fingerprint, Tag, Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";
import FuriganaText from "./FuriganaText";
import KanjiQuizModal from "./KanjiQuizModal";

export default function KanjiList({ initialData }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const [isPending, startTransition] = useTransition();
  
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  const currentLevelFromUrl = searchParams.get("level")?.toUpperCase() || "N5";
  const [level, setLevel] = useState(currentLevelFromUrl);
  
  const [selectedKanji, setSelectedKanji] = useState(null);
  const [examples, setExamples] = useState([]);
  const [loadingExamples, setLoadingExamples] = useState(false);
  
  const [strokeFilter, setStrokeFilter] = useState("all");
  const [radicalFilter, setRadicalFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  useEffect(() => {
    if (currentLevelFromUrl !== level) {
      startTransition(() => {
        setLevel(currentLevelFromUrl);
        setRadicalFilter("all");
        setStrokeFilter("all");
        setCategoryFilter("all");
        setTypeFilter("all");
      });
    }
  }, [currentLevelFromUrl, level]);

  const handleLevelChange = (newLevel) => {
    const params = new URLSearchParams(searchParams);
    params.set("level", newLevel);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const currentLevelData = useMemo(() => {
    return initialData.filter(k => String(k.jlpt_level || "").toUpperCase().trim() === level);
  }, [initialData, level]);

  const availableRadicals = useMemo(() => {
    return ["all", ...new Set(currentLevelData.map(k => k.radical).filter(Boolean))].sort();
  }, [currentLevelData]);

  const availableCategories = useMemo(() => {
    return ["all", ...new Set(currentLevelData.map(k => k.category).filter(Boolean))].sort();
  }, [currentLevelData]);

  const availableTypes = useMemo(() => {
    return ["all", ...new Set(currentLevelData.map(k => k.word_type).filter(Boolean))].sort();
  }, [currentLevelData]);

  const filteredData = useMemo(() => {
    let data = [...currentLevelData];
    if (strokeFilter !== "all") {
      const [min, max] = strokeFilter.split("-").map(Number);
      if (strokeFilter === "16+") data = data.filter(k => k.stroke_count >= 16);
      else data = data.filter(k => k.stroke_count >= min && k.stroke_count <= max);
    }
    if (radicalFilter !== "all") data = data.filter(k => k.radical === radicalFilter);
    if (categoryFilter !== "all") data = data.filter(k => k.category === categoryFilter);
    if (typeFilter !== "all") data = data.filter(k => k.word_type === typeFilter);
    return data;
  }, [currentLevelData, strokeFilter, radicalFilter, categoryFilter, typeFilter]);

  const strokeRanges = ["all", "1-5", "6-10", "11-15", "16+"];

  useEffect(() => {
    let active = true;
    const loadExamples = async () => {
      if (!selectedKanji) return;
      setLoadingExamples(true);
      try {
        const res = await fetch(`/api/admin/kanji_examples?kanji_id=${selectedKanji.id}`);
        const result = await res.json();
        if (active) {
          if (result.data && result.data.length > 0) {
            setExamples(result.data);
          } else {
            const fallbackRes = await fetch(`/api/admin/vocabulary?search=${encodeURIComponent(selectedKanji.character)}&limit=5`);
            const fallbackData = await fallbackRes.json();
            setExamples((fallbackData.data || []).map(v => ({
              japanese_text: v.word,
              furigana: v.hiragana || v.katakana,
              meaning_id: v.meaning_id || v.meaning_en,
              audio_url: v.audio_url
            })));
          }
          setLoadingExamples(false);
        }
      } catch (err) {
        if (active) setLoadingExamples(false);
      }
    };
    loadExamples();
    return () => { active = false; };
  }, [selectedKanji]);

  const playAudio = (text, url) => {
    if (url) {
      new Audio(url).play().catch(() => speak(text));
    } else speak(text);
  };

  const speak = (text) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "ja-JP";
      u.rate = 0.8;
      window.speechSynthesis.speak(u);
    }
  };

  const renderReading = (reading) => {
    if (!reading) return null;
    return typeof reading === "object" ? (reading.reading || reading.kana) : reading;
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Kanji Library</h1>
          <p className="text-slate-500 dark:text-slate-400">Master Kanji from N5 to N1 level.</p>
          
          {/* Global Stats Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
            Total Library: {initialData.length} Kanji
          </div>
        </div>
        
        <div className="flex flex-col items-center gap-6">
          <LevelSelector currentLevel={level} onSelect={handleLevelChange} />
          
          {/* Level & Filter Stats */}
          <div className="flex flex-wrap justify-center gap-4 text-sm font-bold">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
              <span className="px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/30 text-xs">{currentLevelData.length}</span>
              Total {level}
            </div>
            {filteredData.length !== currentLevelData.length && (
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 animate-in fade-in slide-in-from-left-2">
                <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/30 text-xs">{filteredData.length}</span>
                Showing
              </div>
            )}
          </div>
          
          <div className="w-full max-w-4xl bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-[2rem] p-6 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <Tag size={12} className="text-indigo-500" /> Category
                </label>
                <select 
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-2.5 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all cursor-pointer"
                >
                  {availableCategories.map(c => <option key={c} value={c}>{c === "all" ? "All Categories" : c}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <Bookmark size={12} className="text-emerald-500" /> Word Type
                </label>
                <select 
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-2.5 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all cursor-pointer"
                >
                  {availableTypes.map(t => <option key={t} value={t}>{t === "all" ? "All Types" : t}</option>)}
                </select>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <Layers size={12} className="text-purple-500" /> Strokes
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {strokeRanges.map(range => (
                    <button key={range} onClick={() => setStrokeFilter(range)} className={cn("px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all border cursor-pointer", strokeFilter === range ? "bg-purple-600 border-purple-600 text-white shadow-md" : "bg-slate-50 dark:bg-white/5 border-transparent text-slate-500 hover:border-purple-300")}>
                      {range}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <Fingerprint size={12} className="text-pink-500" /> Radicals
                </label>
                <div className="flex flex-wrap gap-1 max-h-[80px] overflow-y-auto custom-scrollbar pr-2">
                  {availableRadicals.map(rad => (
                    <button key={rad} onClick={() => setRadicalFilter(rad)} className={cn("w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold transition-all border cursor-pointer", radicalFilter === rad ? "bg-pink-600 border-pink-600 text-white shadow-md" : "bg-slate-50 dark:bg-white/5 border-transparent text-slate-500 hover:border-pink-300")}>
                      {rad === "all" ? "All" : rad}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          {filteredData.length > 0 && (
            <div className="mt-2 animate-in zoom-in duration-300">
              <KanjiQuizModal kanjiData={filteredData} level={level} />
            </div>
          )}
        </div>
      </div>

      <div className={cn("grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4 transition-all duration-500", isPending ? "opacity-50 blur-sm" : "opacity-100")}>
        {filteredData.map((k) => (
          <button key={k.id} onClick={() => setSelectedKanji(k)} className="group relative aspect-square flex flex-col items-center justify-center rounded-3xl bg-white shadow-sm ring-1 ring-slate-200 transition-all hover:-translate-y-1 hover:shadow-xl hover:ring-indigo-400 dark:bg-[#0f172a] dark:ring-white/10 dark:hover:ring-indigo-500 cursor-pointer">
            <span className="text-5xl font-black text-slate-800 dark:text-white mb-2 group-hover:scale-110 transition-transform duration-300">{k.character}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate px-2 max-w-full">{k.meaning_id || k.meaning_en}</span>
            <div className="absolute top-3 right-3 text-[10px] font-black text-slate-200 dark:text-slate-800">{k.stroke_count}</div>
            <div className="absolute bottom-3 right-3 text-[8px] font-black text-indigo-500/40 uppercase tracking-tighter">{k.word_type?.slice(0,5)}</div>
          </button>
        ))}
      </div>

      {filteredData.length === 0 && !isPending && (
        <div className="text-center py-20 bg-slate-50 dark:bg-white/5 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-white/10">
          <p className="text-slate-400 font-bold text-lg">No Kanji matches your current filters.</p>
          <button onClick={() => {setStrokeFilter("all"); setRadicalFilter("all"); setCategoryFilter("all"); setTypeFilter("all");}} className="px-6 py-2 rounded-full bg-slate-900 text-white text-sm font-bold mt-4 hover:bg-slate-800 dark:bg-white dark:text-slate-900 transition-all cursor-pointer">Reset All Filters</button>
        </div>
      )}

      {selectedKanji && mounted && createPortal(
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedKanji(null)} // Close when clicking backdrop
        >
          <div 
            className="w-full h-[100dvh] sm:h-auto sm:max-h-[90vh] max-w-2xl flex flex-col bg-white dark:bg-[#0f172a] shadow-2xl sm:rounded-3xl overflow-hidden"
            onClick={(e) => e.stopPropagation()} // Prevent close when clicking modal content
          >
            <div className="relative bg-gradient-to-br from-indigo-600 to-violet-700 p-6 sm:p-8 text-center text-white shrink-0">
              <button onClick={() => setSelectedKanji(null)} className="absolute top-4 right-4 rounded-full bg-white/10 p-2 hover:bg-white/20 transition-colors cursor-pointer"><X size={20} /></button>
              <div className="text-8xl font-black mb-2 drop-shadow-lg">{selectedKanji.character}</div>
              <h2 className="text-2xl font-bold capitalize">{selectedKanji.meaning_id || selectedKanji.meaning_en}</h2>
              <div className="mt-4 flex flex-wrap justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/70">
                <span className="bg-white/10 px-3 py-1 rounded-lg border border-white/10">{selectedKanji.jlpt_level}</span>
                <span className="bg-white/10 px-3 py-1 rounded-lg border border-white/10">{selectedKanji.stroke_count} Strokes</span>
                {selectedKanji.category && <span className="bg-white/10 px-3 py-1 rounded-lg border border-white/10">{selectedKanji.category}</span>}
                {selectedKanji.word_type && <span className="bg-white/10 px-3 py-1 rounded-lg border border-white/10">{selectedKanji.word_type}</span>}
              </div>
              <button onClick={() => playAudio(selectedKanji.character, selectedKanji.audio_url)} className="mt-6 inline-flex items-center gap-2 rounded-full bg-white text-indigo-700 px-8 py-3 text-sm font-black shadow-xl hover:scale-105 transition-all active:scale-95 cursor-pointer"><Volume2 size={18} /> Listen Pronunciation</button>
            </div>
            <div className="flex-1 p-6 sm:p-8 space-y-8 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 border-b border-slate-100 dark:border-white/5 pb-8">
                <div className="space-y-3">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Onyomi</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedKanji.onyomi?.length > 0 ? selectedKanji.onyomi.map((on, i) => (
                      <div key={i} className="flex flex-col bg-slate-50 dark:bg-white/5 p-2 rounded-xl border border-slate-100 dark:border-white/5 min-w-[60px] items-center">
                        <span className="text-indigo-600 dark:text-indigo-400 font-black text-lg">{on.kana || on.reading}</span>
                        <span className="text-[10px] text-slate-400 font-mono uppercase">{on.romaji}</span>
                      </div>
                    )) : <span className="text-slate-400 text-sm">-</span>}
                  </div>
                </div>
                <div className="space-y-3">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Kunyomi</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedKanji.kunyomi?.length > 0 ? selectedKanji.kunyomi.map((kun, i) => (
                      <div key={i} className="flex flex-col bg-slate-50 dark:bg-white/5 p-2 rounded-xl border border-slate-100 dark:border-white/5 min-w-[60px] items-center">
                        <span className="text-emerald-600 dark:text-emerald-400 font-black text-lg">{kun.kana || kun.reading}</span>
                        <span className="text-[10px] text-slate-400 font-mono uppercase">{kun.romaji}</span>
                      </div>
                    )) : <span className="text-slate-400 text-sm">-</span>}
                  </div>
                </div>
              </div>
              <div>
                <h3 className="flex items-center gap-2 text-lg font-black text-slate-800 dark:text-white mb-4"><Book size={20} className="text-indigo-500" /> Vocabulary Examples</h3>
                {loadingExamples ? <div className="flex justify-center py-8"><Loader2 className="animate-spin text-indigo-500" /></div> : examples.length > 0 ? (
                  <div className="grid gap-3">
                    {examples.map((ex, i) => (
                      <div key={i} className="group flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 hover:border-indigo-300 transition-all cursor-pointer shadow-sm" onClick={() => playAudio(ex.japanese_text, ex.audio_url)}>
                        <div>
                          <FuriganaText text={ex.japanese_text} furigana={ex.furigana} className="text-xl font-bold text-slate-800 dark:text-white group-hover:text-indigo-600 transition-colors" />
                          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">{ex.meaning_id}</p>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-slate-50 dark:bg-white/10 flex items-center justify-center text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-all"><Volume2 size={18} /></div>
                      </div>
                    ))}
                  </div>
                ) : <div className="text-center py-10 bg-slate-50 dark:bg-white/5 rounded-2xl border-2 border-dashed border-slate-200 dark:border-white/10"><p className="text-slate-400 text-sm font-bold">No examples found for this Kanji.</p></div>}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}