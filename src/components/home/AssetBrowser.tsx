"use client";

import { useGSAP } from "@gsap/react";
import { Icon } from "@iconify/react";
import gsap from "gsap";
import { Flip } from "gsap/Flip";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { Phone } from "@/components/phone/Phone";
import { PreviewPlaceholder } from "@/components/phone/PreviewPlaceholder";
import { type Asset, type SortKey, SORTS, sortAssets } from "@/lib/assets";

gsap.registerPlugin(useGSAP, Flip, ScrollTrigger);

export function AssetBrowser({ assets }: { assets: Asset[] }) {
  const [sort, setSort] = useState<SortKey>("recent");
  const grid = useRef<HTMLDivElement>(null);
  const flipState = useRef<ReturnType<typeof Flip.getState> | null>(null);

  const rank = useMemo(() => {
    const map = new Map<string, number>();
    sortAssets(assets, sort).forEach((a, i) => map.set(a.slug, i));
    return map;
  }, [assets, sort]);

  function choose(next: SortKey) {
    if (next === sort) return;
    if (grid.current) {
      flipState.current = Flip.getState(grid.current.querySelectorAll("[data-cell]"));
    }
    setSort(next);
  }

  // After the new order is in place, glide every phone from where it was.
  useLayoutEffect(() => {
    const state = flipState.current;
    if (!state) return;
    flipState.current = null;
    Flip.from(state, { duration: 0.7, ease: "power3.inOut", stagger: 0.04 });
  }, [sort]);

  // Phones rise in as they come into view.
  useGSAP(
    () => {
      const cells = gsap.utils.toArray<HTMLElement>("[data-cell]");
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.set(cells, { autoAlpha: 0, y: 70, scale: 0.96 });
        ScrollTrigger.batch(cells, {
          start: "top 92%",
          once: true,
          onEnter: (batch) =>
            gsap.to(batch, {
              autoAlpha: 1,
              y: 0,
              scale: 1,
              duration: 0.9,
              ease: "power3.out",
              stagger: 0.08,
              overwrite: true,
            }),
        });
      });
    },
    { scope: grid },
  );

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-6">
        <h2 className="text-3xl md:text-5xl">Explore the kit</h2>
        <div role="tablist" aria-label="Sort effects" className="flex flex-wrap gap-3">
          {SORTS.map((s) => {
            const active = s.key === sort;
            return (
              <button
                key={s.key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => choose(s.key)}
                className={
                  active
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
        {assets.map((a) => (
          <div
            key={a.slug}
            data-cell
            style={{ order: rank.get(a.slug) ?? 0 }}
            className="mx-auto w-full max-w-[320px]"
          >
            <Phone
              slug={a.slug}
              name={a.name}
              views={a.views}
              copies={a.copies}
              likes={a.likes}
              onOpen={() => console.log("open", a.slug)}
            >
              <PreviewPlaceholder />
            </Phone>
          </div>
        ))}
      </div>
    </div>
  );
}