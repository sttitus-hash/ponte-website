"use client";

import Image from "next/image";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { useRef, useState } from "react";
import { Marker, Tag } from "@/components/ui/Primitives";
import { Reveal, RevealLines } from "@/components/ui/Reveal";
import { trackRecord } from "@/lib/content";
import { ease, viewportOnce } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { Lottie } from "@/components/ui/Lottie";
import { asset } from "@/lib/asset";

const slides = trackRecord.slides;

/**
 * 02 Track record — two cards. On desktop the section pins for 4 viewports and
 * the right card steps through the four facts as the user scrolls (labels,
 * 3D object and figure crossfade). On mobile the right card is a swipeable slider.
 */
export function TrackRecord() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const next = Math.min(slides.length - 1, Math.max(0, Math.floor(v * slides.length)));
    if (next !== index) setIndex(next);
  });

  return (
    <section
      ref={ref}
      id="about"
      aria-labelledby="track-title"
      className="relative bg-near-black lg:h-[400vh]"
    >
      <div className="px-gutter py-10 lg:sticky lg:top-0 lg:flex lg:h-screen lg:items-center">
        <div className="grid w-full gap-[10px] lg:grid-cols-2 lg:[height:min(755px,calc(100vh-80px))]">
          {/* Left — mint card -------------------------------------------- */}
          <motion.div
            className="relative flex flex-col justify-between overflow-hidden rounded-panel bg-mint p-6 text-black sm:p-10 lg:p-[39px]"
            initial={reduce ? false : { opacity: 0, y: 48 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewportOnce}
            transition={{ duration: 0.8, ease: ease.out }}
          >
            <div className="flex items-start justify-between">
              <Tag>{trackRecord.tag}</Tag>
            </div>

            {/* Escrow loops — the line draws itself in */}
            <div className="pointer-events-none absolute right-0 top-[27px] hidden w-[57%] text-forest lg:block">
              <DrawnLoops />
            </div>
            <div className="relative mt-8 w-[70%] text-forest lg:hidden">
              <DrawnLoops />
            </div>

            <div className="mt-10 lg:mt-0">
              <RevealLines
                id="track-title"
                as="h2"
                lines={trackRecord.title}
                className="text-h2 max-w-[623px]"
              />
              <Reveal as="p" index={2} className="mt-6 max-w-[520px] text-body-l lg:mt-[22px]">
                {trackRecord.body}
              </Reveal>
            </div>
          </motion.div>

          {/* Right — lime card ------------------------------------------- */}
          <motion.div
            className="on-lime relative overflow-hidden rounded-panel bg-lime text-ink"
            initial={reduce ? false : { opacity: 0, y: 48 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewportOnce}
            transition={{ duration: 0.8, ease: ease.out, delay: 0.1 }}
          >
            {/* Desktop: scroll-driven */}
            <div className="hidden h-full lg:block">
              <SlideCard index={index} />
            </div>
            {/* Mobile: swipeable */}
            <MobileSlider />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */

/** Escrow loops — the official "spring" Lottie (draw / retract loop), tinted forest as in Figma. */
function DrawnLoops() {
  return <Lottie src="/animations/spring.json" tint className="aspect-[466/264] w-full" />;
}

/** Slide content for the lime card; animated by `key` on index change. */
function SlideCard({ index }: { index: number }) {
  const reduce = useReducedMotion();
  const slide = slides[index];
  const fade = {
    initial: reduce ? { opacity: 0 } : { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    exit: reduce ? { opacity: 0 } : { opacity: 0, y: -12 },
  };

  return (
    <div className="relative flex h-full flex-col justify-between p-6 sm:p-10 lg:p-[39px]">
      <div className="flex items-start justify-between text-mono-16 text-moss" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span key={`tl-${index}`} {...fade} transition={{ duration: 0.35 }}>
            {slide.topLeft}
          </motion.span>
        </AnimatePresence>
        <AnimatePresence mode="wait" initial={false}>
          <motion.span key={`tr-${index}`} {...fade} transition={{ duration: 0.35 }} className="text-right">
            {slide.topRight}
          </motion.span>
        </AnimatePresence>
      </div>

      <div className="relative mx-auto flex w-[56%] max-w-[424px] flex-1 items-center justify-center py-6">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={`img-${index}`}
            className="w-full"
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.9, rotate: -4 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.94, rotate: 4 }}
            transition={{ duration: 0.55, ease: ease.out }}
          >
            <Image
              src={asset(slide.image)}
              alt={slide.alt}
              width={848}
              height={822}
              sizes="(min-width: 1024px) 424px, 60vw"
              className="h-auto w-full"
            />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-end justify-between gap-6">
        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={`cap-${index}`}
            {...fade}
            transition={{ duration: 0.35 }}
            className="flex items-center gap-2 text-mono-16 text-moss"
          >
            <Marker color="bg-forest" />
            {slide.caption}
          </motion.p>
        </AnimatePresence>
        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={`fig-${index}`}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -10 }}
            transition={{ duration: 0.45, ease: ease.out }}
            className="text-dot-88 whitespace-nowrap text-[#333333]"
          >
            {slide.figure}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* step indicator — desktop only */}
      <ol className="absolute bottom-[42px] left-1/2 hidden -translate-x-1/2 gap-1.5 lg:flex" aria-label="Slide">
        {slides.map((s, i) => (
          <li
            key={s.topLeft}
            aria-current={i === index ? "step" : undefined}
            className={`h-1 rounded-full transition-all duration-500 ${i === index ? "w-6 bg-ink" : "w-2 bg-ink/25"}`}
          />
        ))}
      </ol>
    </div>
  );
}

function MobileSlider() {
  const [index, setIndex] = useState(0);
  const go = (dir: number) => setIndex((i) => Math.min(slides.length - 1, Math.max(0, i + dir)));

  return (
    <div className="relative lg:hidden">
      <motion.div
        className="min-h-[520px] cursor-grab active:cursor-grabbing"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={(_, info) => {
          if (info.offset.x < -60) go(1);
          else if (info.offset.x > 60) go(-1);
        }}
      >
        <SlideCard index={index} />
      </motion.div>

      <div className="flex items-center justify-between px-6 pb-6">
        <div className="relative h-px flex-1 bg-ink/20">
          <motion.div
            className="absolute inset-y-0 left-0 bg-ink"
            animate={{ width: `${((index + 1) / slides.length) * 100}%` }}
            transition={{ duration: 0.4, ease: ease.out }}
          />
        </div>
        <div className="ml-5 flex gap-2">
          <SliderButton label="Previous" onClick={() => go(-1)} disabled={index === 0} flip />
          <SliderButton label="Next" onClick={() => go(1)} disabled={index === slides.length - 1} />
        </div>
      </div>
    </div>
  );
}

function SliderButton({
  label,
  onClick,
  disabled,
  flip,
}: {
  label: string;
  onClick: () => void;
  disabled: boolean;
  flip?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="flex size-9 items-center justify-center rounded-full bg-ink text-lime disabled:opacity-30"
    >
      <svg width="7" height="12" viewBox="0 0 7 12" fill="none" aria-hidden="true" className={flip ? "rotate-180" : ""}>
        <path d="M0.5 0.5 6 6 0.5 11.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    </button>
  );
}

