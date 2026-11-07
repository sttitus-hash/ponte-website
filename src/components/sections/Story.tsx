"use client";

import Image from "next/image";
import { AnimatePresence, animate, motion, useMotionValue, useScroll, useTransform } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { TypeReveal } from "@/components/ui/TypeReveal";
import { story } from "@/lib/content";
import { ease } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useIsDesktop } from "@/hooks/useIsDesktop";
import { asset } from "@/lib/asset";
import { useKeyframes, pageTop } from "@/lib/scroll/ScrollProvider";
import { STEP_VH } from "@/components/sections/Journey";

const slides = story.slides;
const AUTOPLAY_S = 6;
/** Desktop pinned steps: hold (under the Trust exit) + fade-out revealing the FAQ. */
const STEPS = 2;

/**
 * 07 Our story — a slider with an animated timeline that autoplays (row 28): the active
 * segment of the progress line fills over 6 s, then the next step takes over. Chips, arrow
 * keys and swipe all drive it and restart the timer; it pauses off-screen, while the pointer
 * is down, and under reduced motion. On desktop the section pins and its content fades to
 * 0 on the last scroll, revealing the FAQ underneath (row 29).
 */
export function Story() {
  const isDesktop = useIsDesktop();
  return isDesktop ? <StoryDesktop /> : <StoryMobile />;
}

/** Shared slider state: index, direction, autoplay progress (0‥1 within the active step). */
function useSlider(enabled: boolean) {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);
  const [paused, setPaused] = useState(false);
  const progress = useMotionValue(0);
  const ctrl = useRef<ReturnType<typeof animate> | null>(null);

  const go = useCallback(
    (next: number) => {
      const clamped = ((next % slides.length) + slides.length) % slides.length;
      setDir(clamped >= index ? 1 : -1);
      setIndex(clamped);
    },
    [index],
  );

  // autoplay: fill the active segment, then advance
  useEffect(() => {
    ctrl.current?.stop();
    progress.set(0);
    if (reduce || !enabled || paused) return;
    ctrl.current = animate(progress, 1, {
      duration: AUTOPLAY_S,
      ease: "linear",
      onComplete: () => go(index + 1),
    });
    return () => ctrl.current?.stop();
  }, [index, enabled, paused, reduce, progress, go]);

  return { index, dir, go, progress, setPaused };
}

function useVisible(ref: React.RefObject<HTMLElement | null>) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => setVisible(entries.some((e) => e.isIntersecting)), { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, [ref]);
  return visible;
}

