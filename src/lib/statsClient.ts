import { refreshStats } from "./liveStats";

/** What the browser sends when a visitor views, copies or hearts an asset.
 *  Each one calls a Supabase function of the same name. */
type Kind = "view" | "copy" | "heart";

const RPC: Record<Kind, string> = {
  view: "record_view",
  copy: "record_copy",
  heart: "record_heart",
};

async function send(kind: Kind, slug: string): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return;
  try {
    await fetch(`${url}/rest/v1/rpc/${RPC[kind]}`, {
      method: "POST",
      headers: { apikey: key, "Content-Type": "application/json" },
      body: JSON.stringify({ asset_slug: slug }),
      keepalive: true,
    });
    // Now the database has it: show its real numbers.
    await refreshStats();
  } catch {}
}

/** Once per asset per browser session. Returns true when it counted. */
export function countView(slug: string): boolean {
  try {
    const key = `cv-view:${slug}`;
    if (sessionStorage.getItem(key)) return false;
    sessionStorage.setItem(key, "1");
  } catch {}
  void send("view", slug);
  return true;
}

const lastCopy: Record<string, number> = {};

/** Every copy counts, except two within four seconds. Returns true when it counted. */
export function countCopy(slug: string): boolean {
  const now = Date.now();
  if (now - (lastCopy[slug] ?? 0) < 4000) return false;
  lastCopy[slug] = now;
  void send("copy", slug);
  return true;
}

export function hasHearted(slug: string): boolean {
  try {
    return localStorage.getItem(`cv-heart:${slug}`) === "1";
  } catch {
    return false;
  }
}

/** Whether the heart box should appear: on every copy of an asset the visitor has not hearted. */
export function shouldAskHeart(slug: string): boolean {
  return !hasHearted(slug);
}

/** One heart per asset per browser. Returns true when it counted. */
export function countHeart(slug: string): boolean {
  if (hasHearted(slug)) return false;
  try {
    localStorage.setItem(`cv-heart:${slug}`, "1");
  } catch {}
  void send("heart", slug);
  return true;
}