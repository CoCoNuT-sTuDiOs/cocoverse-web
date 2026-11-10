"use client";

import { Icon } from "@iconify/react";
import gsap from "gsap";
import { useRouter } from "next/navigation";
import { type ReactNode, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Phone } from "@/components/phone/Phone";
import type { Asset } from "@/lib/assets";
import { phoneFlight } from "@/lib/flight";
import { liveStats, useLiveStats } from "@/lib/liveStats";
import { countCopy, countHeart, countView, shouldAskHeart } from "@/lib/statsClient";
import { CopyCode } from "./CopyCode";
import { HeartPrompt } from "./HeartPrompt";
import { HeroPreview } from "./HeroPreview";
import { SiteFooter } from "../SiteFooter";
import { hideLiveUntilSettled } from "@/lib/settleLive";


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
  const closing = useRef(false);
  const askTimer = useRef(0);
  const base = { views: asset.views, copies: asset.copies, likes: asset.likes };
  const counts = useLiveStats()[asset.slug] ?? base;
  const [asking, setAsking] = useState(false);

  // Opening the page counts as one view per visitor session.
  useEffect(() => {
        if (countView(asset.slug)) liveStats.bump(asset.slug, "views", base);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [asset.slug]);

  function handleCopied() {
    if (countCopy(asset.slug)) liveStats.bump(asset.slug, "copies", base);
    // Every copy of an asset you have not hearted asks again.
    if (shouldAskHeart(asset.slug)) {
      window.clearTimeout(askTimer.current);
      askTimer.current = window.setTimeout(() => setAsking(true), 450);
    }
  }

  function later() {
    setAsking(false);
  }

  function heart() {
    setAsking(false);
    if (countHeart(asset.slug)) liveStats.bump(asset.slug, "likes", base);
  }

  useEffect(() => () => window.clearTimeout(askTimer.current), []);
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


  // How far the entrance had got when this effect last stopped. Next can start the effect
  // again after the page is already showing, and it must carry on from there, not replay.
  const resumeAt = useRef(0);

  // The phone grows out of its place on the grid; the page fades in under it.
  // The timeline is built outside any GSAP context on purpose: when the page goes
  // away, nothing resets the phone's position while it is still on screen.
  useLayoutEffect(() => {
    closing.current = false;
    const host = root.current;
    const ph = stage.current;
    if (!host || !ph) return;

    // Start from the natural position, whatever an earlier run left behind.
    gsap.set(ph, { clearProps: "transform" });

    const text = Array.from(host.querySelectorAll<HTMLElement>("[data-hero-text]"));
    const flight = modal ? phoneFlight.get(asset.slug) : null;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!flight || reduced) {
      if (resumeAt.current > 0) {
        gsap.set(text, { autoAlpha: 1, y: 0 });
        return;
      }
      resumeAt.current = 1;
      const t = gsap.fromTo(
        text,
        { autoAlpha: 0, y: 24 },
        { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.08, ease: "power3.out" },
      );
      return () => {
        t.kill();
      };
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
    // Carry on from where the last run stopped, instead of starting over.
    if (resumeAt.current > 0) t.progress(resumeAt.current);
    tl.current = t;

    return () => {
      resumeAt.current = Math.max(resumeAt.current, t.progress());
      t.kill();
      tl.current = null;
    };
  }, [asset.slug, modal]);

  function close() {
    if (closing.current) return;
    closing.current = true;

    if (!modal) {
      router.push("/");
      return;
    }

    const finish = () => {
            hideLiveUntilSettled(stage.current);
      phoneFlight.clear();
      router.back();
    };
    const t = tl.current;
    if (!t || t.progress() === 0) {
      finish();
      return;
    }

    // If the page is scrolled, glide back to the top first, so the phone has a place to fly from.
    const el = root.current;
    const scrolled = !!el && el.scrollTop > 4;
    if (el && scrolled) el.scrollTo({ top: 0, behavior: "smooth" });
    window.setTimeout(
      () => {
        t.eventCallback("onReverseComplete", finish).timeScale(1.5).reverse();
      },
      scrolled ? 420 : 0,
    );
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
              <CopyCode code={getCode} onCopied={handleCopied} />
            </div>
          ) : null}
        </div>

        <div className="order-1 flex justify-center md:order-2">
          <div ref={stage} style={{ width: "min(340px, 44svh)", willChange: "transform" }}>
            <Phone
              slug={asset.slug}
              name={asset.name}
              views={counts.views}
              copies={counts.copies}
              likes={counts.likes}
              onOpen={close}
            >
              {live ? <HeroPreview slug={asset.slug} /> : null}
            </Phone>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1100px] px-6 pb-32">{children}</section>
       {modal ? <SiteFooter /> : null}
      <HeartPrompt open={asking} name={asset.name} onLater={later} onHeart={heart} />
    </div>
  );
}