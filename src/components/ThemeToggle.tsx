"use client";

import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";

type Theme = "light" | "dark";

/** Switches between light and dark, and remembers the choice. */
export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    setTheme(document.documentElement.dataset.theme === "light" ? "light" : "dark");
  }, []);

  function toggle() {
    const next: Theme = theme === "light" ? "dark" : "light";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {
      // storage can be blocked; the switch still works for this visit
    }
    setTheme(next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
      className="clay grid h-12 w-12 place-items-center rounded-full! text-gold-text active:shadow-[var(--clay-pressed)]"
    >
      {theme ? (
        <Icon icon={theme === "light" ? "solar:moon-bold" : "solar:sun-2-bold"} width={22} />
      ) : null}
    </button>
  );
}