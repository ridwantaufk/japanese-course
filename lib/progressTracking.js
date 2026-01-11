/**
 * Progress Tracking Helpers
 * Store and retrieve user learning progress
 */

const STORAGE_KEYS = {
  VOCAB_PROGRESS: 'jp_vocab_progress',
  KANJI_PROGRESS: 'jp_kanji_progress',
  QUIZ_PROGRESS: 'jp_quiz_progress',
  EXAM_PROGRESS: 'jp_exam_progress',
  GRAMMAR_PROGRESS: 'jp_grammar_progress',
  READING_PROGRESS: 'jp_reading_progress',
  CONVERSATION_PROGRESS: 'jp_conversation_progress',
  SETTINGS: 'jp_settings',
};

// Safety check for localStorage
const isLocalStorageAvailable = () => {
  try {
    const test = '__test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
};

// Generic get/set with fallback
const getItem = (key, defaultValue = null) => {
  if (!isLocalStorageAvailable()) return defaultValue;
  
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return defaultValue;
  }
};

const setItem = (key, value) => {
  if (!isLocalStorageAvailable()) return false;
  
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error('Error writing to localStorage:', error);
    return false;
  }
};

/**
 * Vocabulary Progress
 */
export const getVocabProgress = () => {
  return getItem(STORAGE_KEYS.VOCAB_PROGRESS, {
    mastered: [], // array of vocab IDs
    learning: [], // array of vocab IDs
    lastStudied: null,
    streakDays: 0,
  });
};

export const saveVocabProgress = (vocabId, isMastered) => {
  const progress = getVocabProgress();
  
  if (isMastered) {
    if (!progress.mastered.includes(vocabId)) {
      progress.mastered.push(vocabId);
    }
    progress.learning = progress.learning.filter(id => id !== vocabId);
  } else {
    if (!progress.learning.includes(vocabId)) {
      progress.learning.push(vocabId);
    }
  }
  
  progress.lastStudied = new Date().toISOString();
  return setItem(STORAGE_KEYS.VOCAB_PROGRESS, progress);
};

/**
 * Kanji Progress
 */
export const getKanjiProgress = () => {
  return getItem(STORAGE_KEYS.KANJI_PROGRESS, {
    mastered: [],
    learning: [],
    lastStudied: null,
  });
};

export const saveKanjiProgress = (kanjiId, isMastered) => {
  const progress = getKanjiProgress();
  
  if (isMastered) {
    if (!progress.mastered.includes(kanjiId)) {
      progress.mastered.push(kanjiId);
    }
    progress.learning = progress.learning.filter(id => id !== kanjiId);
  } else {
    if (!progress.learning.includes(kanjiId)) {
      progress.learning.push(kanjiId);
    }
  }
  
  progress.lastStudied = new Date().toISOString();
  return setItem(STORAGE_KEYS.KANJI_PROGRESS, progress);
};

/**
 * Quiz Progress
 */
export const getQuizProgress = () => {
  return getItem(STORAGE_KEYS.QUIZ_PROGRESS, {
    completed: {}, // { quizId: { score, date, attempts } }
    bestScores: {}, // { quizId: score }
  });
};

export const saveQuizProgress = (quizId, score, totalQuestions) => {
  const progress = getQuizProgress();
  
  if (!progress.completed[quizId]) {
    progress.completed[quizId] = {
      scores: [],
      attempts: 0,
    };
  }
  
  progress.completed[quizId].scores.push({
    score,
    totalQuestions,
    percentage: Math.round((score / totalQuestions) * 100),
    date: new Date().toISOString(),
  });
  
  progress.completed[quizId].attempts += 1;
  
  // Update best score
  const percentage = Math.round((score / totalQuestions) * 100);
  if (!progress.bestScores[quizId] || percentage > progress.bestScores[quizId]) {
    progress.bestScores[quizId] = percentage;
  }
  
  return setItem(STORAGE_KEYS.QUIZ_PROGRESS, progress);
};

/**
 * JLPT Exam Progress
 */
export const getExamProgress = () => {
  return getItem(STORAGE_KEYS.EXAM_PROGRESS, {
    inProgress: {}, // { examId: { currentSection, answers, startTime } }
    completed: {}, // { examId: { score, date, sections } }
  });
};

export const saveExamInProgress = (examId, sectionIndex, answers, startTime) => {
  const progress = getExamProgress();
  
  progress.inProgress[examId] = {
    currentSection: sectionIndex,
    answers,
    startTime,
    lastSaved: new Date().toISOString(),
  };
  
  return setItem(STORAGE_KEYS.EXAM_PROGRESS, progress);
};

