// Cloud Real-Time Sync Engine for SocioSync
// Synchronizes state across laptop, phone, and all partners in real-time.

const API_BASE = 'https://api.npoint.io/c44c5b367d30f353ad63'; // Shared Cloud Sync Bin

export const fetchCloudState = async () => {
  try {
    const res = await fetch(API_BASE, { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    return data;
  } catch (e) {
    console.warn('Cloud fetch offline/error:', e);
    return null;
  }
};

export const pushCloudState = async (state) => {
  try {
    await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(state)
    });
  } catch (e) {
    console.warn('Cloud push offline/error:', e);
  }
};
