/* ===== SUPABASE.JS - Database connection ===== */

const SUPABASE_URL = 'https://ijpksxtagfiecjspjgsc.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqcGtzeHRhZ2ZpZWNqc3BqZ3NjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ0OTkwMDYsImV4cCI6MjEwMDA3NTAwNn0.SREDuEVJVr0FcN3F9lE3J08WQ2Q0Oqzi353gzZFahfk';

const DB = {
  headers: {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_KEY,
    'Authorization': 'Bearer ' + SUPABASE_KEY
  },

  async getSetting(key) {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/app_settings?key=eq.${key}&select=value`, {
        headers: this.headers
      });
      const data = await res.json();
      return data && data[0] ? data[0].value : null;
    } catch { return null; }
  },

  async setSetting(key, value) {
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/app_settings`, {
        method: 'POST',
        headers: { ...this.headers, 'Prefer': 'resolution=merge-duplicates' },
        body: JSON.stringify({ key, value })
      });
    } catch (e) { console.error('setSetting error:', e); }
  },

  async getAds() {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/ads?select=*&order=created_at.asc`, {
        headers: this.headers
      });
      return await res.json();
    } catch { return []; }
  },

  async addAd(title, content) {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/ads`, {
        method: 'POST',
        headers: { ...this.headers, 'Prefer': 'return=representation' },
        body: JSON.stringify({ title, content })
      });
      return await res.json();
    } catch { return null; }
  },

  async deleteAd(id) {
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/ads?id=eq.${id}`, {
        method: 'DELETE',
        headers: this.headers
      });
    } catch (e) { console.error('deleteAd error:', e); }
  },

  async getDailyContent(date) {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/daily_content?date=eq.${date}&select=content`, {
        headers: this.headers
      });
      const data = await res.json();
      return data && data[0] ? data[0].content : null;
    } catch { return null; }
  },

  async saveDailyContent(date, content) {
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/daily_content`, {
        method: 'POST',
        headers: { ...this.headers, 'Prefer': 'resolution=merge-duplicates' },
        body: JSON.stringify({ date, content })
      });
    } catch (e) { console.error('saveDailyContent error:', e); }
  },

  async deleteDailyContent(date) {
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/daily_content?date=eq.${date}`, {
        method: 'DELETE',
        headers: this.headers
      });
    } catch (e) { console.error('deleteDailyContent error:', e); }
  },

  async subscribePush(subscription) {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/push_subscriptions`, {
        method: 'POST',
        headers: { ...this.headers, 'Prefer': 'resolution=merge-duplicates' },
        body: JSON.stringify({ endpoint: subscription.endpoint, subscription: subscription.toJSON ? subscription.toJSON() : subscription })
      });
      if (!res.ok) {
        console.error('subscribePush failed:', res.status, await res.text());
        return false;
      }
      return true;
    } catch (e) { console.error('subscribePush error:', e); return false; }
  },

  async unsubscribePush(endpoint) {
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/push_subscriptions?endpoint=eq.${encodeURIComponent(endpoint)}`, {
        method: 'DELETE',
        headers: this.headers
      });
    } catch (e) { console.error('unsubscribePush error:', e); }
  }
};
