// Shared organisation logos backed by the Railway backend (table: org_logos).
// Reads are sync from an in-memory cache populated on loadLogos().

const BASE_URL = import.meta.env.VITE_API_URL || 'https://your-railway-app.railway.app/api';
const MOCK_MODE = !import.meta.env.VITE_API_URL;
const MOCK_KEY = 'mock_org_logos';

function authHeaders(): HeadersInit {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

type LogoMap = Record<string, string>;

const cache: LogoMap = {};
let loaded = false;
let loadingPromise: Promise<void> | null = null;

function emitChange() {
  window.dispatchEvent(new CustomEvent('org-logos-changed'));
}

function readMock(): LogoMap {
  try {
    const raw = localStorage.getItem(MOCK_KEY);
    return raw ? (JSON.parse(raw) as LogoMap) : {};
  } catch {
    return {};
  }
}
function writeMock(map: LogoMap) {
  localStorage.setItem(MOCK_KEY, JSON.stringify(map));
}

export async function loadLogos(force = false): Promise<void> {
  if (loaded && !force) return;
  if (loadingPromise) return loadingPromise;
  loadingPromise = (async () => {
    try {
      if (MOCK_MODE) {
        const map = readMock();
        for (const [k, v] of Object.entries(map)) cache[k] = v;
      } else {
        const res = await fetch(`${BASE_URL}/org-logos`, { headers: authHeaders() });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const rows = (await res.json()) as Array<{ name: string; data_url: string }>;
        for (const row of rows) {
          if (row?.name && row?.data_url) cache[row.name] = row.data_url;
        }
      }
      loaded = true;
      emitChange();
    } catch (err) {
      console.warn('Failed to load org logos', err);
    }
  })();
  try {
    await loadingPromise;
  } finally {
    loadingPromise = null;
  }
}

export function getLogo(name: string): string | undefined {
  return cache[name];
}

export function getAllLogos(): LogoMap {
  return { ...cache };
}

export async function setLogo(name: string, dataUrl: string): Promise<void> {
  if (MOCK_MODE) {
    const map = readMock();
    map[name] = dataUrl;
    writeMock(map);
  } else {
    const res = await fetch(`${BASE_URL}/org-logos/${encodeURIComponent(name)}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ data_url: dataUrl }),
    });
    if (!res.ok) throw new Error(`Failed to save logo (${res.status})`);
  }
  cache[name] = dataUrl;
  emitChange();
}

export async function removeLogo(name: string): Promise<void> {
  if (MOCK_MODE) {
    const map = readMock();
    delete map[name];
    writeMock(map);
  } else {
    const res = await fetch(`${BASE_URL}/org-logos/${encodeURIComponent(name)}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error(`Failed to delete logo (${res.status})`);
  }
  delete cache[name];
  emitChange();
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
