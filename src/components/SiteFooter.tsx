"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import MohairFur, { type Run } from "./fur/MohairFur";
import { useFurPalette } from "./fur/useFurPalette";

/** Swap in your portfolio link when it is ready. A full https:// address opens in a new tab. */
const PORTFOLIO_URL = "https://helix-3zcg.onrender.com/";
const external = /^https?:\/\//i.test(PORTFOLIO_URL);

const FONT = { fontFamily: "Syne", fontWeight: 800 };
/** Room above the fur for its hairs. The footer reaches this far up, empty and see-through. */
const TOP = 96;

const NAV = [
  { label: "Home", href: "/" },
  { label: "Terms", href: "/terms" },
  { label: "Privacy policy", href: "/privacy" },
];
const SENTENCE = "cocoverse-ui is actively maintained by coconut studios";
const SENTENCE_LINES = ["cocoverse-ui is actively", "maintained by coconut studios"];

type Layout = { height: number; px: number; split: boolean };

function layoutFor(width: number): Layout {
  if (width >= 820) return { height: 150, px: 18, split: false };
  return { height: 196, px: 14, split: true };
}

/** Without WebGL2 there is no fur to carry the words, so they show as ordinary text. */
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

export function SiteFooter() {
  const pal = useFurPalette();
  const hasGL = useWebGL2();
  const footerRef = useRef<HTMLElement>(null);
  const areaRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(1440);
  const [runs, setRuns] = useState<Run[]>([]);
  // Read after the page opens: the current time cannot be read while it is prerendered.
  const [year, setYear] = useState<number | null>(null);
  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);
  const layout = layoutFor(width);

  useEffect(() => {
    const el = footerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setWidth(Math.round(entry.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // The links are laid out by the page. Each piece of text is measured and dyed into the fur
  // at the same spot, so the words you see are exactly where the links are.
  const measure = useCallback(() => {
    const area = areaRef.current;
    const overlay = overlayRef.current;
    if (!area || !overlay) return;
    const a = area.getBoundingClientRect();
    const cx = a.left + a.width / 2;
    const cy = a.top + a.height / 2;
    const next: Run[] = Array.from(overlay.querySelectorAll<HTMLElement>("[data-run]")).map((el) => {
      const r = el.getBoundingClientRect();
      return {
        text: el.textContent ?? "",
        x: Math.round((r.left + r.width / 2 - cx) * 2) / 2,
        y: Math.round((r.top + r.height / 2 - cy) * 2) / 2,
        underline: el.hasAttribute("data-underline"),
      };
    });
    setRuns((prev) => (JSON.stringify(prev) === JSON.stringify(next) ? prev : next));
  }, []);

  useEffect(() => {
    measure();
    document.fonts?.ready.then(measure);
  }, [measure, pal, width, year, layout.height, layout.px, layout.split]);
    const textColor = hasGL ? "text-transparent" : "text-ink";
  const linkCls = `pointer-events-auto inline-block py-1 ${textColor} focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold`;

  return (
    <footer
      ref={footerRef}
      style={{
        position: "relative",
        overflow: "clip",
        marginTop: -TOP,
        paddingTop: TOP,
        pointerEvents: "none",
      }}
    >
      <div
        ref={areaRef}
        className={hasGL ? "" : "bg-surface-1"}
        style={{ position: "relative", height: layout.height }}
      >
        {pal ? (
          <MohairFur
            fixed
            decorative
            background="transparent"
            label=""
            runs={runs}
            buttonWidth={width + 160}
            buttonHeight={layout.height + 56}
            radius={40}
            furColor={pal.slab.fur}
            tipColor={pal.slab.tip}
            textColor={pal.ink}
            furLength={5}
            sway={0}
            font={{ ...FONT, fontSize: `${layout.px}px` }}
            advanced={{ shadow: 0, glow: 0 }}
            style={{ width: "100%", height: layout.height, overflow: "visible", pointerEvents: "auto" }}
          >
            <div
              ref={overlayRef}
              className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center"
              style={{ fontSize: layout.px, fontWeight: 800, lineHeight: 1.4 }}
            >
              <nav aria-label="Footer" className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1">
                {NAV.map((item) => (
                  <Link key={item.href} href={item.href} data-run="" className={linkCls}>
                    {item.label}
                  </Link>
                ))}
                <span data-run="" suppressHydrationWarning className={`inline-block py-1 ${textColor}`}>
                  © {year ?? ""}
                </span>
              </nav>
              <p className={`m-0 ${textColor}`}>
                {layout.split ? (
                  SENTENCE_LINES.map((line) => (
                    <span key={line} data-run="" className="block">
                      {line}
                    </span>
                  ))
                ) : (
                  <span data-run="" className="block">
                    {SENTENCE}
                  </span>
                )}
              </p>

              <a
                href={PORTFOLIO_URL}
                data-run=""
                data-underline=""
                {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                 className={linkCls}
               >
                @CoCoNuT-sTuDiOs
              </a>
            </div>
          </MohairFur>
        ) : null}
      </div>
    </footer>
  );
}

