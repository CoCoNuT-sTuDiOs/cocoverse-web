"use client";

import { useGSAP } from "@gsap/react";
import { Icon } from "@iconify/react";
import gsap from "gsap";
import { useRouter } from "next/navigation";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { Phone } from "@/components/phone/Phone";
import type { Asset } from "@/lib/assets";
import { phoneFlight } from "@/lib/flight";
import { CopyCode } from "./CopyCode";
import { HeroPreview } from "./HeroPreview";

gsap.registerPlugin(useGSAP);

type Props = {
  asset: Asset;
  summary?: string;
  getCode?: string;
  /** True when it opens over the grid; false when the page was opened directly. */
  modal?: boolean;
  children: ReactNode;
};

export function DetailShell({ asset, summary, getCode, modal = false, children }: Props) {
  const router = useRouter();
  const root = useRef<HTMLDivElement>(null);
  const bg = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
    const tl = useRef<gsap.core.Timeline | null>(null);
  const [live, setLive] = useState(true);

  // The live 3D only runs while the phone is on screen. Scrolled away, it is unmounted.
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setLive(entry.isIntersecting), {
      root: modal ? root.current : null,
      rootMargin: "200px 0px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, [modal]);

  // The phone grows out of its place on the grid; the page fades in under it.
  useGSAP(
    () => {
      const host = root.current;
      const ph = stage.current;
      if (!host || !ph) return;
      const text = Array.from(host.querySelectorAll<HTMLElement>("[data-hero-text]"));
            const flight = modal ? phoneFlight.get(asset.slug) : null;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (!flight || reduced) {

      gsap.fromTo(text, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.08, ease: "power3.out" });
        return;
      }

      const to = ph.getBoundingClientRect();
      const s = flight.rect.width / to.width;
      const dx = flight.rect.left + flight.rect.width / 2 - (to.left + to.width / 2);
      const dy = flight.rect.top + flight.rect.height / 2 - (to.top + to.height / 2);

      const t = gsap.timeline();
      t.set(ph, { x: dx, y: dy, scale: s, transformOrigin: "50% 50%" });
      if (bg.current) {
        t.fromTo(bg.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5, ease: "power2.out" }, 0.05);
      }
      t.to(ph, { x: 0, y: 0, scale: 1, duration: 1, ease: "expo.inOut" }, 0).fromTo(
        text,
        { autoAlpha: 0, y: 36 },
        { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.08, ease: "power3.out" },
        0.55,
      );
      tl.current = t;
    },
    { scope: root, dependencies: [] },
  );

  function close() {
    if (!modal) {
      router.push("/");
      return;
    }
    const finish = () => {
      phoneFlight.clear();
      router.back();
    };
    const t = tl.current;
    if (!t || t.progress() === 0) {
      finish();
      return;
    }
    if (root.current) root.current.scrollTop = 0;
    t.eventCallback("onReverseComplete", finish).timeScale(1.5).reverse();
  }

  const closeRef = useRef(close);
  closeRef.current = close;

  // Escape goes back. Captured first, so the grid's own Escape handler stays out of it.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.stopImmediatePropagation();
      closeRef.current();
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, []);

  return (
        <div ref={root} className={modal ? "fixed inset-0 z-[80] overflow-y-auto overscroll-contain" : "relative isolate"}>
      <div ref={bg} aria-hidden="true" className="pelt" />
      <div className="mx-auto flex max-w-[1400px] items-center px-6 py-6">
        <button
          type="button"
          onClick={close}
          className="clay inline-flex items-center gap-2 rounded-full! px-5 py-2.5 text-sm font-bold text-ink-dim transition-colors hover:text-ink"
        >
          <Icon icon="solar:alt-arrow-left-bold" width={18} />
          All effects
        </button>
      </div>

      <section className="mx-auto grid max-w-[1400px] items-center gap-12 px-6 pb-20 md:min-h-[calc(100svh-6rem)] md:grid-cols-2">
        <div className="order-2 md:order-1">
          <h1 data-hero-text className="text-5xl md:text-7xl">
            {asset.name}
          </h1>
          {summary ? (
            <p data-hero-text className="mt-6 max-w-xl text-lg font-semibold text-ink">
          {summary}
            </p>
          ) : null}
          {getCode ? (
            <div data-hero-text className="mt-8">
              <CopyCode code={getCode} />
            </div>
          ) : null}
        </div>

        <div className="order-1 flex justify-center md:order-2">
          <div ref={stage} style={{ width: "min(340px, 44svh)" }}>
            <Phone
              slug={asset.slug}
              name={asset.name}
              views={asset.views}
              copies={asset.copies}
              likes={asset.likes}
              onOpen={close}
            >
              {live ? <HeroPreview slug={asset.slug} /> : null}
            </Phone>
          </div>
        </div>
      </section>

        <section className="docs-carve mx-auto max-w-[1100px] px-6 pb-32">{children}</section>
    </div>
  );
}