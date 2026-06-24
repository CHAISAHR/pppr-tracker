// Shared capacity-assessment records backed by the Railway backend
// (table: capacity_assessments). One row per (participant × competency × event).
// The UI groups them back into per-event / per-participant cards.

const BASE_URL = import.meta.env.VITE_API_URL || 'https://your-railway-app.railway.app/api';
const MOCK_MODE = !import.meta.env.VITE_API_URL;
const MOCK_KEY = 'mock_capacity_assessments';

function authHeaders(): HeadersInit {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

export interface CapacityRow {
  id: string;
  event_id: string | null;
  event_focus_area: string;
  event_date: string | null;
  focus_area: string | null;
  sector: string | null;
  participant_name: string;
  competency: string;
  pre_score: number | null;
  post_score: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface ParticipantRecord {
  participantName: string;
  scores: Record<string, { id: string; pre: number | null; post: number | null }>;
}

export interface EventCapacity {
  eventId: string | null;
  eventFocusArea: string;
  eventDate: string | null;
  focusArea: string | null;
  sector: string | null;
  competencies: string[];
  participants: ParticipantRecord[];
}

let cache: CapacityRow[] = [];
let loaded = false;
let loadingPromise: Promise<void> | null = null;

const EVENT = 'capacity-changed';
function emitChange() {
  window.dispatchEvent(new CustomEvent(EVENT));
}

function readMock(): CapacityRow[] {
  try {
    const raw = localStorage.getItem(MOCK_KEY);
    return raw ? (JSON.parse(raw) as CapacityRow[]) : [];
  } catch {
    return [];
  }
}
function writeMock(rows: CapacityRow[]) {
  localStorage.setItem(MOCK_KEY, JSON.stringify(rows));
}

export async function loadCapacity(force = false): Promise<void> {
  if (loaded && !force) return;
  if (loadingPromise) return loadingPromise;
  loadingPromise = (async () => {
    try {
      if (MOCK_MODE) {
        cache = readMock();
      } else {
        const res = await fetch(`${BASE_URL}/capacity-assessments`, { headers: authHeaders() });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        cache = (await res.json()) as CapacityRow[];
      }
      loaded = true;
      emitChange();
    } catch (err) {
      console.warn('Failed to load capacity assessments', err);
    }
  })();
  try {
    await loadingPromise;
  } finally {
    loadingPromise = null;
  }
}

export function getAllRows(): CapacityRow[] {
  return [...cache];
}

export function groupByEvent(rows: CapacityRow[] = cache): EventCapacity[] {
  const events = new Map<string, EventCapacity>();
  for (const row of rows) {
    const key = row.event_id ?? `__label__${row.event_focus_area}`;
    let evt = events.get(key);
    if (!evt) {
      evt = {
        eventId: row.event_id,
        eventFocusArea: row.event_focus_area,
        eventDate: row.event_date,
        focusArea: row.focus_area,
        sector: row.sector,
        competencies: [],
        participants: [],
      };
      events.set(key, evt);
    }
    if (!evt.competencies.includes(row.competency)) evt.competencies.push(row.competency);
    let participant = evt.participants.find(p => p.participantName === row.participant_name);
    if (!participant) {
      participant = { participantName: row.participant_name, scores: {} };
      evt.participants.push(participant);
    }
    participant.scores[row.competency] = {
      id: row.id,
      pre: row.pre_score,
      post: row.post_score,
    };
  }
  return Array.from(events.values()).sort((a, b) => {
    const ad = a.eventDate ?? '';
    const bd = b.eventDate ?? '';
    return bd.localeCompare(ad);
  });
}

export interface SaveInput {
  eventId: string | null;
  eventFocusArea: string;
  eventDate: string | null;
  focusArea: string | null;
  sector: string | null;
  competencies: string[];
  participants: Array<{
    participantName: string;
    preScores: Record<string, number | null>;
    postScores: Record<string, number | null>;
  }>;
}

async function deleteRows(ids: string[]): Promise<void> {
  if (!ids.length) return;
  if (MOCK_MODE) {
    const remaining = readMock().filter(r => !ids.includes(r.id));
    writeMock(remaining);
    return;
  }
  const res = await fetch(`${BASE_URL}/capacity-assessments`, {
    method: 'DELETE',
    headers: authHeaders(),
    body: JSON.stringify({ ids }),
  });
  if (!res.ok) throw new Error(`Delete failed (${res.status})`);
}

async function insertRows(
  rows: Array<Omit<CapacityRow, 'id' | 'created_at' | 'updated_at'>>,
): Promise<void> {
  if (!rows.length) return;
  if (MOCK_MODE) {
    const now = new Date().toISOString();
    const withIds: CapacityRow[] = rows.map(r => ({
      ...r,
      id: crypto.randomUUID(),
      created_at: now,
      updated_at: now,
    }));
    writeMock([...readMock(), ...withIds]);
    return;
  }
  const res = await fetch(`${BASE_URL}/capacity-assessments`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ rows }),
  });
  if (!res.ok) throw new Error(`Insert failed (${res.status})`);
}

/** Replace ALL rows for the given event with the supplied participant data. */
export async function saveEventCapacity(
  input: SaveInput,
  existingRowIds: string[] = [],
): Promise<void> {
  if (existingRowIds.length) await deleteRows(existingRowIds);
  const inserts: Array<Omit<CapacityRow, 'id' | 'created_at' | 'updated_at'>> = [];
  for (const p of input.participants) {
    const name = p.participantName.trim();
    if (!name) continue;
    for (const c of input.competencies) {
      const competency = c.trim();
      if (!competency) continue;
      const pre = p.preScores[competency];
      const post = p.postScores[competency];
      if (pre == null && post == null) continue;
      inserts.push({
        event_id: input.eventId,
        event_focus_area: input.eventFocusArea,
        event_date: input.eventDate,
        participant_name: name,
        competency,
        pre_score: pre ?? null,
        post_score: post ?? null,
      });
    }
  }
  await insertRows(inserts);
  await loadCapacity(true);
}

export async function deleteEventCapacity(rowIds: string[]): Promise<void> {
  if (!rowIds.length) return;
  await deleteRows(rowIds);
  await loadCapacity(true);
}

/** Bulk-insert raw rows (used by Excel import). No fields are required. */
export async function importCapacityRows(
  rows: Array<Partial<Omit<CapacityRow, 'id' | 'created_at' | 'updated_at'>>>,
): Promise<number> {
  const normalised = rows.map((r) => ({
    event_id: r.event_id ?? null,
    event_focus_area: r.event_focus_area ?? '',
    event_date: r.event_date ?? null,
    participant_name: r.participant_name ?? '',
    competency: r.competency ?? '',
    pre_score: r.pre_score ?? null,
    post_score: r.post_score ?? null,
  }));
  await insertRows(normalised);
  await loadCapacity(true);
  return normalised.length;
}

export function rowIdsForEvent(evt: EventCapacity): string[] {
  return evt.participants.flatMap(p => Object.values(p.scores).map(s => s.id));
}

export function averagesPerCompetency(evt: EventCapacity) {
  return evt.competencies.map((c) => {
    const pres: number[] = [];
    const posts: number[] = [];
    for (const p of evt.participants) {
      const s = p.scores[c];
      if (s?.pre != null) pres.push(s.pre);
      if (s?.post != null) posts.push(s.post);
    }
    const avg = (arr: number[]) =>
      arr.length ? arr.reduce((s, v) => s + v, 0) / arr.length : null;
    const pre = avg(pres);
    const post = avg(posts);
    return { competency: c, pre, post, change: pre != null && post != null ? post - pre : null };
  });
}
