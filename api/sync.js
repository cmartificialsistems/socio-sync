let memoryCache = null;

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

  if (req.method === 'POST' || req.method === 'PUT') {
    try {
      const payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      memoryCache = payload;
      if (typeof globalThis !== 'undefined') {
        globalThis.socioSyncWorkspaceData = payload;
      }
      return res.status(200).json({ success: true, ts: payload?.data?.ts || Date.now() });
    } catch (e) {
      return res.status(400).json({ error: e.message });
    }
  }

  if (req.method === 'GET') {
    const cached = memoryCache || (typeof globalThis !== 'undefined' ? globalThis.socioSyncWorkspaceData : null);
    return res.status(200).json({ data: cached?.data || cached || null });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
