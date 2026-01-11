/**
 * Audio Helpers
 * Centralized audio playback with fallback support
 */

/**
 * Play audio with multiple fallback strategies
 * @param {string|null} audioUrl - URL to audio file
 * @param {string} fallbackText - Japanese text for speech synthesis fallback
 * @param {function} onStart - Callback when audio starts
 * @param {function} onEnd - Callback when audio ends
 * @param {function} onError - Callback on error
 * @returns {Promise<void>}
 */
export async function playAudioWithFallback({
  audioUrl,
  fallbackText,
  onStart,
  onEnd,
  onError,
}) {
  try {
    // Strategy 1: Try audio URL if available
    if (audioUrl) {
      onStart?.();
      const audio = new Audio(audioUrl);

      audio.onended = () => {
        onEnd?.();
      };

      audio.onerror = () => {
        console.warn('Audio file failed, using speech synthesis fallback');
        speakJapanese(fallbackText, onEnd);
        onError?.('Audio file not found');
      };

      await audio.play();
      return;
    }

    // Strategy 2: Use Web Speech API
    if (fallbackText) {
      onStart?.();
      speakJapanese(fallbackText, onEnd);
      return;
    }

    // No audio available
    onError?.('No audio available');
  } catch (error) {
    console.error('Audio playback error:', error);
    
    // Final fallback to speech
    if (fallbackText) {
      speakJapanese(fallbackText, onEnd);
      onError?.('Using speech synthesis');
    } else {
      onError?.('Audio failed');
    }
  }
}

/**
 * Use Web Speech API to speak Japanese text
 * @param {string} text - Japanese text to speak
 * @param {function} onEnd - Callback when speech ends
 */
export function speakJapanese(text, onEnd) {
  if (!('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported');
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ja-JP';
  utterance.rate = 0.9; // Slightly slower for learning
  utterance.pitch = 1.0;

  utterance.onend = () => {
    onEnd?.();
  };

  utterance.onerror = (event) => {
    console.error('Speech synthesis error:', event);
    onEnd?.();
  };

  window.speechSynthesis.speak(utterance);
}

/**
 * Stop all audio playback
 */
export function stopAllAudio() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Check if audio is supported
 * @returns {boolean}
 */
export function isAudioSupported() {
  return 'Audio' in window || 'speechSynthesis' in window;
}

/**
 * Preload audio file
 * @param {string} audioUrl - URL to preload
 * @returns {Promise<void>}
 */
export async function preloadAudio(audioUrl) {
  if (!audioUrl) return;
  
  try {
    const audio = new Audio();
    audio.preload = 'auto';
    audio.src = audioUrl;
    
    return new Promise((resolve, reject) => {
      audio.oncanplaythrough = () => resolve();
      audio.onerror = () => reject(new Error('Failed to preload audio'));
    });
  } catch (error) {
    console.warn('Audio preload failed:', error);
  }
}

/**
 * Create audio player hook state manager
 * @returns {object} Audio player state and controls
 */
export function createAudioPlayer() {
  let currentAudio = null;
  let isPlaying = false;

  return {
    play: async (audioUrl, fallbackText) => {
      // Stop any ongoing audio
      if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
      }

      isPlaying = true;

      return playAudioWithFallback({
        audioUrl,
        fallbackText,
        onStart: () => (isPlaying = true),
        onEnd: () => {
          isPlaying = false;
          currentAudio = null;
        },
        onError: (error) => {
          console.warn('Audio error:', error);
        },
      });
    },

    stop: () => {
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        currentAudio = null;
      }
      stopAllAudio();
      isPlaying = false;
    },

    isPlaying: () => isPlaying,
  };
}