export const clearExamInProgress = (examId) => {
  const progress = getExamProgress();
  delete progress.inProgress[examId];
  return setItem(STORAGE_KEYS.EXAM_PROGRESS, progress);
};

export const saveExamCompletion = (examId, score, totalQuestions, sections) => {
  const progress = getExamProgress();
  
  if (!progress.completed[examId]) {
    progress.completed[examId] = [];
  }
  
  progress.completed[examId].push({
    score,
    totalQuestions,
    percentage: Math.round((score / totalQuestions) * 100),
    sections,
    date: new Date().toISOString(),
  });
  
  // Clear in-progress data
  delete progress.inProgress[examId];
  
  return setItem(STORAGE_KEYS.EXAM_PROGRESS, progress);
};

/**
 * Grammar Progress
 */
export const getGrammarProgress = () => {
  return getItem(STORAGE_KEYS.GRAMMAR_PROGRESS, {
    studied: [], // array of grammar IDs
    mastered: [],
  });
};

export const saveGrammarProgress = (grammarId, isMastered) => {
  const progress = getGrammarProgress();
  
  if (!progress.studied.includes(grammarId)) {
    progress.studied.push(grammarId);
  }
  
  if (isMastered && !progress.mastered.includes(grammarId)) {
    progress.mastered.push(grammarId);
  }
  
  return setItem(STORAGE_KEYS.GRAMMAR_PROGRESS, progress);
};

/**
 * Reading Progress
 */
export const getReadingProgress = () => {
  return getItem(STORAGE_KEYS.READING_PROGRESS, {
    completed: [], // array of reading text IDs
    inProgress: {}, // { textId: { scrollPosition, lastRead } }
  });
};

export const saveReadingProgress = (textId, isCompleted, scrollPosition = 0) => {
  const progress = getReadingProgress();
  
  if (isCompleted) {
    if (!progress.completed.includes(textId)) {
      progress.completed.push(textId);
    }
    delete progress.inProgress[textId];
  } else {
    progress.inProgress[textId] = {
      scrollPosition,
      lastRead: new Date().toISOString(),
    };
  }
  
  return setItem(STORAGE_KEYS.READING_PROGRESS, progress);
};

/**
 * Conversation Progress
 */
export const getConversationProgress = () => {
  return getItem(STORAGE_KEYS.CONVERSATION_PROGRESS, {
    completed: [],
    practiced: {},
  });
};

export const saveConversationProgress = (conversationId, isCompleted) => {
  const progress = getConversationProgress();
  
  if (!progress.practiced[conversationId]) {
    progress.practiced[conversationId] = {
      count: 0,
      dates: [],
    };
  }
  
  progress.practiced[conversationId].count += 1;
  progress.practiced[conversationId].dates.push(new Date().toISOString());
  
  if (isCompleted && !progress.completed.includes(conversationId)) {
    progress.completed.push(conversationId);
  }
  
  return setItem(STORAGE_KEYS.CONVERSATION_PROGRESS, progress);
};

/**
 * Settings
 */
export const getSettings = () => {
  return getItem(STORAGE_KEYS.SETTINGS, {
    autoPlayAudio: true,
    showRomaji: true,
    showFurigana: true,
    darkMode: false,
    soundEffects: true,
  });
};

export const saveSettings = (newSettings) => {
  const settings = getSettings();
  return setItem(STORAGE_KEYS.SETTINGS, { ...settings, ...newSettings });
};

/**
 * Clear all progress (for testing or reset)
 */
export const clearAllProgress = () => {
  if (!isLocalStorageAvailable()) return false;
  
  Object.values(STORAGE_KEYS).forEach(key => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error clearing ${key}:`, error);
    }
  });
  
  return true;
};

/**
 * Get overall statistics
 */
export const getOverallStats = () => {
  const vocab = getVocabProgress();
  const kanji = getKanjiProgress();
  const quiz = getQuizProgress();
  const grammar = getGrammarProgress();
  const reading = getReadingProgress();
  const conversation = getConversationProgress();
  
  return {
    totalVocabMastered: vocab.mastered.length,
    totalKanjiMastered: kanji.mastered.length,
    totalQuizzesTaken: Object.values(quiz.completed).reduce((sum, q) => sum + q.attempts, 0),
    totalGrammarStudied: grammar.studied.length,
    totalReadingCompleted: reading.completed.length,
    totalConversationsPracticed: Object.keys(conversation.practiced).length,
  };
};
