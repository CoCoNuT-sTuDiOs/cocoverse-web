"use client";

import { useLayoutEffect, useRef } from "react";
import { activePhone } from "@/lib/activePhone";
import { enqueueView, loadFlutter } from "@/lib/flutterEngine";
import { useTouchOnly } from "@/lib/useTouchOnly";

/** The live effect in the details page's phone.
 *  If the home grid is already running this effect, that very view is moved in
 *  here and handed back on the way out. A page opened directly starts its own. */
export function HeroPreview({ slug }: { slug: string }) {
  const box = useRef<HTMLDivElement>(null);
  const touch = useTouchOnly();

  useLayoutEffect(() => {
    const target = box.current;
    if (!target) return;
    let cancelled = false;
    let ownId: number | null = null;
    let offReady: (() => void) | null = null;
    const extras: HTMLElement[] = [];

    const live = document.querySelector<HTMLElement>(
      `[data-cell] [data-phone-screen="${slug}"] .cvp-host`,
    );
    const home = live?.parentElement ?? null;

    if (live) {
      target.appendChild(live);
      activePhone.hold(slug);
      activePhone.set(slug);
    } else {
      const mine = document.createElement("div");
      mine.className = "cvp-host";
      mine.style.opacity = "0";
      const poster = document.createElement("div");
      poster.className = "cvp-poster";
      target.append(mine, poster);
      extras.push(mine, poster);

      const onReady = (event: Event) => {
        const id = ownId;
        if (id === null || (event as CustomEvent<number>).detail !== id) return;
        mine.style.opacity = "1";
        poster.remove();
        window.cocoverseSetActive?.(id, true);
      };
      window.addEventListener("cocoverse-view-ready", onReady);
      offReady = () => window.removeEventListener("cocoverse-view-ready", onReady);

      enqueueView(async () => {
        const app = await loadFlutter();
        if (cancelled) return;
        ownId = app.addView({ hostElement: mine, initialData: { slug, low: touch } });
      }).catch((error) => console.error("[cocoverse] could not start", slug, error));
    }

    return () => {
      cancelled = true;
      offReady?.();
      if (live) {
        activePhone.hold(null);
        activePhone.set(null);
        if (home?.isConnected) home.prepend(live);
      } else {
        if (ownId !== null) window.__cocoverseFlutter?.removeView(ownId);
        extras.forEach((el) => el.remove());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  return <div ref={box} className="absolute inset-0" />;
}