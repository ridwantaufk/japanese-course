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

// Utility function to play audio with Web Speech API fallback
export function playAudioWithFallback(audioUrl, text, lang = "ja-JP") {
  return new Promise((resolve, reject) => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio
        .play()
        .then(() => {
          audio.onended = resolve;
        })
        .catch((e) => {
          console.warn("Audio file error, trying fallback:", e);
          speakText(text, lang).then(resolve).catch(reject);
        });
    } else if (text && "speechSynthesis" in window) {
      speakText(text, lang).then(resolve).catch(reject);
    } else {
      reject(new Error("No audio source available"));
    }
  });
}

// Web Speech API helper
function speakText(text, lang = "ja-JP") {
  return new Promise((resolve, reject) => {
    if (!("speechSynthesis" in window)) {
      reject(new Error("Speech synthesis not supported"));
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.onend = resolve;
    utterance.onerror = reject;
    window.speechSynthesis.speak(utterance);
  });
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
