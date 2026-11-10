"use client";

import { useEffect, useState } from "react";

type RGB = [number, number, number];

export type FurPalette = {
  ink: string;
  gold: string;
  light: boolean;
  /** The four inks the hero art is drawn in. */
  art: { brown: string; cream: string; gold: string; pink: string };
  slab: { fur: string; tip: string };
  pill: { fur: string; tip: string };
};

const mix = (a: RGB, b: RGB, t: number): RGB => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
];
const css = (c: RGB) => `rgb(${Math.round(c[0] * 255)}, ${Math.round(c[1] * 255)}, ${Math.round(c[2] * 255)})`;

function compute(): FurPalette {
  const probe = document.createElement("span");
  probe.style.cssText = "position:absolute;visibility:hidden;pointer-events:none";
  document.body.appendChild(probe);
  const read = (token: string): RGB => {
    probe.style.color = `var(${token})`;
    const m = getComputedStyle(probe).color.match(/[\d.]+/g);
    return m && m.length >= 3 ? [+m[0] / 255, +m[1] / 255, +m[2] / 255] : [0.5, 0.5, 0.5];
  };
  const bg = read("--bg");
  const s1 = read("--surface-1");
  const s2 = read("--surface-2");
  const ink = read("--ink");
  const gold = read("--gold-text");
  const goldDeep = read("--gold-deep");
  const coral = read("--coral");
  probe.remove();

  const light = document.documentElement.dataset.theme === "light";
  const white: RGB = [1, 1, 1];
  const slab = light ? mix(bg, s2, 0.35) : mix(s2, ink, 0.12);
  const slabTip = light ? mix(slab, white, 0.6) : mix(slab, ink, 0.3);
  const pill = light ? mix(s2, ink, 0.12) : mix(s1, ink, 0.06);
  const pillTip = light ? mix(pill, white, 0.5) : mix(pill, ink, 0.3);
  const dark = light ? ink : bg;
  const art = {
    brown: css(mix(dark, goldDeep, 0.35)),
    cream: css(light ? mix(bg, white, 0.6) : ink),
    gold: css(gold),
    pink: css(mix(coral, white, 0.45)),
  };

  return {
    light,
    art,
    ink: css(ink),
    gold: css(gold),
    slab: { fur: css(slab), tip: css(slabTip) },
    pill: { fur: css(pill), tip: css(pillTip) },
  };
}

/** Fur colours from the page's own tokens. Null until the page has mounted. */
export function useFurPalette(): FurPalette | null {
  const [palette, setPalette] = useState<FurPalette | null>(null);

  useEffect(() => {
    const read = () => setPalette(compute());
    read();
    const watcher = new MutationObserver(read);
    watcher.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => watcher.disconnect();
  }, []);

  return palette;
}