"use client";

import { useState, useEffect, useMemo, useTransition, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createPortal } from "react-dom";
import LevelSelector from "./LevelSelector";
import InteractiveVocabularyQuiz from "./InteractiveVocabularyQuiz";
import { playAudioWithFallback } from "@/lib/tts";
import {
  X,
  Volume2,
  Book,
  Loader2,
  BrainCircuit,
  Search,
  Filter,
  BookOpen,
  Tag,
  TrendingUp,
  Clock,
  Star,
  Sparkles,
  Languages,
  MessageSquare,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import FuriganaText from "./FuriganaText";

export default function VocabularyList({ initialData }) {
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

  const [selectedVocab, setSelectedVocab] = useState(null);
  const [examples, setExamples] = useState([]);
  const [loadingExamples, setLoadingExamples] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [wordTypeFilter, setWordTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("frequency"); // frequency, alphabetical, difficulty

  useEffect(() => {
    if (currentLevelFromUrl !== level) {
      startTransition(() => {
        setLevel(currentLevelFromUrl);
        setSearchQuery("");
        setWordTypeFilter("all");
        setCategoryFilter("all");
      });
    }
  }, [currentLevelFromUrl, level]);

  const handleLevelChange = (newLevel) => {
    const params = new URLSearchParams(searchParams);
    params.set("level", newLevel);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  // Scroll lock when modal is open
  useEffect(() => {
    if (selectedVocab) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedVocab]);

  useEffect(() => {
    let active = true;
    const loadExamples = async () => {
      if (!selectedVocab) return;
      setLoadingExamples(true);
      try {
        const res = await fetch(
          `/api/admin/vocabulary_examples?vocabulary_id=${selectedVocab.id}`
        );
        if (res.ok) {
          const data = await res.json();
          if (active) {
            setExamples(data.data || []);
          }
          setLoadingExamples(false);
        }
      } catch (err) {
        if (active) setLoadingExamples(false);
      }
    };
    loadExamples();
    return () => {
      active = false;
    };
  }, [selectedVocab]);

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

  // Get unique values for filters
  const wordTypes = useMemo(() => {
    const types = new Set();
    initialData.forEach(v => {
      if (v.word_type) types.add(v.word_type);
    });
    return Array.from(types).sort();
  }, [initialData]);

  const categories = useMemo(() => {
    const cats = new Set();
    initialData.forEach(v => {
      if (v.category) cats.add(v.category);
    });
    return Array.from(cats).sort();
  }, [initialData]);

  const calculateDifficulty = useCallback((vocab) => {
    let score = 0;
    if (vocab.word) score += vocab.word.length * 10;
    if (vocab.frequency_rank) score += (10000 - vocab.frequency_rank) / 100;
    return score;
  }, []);

  // Filter and sort vocabulary
  const filteredVocabulary = useMemo(() => {
    let filtered = initialData.filter(
      (v) =>
        String(v.jlpt_level || "")
          .toUpperCase()
          .trim() === level
    );

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(v =>
        v.word?.toLowerCase().includes(query) ||
        v.reading?.toLowerCase().includes(query) ||
        v.romaji?.toLowerCase().includes(query) ||
        v.meaning_id?.toLowerCase().includes(query) ||
        v.meaning_en?.toLowerCase().includes(query)
      );
    }

    // Word type filter
    if (wordTypeFilter !== "all") {
      filtered = filtered.filter(v => v.word_type === wordTypeFilter);
    }

    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter(v => v.category === categoryFilter);
    }

    // Sort
    if (sortBy === "frequency") {
      filtered.sort((a, b) => (a.frequency_rank || 9999) - (b.frequency_rank || 9999));
    } else if (sortBy === "alphabetical") {
      filtered.sort((a, b) => (a.word || "").localeCompare(b.word || ""));
    } else if (sortBy === "difficulty") {
      filtered.sort((a, b) => {
        const diffA = calculateDifficulty(a);
        const diffB = calculateDifficulty(b);
        return diffA - diffB;
      });
    }

    return filtered;
  }, [initialData, level, searchQuery, wordTypeFilter, categoryFilter, sortBy, calculateDifficulty]);

  const getLevelStats = () => {
    const total = filteredVocabulary.length;
    const types = new Set(filteredVocabulary.map(v => v.word_type)).size;
    const categories = new Set(filteredVocabulary.map(v => v.category)).size;
    return { total, types, categories };
  };

  const stats = getLevelStats();

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              📚 Vocabulary Master
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Master {stats.total} words with interactive learning
            </p>
          </div>

          <InteractiveVocabularyQuiz vocabularyData={filteredVocabulary} level={level} />
        </div>

        {/* Level Selector */}
        <LevelSelector
          currentLevel={level}
          onSelect={handleLevelChange}
          disabled={isPending}
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 border-2 border-indigo-200 dark:border-indigo-800">
            <div className="flex items-center gap-2 mb-1">
              <BookOpen size={16} className="text-indigo-600 dark:text-indigo-400" />
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">Total Words</span>
            </div>
            <div className="text-2xl font-black text-indigo-900 dark:text-indigo-100">{stats.total}</div>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-2 border-purple-200 dark:border-purple-800">
            <div className="flex items-center gap-2 mb-1">
              <Tag size={16} className="text-purple-600 dark:text-purple-400" />
              <span className="text-xs font-bold text-purple-600 dark:text-purple-400">Word Types</span>
            </div>
            <div className="text-2xl font-black text-purple-900 dark:text-purple-100">{stats.types}</div>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 border-2 border-pink-200 dark:border-pink-800">
            <div className="flex items-center gap-2 mb-1">
              <Layers size={16} className="text-pink-600 dark:text-pink-400" />
              <span className="text-xs font-bold text-pink-600 dark:text-pink-400">Categories</span>
            </div>
            <div className="text-2xl font-black text-pink-900 dark:text-pink-100">{stats.categories}</div>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-2 border-orange-200 dark:border-orange-800">
            <div className="flex items-center gap-2 mb-1">
              <Star size={16} className="text-orange-600 dark:text-orange-400" />
              <span className="text-xs font-bold text-orange-600 dark:text-orange-400">Level</span>
            </div>
            <div className="text-2xl font-black text-orange-900 dark:text-orange-100">{level}</div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search vocabulary by word, reading, meaning..."
            className="w-full pl-12 pr-4 py-3 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors"
          />
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap gap-3">
          {/* Word Type Filter */}
          <select
            value={wordTypeFilter}
            onChange={(e) => setWordTypeFilter(e.target.value)}
            className="px-4 py-2 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors"
          >
            <option value="all">All Types</option>
            {wordTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors"
          >
            <option value="frequency">Most Common</option>
            <option value="alphabetical">Alphabetical</option>
            <option value="difficulty">Difficulty</option>
          </select>

          {/* Clear Filters */}
          {(searchQuery || wordTypeFilter !== "all" || categoryFilter !== "all" || sortBy !== "frequency") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setWordTypeFilter("all");
                setCategoryFilter("all");
                setSortBy("frequency");
              }}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Vocabulary Grid */}
      {isPending ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      ) : filteredVocabulary.length === 0 ? (
        <div className="text-center py-20">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
          <p className="text-lg font-medium text-slate-600 dark:text-slate-400">
            No vocabulary found
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">
            Try adjusting your filters
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredVocabulary.map((vocab) => (
            <div
              key={vocab.id}
              onClick={() => setSelectedVocab(vocab)}
              className="group relative p-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-indigo-500 dark:hover:border-indigo-400 hover:shadow-xl transition-all text-left cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="text-2xl font-black text-slate-900 dark:text-white mb-1">
                    {vocab.word}
                  </div>
                  {vocab.reading && vocab.reading !== '-' && vocab.reading !== vocab.word && (
                    <div className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                      {vocab.reading}
                    </div>
                  )}
                  {vocab.romaji && vocab.romaji !== '-' && (
                    <div className="text-xs font-mono text-slate-400 mt-1">
                      {vocab.romaji}
                    </div>
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    playAudio(vocab.word, vocab.audio_url);
                  }}
                  className="p-2 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 transition-colors"
                >
                  <Volume2 size={18} />
                </button>
              </div>

              <div className="text-sm text-slate-700 dark:text-slate-300 font-medium mb-3">
                {vocab.meaning_id || vocab.meaning_en}
              </div>

              <div className="flex flex-wrap gap-2">
                {vocab.word_type && (
                  <span className="px-2 py-1 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-[10px] font-bold text-purple-700 dark:text-purple-300">
                    {vocab.word_type}
                  </span>
                )}
                {vocab.category && (
                  <span className="px-2 py-1 rounded-lg bg-pink-100 dark:bg-pink-900/30 text-[10px] font-bold text-pink-700 dark:text-pink-300">
                    {vocab.category}
                  </span>
                )}
                {vocab.frequency_rank && vocab.frequency_rank < 1000 && (
                  <span className="px-2 py-1 rounded-lg bg-orange-100 dark:bg-orange-900/30 text-[10px] font-bold text-orange-700 dark:text-orange-300">
                    ⭐ Common
                  </span>
                )}
              </div>

              {vocab.example_count > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                    <MessageSquare size={12} />
                    {vocab.example_count} {vocab.example_count === 1 ? 'example' : 'examples'}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Vocabulary Detail Modal */}
      {selectedVocab &&
        mounted &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-md p-0 sm:p-4 animate-in fade-in duration-200"
            onClick={() => setSelectedVocab(null)}
          >
            <div
              className="w-full h-[100dvh] sm:h-auto sm:max-h-[90vh] max-w-3xl flex flex-col bg-white dark:bg-slate-800 shadow-2xl sm:rounded-3xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative bg-gradient-to-br from-indigo-600 to-purple-700 p-6 sm:p-8 text-center text-white shrink-0">
                <button
                  onClick={() => setSelectedVocab(null)}
                  className="absolute top-4 right-4 rounded-full bg-white/10 p-2 hover:bg-white/20 transition-colors cursor-pointer"
                >
                  <X size={20} />
                </button>
                <div className="text-6xl font-black mb-3 drop-shadow-lg">
                  {selectedVocab.word}
                </div>
                {selectedVocab.reading && selectedVocab.reading !== '-' && selectedVocab.reading !== selectedVocab.word && (
                  <div className="text-2xl font-bold mb-2 opacity-90">
                    {selectedVocab.reading}
                  </div>
                )}
                {selectedVocab.romaji && selectedVocab.romaji !== '-' && (
                  <div className="text-lg font-mono opacity-75">
                    {selectedVocab.romaji}
                  </div>
                )}
                <button
                  onClick={() => playAudio(selectedVocab.word, selectedVocab.audio_url)}
                  className="mt-4 px-6 py-3 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm font-bold flex items-center gap-2 mx-auto transition-colors cursor-pointer"
                >
                  <Volume2 size={20} />
                  Play Audio
                </button>
              </div>

              <div className="flex-1 p-6 sm:p-8 space-y-8 overflow-y-auto custom-scrollbar">
                {/* Meaning */}
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-slate-400 mb-3">
                    Meaning
                  </h3>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {selectedVocab.meaning_id || selectedVocab.meaning_en}
                  </p>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {selectedVocab.word_type && (
                    <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                      <div className="text-xs font-bold text-purple-600 dark:text-purple-400 mb-1">
                        Word Type
                      </div>
                      <div className="font-black text-purple-900 dark:text-purple-100">
                        {selectedVocab.word_type}
                      </div>
                    </div>
                  )}

                  {selectedVocab.category && (
                    <div className="p-4 rounded-xl bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-800">
                      <div className="text-xs font-bold text-pink-600 dark:text-pink-400 mb-1">
                        Category
                      </div>
                      <div className="font-black text-pink-900 dark:text-pink-100">
                        {selectedVocab.category}
                      </div>
                    </div>
                  )}

                  {selectedVocab.jlpt_level && (
                    <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800">
                      <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-1">
                        JLPT Level
                      </div>
                      <div className="font-black text-indigo-900 dark:text-indigo-100">
                        {selectedVocab.jlpt_level}
                      </div>
                    </div>
                  )}

                  {selectedVocab.frequency_rank && (
                    <div className="p-4 rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
                      <div className="text-xs font-bold text-orange-600 dark:text-orange-400 mb-1">
                        Frequency
                      </div>
                      <div className="font-black text-orange-900 dark:text-orange-100">
                        #{selectedVocab.frequency_rank}
                      </div>
                    </div>
                  )}
                </div>

                {/* Examples */}
                {loadingExamples ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                  </div>
                ) : examples.length > 0 ? (
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-wider text-slate-400 mb-4">
                      Example Sentences
                    </h3>
                    <div className="space-y-4">
                      {examples.map((ex, i) => (
                        <div
                          key={i}
                          className="p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600"
                        >
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="text-lg font-bold text-slate-900 dark:text-white">
                              <FuriganaText text={ex.japanese_text} />
                            </div>
                            <button
                              onClick={() => playAudio(ex.japanese_text, ex.audio_url)}
                              className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600 text-indigo-600 dark:text-indigo-400 transition-colors flex-shrink-0"
                            >
                              <Volume2 size={16} />
                            </button>
                          </div>
                          <div className="text-sm text-slate-600 dark:text-slate-300">
                            {ex.meaning_id || ex.meaning_en}
                          </div>
                          {ex.romaji && (
                            <div className="text-xs font-mono text-slate-400 mt-2">
                              {ex.romaji}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
