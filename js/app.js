/* ===== APP.JS - Main orchestrator ===== */

// ===== MODAL HELPERS =====
function showModal(id) {
  const el = document.getElementById(id);
  if (el) { el.classList.add('active'); document.body.style.overflow = 'hidden'; }
}
function closeModal(id) {
  const el = document.getElementById(id);
  if (el) {
    el.classList.remove('active');
    if (!document.querySelector('.modal-overlay.active')) document.body.style.overflow = '';
  }
}

// ===== TOAST =====
let toastTimer = null;
function showToast(msg, type = '') {
  let toast = document.getElementById('larkToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'larkToast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.className = `toast ${type} show`;
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
}

// ===== POINTS =====
function updatePointsDisplay() {
  const el = document.getElementById('pointsDisplay');
  if (el) el.textContent = AppState.points;
  const el2 = document.getElementById('totalPoints');
  if (el2) el2.textContent = AppState.points;
}

// ===== NAVIGATION =====
function navigateTo(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  const pageEl = document.getElementById(page + 'Page');
  if (pageEl) pageEl.classList.add('active');
  const navId = 'nav' + page.charAt(0).toUpperCase() + page.slice(1);
  const navBtn = document.getElementById(navId);
  if (navBtn) navBtn.classList.add('active');
  if (page === 'progress') updateProgressPage();
  if (page === 'about') loadAboutPage();
  if (page === 'vocab') renderVocabList();
}

function updateProgressPage() {
  const sets = [
    ['streakCount', AppState.streak], ['totalPoints', AppState.points],
    ['storiesRead', AppState.storiesRead], ['quizzesCompleted', AppState.quizzesDone],
    ['missedDays', AppState.missedDays || 0], ['wordsLearned', (AppState.vocab||[]).length]
  ];
  sets.forEach(([id, val]) => { const el = document.getElementById(id); if (el) el.textContent = val; });
}

function loadAboutPage() {
  const el = document.getElementById('aboutText');
  if (el) el.textContent = AppState.shared.aboutText || 'Welcome to Lark – your daily English learning companion.';
}

// ===== LOAD SHARED DATA FROM SUPABASE =====
async function loadSharedData() {
  try {
    const [whatsapp, aboutText, aiInstructions, ads] = await Promise.all([
      DB.getSetting('whatsapp'),
      DB.getSetting('about_text'),
      DB.getSetting('ai_instructions'),
      DB.getAds()
    ]);
    AppState.shared.whatsapp       = whatsapp || '';
    AppState.shared.aboutText      = aboutText || '';
    AppState.shared.aiInstructions = aiInstructions || '';
    AppState.shared.ads            = ads || [];
  } catch (e) {
    console.error('Failed to load shared data:', e);
  }
}

// ===== LOAD DAILY CONTENT =====
async function loadDailyContent() {
  const today = AppState.todayStr();

  // Show loading
  ['storyPreview','grammarRuleName','quizFirstQ'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = t('loading');
  });

  try {
    // Check Supabase for today's content first
    let content = await DB.getDailyContent(today);

    if (!content) {
      // Generate new content
      content = await generateDailyContent();
      // Save to Supabase so all users get same content
      await DB.saveDailyContent(today, content);
    }

    AppState.dailyContent = content;
    populateCards(content);
  } catch (e) {
    console.error('loadDailyContent error:', e);
    // Fallback to demo
    AppState.dailyContent = DEMO_CONTENT;
    populateCards(DEMO_CONTENT);
  }
}

function populateCards(content) {
  if (content.story) {
    const el = document.getElementById('storyPreview');
    if (el) el.textContent = content.story.preview || content.story.full.substring(0, 120) + '...';
  }
  if (content.grammar) {
    const el = document.getElementById('grammarRuleName');
    if (el) el.textContent = content.grammar.rule || content.grammar.preview || '';
  }
  if (content.quiz?.length) loadQuizPreview(content);
}

