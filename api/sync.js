const MASTER_INDEX_ID = 'ff808181a09d98f701a0c4f4847c63eb';

if (typeof globalThis.socioSyncStore === 'undefined') {
  globalThis.socioSyncStore = {};
}
if (typeof globalThis.socioSyncMasterIndex === 'undefined') {
  globalThis.socioSyncMasterIndex = null;
}

async function getMasterIndex() {
  if (globalThis.socioSyncMasterIndex) {
    return globalThis.socioSyncMasterIndex;
  }
  try {
    const res = await fetch('https://api.restful-api.dev/objects/' + MASTER_INDEX_ID);
    if (res.ok) {
      const doc = await res.json();
      globalThis.socioSyncMasterIndex = doc.data?.workspaces || {};
      return globalThis.socioSyncMasterIndex;
    }
  } catch (e) {}
  return {};
}

async function saveMasterIndex(indexObj) {
  globalThis.socioSyncMasterIndex = indexObj;
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
        const cloudRes = await fetch('https://api.restful-api.dev/objects/' + docId);
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
