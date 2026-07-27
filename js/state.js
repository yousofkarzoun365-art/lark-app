/* ===== STATE.JS - Local user data (stays on device) ===== */

// Local keys — user-specific data stays on device
const LOCAL = {
  USERNAME:    'lark_username',
  POINTS:      'lark_points',
  LANG:        'lark_lang',
  FONT_SIZE:   'lark_font_size',
  VOCAB:       'lark_vocab',
  STREAK:      'lark_streak',
  LAST_VISIT:  'lark_last_visit',
  STORIES_READ:'lark_stories_read',
  QUIZZES_DONE:'lark_quizzes_done',
  QUIZ_DATE:   'lark_quiz_date',
  AD_PREFIX:   'lark_ad_read_',
  MISSED_DAYS: 'lark_missed_days',
};

const AppState = {
  username: '',
  points: 0,
  lang: 'en',
  fontSize: 'medium',
  vocab: [],
  streak: 0,
  storiesRead: 0,
  quizzesDone: 0,
  missedDays: 0,
  quizDoneToday: false,
  dailyContent: null,

  // Shared data loaded from Supabase
  shared: {
    whatsapp: '',
    aboutText: '',
    apiKey: '',
    aiInstructions: '',
    ads: []
  },

  load() {
    this.username    = localStorage.getItem(LOCAL.USERNAME) || '';
    this.points      = parseInt(localStorage.getItem(LOCAL.POINTS) || '0');
    this.lang        = localStorage.getItem(LOCAL.LANG) || 'en';
    this.fontSize    = localStorage.getItem(LOCAL.FONT_SIZE) || 'medium';
    this.storiesRead = parseInt(localStorage.getItem(LOCAL.STORIES_READ) || '0');
    this.quizzesDone = parseInt(localStorage.getItem(LOCAL.QUIZZES_DONE) || '0');
    this.missedDays  = parseInt(localStorage.getItem(LOCAL.MISSED_DAYS) || '0');

    try { this.vocab = JSON.parse(localStorage.getItem(LOCAL.VOCAB) || '[]'); }
    catch { this.vocab = []; }

    // Streak
    const lastVisit   = localStorage.getItem(LOCAL.LAST_VISIT);
    const today       = this.todayStr();
    const savedStreak = parseInt(localStorage.getItem(LOCAL.STREAK) || '0');

    if (!lastVisit) {
      this.streak = 1;
      this.missedDays = 0;
    } else if (lastVisit === today) {
      this.streak = savedStreak;
    } else {
      const diff = this.daysDiff(lastVisit, today);
      if (diff === 1) {
        this.streak = savedStreak + 1;
        this.missedDays = 0;
      } else {
        this.missedDays = diff - 1;
        this.streak = 1;
      }
    }
    localStorage.setItem(LOCAL.STREAK, this.streak);
    localStorage.setItem(LOCAL.LAST_VISIT, today);
    localStorage.setItem(LOCAL.MISSED_DAYS, this.missedDays);

    // Quiz done today?
    const quizDate = localStorage.getItem(LOCAL.QUIZ_DATE);
    this.quizDoneToday = quizDate === today;
  },

  save() {
    localStorage.setItem(LOCAL.USERNAME,     this.username);
    localStorage.setItem(LOCAL.POINTS,       this.points);
    localStorage.setItem(LOCAL.LANG,         this.lang);
    localStorage.setItem(LOCAL.FONT_SIZE,    this.fontSize);
    localStorage.setItem(LOCAL.VOCAB,        JSON.stringify(this.vocab));
    localStorage.setItem(LOCAL.STORIES_READ, this.storiesRead);
    localStorage.setItem(LOCAL.QUIZZES_DONE, this.quizzesDone);
  },

  addPoints(n) {
    this.points += n;
    localStorage.setItem(LOCAL.POINTS, this.points);
  },

  markQuizDone() {
    this.quizDoneToday = true;
    localStorage.setItem(LOCAL.QUIZ_DATE, this.todayStr());
    this.quizzesDone++;
    localStorage.setItem(LOCAL.QUIZZES_DONE, this.quizzesDone);
  },

  markStoryRead() {
    this.storiesRead++;
    localStorage.setItem(LOCAL.STORIES_READ, this.storiesRead);
  },

  hasReadAd(id) {
    return localStorage.getItem(LOCAL.AD_PREFIX + id) === this.todayStr();
  },

  markAdRead(id) {
    localStorage.setItem(LOCAL.AD_PREFIX + id, this.todayStr());
  },

  todayStr() {
    return new Date().toISOString().split('T')[0];
  },

  daysDiff(d1, d2) {
    return Math.floor((new Date(d2) - new Date(d1)) / 86400000);
  }
};
