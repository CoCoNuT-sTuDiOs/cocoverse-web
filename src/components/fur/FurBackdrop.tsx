"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Art } from "../../lib/furArt";
import MohairFur, { type Run } from "./MohairFur";
import { useFurPalette } from "./useFurPalette";

/** How long the hairs grow in CSS px, so the fur looks the same however tall the section is. */
const HAIR_PX = 45;
/** Lock length at Fur Length 1, in button heights: the mohair constants 0.06 + 0.032. */
const LOCK_AT_ONE = 0.092;

function useWebGL2(): boolean {
  const [ok, setOk] = useState(true);
  useEffect(() => {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2");
    setOk(!!gl);
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
  }, []);
  return ok;
}

/**
 * Fur behind a whole section, reaching up behind the header too. Every element in the section marked
 * data-run is measured and its text is dyed into the fur where it sits (data-run-alt: in gold). An element
 * marked data-art is where the drawing goes. The real text stays in the page.
 */
export function FurBackdrop() {
  const hasGL = useWebGL2();
  const pal = useFurPalette();
  const areaRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 1440, h: 700 });
  const [above, setAbove] = useState(0);
  const [runs, setRuns] = useState<Run[]>([]);
  const [art, setArt] = useState<Art | undefined>(undefined);

  const active = hasGL && !!pal;

  useEffect(() => {
    const el = areaRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) =>
      setSize({ w: Math.round(entry.contentRect.width), h: Math.round(entry.contentRect.height) }),
    );
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const measure = useCallback(() => {
    const area = areaRef.current;
    const section = area?.closest("section");
    if (!area || !section || !pal) return;

    // How far the fur reaches up to cover the header. The pin spacer keeps its place while the hero is pinned.
    const host = section.parentElement?.classList.contains("pin-spacer") ? section.parentElement : section;
    setAbove(Math.max(0, Math.round(host.getBoundingClientRect().top + window.scrollY)));

    const a = area.getBoundingClientRect();
    const cx = a.left + a.width / 2;
    const cy = a.top + a.height / 2;
    const inkTone = pal.light ? 0 : 1;

    const next: Run[] = [];
    section.querySelectorAll<HTMLElement>("[data-run]").forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return;
      const cs = getComputedStyle(el);
      next.push({
        text: el.textContent ?? "",
        x: Math.round((r.left + r.width / 2 - cx) * 2) / 2,
        y: Math.round((r.top + r.height / 2 - cy) * 2) / 2,
        size: parseFloat(cs.fontSize),
        weight: parseInt(cs.fontWeight, 10) || 800,
        family: cs.fontFamily,
        tone: el.hasAttribute("data-run-alt") ? 2 : inkTone,
      });
    });
    setRuns((prev) => (JSON.stringify(prev) === JSON.stringify(next) ? prev : next));

    const slot = section.querySelector<HTMLElement>("[data-art]");
    const sr = slot?.getBoundingClientRect();
    const nextArt: Art | undefined =
      sr && sr.width > 0
        ? {
            id: "kitten",
            x: Math.round(sr.left + sr.width / 2 - cx),
            y: Math.round(sr.top + sr.height / 2 - cy),
            w: Math.round(sr.width),
            h: Math.round(sr.height),
          }
        : undefined;
    setArt((prev) => (JSON.stringify(prev) === JSON.stringify(nextArt) ? prev : nextArt));
  }, [pal]);

  useEffect(() => {
    if (!active) return;
    measure();
    document.fonts?.ready.then(measure);
  }, [active, measure, size.w, size.h]);

  // The real text turns see-through, and the header's own background steps aside, once the fur is there.
  const ready = runs.length > 0 || !!art;
  useEffect(() => {
    const section = areaRef.current?.closest("section");
    if (!active || !section || !ready) return;
    const html = document.documentElement;
    const timer = window.setTimeout(() => {
      section.setAttribute("data-fur-hero", "on");
      html.setAttribute("data-fur-top", "");
    }, 700);
    return () => {
      window.clearTimeout(timer);
      section.removeAttribute("data-fur-hero");
      html.removeAttribute("data-fur-top");
    };
  }, [active, ready]);

  const buttonHeight = size.h + 56;

  return (
    <div
      ref={areaRef}
      aria-hidden="true"
      className="absolute inset-x-0 bottom-0 overflow-clip"
      style={{
        top: -above,
        zIndex: -1,
        pointerEvents: "none",
        opacity: ready ? 1 : 0,
        transition: "opacity 0.6s ease",
      }}
    >
      {active && pal ? (
        <MohairFur
          fixed
          decorative
          background="transparent"
          label=""
          runs={runs}
          art={art}
          buttonWidth={size.w + 160}
          buttonHeight={buttonHeight}
          radius={40}
          furColor={pal.slab.fur}
          tipColor={pal.slab.tip}
          textColor="#000000"
          inks={["#ffffff", pal.art.gold, "#1ea7ff"]}
          furLength={1}
          hairScale={HAIR_PX / (LOCK_AT_ONE * buttonHeight)}
          bleed={0.25}
          sway={0}
          font={{ fontFamily: "Syne", fontWeight: 800, fontSize: "18px" }}
          advanced={{ shadow: 0, glow: 0, lockSize: 1.8 }}
          style={{ width: "100%", height: "100%", overflow: "visible", pointerEvents: "auto" }}
        />
      ) : null}
    </div>
  );
}