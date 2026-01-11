/**
 * Enhanced Text-to-Speech Library
 * Supports multiple TTS engines with automatic fallback
 *
 * Priority:
 * 1. Google Cloud TTS (via API endpoint) - Best quality, free tier 1M chars/month
 * 2. ResponsiveVoice (free tier) - Good quality
 * 3. Web Speech API with optimized Japanese voices - Built-in, always works
 */

// Cache for audio blobs to avoid repeated API calls
const audioCache = new Map();

/**
 * Main TTS function with automatic fallback
 * @param {string} text - Text to speak
 * @param {object} options - TTS options
 * @returns {Promise<void>}
 */
export async function speak(text, options = {}) {
  const {
    lang = "ja-JP",
    rate = 0.85,
    pitch = 1.0,
    volume = 1.0,
    voice = null,
    useCache = true,
  } = options;

  if (!text || text.trim() === "") {
    throw new Error("No text provided");
  }

  const cacheKey = `${text}-${lang}-${rate}-${pitch}`;

  // Check cache first
  if (useCache && audioCache.has(cacheKey)) {
    try {
      const cachedAudio = audioCache.get(cacheKey);
      await playAudioBlob(cachedAudio);
      return;
    } catch (e) {
      console.warn("Cache playback failed:", e);
      audioCache.delete(cacheKey);
    }
  }

  // Try methods in order
  const methods = [
    () => speakWithGoogleTTS(text, { lang, rate, pitch, volume, cacheKey }),
    () => speakWithResponsiveVoice(text, { lang, rate, pitch, volume }),
    () => speakWithWebSpeech(text, { lang, rate, pitch, volume, voice }),
  ];

  let lastError;
  for (const method of methods) {
    try {
      await method();
      return;
    } catch (e) {
      console.warn("TTS method failed, trying next:", e.message);
      lastError = e;
    }
  }

  throw lastError || new Error("All TTS methods failed");
}

/**
 * Google Cloud TTS via our API endpoint
 */
async function speakWithGoogleTTS(text, options) {
  const { lang, rate, pitch, cacheKey } = options;

  try {
    const response = await fetch("/api/tts/google", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, lang, rate, pitch }),
    });

    if (!response.ok) {
      throw new Error(`Google TTS API failed: ${response.status}`);
    }

    const audioBlob = await response.blob();

    // Cache the audio
    if (cacheKey) {
      audioCache.set(cacheKey, audioBlob);
    }

    await playAudioBlob(audioBlob);
  } catch (e) {
    throw new Error(`Google TTS failed: ${e.message}`);
  }
}

/**
 * ResponsiveVoice (Free tier: 5000 chars/day)
 */
async function speakWithResponsiveVoice(text, options) {
  if (typeof window.responsiveVoice === "undefined") {
    throw new Error("ResponsiveVoice not loaded");
  }

  return new Promise((resolve, reject) => {
    const voiceMap = {
      "ja-JP": "Japanese Female",
      ja: "Japanese Female",
    };

    const voice = voiceMap[options.lang] || "Japanese Female";

    window.responsiveVoice.speak(text, voice, {
      rate: options.rate,
      pitch: options.pitch,
      volume: options.volume,
      onend: resolve,
      onerror: reject,
    });
  });
}

/**
 * Web Speech API with optimized Japanese voices
 */
async function speakWithWebSpeech(text, options) {
  if (!("speechSynthesis" in window)) {
    throw new Error("Web Speech API not supported");
  }

  return new Promise((resolve, reject) => {
    // Cancel any ongoing speech and wait a bit
    window.speechSynthesis.cancel();
    
    // Small delay to ensure cancellation completes
    setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = options.lang;
      utterance.rate = options.rate;
      utterance.pitch = options.pitch;
      utterance.volume = options.volume;

      // Try to use the best Japanese voice available
      if (options.voice) {
        utterance.voice = options.voice;
      } else {
        const voices = window.speechSynthesis.getVoices();
        const japaneseVoice = findBestJapaneseVoice(voices);
        if (japaneseVoice) {
          utterance.voice = japaneseVoice;
        }
      }

      utterance.onend = resolve;
      utterance.onerror = (e) => {
        // Don't reject on interrupted error, it's expected behavior
        if (e.error === 'interrupted' || e.error === 'canceled') {
          resolve();
        } else {
          reject(new Error(`Speech synthesis error: ${e.error}`));
        }
      };

      window.speechSynthesis.speak(utterance);

      // Timeout fallback (some browsers don't fire onend)
      setTimeout(() => {
        if (!window.speechSynthesis.speaking) {
          resolve();
        }
      }, text.length * 50 + 1000);
    }, 50);
  });
}

/**
 * Find the best Japanese voice from available voices
 */
function findBestJapaneseVoice(voices) {
  // Priority order of Japanese voices (best quality first)
  const preferredVoices = [
    "Microsoft Nanami - Japanese (Japan)",
    "Microsoft Ayumi - Japanese (Japan)",
    "Google 日本語",
    "Kyoko",
    "Otoya",
  ];

  // Try exact matches first
  for (const preferred of preferredVoices) {
    const voice = voices.find((v) => v.name === preferred);
    if (voice) return voice;
  }

  // Try partial matches
  const jaVoices = voices.filter(
    (v) =>
      v.lang.startsWith("ja") ||
      v.name.includes("Japan") ||
      v.name.includes("日本")
  );

  if (jaVoices.length > 0) {
    // Prefer female voices for better clarity
    const femaleVoice = jaVoices.find(
      (v) =>
        v.name.includes("Female") ||
        v.name.includes("Nanami") ||
        v.name.includes("Kyoko")
    );
    return femaleVoice || jaVoices[0];
  }

  return null;
}

/**
 * Get list of available Japanese voices
 */
export function getJapaneseVoices() {
  if (!("speechSynthesis" in window)) {
    return [];
  }

  const voices = window.speechSynthesis.getVoices();
  return voices
    .filter(
      (v) =>
        v.lang.startsWith("ja") ||
        v.name.includes("Japan") ||
        v.name.includes("日本")
    )
    .map((v) => ({
      name: v.name,
      lang: v.lang,
      localService: v.localService,
      default: v.default,
    }));
}

/**
 * Play audio from blob
 */
async function playAudioBlob(blob) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);

    audio.onended = () => {
      URL.revokeObjectURL(url);
      resolve();
    };

    audio.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(new Error("Audio playback failed"));
    };

    audio.play().catch(reject);
  });
}

/**
 * Play audio with fallback to TTS
 * @param {string} audioUrl - URL to audio file
 * @param {string} text - Text for TTS fallback
 * @param {object} options - TTS options
 */
export async function playAudioWithFallback(audioUrl, text, options = {}) {
  if (audioUrl) {
    try {
      const audio = new Audio(audioUrl);
      await audio.play();
      return new Promise((resolve) => {
        audio.onended = resolve;
      });
    } catch (e) {
      console.warn("Audio file failed, using TTS:", e);
    }
  }

  // Fallback to TTS
  if (text) {
    await speak(text, options);
  } else {
    throw new Error("No audio source available");
  }
}

/**
 * Preload TTS for better performance
 */
export async function preloadTTS(texts, options = {}) {
  const promises = texts.map((text) =>
    speak(text, { ...options, volume: 0 }).catch(() => {})
  );
  await Promise.allSettled(promises);
}

/**
 * Clear TTS cache
 */
export function clearTTSCache() {
  audioCache.clear();
}

/**
 * Get cache size
 */
export function getTTSCacheSize() {
  return audioCache.size;
}
