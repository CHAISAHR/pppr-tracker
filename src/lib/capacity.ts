// Shared capacity-assessment records backed by public.capacity_assessments.
// One row per (participant × competency × event). The UI groups them
// back into per-event / per-participant cards.

import { supabase } from "@/integrations/supabase/client";

export interface CapacityRow {
  id: string;
  event_id: string | null;
  event_focus_area: string;
  event_date: string | null;
  participant_name: string;
  competency: string;
  pre_score: number | null;
  post_score: number | null;
  created_at: string;
  updated_at: string;
}

export interface ParticipantRecord {
  participantName: string;
  // rowId per competency so we can update/delete individual cells
  scores: Record<string, { id: string; pre: number | null; post: number | null }>;
}

export interface EventCapacity {
  eventId: string | null;
  eventFocusArea: string;
  eventDate: string | null;
  competencies: string[];
  participants: ParticipantRecord[];
}

let cache: CapacityRow[] = [];
let loaded = false;
let loadingPromise: Promise<void> | null = null;
let realtimeBound = false;

const EVENT = "capacity-changed";

function emitChange() {
  window.dispatchEvent(new CustomEvent(EVENT));
}

function bindRealtime() {
  if (realtimeBound) return;
  realtimeBound = true;
  supabase
    .channel("capacity_assessments_changes")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "capacity_assessments" },
      () => {
        // Easiest correct path: refetch. Volume is small.
        loadCapacity(true).catch(() => {});
      }
    )
    .subscribe();
}

export async function loadCapacity(force = false): Promise<void> {
  if (loaded && !force) return;
  if (loadingPromise) return loadingPromise;
  loadingPromise = (async () => {
    const { data, error } = await supabase
      .from("capacity_assessments")
      .select("*")
      .order("event_date", { ascending: false })
      .order("participant_name");
    if (error) {
      console.warn("Failed to load capacity assessments", error);
      return;
    }
    cache = (data ?? []) as CapacityRow[];
    loaded = true;
    bindRealtime();
    emitChange();
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
    const ad = a.eventDate ?? "";
    const bd = b.eventDate ?? "";
    return bd.localeCompare(ad);
  });
}

export interface SaveInput {
  eventId: string | null;
  eventFocusArea: string;
  eventDate: string | null;
  competencies: string[];
  participants: Array<{
    participantName: string;
    preScores: Record<string, number | null>;
    postScores: Record<string, number | null>;
  }>;
}

/** Replace ALL rows for the given event with the supplied participant data. */
export async function saveEventCapacity(
  input: SaveInput,
  existingRowIds: string[] = [],
): Promise<void> {
  // Delete existing rows for this event/label first.
  if (existingRowIds.length) {
    const { error: delErr } = await supabase
      .from("capacity_assessments")
      .delete()
      .in("id", existingRowIds);
    if (delErr) throw delErr;
  }
  const inserts: Array<Omit<CapacityRow, "id" | "created_at" | "updated_at">> = [];
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
  if (inserts.length) {
    const { error } = await supabase.from("capacity_assessments").insert(inserts);
    if (error) throw error;
  }
  await loadCapacity(true);
}

export async function deleteEventCapacity(rowIds: string[]): Promise<void> {
  if (!rowIds.length) return;
  const { error } = await supabase
    .from("capacity_assessments")
    .delete()
    .in("id", rowIds);
  if (error) throw error;
  await loadCapacity(true);
}

export function rowIdsForEvent(evt: EventCapacity): string[] {
  return evt.participants.flatMap(p =>
    Object.values(p.scores).map(s => s.id),
  );
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
