'use client';

export default function FuriganaText({ text, furigana, className = '' }) {
  // Jika tidak ada furigana, tampilkan text biasa
  if (!furigana || text === furigana) {
    return <span className={className}>{text}</span>;
  }

  // Simple ruby rendering
  return (
    <ruby className={`font-japanese ${className}`}>
      {text}
      <rt className="text-[0.6em] text-slate-500 dark:text-slate-400 select-none opacity-80">{furigana}</rt>
    </ruby>
  );
}