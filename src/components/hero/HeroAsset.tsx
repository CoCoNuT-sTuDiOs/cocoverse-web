"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useTouchOnly } from "@/lib/useTouchOnly";

const EmberHusk = dynamic(() => import("./EmberHusk"), {
  ssr: false,
  loading: () => null,
});

/** The big live asset in the hero. */
export function HeroAsset() {
  const touch = useTouchOnly();
  const [wide, setWide] = useState(false);
  const [ready, setReady] = useState(false);

  // The stone waits until the page itself has finished loading, so its
  // download never competes with the text and the first paint.
  useEffect(() => {
    let timer = 0;
    const go = () => {
      timer = window.setTimeout(() => setReady(true), 400);
    };
    if (document.readyState === "complete") go();
    else window.addEventListener("load", go, { once: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("load", go);
    };
  }, []);

  // Phones never render the stone, so its code is never even downloaded.
  useEffect(() => {
    const query = window.matchMedia("(min-width: 768px)");
    const update = () => setWide(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

if (!wide || !ready) return null;
  return <EmberHusk size={1} quality={touch ? "low" : "high"} style={{ background: "transparent" }} />;
}
