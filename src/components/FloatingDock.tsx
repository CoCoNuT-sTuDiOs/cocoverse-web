"use client";

import { Icon } from "@iconify/react";
import gsap from "gsap";
import { useRouter  } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

/** Scroll distance at which the logo is pulled into the button, and how close
 *  to the top the page must come back before the button lets it go again. */
const DOCK_AT = 8;
const UNDOCK_AT = 4;

/** One 48px button plus its 12px gap. */
const TRAY_WIDTH = 60;
export function FloatingDock() {
  const root = useRef<HTMLDivElement>(null);
  const openRef = useRef(false);
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const router = useRouter();

  // Keep the icons in step with the page's theme, whoever changed it.
  useEffect(() => {
    const read = () =>
      setTheme(document.documentElement.dataset.theme === "light" ? "light" : "dark");
    read();
    const watcher = new MutationObserver(read);
    watcher.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => watcher.disconnect();
  }, []);

  /** Opens or closes the bar. */
  const setTray = useCallback((next: boolean, instant = false) => {
    openRef.current = next;
    setOpen(next);
    const host = root.current;
    if (!host) return;
    const extra = host.querySelector("[data-dock-extra]");
    const pill = host.querySelector("[data-dock-pill]");
    if (!extra || !pill) return;
    if (instant) {
      gsap.set(extra, { width: next ? TRAY_WIDTH : 0, autoAlpha: next ? 1 : 0 });
      gsap.set(pill, { autoAlpha: next ? 1 : 0 });
      return;
    }
    if (next) {
      gsap.to(extra, { width: TRAY_WIDTH, autoAlpha: 1, duration: 0.55, ease: "back.out(1.5)", overwrite: true });
      gsap.to(pill, { autoAlpha: 1, duration: 0.3, overwrite: true });
    } else {
      gsap.to(extra, { width: 0, autoAlpha: 0, duration: 0.3, ease: "power3.in", overwrite: true });
      gsap.to(pill, { autoAlpha: 0, duration: 0.25, overwrite: true });
    }
  }, []);

  // A press outside the bar, or Escape, closes it.
  useEffect(() => {
    if (!open) return;
    const onDown = (event: PointerEvent) => {
      const dock = root.current?.querySelector("[data-dock]");
      if (dock && !dock.contains(event.target as Node)) setTray(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setTray(false);
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, setTray]);

  // The magnet animation.
  useEffect(() => {
    const host = root.current;
    if (!host) return;
    const html = document.documentElement;
    const logo = host.querySelector<HTMLElement>("[data-dock-logo]");
    const dock = host.querySelector<HTMLElement>("[data-dock]");
    const main = host.querySelector<HTMLElement>("[data-dock-main]");
    const themeIcon = host.querySelector<HTMLElement>("[data-dock-theme-icon]");
    const homeIcon = host.querySelector<HTMLElement>("[data-dock-home-icon]");
    if (!logo || !dock || !main || !themeIcon || !homeIcon) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let tl: gsap.core.Timeline | null = null;
    let docked = false;

    const handBack = () => {
      html.removeAttribute("data-docked");
      gsap.set([logo, dock], { autoAlpha: 0 });
    };

    /** Builds the whole trip with the header's positions as they are right
     *  now, so it always starts and ends on the real logo and button. */
    const build = () => {
      const headers = document.querySelectorAll<HTMLElement>("[data-hdr]");
      const logoBox = headers[0]?.getBoundingClientRect();
      const buttonBox = headers[1]?.getBoundingClientRect();

      gsap.set(dock, { x: 0, y: 0, scaleX: 1, scaleY: 1 });
      const t = gsap.timeline({ paused: true, onReverseComplete: handBack });

      if (!logoBox || !buttonBox) {
        // No header to fly from: the button just fades in as the home button.
        return t
          .fromTo(dock, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 }, 0)
          .fromTo(themeIcon, { autoAlpha: 0 }, { autoAlpha: 0, duration: 0.01 }, 0)
          .fromTo(homeIcon, { autoAlpha: 1, scale: 1, rotation: 0 }, { autoAlpha: 1, scale: 1, rotation: 0, duration: 0.01 }, 0);
      }

      const rest = dock.getBoundingClientRect();
      const bx = buttonBox.left + buttonBox.width / 2;
      const by = buttonBox.top + buttonBox.height / 2;
      const dx = bx - (rest.left + rest.width / 2);
      const dy = by - (rest.top + rest.height / 2);
      const lw = logo.offsetWidth;
      const lh = logo.offsetHeight;

      // 1. The logo is pulled into the button, faster and faster.
      t.fromTo(
        logo,
        { autoAlpha: 1, x: logoBox.left, y: logoBox.top, scale: 1, rotation: 0 },
        { autoAlpha: 0, x: bx - lw / 2, y: by - lh / 2, scale: 0.08, rotation: -14, duration: 0.38, ease: "power3.in" },
        0,
      );

      // 2. The button swallows it: a squash, and the sun turns into a house.
      t.fromTo(main, { scaleX: 1, scaleY: 1 }, { scaleX: 1.3, scaleY: 0.76, duration: 0.12, ease: "power2.out" }, 0.32)
        .fromTo(main, { scaleX: 1.3, scaleY: 0.76 }, { scaleX: 1, scaleY: 1, duration: 0.55, ease: "elastic.out(1, 0.4)" }, 0.44)
        .fromTo(themeIcon, { autoAlpha: 1, scale: 1, rotation: 0 }, { autoAlpha: 0, scale: 0.2, rotation: -120, duration: 0.2, ease: "power2.in" }, 0.4)
        .fromTo(homeIcon, { autoAlpha: 0, scale: 0.2, rotation: 120 }, { autoAlpha: 1, scale: 1, rotation: 0, duration: 0.45, ease: "back.out(2.4)" }, 0.48);

      // 3. It drops to the corner, stretched, and lands with a squash.
      t.fromTo(
        dock,
        { autoAlpha: 1, x: dx, y: dy, scaleX: 1, scaleY: 1 },
        { autoAlpha: 1, x: 0, y: 0, scaleX: 0.84, scaleY: 1.2, duration: 0.6, ease: "power3.inOut" },
        0.62,
      )
        .fromTo(dock, { scaleX: 0.84, scaleY: 1.2 }, { scaleX: 1.28, scaleY: 0.74, duration: 0.1, ease: "power2.out" }, 1.22)
        .fromTo(dock, { scaleX: 1.28, scaleY: 0.74 }, { scaleX: 1, scaleY: 1, duration: 0.55, ease: "elastic.out(1, 0.4)" }, 1.32);

      return t;
    };

    const goDocked = () => {
      html.setAttribute("data-docked", "");
      if (tl && tl.isActive() && tl.reversed()) {
        tl.play();
        return;
      }
      tl?.kill();
      tl = build();
      if (reduced) tl.timeScale(100);
      tl.play(0);
    };

    const goHome = () => {
      setTray(false, true);
      if (tl && tl.isActive() && !tl.reversed()) {
        tl.reverse();
        return;
      }
      tl?.kill();
      tl = build();
      if (reduced) tl.timeScale(100);
      tl.progress(1).reverse();
    };

    const onScroll = () => {
      const y = window.scrollY;
      if (!docked && y > DOCK_AT) {
        docked = true;
        goDocked();
      } else if (docked && y <= UNDOCK_AT) {
        docked = false;
        goHome();
      }
    };

    // A page that was reloaded part way down starts with the button out.
    if (window.scrollY > DOCK_AT) {
      docked = true;
      html.setAttribute("data-docked", "");
      tl = build();
      tl.progress(1);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      tl?.kill();
      html.removeAttribute("data-docked");
      gsap.set([logo, dock, main, themeIcon, homeIcon], { clearProps: "all" });
    };
  }, [setTray]);

  /** The theme switch in the bar presses the header's real one, so there is
   *  only ever one theme state. If that button is not found it flips the
   *  theme itself, the same way the page's own script does. */
  function toggleTheme() {
    const real = document.querySelectorAll<HTMLElement>("[data-hdr]")[1]?.querySelector("button");
    if (real) {
      real.click();
      return;
    }
    const next = document.documentElement.dataset.theme === "light" ? "dark" : "light";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {}
  }

  function onMain() {
    if (!openRef.current) {
      setTray(true);
      return;
    }
    setTray(false);
     if (window.location.pathname === "/") window.scrollTo({ top: 0, behavior: "smooth" });
    else router.push("/");
  }

  const themeIconName = theme === "dark" ? "solar:sun-bold" : "solar:moon-bold";

  return (
    <div ref={root}>
      {/* A copy of the header logo, the one that gets pulled in. Decorative. */}
      <div aria-hidden="true" data-dock-logo className="pointer-events-none invisible fixed left-0 top-0 z-[60]">
        <span className="inline-flex items-center gap-2 font-logo text-3xl leading-none">
          <span className="text-ink">CocoVerse</span>
          <span className="rounded-full bg-gradient-to-br from-gold-bright via-gold to-gold-deep px-3 py-1 text-[0.55em] text-[#1c1405] shadow-[var(--clay-raised)]">
            ui
          </span>
        </span>
      </div>

      <div
        data-dock
        className="invisible fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-5 z-[60] flex items-center"
      >
        <span
          aria-hidden="true"
          data-dock-pill
          className="clay-pressed pointer-events-none invisible absolute -inset-1.5 -z-10 rounded-full! opacity-0"
        />

        <div data-dock-extra className="invisible relative flex w-0 justify-end opacity-0">
          <button
            type="button"
            onClick={toggleTheme}
            tabIndex={open ? 0 : -1}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            className="clay mr-3 grid size-12 shrink-0 place-items-center rounded-full! text-gold"
          >
            <Icon icon={themeIconName} width={22} />
          </button>
        </div>

        <button
          type="button"
          data-dock-main
          onClick={onMain}
          aria-expanded={open}
          aria-label={open ? "Go home" : "Open menu"}
          className="clay relative grid size-12 place-items-center rounded-full! text-gold"
        >
          <span data-dock-theme-icon className="absolute inset-0 grid place-items-center">
            <Icon icon={themeIconName} width={22} />
          </span>
          <span data-dock-home-icon className="invisible absolute inset-0 grid place-items-center opacity-0">
            <Icon icon="solar:home-2-bold" width={22} />
          </span>
        </button>
      </div>
    </div>
  );
}