function StoryDesktop() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const visible = useVisible(ref);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const p = useTransform(scrollYProgress, (v) => (reduce ? Math.round(v * STEPS) : v * STEPS));
  // fade to 0 over the last step, revealing the FAQ beneath
  const fadeO = useTransform(p, (v) => 1 - Math.min(1, Math.max(0, (v - 1) / 0.85)));
  const [faded, setFaded] = useState(false);
  useEffect(() => fadeO.on("change", (v) => setFaded(v < 0.05)), [fadeO]);
  const { index, dir, go, progress, setPaused } = useSlider(visible && !faded);

  useKeyframes(3, () => {
    const el = ref.current;
    if (!el) return [];
    const top = pageTop(el);
    const step = window.innerHeight * STEP_VH;
    return Array.from({ length: STEPS + 1 }, (_, i) => top + i * step);
  });

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

  return (
    <section
      ref={ref}
      id="story"
      aria-roledescription="carousel"
      aria-label="Our story"
      className="relative z-[4]"
      style={{ height: `calc(100vh + ${STEPS * STEP_VH * 100}vh)`, marginTop: `calc(-100vh - ${STEP_VH * 100}vh)` }}
    >
      <motion.div className="sticky top-0 h-screen overflow-hidden bg-forest text-cream" style={{ opacity: fadeO }} aria-hidden={faded}>
        <Backdrop />
        <motion.div
          className="relative flex h-full flex-col px-gutter pb-[45px] pt-10"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0}
          dragMomentum={false}
          onPointerDown={() => setPaused(true)}
          onPointerUp={() => setPaused(false)}
          onPointerCancel={() => setPaused(false)}
          onDragEnd={(_, info) => {
            if (info.offset.x < -60) go(index + 1);
            else if (info.offset.x > 60) go(index - 1);
          }}
        >
          <Reveal as="p" className="text-mono-16 text-mint">
            {story.eyebrow.map((l) => (
              <span key={l} className="block">
                {l}
              </span>
            ))}
          </Reveal>

          {/* Big word + counter (Figma y 376 of 900 → 41.8 %) */}
          <div className="absolute inset-x-[clamp(1rem,2.5vw,2.5rem)] top-[41.8%] flex items-end justify-between text-cream-warm" aria-live="polite">
            <BigWord index={index} dir={dir} reduce={reduce} text={slides[index].word} />
            <BigWord index={index} dir={dir} reduce={reduce} text={`${index + 1}/${slides.length}`} />
          </div>

          {/* Bottom row: chips · body · progress */}
          <div className="mt-auto grid grid-cols-[1fr_751px] items-end">
            <Chips index={index} go={go} column />
            <div>
              <div className="relative min-h-[81px]" aria-live="polite">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.p key={`b-${index}`} {...wordAnim(dir, reduce)} className="text-body-l max-w-[470px]">
                    {slides[index].body}
                    <span className="text-lime">{slides[index].highlight}</span>
                  </motion.p>
                </AnimatePresence>
              </div>
              <ProgressLine index={index} progress={progress} className="mt-[55px]" />
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}

function StoryMobile() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const visible = useVisible(ref);
  const { index, dir, go, progress, setPaused } = useSlider(visible);
  return (
    <section ref={ref} id="story" aria-roledescription="carousel" aria-label="Our story" className="relative overflow-hidden bg-forest text-cream">
      <Backdrop />
      <motion.div
        className="relative flex min-h-[812px] flex-col px-5 pb-5 pt-[22px]"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0}
        dragMomentum={false}
        onPointerDown={() => setPaused(true)}
        onPointerUp={() => setPaused(false)}
        onPointerCancel={() => setPaused(false)}
        onDragEnd={(_, info) => {
          if (info.offset.x < -60) go(index + 1);
          else if (info.offset.x > 60) go(index - 1);
        }}
      >
        {/* Segments at the top show the current step (mobile Figma + designer note) */}
        <Chips index={index} go={go} progress={progress} />
        <Reveal as="p" className="mt-[35px] text-mono-14 uppercase text-mint">
          {story.eyebrow.map((l) => (
            <span key={l} className="block">
              {l}
            </span>
          ))}
        </Reveal>
        <div className="absolute inset-x-5 top-[331px] text-cream-warm" aria-live="polite">
          <BigWord index={index} dir={dir} reduce={reduce} text={slides[index].word} />
        </div>
        <div className="relative mt-auto min-h-[78px]" aria-live="polite">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.p key={`b-${index}`} {...wordAnim(dir, reduce)} className="text-body-l">
              {slides[index].body}
              <span className="text-lime">{slides[index].highlight}</span>
            </motion.p>
          </AnimatePresence>
        </div>
      </motion.div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */

const wordAnim = (dir: number, reduce: boolean) => ({
  initial: reduce ? { opacity: 0 } : { opacity: 0, y: 24 * dir },
  animate: { opacity: 1, y: 0 },
  exit: reduce ? { opacity: 0 } : { opacity: 0, y: -24 * dir },
  transition: { duration: 0.4, ease: ease.out },
});

function BigWord({ index, dir, reduce, text }: { index: number; dir: number; reduce: boolean; text: string }) {
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.span key={`${text}-${index}`} {...wordAnim(dir, reduce)} className="text-dot-88 block max-lg:text-[80px]">
        {text}
      </motion.span>
    </AnimatePresence>
  );
}

