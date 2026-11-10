"use client";

import { useGSAP } from "@gsap/react";
import { Icon } from "@iconify/react";
import gsap from "gsap";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { FlutterPreview } from "@/components/phone/FlutterPreview";
import { Phone } from "@/components/phone/Phone";
import { activePhone } from "@/lib/activePhone";
import { type Asset, type SortKey, SORTS, sortAssets } from "@/lib/assets";
import { phoneFlight } from "@/lib/flight";
import { refreshStats, useLiveStats } from "@/lib/liveStats";


gsap.registerPlugin(useGSAP);

const PER_PAGE_DESKTOP = 8;
const PER_PAGE_MOBILE = 4;

export function AssetBrowser({ assets }: { assets: Asset[] }) {
  const grid = useRef<HTMLDivElement>(null);
  const veil = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const onAsset = pathname.startsWith("/asset");
  const pushTimer = useRef(0);
  const [chosen, setChosen] = useState<string | null>(null);
  const [sort, setSort] = useState<SortKey>("recent");
  const [page, setPage] = useState(1);
  const [small, setSmall] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setSmall(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const perPage = small ? PER_PAGE_MOBILE : PER_PAGE_DESKTOP;
    const live = useLiveStats();
  const withLive = useMemo(
    () => assets.map((a) => (live[a.slug] ? { ...a, ...live[a.slug] } : a)),
    [assets, live],
  );
  const sorted = useMemo(() => sortAssets(withLive, sort), [withLive, sort]);
  const pages = Math.max(1, Math.ceil(sorted.length / perPage));
  const current = Math.min(page, pages);
  const visible = sorted.slice((current - 1) * perPage, current * perPage);
  const key = visible.map((a) => a.slug).join("|");

  function choose(next: SortKey) {
    if (next === sort) return;
    activePhone.set(null);
    setSort(next);
    setPage(1);
  }

  function goTo(next: number) {
    activePhone.set(null);
    setPage(next);
    grid.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }


  function open(slug: string) {
    if (chosen) return;
    // Remember where the phone is, so the details page can grow out of it.
    const body = document.querySelector<HTMLElement>(`[data-cell] [data-asset-slug="${slug}"] .cvp-body`);
    const r = body?.getBoundingClientRect();
    // A phone you are pointing at is lifted 8px. Measure it where it rests, so the details
    // page grows out of, and shrinks back into, the exact same place.
    const lift = body ? new DOMMatrix(getComputedStyle(body).transform).m42 : 0;
    if (r) {
      phoneFlight.set({ slug, rect: { left: r.left, top: r.top - lift, width: r.width, height: r.height } });
    }
    setChosen(slug);
    activePhone.set(slug);
    // Let the blur settle for a moment, then go.
    pushTimer.current = window.setTimeout(() => router.push(`/asset/${slug}`, { scroll: false }), 450);
  }


  /** Lets the blur go and puts the chosen phone back in the grid. */

  function release() {
    window.clearTimeout(pushTimer.current);
    const el = veil.current;
    if (!el) {
      setChosen(null);
      return;
    }
    gsap.to(el, { autoAlpha: 0, duration: 0.35, ease: "power2.in", onComplete: () => setChosen(null) });
  }

  // The real counts, read from the database when the home page opens and every time
  // you come back to it from a details page...
  useEffect(() => {

    if (pathname === "/") void refreshStats();
  }, [pathname]);

  // ...and when you come back to the browser tab.
  useEffect(() => {
    const onShow = () => {
      if (document.visibilityState === "visible") void refreshStats();
    };
    document.addEventListener("visibilitychange", onShow);
    window.addEventListener("focus", onShow);
    return () => {
      document.removeEventListener("visibilitychange", onShow);
      window.removeEventListener("focus", onShow);
    };
  }, []);

  // Back on the home page after a details page: let the blur go.
  useEffect(() => {
    if (pathname === "/" && chosen) release();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // While a phone is chosen: the veil fades in, the page stops scrolling and Escape lets go.
  useEffect(() => {
    const el = veil.current;
    if (!chosen || !el) return;
    const html = document.documentElement;
    html.style.overflow = "hidden";
    gsap.fromTo(el, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.45, ease: "power2.out" });
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") release();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      html.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chosen]);

  // The phones on the current page rise in whenever the page or the sort changes.
  useGSAP(
    () => {
      const cells = gsap.utils.toArray<HTMLElement>("[data-cell]");
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          cells,
          { autoAlpha: 0, y: 50, scale: 0.97 },
          { autoAlpha: 1, y: 0, scale: 1, duration: 0.8, ease: "power3.out", stagger: 0.07 },
        );
      });
    },
    { scope: grid, dependencies: [key], revertOnUpdate: true },
  );


    return (
    <div>
      {chosen ? (
        <div
          ref={veil}
          aria-hidden="true"
          onClick={release}
          className="fixed inset-0 z-[65] cursor-zoom-out bg-bg/40 opacity-0 backdrop-blur-xl"
        />
      ) : null}
      <div className="flex flex-wrap items-end justify-between gap-6">
        <h2 className="text-3xl md:text-5xl">Explore the kit</h2>
        <div role="tablist" aria-label="Sort effects" className="flex flex-wrap gap-3">
          {SORTS.map((s) => {
            const on = s.key === sort;
            return (
              <button
                key={s.key}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => choose(s.key)}
                className={
                  on
                    ? "btn-gold px-5! py-2.5! text-sm"
                    : "clay inline-flex items-center gap-2 rounded-full! px-5 py-2.5 text-sm font-bold text-ink-dim transition-colors hover:text-ink"
                }
              >
                <Icon icon={s.icon} width={18} />
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      <div ref={grid} className="mt-12 grid grid-cols-2 gap-x-4 gap-y-14 md:grid-cols-4 md:gap-x-10">
        {visible.map((a) => (
          <div
            key={a.slug}
            data-cell
            data-chosen={chosen === a.slug ? "" : undefined}
            data-flying={chosen === a.slug && onAsset ? "" : undefined}
            className="mx-auto w-full max-w-[320px]"
          >
            <Phone
              slug={a.slug}
              name={a.name}
              views={a.views}
              copies={a.copies}
              likes={a.likes}
              onOpen={() => open(a.slug)}
            >
              <FlutterPreview slug={a.slug} />
            </Phone>
          </div>
        ))}
      </div>

      {pages > 1 ? (
        <nav aria-label="Pages" className="mt-16 flex items-center justify-center gap-3">
          <svg width="0" height="0" aria-hidden="true" focusable="false" className="absolute">
            <filter id="fur-edge" x="-15%" y="-15%" width="130%" height="130%" colorInterpolationFilters="sRGB">
              <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" seed="7" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="6" xChannelSelector="R" yChannelSelector="G" />
            </filter>
          </svg> 
        <button
            type="button"
            aria-label="Previous page"
            disabled={current === 1}
            onClick={() => goTo(current - 1)}
               className="clay grid size-11 place-items-center rounded-full! text-ink-dim disabled:opacity-40"
            >
            <Icon icon="solar:alt-arrow-left-bold" width={18} />
          </button>
          {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              aria-current={n === current ? "page" : undefined}
              onClick={() => goTo(n)}
              className={
                n === current
                  ? "fur fur-gold grid size-12 place-items-center text-xl font-bold"
                  : "fur grid size-12 place-items-center text-xl font-bold text-ink-dim hover:text-ink"
              }
            >
              {n}
            </button>
          ))}
          <button
            type="button"
            aria-label="Next page"
            disabled={current === pages}
            onClick={() => goTo(current + 1)}
            className="clay grid size-11 place-items-center rounded-full! text-ink-dim disabled:opacity-40"
          >
            <Icon icon="solar:alt-arrow-right-bold" width={18} />
          </button>
        </nav>
      ) : null}
    </div>
  );
}