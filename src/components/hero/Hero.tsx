"use client";

import { useGSAP } from "@gsap/react";
import { Icon } from "@iconify/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Fragment, useRef } from "react";
import { FurBackdrop } from "../fur/FurBackdrop";


gsap.registerPlugin(useGSAP, ScrollTrigger);

const HEADLINE = ["Effects", "that", "feel", "alive."];

/** Each word on its own, so phones can dye every word into the fur where it lands. */
function Words({ text, alt = false }: { text: string; alt?: boolean }) {
return (
    <>
      {text.split(" ").map((word, i) => (
        <Fragment key={i}>
          {i > 0 ? " " : null}
          <span data-run="" {...(alt ? { "data-run-alt": "" } : {})} className="inline-block">
            {word}
          </span>          
        </Fragment>
      ))}
    </>
  );
}

export function Hero() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // The logo and the theme button live in the header, outside this section.
        const header = Array.from(document.querySelectorAll("[data-hdr]"));
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
        tl.fromTo(header, { autoAlpha: 0, y: -26 }, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.12 }, 0);
        // The words are dyed into the fur, so they stay exactly where they are. The fur itself fades in.
        tl.set("[data-reveal]", { autoAlpha: 1 }, 0);
        // The hero stays put while the page body slides up over it.
          ScrollTrigger.create({
          trigger: root.current,
          start: "top top",
          end: "bottom top",
          pin: true,
          pinSpacing: false,
        });

      });
    },
    { scope: root },
  );

  return (
    <section ref={root} className="relative overflow-x-clip">
      <FurBackdrop />
      <div data-hero-content className="relative mx-auto grid max-w-[1400px] items-center gap-12 px-6  pb-32 pt-6 md:grid-cols-[1.05fr_0.95fr] md:gap-8 md:pb-40 lg:min-h-[78svh]">
       <div>
          <h1 data-headline data-hero-copy data-reveal className="mt-6 text-[clamp(3rem,8vw,6.5rem)]">
            {HEADLINE.map((word, i) => (
              <span key={word} className="mr-[0.22em] inline-block overflow-hidden pb-[0.12em] align-bottom">
                <span
                  data-word
                  data-run=""
                  {...(i === HEADLINE.length - 1 ? { "data-run-alt": "" } : {})}                  
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
            data-hero-copy
            data-reveal
            className="mt-4 font-heading text-2xl text-gold-text md:text-3xl"
            style={{ fontVariationSettings: '"SOFT" 100, "WONK" 1' }}
          >
            <Words text="The coolest mobile development UI kit in the World." alt />
          </p>

            <p data-sub data-hero-copy data-reveal className="mt-6 max-w-xl text-lg text-ink-dim">
            <Words text="Live, touchable effects. Pick one, press its home button, and step inside." />
          </p>

        </div>
        <div data-stage-wrap className="mx-auto hidden w-full max-w-[420px] md:block">
          {/* Where the kitten is dyed into the fur. The word under it is dyed in too. */}
          <div data-art className="relative aspect-[4/5] w-full" style={{ containerType: "inline-size" }}>
            <span
              aria-hidden="true"
              data-run=""
              data-hero-copy
              className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap font-logo leading-none text-transparent"
              style={{ top: "74.4%", fontSize: "6.2cqw" }}
            >
              CocoVerse
            </span>
          </div>
        </div>

      </div>
      <div
        data-cue
        data-reveal
          className="absolute bottom-22 left-1/2 flex -translate-x-1/2 items-center gap-2 text-sm text-ink-dim">
          <Icon icon="solar:alt-arrow-down-bold" width={18} className="animate-bounce" />
        <span data-run="" data-hero-copy>Step right in.</span>
      </div>
    </section>
  );
}