// ===== STORY & GRAMMAR =====
function initContentModals() {
  document.getElementById('readStoryBtn').addEventListener('click', openStory);
  document.getElementById('storyModalClose').addEventListener('click', () => closeModal('storyModal'));
  document.getElementById('exploreGrammarBtn').addEventListener('click', openGrammar);
  document.getElementById('grammarModalClose').addEventListener('click', () => closeModal('grammarModal'));

  // Close on overlay click
  ['storyModal','grammarModal','quizModal','adsModal','singleAdModal',
   'addVocabModal','profileModal','languageModal','fontSizeModal','newAdModal'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('click', e => {
      if (e.target === el) {
        if (id === 'singleAdModal') closeSingleAd();
        else closeModal(id);
      }
    });
  });
}

function textToHtml(text) {
  return text.split('\n').map(line => {
    if (!line.trim()) return '<br>';
    if (line.startsWith('🔑') || line.startsWith('💡')) return `<p style="font-weight:700;margin-top:14px">${line}</p>`;
    if (line.startsWith('•') || line.startsWith('✅') || line.startsWith('❌'))
      return `<p style="padding-left:10px;margin:4px 0">${line}</p>`;
    return `<p style="margin:4px 0">${line}</p>`;
  }).join('');
}

function openStory() {
  const content = AppState.dailyContent;
  if (!content?.story) return;
  const body = document.getElementById('storyModalBody');
  body.innerHTML = `<div class="story-content"><h4>${escHtml(content.story.title||"Today's Story")}</h4>${textToHtml(content.story.full||'')}</div>`;
  AppState.markStoryRead();
  showModal('storyModal');
}

function openGrammar() {
  const content = AppState.dailyContent;
  if (!content?.grammar) return;
  const body = document.getElementById('grammarModalBody');
  body.innerHTML = `<div class="grammar-content">${textToHtml(content.grammar.full||'')}</div>`;
  showModal('grammarModal');
}

// ===== ONBOARDING =====
function showOnboarding() {
  const screen = document.createElement('div');
  screen.className = 'onboarding-screen';
  screen.id = 'onboardingScreen';
  screen.innerHTML = `
    <img src="images/logo.png" alt="Lark" class="onboarding-logo"/>
    <div class="onboarding-title">LARK</div>
    <p class="onboarding-subtitle">Your daily English learning companion.<br>Learn a little every day.</p>
    <div class="onboarding-form">
      <label class="onboarding-label">What's your name?</label>
      <input type="text" class="onboarding-input" id="onboardingName" placeholder="Enter your name..." maxlength="30"/>
      <button class="onboarding-btn" id="onboardingSubmit">Start Learning 🚀</button>
    </div>`;
  document.body.appendChild(screen);
  document.getElementById('onboardingSubmit').addEventListener('click', finishOnboarding);
  document.getElementById('onboardingName').addEventListener('keydown', e => { if (e.key === 'Enter') finishOnboarding(); });
  setTimeout(() => document.getElementById('onboardingName').focus(), 300);
}

function finishOnboarding() {
  const name = document.getElementById('onboardingName').value.trim();
  if (!name) { document.getElementById('onboardingName').style.borderColor = 'var(--gold)'; return; }
  AppState.username = name;
  AppState.save();
  const screen = document.getElementById('onboardingScreen');
  screen.style.opacity = '0';
  screen.style.transition = 'opacity 0.5s';
  setTimeout(() => { screen.remove(); applyTranslations(); loadDailyContent(); }, 500);
}

// ===== NAVIGATION INIT =====
function initNavigation() {
  document.getElementById('navHome').addEventListener('click', () => navigateTo('home'));
  document.getElementById('navVocab').addEventListener('click', () => navigateTo('vocab'));
  document.getElementById('navProgress').addEventListener('click', () => navigateTo('progress'));
  document.getElementById('navAbout').addEventListener('click', () => navigateTo('about'));
}

// ===== MAIN INIT =====
async function init() {
  AppState.load();
  applyFontSize(AppState.fontSize);
  applyTranslations();

  initNavigation();
  initContentModals();
  initSettings();
  initNotifications();
  initQuiz();
  initVocab();
  initAds();
  updatePointsDisplay();

  // Load shared data from Supabase
  await loadSharedData();

  if (!AppState.username) {
    showOnboarding();
  } else {
    await loadDailyContent();
  }
}

document.addEventListener('DOMContentLoaded', init);
