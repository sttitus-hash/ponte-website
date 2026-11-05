"use client";

import Image from "next/image";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { useRef, useState } from "react";
import { Marker, Tag } from "@/components/ui/Primitives";
import { ChevronSmall } from "@/components/ui/icons";
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
  const [mIndex, setMIndex] = useState(0);
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
            <MobileSlider index={mIndex} onChange={setMIndex} />
          </motion.div>

          {/* Mobile progress rail — outside the card, as in the Figma mobile frame */}
          <MobileRail index={mIndex} onChange={setMIndex} />
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

      <div className="relative mx-auto flex w-[50%] max-w-[424px] flex-1 items-center justify-center py-5 lg:w-[64%] lg:py-6">
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

      <div className="flex flex-col-reverse items-start gap-3 lg:flex-row lg:items-end lg:justify-between lg:gap-6">
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
            className="text-dot-88 whitespace-nowrap text-[#333333] max-lg:text-[56px]"
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

function MobileSlider({ index, onChange }: { index: number; onChange: (i: number) => void }) {
  const go = (dir: number) => onChange(Math.min(slides.length - 1, Math.max(0, index + dir)));
  return (
    <motion.div
      className="min-h-[352px] cursor-grab active:cursor-grabbing lg:hidden"
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
  );
}

/** Progress line with four square stops, "01 / 04" and a SWIPE hint (Figma mobile "about"). */
function MobileRail({ index, onChange }: { index: number; onChange: (i: number) => void }) {
  return (
    <div className="mt-2 lg:hidden">
      <div className="relative h-[14px]" role="tablist" aria-label="Milestones">
        <div className="absolute inset-x-[5px] top-1/2 h-px -translate-y-1/2 bg-cream-warm/25" />
        <motion.div
          className="absolute left-[5px] top-1/2 h-px -translate-y-1/2 bg-lime"
          animate={{ width: `calc((100% - 10px) * ${index / (slides.length - 1)})` }}
          transition={{ duration: 0.4, ease: ease.out }}
        />
        {slides.map((s, i) => (
          <button
            key={s.topLeft}
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-label={`Slide ${i + 1}`}
            onClick={() => onChange(i)}
            className="absolute top-1/2 flex size-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center"
            style={{ left: `calc(5px + (100% - 10px) * ${i / (slides.length - 1)})` }}
          >
            {i === index ? (
              <span className="flex size-[14px] items-center justify-center rounded-[2px] border border-lime bg-black/60">
                <span className="size-1 bg-lime" />
              </span>
            ) : (
              <span className={`block size-[10px] rounded-[1px] ${i < index ? "bg-lime" : "bg-[#41403F]"}`} />
            )}
          </button>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between text-mono-14 uppercase text-cream">
        <span aria-live="polite">0{index + 1} / 0{slides.length}</span>
        <span className="flex items-center gap-2 text-grey">Swipe <ChevronSmall className="h-[10px] w-[6px]" /></span>
      </div>
    </div>
  );
}

