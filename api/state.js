const DEFAULT_STATE = {
  products: [],
  purchases: [],
  updatedAt: 0,
};

function normalizeState(input) {
  const safe = input && typeof input === 'object' ? input : {};
  return {
    products: Array.isArray(safe.products) ? safe.products : [],
    purchases: Array.isArray(safe.purchases) ? safe.purchases : [],
    updatedAt: Number(safe.updatedAt) || Date.now(),
  };
}

function readStore() {
  if (!globalThis.__ROBO_ALAIN_SHARED_STATE__) {
    globalThis.__ROBO_ALAIN_SHARED_STATE__ = {
      ...DEFAULT_STATE,
      updatedAt: Date.now(),
    };
  }
  return globalThis.__ROBO_ALAIN_SHARED_STATE__;
}

function writeStore(nextState) {
  globalThis.__ROBO_ALAIN_SHARED_STATE__ = normalizeState(nextState);
  return globalThis.__ROBO_ALAIN_SHARED_STATE__;
}

export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'GET') {
    return res.status(200).json(readStore());
  }

  if (req.method === 'POST') {
    const incoming = normalizeState(req.body || {});
    const current = readStore();

    if (!current.updatedAt || incoming.updatedAt >= current.updatedAt) {
      return res.status(200).json(writeStore(incoming));
    }

    return res.status(200).json(current);
  }

  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({ error: 'Method not allowed' });
}
