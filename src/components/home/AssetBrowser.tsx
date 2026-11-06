"use client";

import { useGSAP } from "@gsap/react";
import { Icon } from "@iconify/react";
import gsap from "gsap";
import { useEffect, useMemo, useRef, useState } from "react";
import { FlutterPreview } from "@/components/phone/FlutterPreview";
import { Phone } from "@/components/phone/Phone";
import { activePhone } from "@/lib/activePhone";
import { type Asset, type SortKey, SORTS, sortAssets } from "@/lib/assets";
import { useTouchOnly } from "@/lib/useTouchOnly";

gsap.registerPlugin(useGSAP);

const PER_PAGE_DESKTOP = 8;
const PER_PAGE_MOBILE = 4;

export function AssetBrowser({ assets }: { assets: Asset[] }) {
  const touch = useTouchOnly();
  const grid = useRef<HTMLDivElement>(null);
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
  const sorted = useMemo(() => sortAssets(assets, sort), [assets, sort]);
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
    // On a touch screen the first tap wakes the phone and the second opens it.
    if (touch && activePhone.get() !== slug) {
      activePhone.set(slug);
      return;
    }
    console.log("open", slug); // the asset page comes next
  }

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
          <div key={a.slug} data-cell className="mx-auto w-full max-w-[320px]">
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