export const resources = {
  // --- USER DATA ---
  users: {
    label: 'Users',
    table: 'users',
    primaryKey: 'id',
    columns: [
      { key: 'username', label: 'Username' },
      { key: 'email', label: 'Email' },
      { key: 'is_premium', label: 'Premium', type: 'boolean' },
      { key: 'last_login_at', label: 'Last Login', type: 'date' },
    ],
    fields: [
      { key: 'username', label: 'Username', type: 'text', required: true },
      { key: 'email', label: 'Email', type: 'email', required: true },
      { key: 'display_name', label: 'Display Name', type: 'text' },
      { key: 'native_language', label: 'Native Language', type: 'text' },
      { key: 'is_active', label: 'Active', type: 'checkbox' },
      { key: 'is_premium', label: 'Premium', type: 'checkbox' },
      { key: 'target_level', label: 'Target Level', type: 'select', options: ['N5', 'N4', 'N3', 'N2', 'N1'] },
    ]
  },
  study_sessions: {
    label: 'Study Logs',
    table: 'study_sessions',
    primaryKey: 'id',
    readOnly: true,
    columns: [
      { key: 'user_id', label: 'User ID' },
      { key: 'session_type', label: 'Type' },
      { key: 'started_at', label: 'Date', type: 'date' },
      { key: 'duration_seconds', label: 'Duration (s)' },
    ],
    fields: []
  },
  user_progress: {
    label: 'User Progress',
    table: 'user_progress',
    primaryKey: 'id',
    readOnly: true,
    columns: [
      { key: 'user_id', label: 'User ID' },
      { key: 'content_type', label: 'Type' },
      { key: 'status', label: 'Status' },
      { key: 'srs_level', label: 'SRS Lvl' },
    ],
    fields: []
  },

  // --- ANALYTICS VIEWS (Read Only) ---
  vw_content_stats: {
    label: 'Content Stats',
    table: 'vw_content_stats',
    primaryKey: 'jlpt_level', // Mock key for view
    readOnly: true,
    columns: [
      { key: 'jlpt_level', label: 'Level' },
      { key: 'vocab_count', label: 'Vocab' },
      { key: 'kanji_count', label: 'Kanji' },
      { key: 'grammar_count', label: 'Grammar' },
      { key: 'conversation_count', label: 'Convos' },
    ],
    fields: []
  },
  vw_user_progress_summary: {
    label: 'User Mastery',
    table: 'vw_user_progress_summary',
    primaryKey: 'user_id',
    readOnly: true,
    columns: [
      { key: 'username', label: 'Username' },
      { key: 'vocab_mastered', label: 'Vocab' },
      { key: 'kanji_mastered', label: 'Kanji' },
      { key: 'grammar_mastered', label: 'Grammar' },
      { key: 'total_study_minutes', label: 'Mins Studied' },
    ],
    fields: []
  },

  // --- CORE KNOWLEDGE ---
  hiragana: {
    label: 'Hiragana',
    table: 'hiragana',
    primaryKey: 'id',
    columns: [
      { key: 'character', label: 'Char' },
      { key: 'romaji', label: 'Romaji' },
      { key: 'category', label: 'Category' },
    ],
    fields: [
      { key: 'character', label: 'Character', type: 'text', required: true },
      { key: 'romaji', label: 'Romaji', type: 'text', required: true },
      { key: 'category', label: 'Category', type: 'text' }, 
      { key: 'stroke_order', label: 'Stroke Order (JSON)', type: 'json' },
      { key: 'audio_url', label: 'Audio URL', type: 'text' },
    ]
  },
  katakana: {
    label: 'Katakana',
    table: 'katakana',
    primaryKey: 'id',
    columns: [
      { key: 'character', label: 'Char' },
      { key: 'romaji', label: 'Romaji' },
      { key: 'category', label: 'Category' },
    ],
    fields: [
      { key: 'character', label: 'Character', type: 'text', required: true },
      { key: 'romaji', label: 'Romaji', type: 'text', required: true },
      { key: 'category', label: 'Category', type: 'text' },
      { key: 'stroke_order', label: 'Stroke Order (JSON)', type: 'json' },
      { key: 'audio_url', label: 'Audio URL', type: 'text' },
    ]
  },
  kanji: {
    label: 'Kanji',
    table: 'kanji',
    primaryKey: 'id',
    columns: [
      { key: 'character', label: 'Char' },
      { key: 'meaning_id', label: 'Meaning' },
      { key: 'jlpt_level', label: 'JLPT' },
      { key: 'stroke_count', label: 'Strokes' },
    ],
    fields: [
      { key: 'character', label: 'Character', type: 'text', required: true },
      { key: 'meaning_id', label: 'Meaning (ID/En)', type: 'text', required: true },
      { key: 'jlpt_level', label: 'JLPT Level', type: 'select', options: ['N5', 'N4', 'N3', 'N2', 'N1'] },
      { key: 'stroke_count', label: 'Stroke Count', type: 'number' },
      { key: 'onyomi', label: 'Onyomi (JSON)', type: 'json' },
      { key: 'kunyomi', label: 'Kunyomi (JSON)', type: 'json' },
      { key: 'notes_id', label: 'Notes', type: 'textarea' },
    ]
  },
  kanji_examples: {
    label: 'Kanji Examples',
    table: 'kanji_examples',
    primaryKey: 'id',
    columns: [
      { key: 'kanji_id', label: 'Kanji ID' },
      { key: 'japanese_text', label: 'Text' },
      { key: 'meaning_id', label: 'Meaning' },
    ],
    fields: [
      { key: 'kanji_id', label: 'Kanji ID', type: 'number', required: true },
      { key: 'japanese_text', label: 'Japanese Text', type: 'text', required: true },
      { key: 'furigana', label: 'Furigana', type: 'text', required: true },
      { key: 'romaji', label: 'Romaji', type: 'text', required: true },
      { key: 'meaning_id', label: 'Meaning', type: 'text', required: true },
      { key: 'audio_url', label: 'Audio URL', type: 'text' },
    ]
  },
  vocabulary: {
    label: 'Vocabulary',
    table: 'vocabulary',
    primaryKey: 'id',
    columns: [
      { key: 'word', label: 'Word' },
      { key: 'hiragana', label: 'Hiragana' },
      { key: 'meaning_id', label: 'Meaning' },
      { key: 'jlpt_level', label: 'JLPT' },
    ],
    fields: [
      { key: 'word', label: 'Word', type: 'text', required: true },
      { key: 'hiragana', label: 'Hiragana', type: 'text' },
      { key: 'katakana', label: 'Katakana', type: 'text' },
      { key: 'romaji', label: 'Romaji', type: 'text', required: true },
      { key: 'meaning_id', label: 'Meaning', type: 'text', required: true },
      { key: 'jlpt_level', label: 'JLPT Level', type: 'select', options: ['N5', 'N4', 'N3', 'N2', 'N1'] },
      { key: 'word_category', label: 'Category', type: 'text' },
      { key: 'pitch_accent', label: 'Pitch Accent', type: 'text' },
      { key: 'audio_url', label: 'Audio URL', type: 'text' },
    ]
  },
  vocabulary_examples: {
    label: 'Vocab Examples',
    table: 'vocabulary_examples',
    primaryKey: 'id',
    columns: [
      { key: 'vocabulary_id', label: 'Vocab ID' },
      { key: 'japanese_text', label: 'Sentence' },
      { key: 'meaning_id', label: 'Meaning' },
    ],
    fields: [
      { key: 'vocabulary_id', label: 'Vocabulary ID', type: 'number', required: true },
      { key: 'japanese_text', label: 'Sentence', type: 'textarea', required: true },
      { key: 'furigana', label: 'Furigana', type: 'textarea', required: true },
      { key: 'romaji', label: 'Romaji', type: 'textarea', required: true },
      { key: 'meaning_id', label: 'Meaning', type: 'textarea', required: true },
    ]
  },
  grammar: {
    label: 'Grammar',
    table: 'grammar',
    primaryKey: 'id',
    columns: [
      { key: 'pattern', label: 'Pattern' },
      { key: 'title_id', label: 'Title' },
      { key: 'jlpt_level', label: 'JLPT' },
    ],
    fields: [
      { key: 'pattern', label: 'Pattern', type: 'text', required: true },
      { key: 'title_id', label: 'Title (ID)', type: 'text', required: true },
      { key: 'jlpt_level', label: 'JLPT Level', type: 'select', options: ['N5', 'N4', 'N3', 'N2', 'N1'] },
      { key: 'structure', label: 'Structure', type: 'textarea' },
      { key: 'explanation_id', label: 'Explanation (ID)', type: 'textarea' },
      { key: 'formation', label: 'Formation (JSON)', type: 'json' },
    ]
  },
  grammar_examples: {
    label: 'Grammar Examples',
    table: 'grammar_examples',
    primaryKey: 'id',
    columns: [
      { key: 'grammar_id', label: 'Grammar ID' },
      { key: 'japanese_text', label: 'Sentence' },
      { key: 'meaning_id', label: 'Meaning' },
    ],
    fields: [
      { key: 'grammar_id', label: 'Grammar ID', type: 'number', required: true },
      { key: 'japanese_text', label: 'Sentence', type: 'textarea', required: true },
      { key: 'furigana', label: 'Furigana', type: 'textarea', required: true },
      { key: 'romaji', label: 'Romaji', type: 'textarea', required: true },
      { key: 'meaning_id', label: 'Meaning', type: 'textarea', required: true },
    ]
  },
  audio_files: {
    label: 'Audio Files',
    table: 'audio_files',
    primaryKey: 'id',
    columns: [
      { key: 'file_name', label: 'Name' },
      { key: 'file_path', label: 'Path' },
      { key: 'duration_ms', label: 'Duration (ms)' },
    ],
    fields: [
      { key: 'file_name', label: 'File Name', type: 'text', required: true },
      { key: 'file_path', label: 'File Path', type: 'text', required: true },
      { key: 'file_url', label: 'Public URL', type: 'text' },
      { key: 'duration_ms', label: 'Duration (ms)', type: 'number' },
      { key: 'reference_type', label: 'Ref Type', type: 'text' },
      { key: 'reference_id', label: 'Ref ID', type: 'number' },
    ]
  },

  // --- CONTENT ---
  conversations: {
    label: 'Conversations',
    table: 'conversations',
    primaryKey: 'id',
    columns: [
      { key: 'title_id', label: 'Title' },
      { key: 'jlpt_level', label: 'JLPT' },
      { key: 'topic', label: 'Topic' },
    ],
    fields: [
      { key: 'title_id', label: 'Title (ID)', type: 'text', required: true },
      { key: 'jlpt_level', label: 'JLPT Level', type: 'select', options: ['N5', 'N4', 'N3', 'N2', 'N1'] },
      { key: 'topic', label: 'Topic', type: 'text' },
      { key: 'description_id', label: 'Description', type: 'textarea' },
      { key: 'audio_url', label: 'Audio URL', type: 'text' },
      { key: 'video_url', label: 'Video URL', type: 'text' },
      { key: 'is_featured', label: 'Featured', type: 'checkbox' },
    ]
  },
  conversation_lines: {
    label: 'Conv. Lines',
    table: 'conversation_lines',
    primaryKey: 'id',
    columns: [
      { key: 'conversation_id', label: 'Conv ID' },
      { key: 'line_order', label: 'Order' },
      { key: 'speaker_name', label: 'Speaker' },
      { key: 'japanese_text', label: 'Text' },
    ],
    fields: [
      { key: 'conversation_id', label: 'Conversation ID', type: 'number', required: true },
      { key: 'line_order', label: 'Order', type: 'number', required: true },
      { key: 'speaker_name', label: 'Speaker Name', type: 'text' },
      { key: 'japanese_text', label: 'Japanese Text', type: 'textarea', required: true },
      { key: 'furigana', label: 'Furigana', type: 'textarea' },
      { key: 'romaji', label: 'Romaji', type: 'textarea' },
      { key: 'meaning_id', label: 'Meaning', type: 'textarea', required: true },
      { key: 'audio_url', label: 'Audio URL', type: 'text' },
    ]
  },
  reading_texts: {
    label: 'Reading Texts',
    table: 'reading_texts',
    primaryKey: 'id',
    columns: [
      { key: 'title_id', label: 'Title' },
      { key: 'content_type', label: 'Type' },
      { key: 'jlpt_level', label: 'JLPT' },
    ],
    fields: [
      { key: 'title_id', label: 'Title (ID)', type: 'text', required: true },
      { key: 'content_type', label: 'Type', type: 'select', options: ['Story', 'News', 'Essay', 'Dialogue'] },
      { key: 'jlpt_level', label: 'JLPT Level', type: 'select', options: ['N5', 'N4', 'N3', 'N2', 'N1'] },
      { key: 'japanese_text', label: 'Japanese Text', type: 'textarea', required: true },
      { key: 'meaning_id', label: 'Translation (ID)', type: 'textarea', required: true },
      { key: 'summary_id', label: 'Summary', type: 'textarea' },
      { key: 'image_url', label: 'Image URL', type: 'text' },
    ]
  },
  reading_sentences: {
    label: 'Reading Sentences',
    table: 'reading_sentences',
    primaryKey: 'id',
    columns: [
      { key: 'reading_text_id', label: 'Text ID' },
      { key: 'sentence_order', label: 'Order' },
      { key: 'japanese_text', label: 'Text' },
    ],
    fields: [
      { key: 'reading_text_id', label: 'Text ID', type: 'number', required: true },
      { key: 'sentence_order', label: 'Order', type: 'number', required: true },
      { key: 'japanese_text', label: 'Japanese', type: 'textarea', required: true },
      { key: 'meaning_id', label: 'Meaning', type: 'textarea', required: true },
      { key: 'grammar_points', label: 'Grammar IDs (JSON)', type: 'json' },
    ]
  },

  // --- EXAMS & TESTS ---
  quiz_sets: {
    label: 'Quiz Sets',
    table: 'quiz_sets',
    primaryKey: 'id',
    columns: [
      { key: 'title_id', label: 'Title' },
      { key: 'quiz_type', label: 'Type' },
      { key: 'jlpt_level', label: 'JLPT' },
    ],
    fields: [
      { key: 'title_id', label: 'Title (ID)', type: 'text', required: true },
      { key: 'jlpt_level', label: 'JLPT Level', type: 'select', options: ['N5', 'N4', 'N3', 'N2', 'N1'] },
      { key: 'quiz_type', label: 'Type', type: 'select', options: ['Vocabulary', 'Kanji', 'Grammar', 'Reading', 'Listening'] },
      { key: 'time_limit_minutes', label: 'Time Limit', type: 'number' },
      { key: 'pass_score', label: 'Pass Score', type: 'number' },
      { key: 'is_active', label: 'Active', type: 'checkbox' },
    ]
  },
  quiz_questions: {
    label: 'Quiz Questions',
    table: 'quiz_questions',
    primaryKey: 'id',
    columns: [
      { key: 'quiz_set_id', label: 'Set ID' },
      { key: 'question_order', label: 'Order' },
      { key: 'question_type', label: 'Type' },
    ],
    fields: [
      { key: 'quiz_set_id', label: 'Quiz Set ID', type: 'number', required: true },
      { key: 'question_order', label: 'Order', type: 'number', required: true },
      { key: 'question_type', label: 'Type', type: 'select', options: ['Multiple Choice', 'True/False', 'Fill in Blank'] },
      { key: 'question_ja', label: 'Question (JP)', type: 'textarea' },
      { key: 'question_id', label: 'Question (ID)', type: 'textarea', required: true },
      { key: 'options', label: 'Options (JSON)', type: 'json' },
      { key: 'correct_answer', label: 'Correct Answer', type: 'text', required: true },
      { key: 'explanation_id', label: 'Explanation', type: 'textarea' },
    ]
  },
  jlpt_exams: {
    label: 'JLPT Exams',
    table: 'jlpt_exams',
    primaryKey: 'id',
    columns: [
      { key: 'title_id', label: 'Exam Title' },
      { key: 'exam_year', label: 'Year' },
      { key: 'jlpt_level', label: 'Level' },
    ],
    fields: [
      { key: 'title_id', label: 'Exam Title', type: 'text', required: true },
      { key: 'exam_year', label: 'Year', type: 'number' },
      { key: 'jlpt_level', label: 'Level', type: 'select', options: ['N5', 'N4', 'N3', 'N2', 'N1'] },
      { key: 'total_time', label: 'Duration (min)', type: 'number', required: true },
      { key: 'is_active', label: 'Active', type: 'checkbox' },
    ]
  },
  jlpt_exam_sections: {
    label: 'JLPT Sections',
    table: 'jlpt_exam_sections',
    primaryKey: 'id',
    columns: [
      { key: 'exam_id', label: 'Exam ID' },
      { key: 'section_name_id', label: 'Name' },
      { key: 'section_type', label: 'Type' },
    ],
    fields: [
      { key: 'exam_id', label: 'Exam ID', type: 'number', required: true },
      { key: 'section_name_id', label: 'Section Name', type: 'text', required: true },
      { key: 'section_type', label: 'Type', type: 'select', options: ['Vocabulary', 'Grammar', 'Reading', 'Listening'] },
      { key: 'time_limit_minutes', label: 'Time Limit', type: 'number', required: true },
    ]
  },
  jlpt_reading_passages: {
    label: 'JLPT Passages',
    table: 'jlpt_reading_passages',
    primaryKey: 'id',
    columns: [
      { key: 'section_id', label: 'Section ID' },
      { key: 'passage_ja', label: 'Text (Preview)' },
    ],
    fields: [
      { key: 'section_id', label: 'Section ID', type: 'number', required: true },
      { key: 'passage_ja', label: 'Japanese Text', type: 'textarea', required: true },
      { key: 'passage_meaning_id', label: 'Meaning', type: 'textarea' },
    ]
  },
  jlpt_exam_questions: {
    label: 'JLPT Questions',
    table: 'jlpt_exam_questions',
    primaryKey: 'id',
    columns: [
      { key: 'section_id', label: 'Section ID' },
      { key: 'question_number', label: 'Num' },
      { key: 'question_ja', label: 'Question' },
    ],
    fields: [
      { key: 'section_id', label: 'Section ID', type: 'number', required: true },
      { key: 'question_number', label: 'Number', type: 'number', required: true },
      { key: 'question_ja', label: 'Question Text', type: 'textarea' },
      { key: 'options', label: 'Options (JSON)', type: 'json', required: true },
      { key: 'correct_answer', label: 'Correct Answer', type: 'text', required: true },
    ]
  },
  interactive_tests: {
    label: 'Interactive Tests',
    table: 'interactive_tests',
    primaryKey: 'id',
    columns: [
      { key: 'title_id', label: 'Title' },
      { key: 'test_type', label: 'Type' },
      { key: 'jlpt_level', label: 'JLPT' },
    ],
    fields: [
      { key: 'title_id', label: 'Title (ID)', type: 'text', required: true },
      { key: 'jlpt_level', label: 'JLPT Level', type: 'select', options: ['N5', 'N4', 'N3', 'N2', 'N1'] },
      { key: 'test_type', label: 'Type', type: 'text', required: true },
      { key: 'is_active', label: 'Active', type: 'checkbox' },
    ]
  },
  memory_tests: {
    label: 'Memory Tests',
    table: 'memory_tests',
    primaryKey: 'id',
    columns: [
      { key: 'title_id', label: 'Title' },
      { key: 'memory_type', label: 'Type' },
    ],
    fields: [
      { key: 'title_id', label: 'Title (ID)', type: 'text', required: true },
      { key: 'memory_type', label: 'Type', type: 'text', required: true },
      { key: 'target_type', label: 'Target', type: 'text' },
      { key: 'is_active', label: 'Active', type: 'checkbox' },
    ]
  },
  translation_tests: {
    label: 'Transl. Tests',
    table: 'translation_tests',
    primaryKey: 'id',
    columns: [
      { key: 'title_id', label: 'Title' },
      { key: 'translation_direction', label: 'Direction' },
    ],
    fields: [
      { key: 'title_id', label: 'Title (ID)', type: 'text', required: true },
      { key: 'translation_direction', label: 'Direction', type: 'text', required: true }, // e.g. ja_en
      { key: 'is_active', label: 'Active', type: 'checkbox' },
    ]
  }
};