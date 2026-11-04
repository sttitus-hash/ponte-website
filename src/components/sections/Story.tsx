"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { story } from "@/lib/content";
import { ease } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const slides = story.slides;

/**
 * 07 Our story — a regular slider over the ridge photo. Milestone chips,
 * arrow keys and swipe all drive it; the progress line fills to the active step.
 */
export function Story() {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);
  const ref = useRef<HTMLElement>(null);

  const go = useCallback(
    (next: number) => {
      const clamped = Math.min(slides.length - 1, Math.max(0, next));
      setDir(clamped >= index ? 1 : -1);
      setIndex(clamped);
    },
    [index],
  );

  // Keyboard: left/right while the section has focus within
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(index + 1);
      if (e.key === "ArrowLeft") go(index - 1);
    };
    el.addEventListener("keydown", onKey);
    return () => el.removeEventListener("keydown", onKey);
  }, [go, index]);

  const slide = slides[index];
  const wordAnim = {
    initial: reduce ? { opacity: 0 } : { opacity: 0, y: 24 * dir },
    animate: { opacity: 1, y: 0 },
    exit: reduce ? { opacity: 0 } : { opacity: 0, y: -24 * dir },
    transition: { duration: 0.5, ease: ease.out },
  };

  return (
    <section
      ref={ref}
      id="story"
      aria-roledescription="carousel"
      aria-label="Our story"
      className="relative overflow-hidden bg-forest text-cream"
    >
      {/* Backdrop ---------------------------------------------------------- */}
      <motion.div
        aria-hidden="true"
        className="absolute inset-0"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.08}
        onDragEnd={(_, info) => {
          if (info.offset.x < -60) go(index + 1);
          else if (info.offset.x > 60) go(index - 1);
        }}
      >
        <Image
          src="/images/story-hikers.png"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-[50%_60%] mix-blend-darken lg:object-[50%_55%]"
        />
        <div className="absolute inset-0 bg-forest mix-blend-darken" />
        <div className="absolute inset-y-0 left-0 w-[56%] bg-gradient-to-r from-black/70 to-transparent" />
        <div className="absolute inset-y-0 right-0 w-[56%] bg-gradient-to-l from-black/70 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-[42%] bg-gradient-to-b from-transparent to-black/85" />
      </motion.div>

      <div className="relative flex min-h-[812px] flex-col px-gutter pb-10 pt-10 lg:h-[900px] lg:min-h-0">
        {/* Eyebrow */}
        <Reveal as="p" className="text-mono-16 text-mint">
          {story.eyebrow.map((l) => (
            <span key={l} className="block">
              {l}
            </span>
          ))}
        </Reveal>

        {/* Big word + counter */}
        <div
          className="mt-auto flex items-end justify-between text-cream-warm lg:absolute lg:inset-x-[clamp(1rem,2.5vw,2.5rem)] lg:top-[376px] lg:mt-0"
          aria-live="polite"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span key={`w-${index}`} {...wordAnim} className="text-dot-88 block">
              {slide.word}
            </motion.span>
          </AnimatePresence>
          <AnimatePresence mode="wait" initial={false}>
            <motion.span key={`c-${index}`} {...wordAnim} className="text-dot-88 block max-lg:text-[40px]">
              {index + 1}/{slides.length}
            </motion.span>
          </AnimatePresence>
        </div>

        {/* Bottom row: chips · body · progress */}
        <div className="mt-10 flex flex-col gap-8 lg:mt-auto lg:grid lg:grid-cols-[1fr_751px] lg:items-end lg:gap-0">
          <div role="tablist" aria-label="Milestones" className="flex flex-wrap gap-1.5 lg:flex-col lg:items-start">
            {slides.map((s, i) => (
              <button
                key={s.chip}
                role="tab"
                aria-selected={i === index}
                tabIndex={i === index ? 0 : -1}
                onClick={() => go(i)}
                className={`rounded-[2px] px-[10px] py-[6px] text-mono-14 uppercase transition-colors duration-300 ${
                  i === index ? "bg-lime text-ink" : "bg-black/45 text-grey hover:text-cream"
                }`}
              >
                {s.chip}
              </button>
            ))}
          </div>

          <div>
            <div className="min-h-[108px] lg:min-h-[81px]" aria-live="polite">
              <AnimatePresence mode="wait" initial={false}>
                <motion.p
                  key={`b-${index}`}
                  {...wordAnim}
                  className="text-body-l max-w-[470px]"
                >
                  {slide.body}
                  <span className="text-lime">{slide.highlight}</span>
                </motion.p>
              </AnimatePresence>
            </div>

            {/* Progress line */}
            <div className="relative mt-10 h-[14px] lg:mt-[55px]" aria-hidden="true">
              <div className="absolute inset-x-[5px] top-1/2 h-px -translate-y-1/2 bg-cream-warm/25" />
              <motion.div
                className="absolute left-[5px] top-1/2 h-px -translate-y-1/2 bg-lime"
                animate={{ width: `calc((100% - 10px) * ${index / (slides.length - 1)})` }}
                transition={{ duration: reduce ? 0 : 0.6, ease: ease.inOut }}
              />
              {slides.map((s, i) => (
                <span
                  key={s.chip}
                  className="absolute top-1/2 -translate-y-1/2"
                  style={{ left: `calc((100% - 10px) * ${i / (slides.length - 1)})` }}
                >
                  {i === index ? (
                    <span className="flex size-[14px] -translate-x-[2px] items-center justify-center rounded-[2px] border border-lime bg-black/60">
                      <span className="size-1 bg-lime" />
                    </span>
                  ) : (
                    <span
                      className={`block size-[10px] rounded-[1px] transition-colors duration-500 ${
                        i < index ? "bg-lime" : "bg-[#41403F]"
                      }`}
                    />
                  )}
                </span>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
