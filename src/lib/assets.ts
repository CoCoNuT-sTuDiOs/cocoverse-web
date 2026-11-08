export type AssetEntry = {
  slug: string;
  name: string;
  /** ISO date the asset was added. */
  addedAt: string;
};

export type Stats = { views: number; copies: number; likes: number };

/** An asset with its counts. The counts come from Supabase (see stats.ts). */
export type Asset = AssetEntry & Stats;

export type SortKey = "recent" | "viewed" | "copied" | "liked";

export const SORTS: { key: SortKey; label: string; icon: string }[] = [
  { key: "recent", label: "Recently added", icon: "solar:clock-circle-bold" },
  { key: "viewed", label: "Most viewed", icon: "solar:eye-bold" },
  { key: "copied", label: "Most copied", icon: "solar:bookmark-bold" },
  { key: "liked", label: "Most liked", icon: "solar:heart-bold" },
];

export function sortAssets(list: Asset[], key: SortKey): Asset[] {
  const by: Record<SortKey, (a: Asset, b: Asset) => number> = {
    recent: (a, b) => b.addedAt.localeCompare(a.addedAt),
    viewed: (a, b) => b.views - a.views,
    copied: (a, b) => b.copies - a.copies,
    liked: (a, b) => b.likes - a.likes,
  };
  return [...list].sort(by[key]);
}

/** To add an asset: compile it into the Flutter app, add one line here with the
 *  same slug, and add its entry in docs.ts. It then shows on the grid and gets
 *  its own page. */
export const ASSETS: AssetEntry[] = [
  { slug: "capsule-sprite", name: "Capsule sprite", addedAt: "2026-11-01" },
  { slug: "cube-sphere", name: "Cube sphere", addedAt: "2026-10-30" },
  { slug: "blossom", name: "Blossom", addedAt: "2026-10-29" },
  { slug: "link-chain", name: "Link chain", addedAt: "2026-10-26" },
  { slug: "geo-morph", name: "GeoMorph", addedAt: "2026-10-22" },
  { slug: "pisces", name: "Pisces", addedAt: "2026-11-04" },
  { slug: "clay-bot", name: "Clay bot", addedAt: "2026-11-02" },
  { slug: "foil-ring", name: "Foil ring", addedAt: "2026-10-20" },
  { slug: "urchin", name: "Urchin", addedAt: "2026-10-18" },
  { slug: "jelly-sphere", name: "Jelly sphere", addedAt: "2026-10-15" },
  { slug: "shard-sphere", name: "Shard sphere", addedAt: "2026-10-12" },
  { slug: "particle-cube", name: "Particle cube", addedAt: "2026-10-10" },
  { slug: "glass-ring", name: "Glass ring", addedAt: "2026-10-08" },
  { slug: "starfield-sphere", name: "Starfield sphere", addedAt: "2026-10-05" },
  { slug: "glossy-sphere", name: "Glossy sphere", addedAt: "2026-10-02" },
];