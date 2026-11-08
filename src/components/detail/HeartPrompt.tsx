"use client";

import { Icon } from "@iconify/react";
import gsap from "gsap";
import { useEffect, useRef, useState } from "react";

type Props = {
  open: boolean;
  name: string;
  onLater: () => void;
  onHeart: () => void;
};

/** The box that asks for a heart after a copy, and the heart that pops and fades. */
export function HeartPrompt({ open, name, onLater, onHeart }: Props) {
  const card = useRef<HTMLDivElement>(null);
  const heart = useRef<HTMLDivElement>(null);
  const [burst, setBurst] = useState(false);

  useEffect(() => {
    if (!open || !card.current) return;
    gsap.fromTo(
      card.current,
      { autoAlpha: 0, y: 24, scale: 0.96 },
      { autoAlpha: 1, y: 0, scale: 1, duration: 0.45, ease: "back.out(1.6)" },
    );
  }, [open]);

  useEffect(() => {
    const el = heart.current;
    if (!burst || !el) return;
    const t = gsap.timeline({ onComplete: () => setBurst(false) });
    t.fromTo(el, { autoAlpha: 0, scale: 0.3, y: 0 }, { autoAlpha: 1, scale: 1.2, duration: 0.45, ease: "back.out(2.4)" })
      .to(el, { scale: 1, duration: 0.15 })
      .to(el, { y: -90, autoAlpha: 0, duration: 0.7, ease: "power2.in" }, "+=0.2");
    return () => {
      t.kill();
    };
  }, [burst]);

  function later() {
    if (!card.current) return onLater();
    gsap.to(card.current, { autoAlpha: 0, y: 16, duration: 0.25, ease: "power2.in", onComplete: onLater });
  }

  function accept() {
    setBurst(true);
    onHeart();
  }

  return (
    <>
      {open ? (
        <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[90] flex justify-center px-4">
          <div
            ref={card}
            role="alertdialog"
            aria-label={`Give ${name} a heart`}
            className="clay pointer-events-auto invisible w-[min(92vw,380px)] p-5"
          >
            <div className="flex items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-surface-2 text-coral">
                <Icon icon="solar:heart-bold" width={22} />
              </span>
              <div>
                <p className="font-bold">Copied to your clipboard</p>
                <p className="mt-1 text-sm text-ink-dim">Enjoying {name}? Give it a heart.</p>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={later}
                className="clay rounded-full! px-5 py-2 text-sm font-bold text-ink-dim transition-colors hover:text-ink"
              >
                Not now
              </button>
              <button type="button" onClick={accept} className="btn-gold px-5! py-2! text-sm">
                Heart it
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {burst ? (
        <div className="pointer-events-none fixed inset-0 z-[95] grid place-items-center">
          <div ref={heart} className="invisible text-coral drop-shadow-[0_8px_24px_rgba(255,122,89,0.5)]">
            <Icon icon="solar:heart-bold" width={120} />
          </div>
        </div>
      ) : null}
    </>
  );
}