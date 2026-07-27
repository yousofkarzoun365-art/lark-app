/* ===== SETTINGS.JS ===== */

const FONT_SIZES = {
  small:  { label_en: 'Small',   label_ar: 'صغير',      value: '13px' },
  medium: { label_en: 'Medium',  label_ar: 'متوسط',     value: '15px' },
  large:  { label_en: 'Large',   label_ar: 'كبير',      value: '17px' },
  xlarge: { label_en: 'X-Large', label_ar: 'كبير جداً', value: '19px' },
};
const FONT_ORDER = ['small','medium','large','xlarge'];

function initSettings() {
  document.getElementById('settingsBtn').addEventListener('click', openSidebar);
  document.getElementById('sidebarClose').addEventListener('click', closeSidebar);
  document.getElementById('sidebarOverlay').addEventListener('click', closeSidebar);

  document.getElementById('profileBtn').addEventListener('click', () => { closeSidebar(); showModal('profileModal'); });
  document.getElementById('notificationsBtn').addEventListener('click', () => { closeSidebar(); showToast('🔔 Notifications coming soon!', ''); });
  document.getElementById('languageBtn').addEventListener('click', () => { closeSidebar(); showModal('languageModal'); });
  document.getElementById('fontSizeBtn').addEventListener('click', () => { closeSidebar(); showModal('fontSizeModal'); });
  document.getElementById('aboutSidebarBtn').addEventListener('click', () => { closeSidebar(); navigateTo('about'); });

  document.getElementById('profileModalClose').addEventListener('click', () => closeModal('profileModal'));
  document.getElementById('languageModalClose').addEventListener('click', () => closeModal('languageModal'));
  document.getElementById('fontSizeModalClose').addEventListener('click', () => closeModal('fontSizeModal'));

  document.getElementById('saveProfileBtn').addEventListener('click', saveProfile);
  document.getElementById('usernameInput').addEventListener('keydown', e => { if (e.key === 'Enter') saveProfile(); });

  document.getElementById('langEN').addEventListener('click', () => setLanguage('en'));
  document.getElementById('langAR').addEventListener('click', () => setLanguage('ar'));

  document.getElementById('fontIncrease').addEventListener('click', () => changeFontSize(1));
  document.getElementById('fontDecrease').addEventListener('click', () => changeFontSize(-1));

  document.getElementById('navNewAd').addEventListener('click', () => showModal('newAdModal'));
  document.getElementById('newAdModalClose').addEventListener('click', () => closeModal('newAdModal'));
  document.getElementById('contactDeveloperBtn').addEventListener('click', contactDeveloper);

  applyFontSize(AppState.fontSize);
  updateFontPreview();
  document.getElementById('usernameInput').value = AppState.username || '';
}

function openSidebar() {
  document.getElementById('sidebar').classList.add('open');
  document.getElementById('sidebarOverlay').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebarOverlay').classList.remove('active');
  document.body.style.overflow = '';
}

function saveProfile() {
  const name = document.getElementById('usernameInput').value.trim();
  if (!name) { showToast('Please enter a name', ''); return; }
  AppState.username = name;
  AppState.save();
  applyTranslations();
  closeModal('profileModal');
  showToast('✅ Saved!', 'success');
}

function setLanguage(lang) {
  AppState.lang = lang;
  AppState.save();
  applyTranslations();
  document.getElementById('langEN').classList.toggle('active', lang === 'en');
  document.getElementById('langAR').classList.toggle('active', lang === 'ar');
  closeModal('languageModal');
  showToast(lang === 'ar' ? 'تم تغيير اللغة ✅' : 'Language changed ✅', 'success');
}

function changeFontSize(dir) {
  const idx = FONT_ORDER.indexOf(AppState.fontSize);
  const newIdx = Math.max(0, Math.min(FONT_ORDER.length - 1, idx + dir));
  AppState.fontSize = FONT_ORDER[newIdx];
  AppState.save();
  applyFontSize(AppState.fontSize);
  updateFontPreview();
}

function applyFontSize(size) {
  const fs = FONT_SIZES[size] || FONT_SIZES.medium;
  document.documentElement.style.setProperty('--font-size-base', fs.value);
}

function updateFontPreview() {
  const size = AppState.fontSize;
  const fs = FONT_SIZES[size] || FONT_SIZES.medium;
  const el = document.getElementById('fontSizePreview');
  if (el) el.textContent = AppState.lang === 'ar' ? fs.label_ar : fs.label_en;
  const inc = document.getElementById('fontIncrease');
  const dec = document.getElementById('fontDecrease');
  if (inc) inc.disabled = FONT_ORDER.indexOf(size) >= FONT_ORDER.length - 1;
  if (dec) dec.disabled = FONT_ORDER.indexOf(size) <= 0;
}

async function contactDeveloper() {
  // أولاً جرب من الذاكرة
  let whatsapp = AppState.shared.whatsapp || '';

  // إذا فارغة اقرأ مباشرة من Supabase
  if (!whatsapp) {
    showToast('⏳ Loading...', '');
    whatsapp = await DB.getSetting('whatsapp') || '';
    if (whatsapp) {
      AppState.shared.whatsapp = whatsapp;
    }
  }

  if (!whatsapp) {
    showToast('Contact info not available', '');
    return;
  }

  let num = whatsapp.replace(/\D/g, '');
  if (num.startsWith('0')) num = '963' + num.slice(1);
  else if (!num.startsWith('963')) num = '963' + num;

  window.open('https://wa.me/' + num, '_blank');
}
