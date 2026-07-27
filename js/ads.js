/* ===== ADS.JS ===== */

let adTimer = null, adStartTime = null, currentAdId = null;
const AD_SECONDS = 120, AD_POINTS = 15;

function initAds() {
  document.getElementById('readAdBtn').addEventListener('click', openAdsModal);
  document.getElementById('adsModalClose').addEventListener('click', () => closeModal('adsModal'));
  document.getElementById('singleAdClose').addEventListener('click', closeSingleAd);
}

function openAdsModal() {
  const ads = AppState.shared.ads || [];
  const grid = document.getElementById('adsGrid');
  grid.innerHTML = '';

  if (!ads.length) {
    grid.innerHTML = `<div class="no-ads-msg" style="grid-column:1/-1">${t('no_ads')}</div>`;
  } else {
    ads.forEach((ad) => {
      const card = document.createElement('div');
      card.className = 'ad-card';
      card.textContent = ad.title || 'Ad';
      card.addEventListener('click', () => openSingleAd(ad.id, ad));
      grid.appendChild(card);
    });
  }
  showModal('adsModal');
}

function openSingleAd(id, ad) {
  closeModal('adsModal');
  currentAdId = id;
  document.getElementById('singleAdTitle').textContent = ad.title || 'Advertisement';
  document.getElementById('singleAdBody').innerHTML = `<div class="story-content">${escHtml(ad.content).replace(/\n/g,'<br>')}</div>`;

  const fill = document.getElementById('adTimerFill');
  const timerText = document.getElementById('adTimerText');
  fill.style.width = '0%';
  fill.style.background = 'var(--gold)';

  if (AppState.hasReadAd(id)) {
    timerText.textContent = t('already_read');
    fill.style.width = '100%';
    fill.style.background = 'var(--green)';
  } else {
    timerText.textContent = t('read_2min');
    startAdTimer(id);
  }
  showModal('singleAdModal');
}

function startAdTimer(adId) {
  adStartTime = Date.now();
  if (adTimer) clearInterval(adTimer);
  const fill = document.getElementById('adTimerFill');
  const timerText = document.getElementById('adTimerText');

  adTimer = setInterval(() => {
    const elapsed = (Date.now() - adStartTime) / 1000;
    const progress = Math.min((elapsed / AD_SECONDS) * 100, 100);
    fill.style.width = progress + '%';
    const remaining = Math.max(0, Math.ceil(AD_SECONDS - elapsed));

    if (remaining > 0) {
      timerText.textContent = `⏱ ${remaining}s — ${t('read_2min')}`;
    } else {
      clearInterval(adTimer); adTimer = null;
      if (!AppState.hasReadAd(adId)) {
        AppState.markAdRead(adId);
        AppState.addPoints(AD_POINTS);
        updatePointsDisplay();
        fill.style.background = 'var(--green)';
        timerText.textContent = t('pts_earned');
        showToast(`+${AD_POINTS} 🪙`, 'gold');
      }
    }
  }, 1000);
}

function closeSingleAd() {
  if (adTimer) { clearInterval(adTimer); adTimer = null; }
  closeModal('singleAdModal');
  currentAdId = null;
}
