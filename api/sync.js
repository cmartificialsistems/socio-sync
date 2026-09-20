if (typeof globalThis.socioSyncStore === 'undefined') {
  globalThis.socioSyncStore = {};
}

export default function handler(req, res) {
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
      globalThis.socioSyncStore[targetRoom] = payload;
      return res.status(200).json({ success: true, workspaceId: targetRoom, ts: payload?.data?.ts || Date.now() });
    } catch (e) {
      return res.status(400).json({ error: e.message });
    }
  }

  if (req.method === 'GET') {
    const cached = globalThis.socioSyncStore[workspaceId] || null;
    return res.status(200).json({ data: cached?.data || cached || null });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
