// Import enhanced TTS library
import { speak, playAudioWithFallback as playAudioWithTTS } from './tts';

// Utility function to format title strings (remove underscores, capitalize)
export function formatTitle(text) {
  if (!text) return "";
  return text.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}

// Utility function to safely parse JSON fields from database
export function safeJSONParse(value, fallback = null) {
  if (!value) return fallback;
  if (typeof value === "object") return value;

  try {
    return JSON.parse(value);
  } catch (e) {
    console.warn("JSON parse error:", e);
    return fallback;
  }
}

// Enhanced utility function to play audio with TTS fallback
export function playAudioWithFallback(audioUrl, text, lang = "ja-JP") {
  return playAudioWithTTS(audioUrl, text, { lang, rate: 0.85 });
}

// Direct TTS function
export function speakText(text, lang = "ja-JP") {
  return speak(text, { lang, rate: 0.85 });
}

// Format time in MM:SS
export function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s < 10 ? "0" : ""}${s}`;
}

// Get JLPT level color
export function getLevelColor(level) {
  const colors = {
    N5: "emerald",
    N4: "teal",
    N3: "cyan",
    N2: "blue",
    N1: "indigo",
  };
  return colors[level] || "slate";
}

// Get quiz type color
export function getQuizTypeColor(type) {
  const colors = {
    Vocabulary: "emerald",
    Kanji: "orange",
    Grammar: "indigo",
    Listening: "pink",
    Reading: "purple",
  };
  return colors[type] || "indigo";
}
