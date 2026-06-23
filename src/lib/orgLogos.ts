// Shared organisation logos backed by the public.org_logos table.
// Logos persist server-side and sync across browsers via realtime.
// Reads are sync from an in-memory cache populated on initLogos().

import { supabase } from "@/integrations/supabase/client";

type LogoMap = Record<string, string>;

const cache: LogoMap = {};
let loaded = false;
let loadingPromise: Promise<void> | null = null;
let realtimeBound = false;

function emitChange() {
  window.dispatchEvent(new CustomEvent("org-logos-changed"));
}

function bindRealtime() {
  if (realtimeBound) return;
  realtimeBound = true;
  supabase
    .channel("org_logos_changes")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "org_logos" },
      (payload) => {
        const newRow = payload.new as { name?: string; data_url?: string } | null;
        const oldRow = payload.old as { name?: string } | null;
        if (payload.eventType === "DELETE") {
          if (oldRow?.name) delete cache[oldRow.name];
        } else if (newRow?.name && newRow.data_url) {
          cache[newRow.name] = newRow.data_url;
        }
        emitChange();
      }
    )
    .subscribe();
}

export async function loadLogos(force = false): Promise<void> {
  if (loaded && !force) return;
  if (loadingPromise) return loadingPromise;
  loadingPromise = (async () => {
    const { data, error } = await supabase
      .from("org_logos")
      .select("name, data_url");
    if (error) {
      console.warn("Failed to load org logos", error);
      return;
    }
    for (const row of data ?? []) {
      if (row?.name && row?.data_url) cache[row.name] = row.data_url;
    }
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

export function getLogo(name: string): string | undefined {
  return cache[name];
}

export function getAllLogos(): LogoMap {
  return { ...cache };
}

export async function setLogo(name: string, dataUrl: string): Promise<void> {
  const { error } = await supabase
    .from("org_logos")
    .upsert({ name, data_url: dataUrl }, { onConflict: "name" });
  if (error) throw error;
  cache[name] = dataUrl;
  emitChange();
}

export async function removeLogo(name: string): Promise<void> {
  const { error } = await supabase.from("org_logos").delete().eq("name", name);
  if (error) throw error;
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
