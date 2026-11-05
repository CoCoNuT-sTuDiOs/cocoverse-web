"use client";

import { useGSAP } from "@gsap/react";
import { Icon } from "@iconify/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";
import { HeroAsset } from "./HeroAsset";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const HEADLINE = ["Effects", "that", "feel", "alive."];

export function Hero() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // The logo and the theme button live in the header, outside this section.
        const header = Array.from(document.querySelectorAll("[data-hdr]"));
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
        tl.fromTo(header, { autoAlpha: 0, y: -26 }, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.12 }, 0)
          .set("[data-headline]", { autoAlpha: 1 }, 0.3)
          .fromTo(
            "[data-word]",
            { yPercent: 115 },
            { yPercent: 0, duration: 1, stagger: 0.09, ease: "power4.out" },
            0.3,
          )
          .fromTo("[data-sub]", { autoAlpha: 0, y: 22 }, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.14 }, 0.85)
          .fromTo(
            "[data-stage]",
            { autoAlpha: 0, scale: 0.9, y: 40, rotate: 2.5 },
            { autoAlpha: 1, scale: 1, y: 0, rotate: 0, duration: 1.3 },
            0.45,
          )
          .fromTo("[data-cue]", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.8 }, 1.6);

        // The hero stays put while the page body slides up over it.
          ScrollTrigger.create({
          trigger: root.current,
          start: "top top",
          end: "bottom top",
          pin: true,
          pinSpacing: false,
        });

        // The big asset drifts up a little slower than the page as you scroll.
          gsap.to("[data-stage-wrap]", {
          yPercent: -7,
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
        });
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} className="relative overflow-hidden">

      <div className="relative mx-auto grid max-w-[1400px] items-center gap-12 px-6  pb-32 pt-6 md:grid-cols-[1.05fr_0.95fr] md:gap-8 md:pb-40 lg:min-h-[78svh]">
        <div>
          <h1 data-headline data-reveal className="mt-6 text-[clamp(3rem,8vw,6.5rem)]">
            {HEADLINE.map((word, i) => (
              <span key={word} className="mr-[0.22em] inline-block overflow-hidden pb-[0.12em] align-bottom">
                <span
                  data-word
                  className={
                    i === HEADLINE.length - 1
                      ? "inline-block bg-gradient-to-br from-gold-bright via-gold to-gold-deep bg-clip-text text-transparent"
                      : "inline-block"
                  }
                >
                  {word}
                </span>
              </span>
            ))}
          </h1>

          <p
            data-sub
            data-reveal
            className="mt-4 font-heading text-2xl text-gold-text md:text-3xl"
            style={{ fontVariationSettings: '"SOFT" 100, "WONK" 1' }}
          >
            The coolest mobile development UI kit in the World.
          </p>

            <p data-sub data-reveal className="mt-6 max-w-xl text-lg text-ink-dim">
            Live, touchable effects. Pick one, press its home button, and step inside.
          </p>


        </div>
        <div data-stage-wrap className="mx-auto hidden w-full max-w-[420px] md:block">
        <div data-stage data-reveal className="relative aspect-square w-full">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -inset-10"
              style={{
                background:
                  "radial-gradient(closest-side, rgba(255, 38, 6, 0.2), rgba(255, 38, 6, 0.06) 55%, transparent 100%)",
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                WebkitMaskImage: "radial-gradient(closest-side, #000 94%, transparent 100%)",
                maskImage: "radial-gradient(closest-side, #000 94%, transparent 100%)",
              }}
            >
              <HeroAsset />
            </div>
          </div>
        </div>


      </div>
      <div
        data-cue
        data-reveal
          className="absolute bottom-22 left-1/2 flex -translate-x-1/2 items-center gap-2 text-sm text-ink-dim">
          <Icon icon="solar:alt-arrow-down-bold" width={18} className="animate-bounce" />
        Step right in.
      </div>
    </section>
  );
}