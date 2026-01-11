'use client';

import { useState } from 'react';

export default function FuriganaText({ 
  text, 
  furigana, 
  romaji, 
  wordBreakdown, 
  showRomaji = false,
  className = '' 
}) {
  const [hoveredWord, setHoveredWord] = useState(null);

  // Jika tidak ada furigana, tampilkan text biasa
  if (!furigana || text === furigana) {
    return (
      <span className={className}>
        {text}
        {showRomaji && romaji && (
          <span className="ml-2 text-sm font-mono text-slate-400 dark:text-slate-500">({romaji})</span>
        )}
      </span>
    );
  }

  // If word breakdown available, render interactive version
  if (wordBreakdown && Array.isArray(wordBreakdown) && wordBreakdown.length > 0) {
    return (
      <span className={`inline-flex flex-wrap gap-1 ${className}`}>
        {wordBreakdown.map((wb, idx) => (
          <span
            key={idx}
            className="relative inline-block group cursor-help"
            onMouseEnter={() => setHoveredWord(idx)}
            onMouseLeave={() => setHoveredWord(null)}
          >
            <ruby className="font-japanese">
              {wb.word}
              {wb.reading && <rt className="text-[0.7em] text-slate-500 dark:text-slate-400">{wb.reading}</rt>}
            </ruby>
            {hoveredWord === idx && wb.meaning && (
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-slate-900 text-white text-xs rounded-lg whitespace-nowrap z-50 shadow-xl">
                {wb.meaning}
                {wb.romaji && <span className="ml-1 text-slate-400">({wb.romaji})</span>}
              </span>
            )}
          </span>
        ))}
      </span>
    );
  }

  // Simple ruby rendering with optional romaji
  return (
    <span className="inline-flex items-baseline gap-2">
      <ruby className={`font-japanese ${className}`}>
        {text}
        <rt className="text-[0.7em] text-slate-500 dark:text-slate-400 select-none">{furigana}</rt>
      </ruby>
      {showRomaji && romaji && (
        <span className="text-sm font-mono text-slate-400 dark:text-slate-500">({romaji})</span>
      )}
    </span>
  );
}