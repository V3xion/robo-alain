const STORE_KEY = 'robo-alain-shared-state-v1';
const FILE_PATH = '/tmp/robo-alain-shared-state.json';

const DEFAULT_STATE = {
  products: [],
  purchases: [],
  updatedAt: 0,
};

function normalizeState(input) {
  const safe = input && typeof input === 'object' ? input : {};
  const purchases = Array.isArray(safe.purchases) ? safe.purchases.filter(Boolean) : [];
  const products = Array.isArray(safe.products) ? safe.products.filter(Boolean) : [];

  return {
    products,
    purchases,
    updatedAt: Number(safe.updatedAt) || Date.now(),
  };
}

function mergeById(base = [], incoming = [], sortDesc = false) {
  const map = new Map();
  [...base, ...incoming].forEach((item) => {
    if (!item || item.id == null) return;
    map.set(String(item.id), item);
  });

  const result = [...map.values()];
  if (sortDesc) {
    result.sort((a, b) => Number(b.time || b.updatedAt || 0) - Number(a.time || a.updatedAt || 0));
  }
  return result;
}

function mergeState(currentRaw, incomingRaw) {
  const current = normalizeState(currentRaw);
  const incoming = normalizeState(incomingRaw);
  const incomingIsNewer = incoming.updatedAt >= current.updatedAt;

  const products = incomingIsNewer
    ? (incoming.products.length ? incoming.products : current.products)
    : (current.products.length ? current.products : incoming.products);

  return {
    products,
    purchases: mergeById(current.purchases, incoming.purchases, true),
    updatedAt: Math.max(current.updatedAt || 0, incoming.updatedAt || 0, Date.now()),
  };
}

let memoryState = { ...DEFAULT_STATE, updatedAt: Date.now() };

async function readFromKv() {
  if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) return null;

  const res = await fetch(`${process.env.KV_REST_API_URL}/get/${STORE_KEY}`, {
    headers: { Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}` },
  });
  if (!res.ok) return null;

  const payload = await res.json();
  if (!payload || !payload.result) return null;

  if (typeof payload.result === 'string') {
    return normalizeState(JSON.parse(payload.result));
  }
  return normalizeState(payload.result);
}

async function writeToKv(nextState) {
  if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) return false;

  const res = await fetch(`${process.env.KV_REST_API_URL}/set/${STORE_KEY}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(nextState),
  });

  return res.ok;
}

async function readFromFile() {
  try {
    const fs = await import('node:fs/promises');
    const raw = await fs.readFile(FILE_PATH, 'utf8');
    return normalizeState(JSON.parse(raw));
  } catch (_error) {
    return null;
  }
}

async function writeToFile(nextState) {
  try {
    const fs = await import('node:fs/promises');
    await fs.writeFile(FILE_PATH, JSON.stringify(nextState), 'utf8');
    return true;
  } catch (_error) {
    return false;
  }
}

async function readStore() {
  const kvState = await readFromKv();
  if (kvState) return kvState;

  const fileState = await readFromFile();
  if (fileState) {
    memoryState = fileState;
    return fileState;
  }

  return memoryState;
}

async function writeStore(nextState) {
  const normalized = normalizeState(nextState);
  memoryState = normalized;

  const kvWritten = await writeToKv(normalized);
  if (!kvWritten) {
    await writeToFile(normalized);
  }

  return normalized;
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'GET') {
    return res.status(200).json(await readStore());
  }

  if (req.method === 'POST') {
    const current = await readStore();
    const incoming = normalizeState(req.body || {});
    const merged = mergeState(current, incoming);
    return res.status(200).json(await writeStore(merged));
  }

  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({ error: 'Method not allowed' });
}
