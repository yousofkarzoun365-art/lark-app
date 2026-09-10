/* ===== NOTIFICATIONS.JS - Web Push subscribe/unsubscribe ===== */

const VAPID_PUBLIC_KEY = 'BCG6h8SFeA8e5MTanGUZL8zucesWPTApYV2kFaoJ5fRis_asREMNiI6uyyFVV23ID2msPzSf8EKm3JFWiIWw7RQ';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}

async function getPushStatus() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return 'unsupported';
  if (Notification.permission === 'denied') return 'denied';
  try {
    const reg = await Promise.race([
      navigator.serviceWorker.ready,
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 8000))
    ]);
    const sub = await reg.pushManager.getSubscription();
    return sub ? 'enabled' : 'disabled';
  } catch {
    return 'sw_error';
  }
}

async function enableNotifications() {
  try {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      showToast('Push notifications are not supported on this browser', '');
      return;
    }
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      showToast('Notifications permission denied', '');
      await updateNotificationsUI();
      return;
    }
    const reg = await navigator.serviceWorker.ready;
    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      });
    }
    await DB.subscribePush(sub);
    showToast('🔔 Notifications enabled!', 'success');
  } catch (err) {
    console.error('Subscribe failed:', err);
    showToast('Could not enable notifications', '');
  }
  await updateNotificationsUI();
}

async function disableNotifications() {
  try {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (sub) {
      await DB.unsubscribePush(sub.endpoint);
      await sub.unsubscribe();
    }
    showToast('🔕 Notifications disabled', '');
  } catch (err) {
    console.error('Unsubscribe failed:', err);
  }
  await updateNotificationsUI();
}

async function updateNotificationsUI() {
  const statusEl = document.getElementById('notifStatus');
  const enableBtn = document.getElementById('notifEnableBtn');
  const disableBtn = document.getElementById('notifDisableBtn');
  if (!statusEl || !enableBtn || !disableBtn) return;

  const status = await getPushStatus();
  if (status === 'unsupported') {
    statusEl.textContent = 'Not supported on this browser';
    enableBtn.style.display = 'none'; disableBtn.style.display = 'none';
  } else if (status === 'sw_error') {
    statusEl.textContent = '⚠️ Could not connect to the background service. Try closing and reopening the app.';
    enableBtn.style.display = 'none'; disableBtn.style.display = 'none';
  } else if (status === 'denied') {
    statusEl.textContent = 'Blocked — enable notifications for this site in your browser settings';
    enableBtn.style.display = 'none'; disableBtn.style.display = 'none';
  } else if (status === 'enabled') {
    statusEl.textContent = '🔔 Notifications are ON';
    enableBtn.style.display = 'none'; disableBtn.style.display = 'block';
  } else {
    statusEl.textContent = '🔕 Notifications are OFF';
    enableBtn.style.display = 'block'; disableBtn.style.display = 'none';
  }
}

function initNotifications() {
  const enableBtn = document.getElementById('notifEnableBtn');
  const disableBtn = document.getElementById('notifDisableBtn');
  if (enableBtn) enableBtn.addEventListener('click', enableNotifications);
  if (disableBtn) disableBtn.addEventListener('click', disableNotifications);
}