function Backdrop() {
  return (
    <motion.div aria-hidden="true" className="absolute inset-0">
      {/* Figma: 2116x1406 photo placed at (-116,-369) in the 1600x900 frame, under a forest
          layer in "darken" (sky = forest, silhouettes stay black). Mobile keeps a cover crop. */}
      <div className="absolute inset-0 overflow-hidden">
        <Image src={asset("/images/story-hikers.png")} alt="" fill sizes="100vw" className="object-cover object-[50%_60%] lg:hidden" />
        <div className="absolute hidden lg:block" style={{ left: "-7.25%", top: "-41%", width: "132.25%" }}>
          <Image src={asset("/images/story-hikers.png")} alt="" width={2116} height={1406} sizes="135vw" className="h-auto w-full" />
        </div>
      </div>
      <div className="absolute inset-0 bg-forest mix-blend-darken" />
      <div className="absolute inset-y-0 left-0 w-[56%] bg-gradient-to-r from-black/70 to-transparent" />
      <div className="absolute inset-y-0 right-0 w-[56%] bg-gradient-to-l from-black/70 to-transparent" />
      <div className="absolute inset-x-0 top-0 h-[220px] bg-gradient-to-b from-black/80 to-transparent lg:hidden" />
      <div className="absolute inset-x-0 bottom-0 h-[42%] bg-gradient-to-b from-transparent to-black/85 lg:h-[53%]" />
    </motion.div>
  );
}

/** Milestone chips; on mobile each chip carries its own fill as the timeline segment. */
function Chips({ index, go, column, progress }: { index: number; go: (i: number) => void; column?: boolean; progress?: ReturnType<typeof useMotionValue<number>> }) {
  return (
    <div role="tablist" aria-label="Milestones" className={`flex flex-wrap gap-1.5 ${column ? "flex-col items-start" : ""}`}>
      {slides.map((s, i) => (
        <button
          key={s.chip}
          role="tab"
          aria-selected={i === index}
          tabIndex={i === index ? 0 : -1}
          onClick={() => go(i)}
          className={`relative overflow-hidden rounded-[2px] px-[10px] py-[6px] text-mono-14 uppercase transition-colors duration-300 ${
            i === index ? "bg-lime text-ink" : "bg-black/45 text-grey hover:text-cream"
          }`}
        >
          <span className="relative">
            <TypeReveal text={s.chip} active={i === index} duration={0.4} />
          </span>
          {progress && i === index ? <motion.span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[2px] origin-left bg-ink/60" style={{ scaleX: progress }} /> : null}
        </button>
      ))}
    </div>
  );
}

/** Progress line: done segments lime, the active segment fills with the autoplay timer. */
function ProgressLine({ index, progress, className = "" }: { index: number; progress: ReturnType<typeof useMotionValue<number>>; className?: string }) {
  const n = slides.length - 1;
  const width = useTransform(progress, (v) => `calc((100% - 10px) * ${(index + Math.min(v, 1)) / n})`);
  return (
    <div className={`relative h-[14px] ${className}`} aria-hidden="true">
      <div className="absolute inset-x-[5px] top-1/2 h-px -translate-y-1/2 bg-cream-warm/25" />
      <motion.div className="absolute left-[5px] top-1/2 h-px -translate-y-1/2 bg-lime" style={{ width }} />
      {slides.map((s, i) => (
        <span key={s.chip} className="absolute top-1/2 -translate-y-1/2" style={{ left: `calc((100% - 10px) * ${i / n})` }}>
          {i === index ? (
            <span className="flex size-[14px] -translate-x-[2px] items-center justify-center rounded-[2px] border border-lime bg-black/60">
              <span className="size-1 bg-lime" />
            </span>
          ) : (
            <span className={`block size-[10px] rounded-[1px] transition-colors duration-500 ${i < index ? "bg-lime" : "bg-[#41403F]"}`} />
          )}
        </span>
      ))}
    </div>
  );
}
