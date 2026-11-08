import { type Asset, ASSETS } from "./assets";
import { docFor } from "./docs";

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SB_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;


type Row = { slug: string; views: number; copies: number; likes: number };

let warned = false;

async function fetchRows(): Promise<Map<string, Row>> {
  const rows = new Map<string, Row>();
  if (!SB_URL || !SB_KEY) return rows;
  try {
    const res = await fetch(`${SB_URL}/rest/v1/asset_stats?select=slug,views,copies,likes`, {
      headers: { apikey: SB_KEY },
      next: { revalidate: 30 },
    });
    if (!res.ok) return rows;
    for (const row of (await res.json()) as Row[]) rows.set(row.slug, row);
  } catch {}
  return rows;
}

/** Every asset in the list, with its counts from Supabase (zero until it is connected). */
export async function loadAssets(): Promise<Asset[]> {
  if (process.env.NODE_ENV !== "production" && !warned) {
    warned = true;
    for (const a of ASSETS) {
      if (!docFor(a.slug)) console.warn(`[cocoverse] "${a.slug}" is in ASSETS but has no entry in docs.ts`);
    }
  }
  const rows = await fetchRows();
  return ASSETS.map((a) => {
    const r = rows.get(a.slug);
    return { ...a, views: r?.views ?? 0, copies: r?.copies ?? 0, likes: r?.likes ?? 0 };
  });
}