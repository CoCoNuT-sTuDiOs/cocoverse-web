"use client";

import { Icon } from "@iconify/react";
import { useEffect, useRef, useState } from "react";
import { activePhone, useActivePhone } from "@/lib/activePhone";
import { enqueueView, loadFlutter } from "@/lib/flutterEngine";
import { useInView } from "@/lib/useInView";
import { useTouchOnly } from "@/lib/useTouchOnly";
import { PreviewPoster } from "./PreviewPoster";
import "./phone.css";

/** How long after the last touch an awake phone goes back to sleep. */
const IDLE_MS = 2500;
const LEAVE_MS = 1200;
const TOUCH_AWAKE_MS = 7000;

/** The live effect inside a phone screen: one view of the shared Flutter engine. */
export function FlutterPreview({ slug }: { slug: string }) {
  const touch = useTouchOnly();
  const [wrapRef, near] = useInView<HTMLDivElement>("300px 0px");
  const hostRef = useRef<HTMLDivElement>(null);
  const idRef = useRef<number | null>(null);
  const started = useRef(false);
  const timer = useRef(0);
  const [viewId, setViewId] = useState<number | null>(null);
  const [ready, setReady] = useState(false);
  const active = useActivePhone() === slug;

  // Add this phone's view the first time it comes near the screen.
  useEffect(() => {
    if (!near || started.current) return;
    started.current = true;
    enqueueView(async () => {
      const app = await loadFlutter();
      const host = hostRef.current;
      if (!host || !host.isConnected) {
        started.current = false;
        return;
      }
      const id = app.addView({ hostElement: host, initialData: { slug, low: touch } });
      idRef.current = id;
      setViewId(id);
    }).catch((error) => {
      started.current = false;
      console.error("[cocoverse] could not start", slug, error);
    });
  }, [near, slug, touch]);

  // Give the view back when the phone leaves the page.
  useEffect(
    () => () => {
      window.clearTimeout(timer.current);
      const id = idRef.current;
      if (id !== null) {
        window.__cocoverseFlutter?.removeView(id);
        idRef.current = null;
      }
    },
    [],
  );

  // Flutter says when the phone has had its two-second warm-up.
  useEffect(() => {
    if (viewId === null) return;
    const onReady = (event: Event) => {
      if ((event as CustomEvent<number>).detail === viewId) setReady(true);
    };
    window.addEventListener("cocoverse-view-ready", onReady);
    return () => window.removeEventListener("cocoverse-view-ready", onReady);
  }, [viewId]);

  // Wake or sleep the Flutter side.
  useEffect(() => {
    if (viewId === null) return;
    window.cocoverseSetActive?.(viewId, active);
  }, [viewId, active]);

  function sleepAfter(ms: number) {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
            if (activePhone.get() === slug && !activePhone.isHeld(slug)) activePhone.set(null);
    }, ms);
  }

  // An awake phone goes back to sleep once the user stops interacting.
  useEffect(() => {
    if (active) sleepAfter(touch ? TOUCH_AWAKE_MS : IDLE_MS);
    else window.clearTimeout(timer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, touch]);

  // ...or when it is scrolled away.
  useEffect(() => {
    if (active && !near) activePhone.set(null);
  }, [active, near]);

  function poke() {
    if (active) sleepAfter(IDLE_MS);
  }

  return (
    <div
      ref={wrapRef}
      className="absolute inset-0"
      onPointerMove={poke}
      onPointerDown={poke}
      onPointerUp={poke}
      onWheel={poke}
      onPointerLeave={() => {
        if (active) sleepAfter(LEAVE_MS);
      }}
    >
      <div ref={hostRef} className="cvp-host" style={{ opacity: ready ? 1 : 0 }} />
      {!ready ? <PreviewPoster /> : null}
      {ready && !active ? (
        <button
          type="button"
          className="cvp-wake"
          aria-label={`Play the ${slug} preview`}
          onClick={() => activePhone.set(slug)}
        />
      ) : null}
      {ready && !active ? (
        <span className="cvp-play" aria-hidden="true">
          <Icon icon="solar:play-bold" />
        </span>
      ) : null}
    </div>
  );
}