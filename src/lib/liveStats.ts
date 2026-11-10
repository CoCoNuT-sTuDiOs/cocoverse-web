import { useSyncExternalStore } from "react";
import type { Stats } from "./assets";

type StatsMap = Record<string, Stats>;

const EMPTY: StatsMap = {};
let data: StatsMap = EMPTY;
const listeners = new Set<() => void>();

function emit(next: StatsMap) {
  data = next;
  listeners.forEach((l) => l());
}

/** The counts the pages show right now. It starts empty, so the numbers from the
 *  server are used until the browser has fresher ones. */
export const liveStats = {
  get: () => data,
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  /** Adds one to a count at once, starting from base when nothing newer is known. */
  bump(slug: string, field: keyof Stats, base: Stats) {
    const current = data[slug] ?? base;
    emit({ ...data, [slug]: { ...current, [field]: current[field] + 1 } });
  },
};

export function useLiveStats(): StatsMap {
  return useSyncExternalStore(liveStats.subscribe, liveStats.get, () => EMPTY);
}

/** Reads the real counts from Supabase, bypassing every cache. */
export async function refreshStats(): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return;
  try {
    const res = await fetch(`${url}/rest/v1/asset_stats?select=slug,views,copies,likes`, {
      headers: { apikey: key },
      cache: "no-store",
    });
    if (!res.ok) return;
    const rows = (await res.json()) as { slug: string; views: number; copies: number; likes: number }[];
    const next: StatsMap = { ...data };
    for (const r of rows) {
      next[r.slug] = { views: Number(r.views), copies: Number(r.copies), likes: Number(r.likes) };
    }
    emit(next);
  } catch {}
}