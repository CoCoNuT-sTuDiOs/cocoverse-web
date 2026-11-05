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

  // Phones never render the stone, so its code is never even downloaded.
  useEffect(() => {
    const query = window.matchMedia("(min-width: 768px)");
    const update = () => setWide(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  if (!wide) return null;
  return <EmberHusk quality={touch ? "low" : "high"} style={{ background: "transparent" }} />;
}
