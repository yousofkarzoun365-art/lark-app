/* ===== TRANSLATIONS.JS ===== */

const T = {
  en: {
    greeting_morning: 'Good Morning,', greeting_afternoon: 'Good Afternoon,', greeting_evening: 'Good Evening,',
    pts: 'PTS', profile: 'Profile', notifications: 'Notifications', language: 'Language',
    font_size: 'Font Size', about_us: 'About Us', home: 'Home', vocabulary: 'Vocabulary',
    new_ad: 'New Ad', progress: 'Progress', daily_story: 'Daily Story', read_adventure: 'READ ADVENTURE',
    daily_grammar: 'Daily Grammar', explore_rules: 'EXPLORE RULES', daily_quiz: 'Daily Quiz',
    take_challenge: 'TAKE CHALLENGE', sponsored: 'Sponsored Learning',
    sponsored_desc: 'You can improve your English by reading an educational advertisement',
    read_ad: 'READ AN AD', ad_notice_title: 'Advertiser Notice',
    ad_notice_text: 'Thank you for your interest in advertising with Lark App. Please note that you must contact the app developer directly to agree on the advertising details, available placements, and pricing before publishing.',
    contact_developer: 'Contact Developer', add_word: 'Add New Word', word_placeholder: 'Enter a word...',
    add_word_btn: 'Add Word', no_words: 'No words yet. Add your first word!',
    my_vocab: 'My Vocabulary', my_progress: 'My Progress', day_streak: 'Day Streak',
    total_points: 'Total Points', stories_read: 'Stories Read', quizzes_done: 'Quizzes Done',
    words_learned: 'Words Learned', missed_days: 'Missed Days', about_page: 'About Us',
    your_name: 'Your Name', name_placeholder: 'Enter your name...', save: 'Save',
    next_q: 'Next Question', finish: 'Finish', quiz_correct: '✅ Correct!',
    quiz_wrong: '❌ Wrong! Correct answer:', loading: 'Loading today\'s content...',
    read_2min: 'Read for 2 min to earn 15 pts 🪙', pts_earned: '🎉 You earned 15 points!',
    already_read: '✅ Already earned points for this ad today', no_ads: 'No advertisements available yet.',
    quiz_already: '✅ Quiz completed today', results_title: 'Quiz Results!', score_label: 'Your Score',
    points_earned_quiz: 'points earned!', try_again: 'Try Again (No points)', done: 'Done',
    today_story: "Today's Story", grammar_lesson: 'Grammar Lesson', sponsored_learning: 'Sponsored Learning',
    connecting: 'Connecting...', offline_msg: 'Could not connect. Check your internet.',
  },
  ar: {
    greeting_morning: 'صباح الخير,', greeting_afternoon: 'مساء النهار,', greeting_evening: 'مساء الخير,',
    pts: 'نقطة', profile: 'الملف الشخصي', notifications: 'الإشعارات', language: 'اللغة',
    font_size: 'حجم الخط', about_us: 'حول التطبيق', home: 'الرئيسية', vocabulary: 'المفردات',
    new_ad: 'إعلان جديد', progress: 'التقدم', daily_story: 'قصة اليوم', read_adventure: 'اقرأ المغامرة',
    daily_grammar: 'قاعدة اليوم', explore_rules: 'استكشف القواعد', daily_quiz: 'اختبار اليوم',
    take_challenge: 'خذ التحدي', sponsored: 'التعلم المدعوم',
    sponsored_desc: 'يمكنك تحسين لغتك الإنجليزية بقراءة إعلان تعليمي',
    read_ad: 'اقرأ الإعلان', ad_notice_title: 'تنويه للمعلنين',
    ad_notice_text: 'يسعدنا اهتمامك بالإعلان في تطبيق لارك. يرجى العلم أنه يجب التواصل مباشرة مع مطور التطبيق للاتفاق على تفاصيل الإعلان، المساحات المتاحة، والأسعار قبل النشر.',
    contact_developer: 'تواصل مع المطور', add_word: 'إضافة كلمة جديدة', word_placeholder: 'أدخل كلمة...',
    add_word_btn: 'إضافة الكلمة', no_words: 'لا توجد كلمات بعد. أضف كلمتك الأولى!',
    my_vocab: 'مفرداتي', my_progress: 'تقدمي', day_streak: 'أيام متتالية',
    total_points: 'إجمالي النقاط', stories_read: 'القصص المقروءة', quizzes_done: 'الاختبارات المكتملة',
    words_learned: 'الكلمات المتعلمة', missed_days: 'الأيام الفائتة', about_page: 'حول التطبيق',
    your_name: 'اسمك', name_placeholder: 'أدخل اسمك...', save: 'حفظ',
    next_q: 'السؤال التالي', finish: 'انهاء', quiz_correct: '✅ إجابة صحيحة!',
    quiz_wrong: '❌ خاطئ! الإجابة الصحيحة:', loading: 'جارٍ تحميل محتوى اليوم...',
    read_2min: 'اقرأ دقيقتين للحصول على 15 نقطة 🪙', pts_earned: '🎉 ربحت 15 نقطة!',
    already_read: '✅ ربحت نقاط هذا الإعلان اليوم', no_ads: 'لا توجد إعلانات متاحة بعد.',
    quiz_already: '✅ تم إكمال الاختبار اليوم', results_title: 'نتائج الاختبار!', score_label: 'نتيجتك',
    points_earned_quiz: 'نقطة مكتسبة!', try_again: 'حاول مجدداً (بدون نقاط)', done: 'تم',
    today_story: 'قصة اليوم', grammar_lesson: 'درس القواعد', sponsored_learning: 'التعلم المدعوم',
    connecting: 'جارٍ الاتصال...', offline_msg: 'تعذر الاتصال. تحقق من الإنترنت.',
  }
};

