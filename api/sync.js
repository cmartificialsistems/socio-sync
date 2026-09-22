const MASTER_INDEX_ID = 'ff808181a09d98f701a0c4f4847c63eb';

// NOTE: intentionally NO in-RAM cache for master index.
// Vercel Lambdas are stateless; a different warm instance may have written a
// new docId that our cached copy doesn't know about, causing duplicate docs
// and data loss. Always fetch fresh from restful-api.dev.
if (typeof globalThis.socioSyncStore === 'undefined') {
  globalThis.socioSyncStore = {};
}

async function getMasterIndex() {
  try {
    const res = await fetch('https://api.restful-api.dev/objects/' + MASTER_INDEX_ID, { cache: 'no-store' });
    if (res.ok) {
      const doc = await res.json();
      return doc.data?.workspaces || {};
    }
  } catch (e) {}
  return {};
}

async function saveMasterIndex(indexObj) {
  try {
    await fetch('https://api.restful-api.dev/objects/' + MASTER_INDEX_ID, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'socio_sync_master_index', data: { workspaces: indexObj } })
    });
  } catch (e) {}
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Enforce zero caching across CDN, Edge proxies, Vercel edge, and browser caches
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const workspaceId = req.query.workspaceId || 'colombia';

  if (req.method === 'POST' || req.method === 'PUT') {
    try {
      const payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const targetRoom = payload.workspaceId || workspaceId;
      const dataToSave = payload.data || payload;
      
      // Update in-memory fast cache
      globalThis.socioSyncStore[targetRoom] = dataToSave;

      // Save to persistent cloud REST backend
      const masterIndex = await getMasterIndex();
      let docId = masterIndex[targetRoom];

      if (docId) {
        try {
          const putRes = await fetch('https://api.restful-api.dev/objects/' + docId, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'socio_sync_' + targetRoom, data: dataToSave })
          });
          if (putRes.ok) {
            return res.status(200).json({ success: true, workspaceId: targetRoom, ts: dataToSave?.ts || Date.now() });
          }
        } catch (e) {}
      }

      // Create new doc if missing or update failed
      const createRes = await fetch('https://api.restful-api.dev/objects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'socio_sync_' + targetRoom, data: dataToSave })
      });
      const newDoc = await createRes.json();
      if (newDoc.id) {
        masterIndex[targetRoom] = newDoc.id;
        await saveMasterIndex(masterIndex);
      }

      return res.status(200).json({ success: true, workspaceId: targetRoom, ts: dataToSave?.ts || Date.now() });
    } catch (e) {
      return res.status(400).json({ error: e.message });
    }
  }

  if (req.method === 'GET') {
    // 1. Try persistent cloud REST backend first
    try {
      const masterIndex = await getMasterIndex();
      const docId = masterIndex[workspaceId];
      if (docId) {
        const cloudRes = await fetch('https://api.restful-api.dev/objects/' + docId, { cache: 'no-store' });
        if (cloudRes.ok) {
          const doc = await cloudRes.json();
          let cloudPayload = doc.data;
          if (cloudPayload && cloudPayload.data && cloudPayload.data.ts) {
            cloudPayload = cloudPayload.data;
          }
          if (cloudPayload) {
            globalThis.socioSyncStore[workspaceId] = cloudPayload;
            return res.status(200).json({ data: cloudPayload });
          }
        }
      }
    } catch (e) {}

    // 2. Fallback to fast in-memory cache
    const cached = globalThis.socioSyncStore[workspaceId] || null;
    return res.status(200).json({ data: cached?.data || cached || null });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
