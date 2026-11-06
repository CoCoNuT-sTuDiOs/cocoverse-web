export type Asset = {
  slug: string;
  name: string;
  views: number;
  copies: number;
  likes: number;
  /** ISO date the asset was added. */
  addedAt: string;
};

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

/** The numbers are samples. The real ones come from Supabase later. */
export const ASSETS: Asset[] = [
  { slug: "capsule-sprite", name: "Capsule sprite", views: 410, copies: 61, likes: 35, addedAt: "2026-11-01" },
  { slug: "cube-sphere", name: "Cube sphere", views: 2400, copies: 880, likes: 520, addedAt: "2026-10-30" },
  { slug: "blossom", name: "Blossom", views: 320, copies: 40, likes: 29, addedAt: "2026-10-29" },
  { slug: "link-chain", name: "Link chain", views: 1530, copies: 210, likes: 148, addedAt: "2026-10-26" },
  { slug: "geo-morph", name: "GeoMorph", views: 540, copies: 71, likes: 44, addedAt: "2026-10-22" },
  { slug: "pisces", name: "Pisces", views: 1240, copies: 312, likes: 208, addedAt: "2026-11-04" },
  { slug: "clay-bot", name: "Clay bot", views: 640, copies: 98, likes: 77, addedAt: "2026-11-02" },
  { slug: "foil-ring", name: "Foil ring", views: 690, copies: 90, likes: 63, addedAt: "2026-10-20" },
  { slug: "urchin", name: "Urchin", views: 770, copies: 104, likes: 80, addedAt: "2026-10-18" },
  { slug: "jelly-sphere", name: "Jelly sphere", views: 275, copies: 33, likes: 18, addedAt: "2026-10-15" },
  { slug: "shard-sphere", name: "Shard sphere", views: 360, copies: 47, likes: 31, addedAt: "2026-10-12" },
  { slug: "particle-cube", name: "Particle cube", views: 430, copies: 55, likes: 40, addedAt: "2026-10-10" },
  { slug: "glass-ring", name: "Glass ring", views: 980, copies: 241, likes: 150, addedAt: "2026-10-08" },
  { slug: "starfield-sphere", name: "Starfield sphere", views: 510, copies: 66, likes: 49, addedAt: "2026-10-05" },
  { slug: "glossy-sphere", name: "Glossy sphere", views: 600, copies: 80, likes: 58, addedAt: "2026-10-02" },
];