function t(key) {
  const lang = AppState.lang || 'en';
  return (T[lang] && T[lang][key]) || T.en[key] || key;
}

function getGreeting() {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return t('greeting_morning');
  if (h >= 12 && h < 17) return t('greeting_afternoon');
  return t('greeting_evening');
}

function applyTranslations() {
  const lang = AppState.lang;
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  document.body.dir = lang === 'ar' ? 'rtl' : 'ltr';

  const greeting = getGreeting();
  const name = AppState.username || 'User';

  const sets = [
    ['userGreeting', greeting], ['headerUserName', name], ['welcomeGreeting', greeting],
    ['welcomeName', name], ['ptsLabel', t('pts')], ['sidebarUsername', name],
    ['sidebarSubtitle', lang === 'ar' ? 'متعلم اللغة الإنجليزية' : 'English Learner'],
    ['profileLabel', t('profile')], ['notificationsLabel', t('notifications')],
    ['languageLabel', t('language')], ['fontSizeLabel', t('font_size')],
    ['aboutSidebarLabel', t('about_us')], ['navHomeLabel', t('home')],
    ['navVocabLabel', t('vocabulary')], ['navNewAdLabel', t('new_ad')],
    ['navProgressLabel', t('progress')], ['navAboutLabel', t('about_us')],
    ['storyTitle', t('daily_story')], ['readStoryLabel', t('read_adventure')],
    ['grammarTitle', t('daily_grammar')], ['exploreGrammarLabel', t('explore_rules')],
    ['quizTitle', t('daily_quiz')], ['takeQuizLabel', t('take_challenge')],
    ['sponsoredTitle', t('sponsored')], ['sponsoredDesc', t('sponsored_desc')],
    ['readAdLabel', t('read_ad')], ['storyModalTitle', t('today_story')],
    ['grammarModalTitle', t('grammar_lesson')], ['quizModalTitle', t('daily_quiz')],
    ['adsModalTitle', t('sponsored_learning')], ['newAdModalTitle', t('ad_notice_title')],
    ['newAdModalText', t('ad_notice_text')], ['contactDeveloperBtn', t('contact_developer')],
    ['addVocabTitle', t('add_word')], ['profileModalTitle', t('profile')],
    ['fontModalTitle', t('font_size')], ['usernameLabel', t('your_name')],
    ['adTimerText', t('read_2min')], ['vocabPageTitle', t('my_vocab')],
    ['progressPageTitle', t('my_progress')], ['aboutPageTitle', t('about_page')],
    ['streakLabel', t('day_streak')], ['pointsProgressLabel', t('total_points')],
    ['storiesLabel', t('stories_read')], ['quizzesLabel', t('quizzes_done')],
    ['wordsLabel', t('words_learned')], ['missedLabel', t('missed_days')],
    ['addWordBtn', t('add_word_btn')], ['saveProfileBtn', t('save')],
    ['langModalTitle', lang === 'ar' ? 'اللغة / Language' : 'Language / اللغة'],
  ];

  sets.forEach(([id, val]) => { const el = document.getElementById(id); if (el) el.textContent = val; });

  const wi = document.getElementById('newWordInput'); if (wi) wi.placeholder = t('word_placeholder');
  const ni = document.getElementById('usernameInput'); if (ni) ni.placeholder = t('name_placeholder');
}
