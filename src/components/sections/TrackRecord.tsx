"use client";

import Image from "next/image";
import { animate, motion, useMotionValue, useMotionValueEvent, useScroll, type MotionValue } from "motion/react";
import { useRef, useState } from "react";
import { Marker, Tag } from "@/components/ui/Primitives";
import { ChevronSmall } from "@/components/ui/icons";
import { Reveal, RevealLines } from "@/components/ui/Reveal";
import { trackRecord } from "@/lib/content";
import { ease, viewportOnce } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useDeckPosition, useImageLayer, useTextLayer } from "@/hooks/useSlideDeck";
import { Lottie } from "@/components/ui/Lottie";
import { asset } from "@/lib/asset";

const slides = trackRecord.slides;
const N = slides.length;
/** Pinned travel: 4 holds + 3 short ramps (see useDeckPosition). 240vh ≈ 2.4 viewports of scroll. */
const PIN = "lg:h-[340vh]";

/**
 * 02 Track record — two cards. On desktop the section pins and the right card steps
 * through the four facts as a single scroll-driven deck: every layer (labels, 3D object,
 * caption, figure) is a pure function of scroll position, so there is no time-based
 * exit to wait for and nothing to catch up on. On mobile the same deck is driven by a
 * spring that follows the swipe.
 */
export function TrackRecord() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const pos = useDeckPosition(scrollYProgress, N, reduce);
  useMotionValueEvent(pos, "change", (v) => {
    const next = Math.round(v);
    if (next !== index) setIndex(next);
  });

  // Mobile: a spring-driven position that follows the swipe.
  const [mIndex, setMIndex] = useState(0);
  const mPos = useMotionValue(0);
  const goMobile = (i: number) => {
    const next = Math.min(N - 1, Math.max(0, i));
    setMIndex(next);
    if (reduce) mPos.set(next);
    else animate(mPos, next, { type: "spring", stiffness: 260, damping: 30, mass: 0.8 });
  };

  return (
    <section
      ref={ref}
      id="about"
      aria-labelledby="track-title"
      className={`relative bg-near-black ${PIN}`}
    >
      <div className="px-gutter py-10 lg:sticky lg:top-0 lg:flex lg:h-screen lg:items-center">
        <div className="grid w-full gap-[10px] lg:grid-cols-2 lg:[height:min(755px,calc(100vh-80px))]">
          {/* Left — mint card -------------------------------------------- */}
          <motion.div
            className="relative flex flex-col justify-between overflow-hidden rounded-panel bg-mint p-6 text-black sm:p-10 lg:p-[39px]"
            initial={reduce ? false : { opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewportOnce}
            transition={{ duration: 0.6, ease: ease.out }}
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
            initial={reduce ? false : { opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewportOnce}
            transition={{ duration: 0.6, ease: ease.out, delay: 0.06 }}
          >
            {/* Desktop: scroll-driven */}
            <div className="hidden h-full lg:block">
              <SlideDeck pos={pos} index={index} reduce={reduce} />
            </div>
            {/* Mobile: swipeable */}
            <MobileSlider pos={mPos} index={mIndex} reduce={reduce} onChange={goMobile} />
          </motion.div>

          {/* Mobile progress rail — outside the card, as in the Figma mobile frame */}
          <MobileRail index={mIndex} onChange={goMobile} />
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

type DeckProps = { pos: MotionValue<number>; index: number; reduce: boolean };

/**
 * The lime card's content: all four slides are mounted and stacked (so every illustration is
 * decoded before it is needed) and each layer follows the deck position.
 */
function SlideDeck({ pos, index, reduce }: DeckProps) {
  return (
    <div className="relative flex h-full flex-col justify-between p-6 sm:p-10 lg:p-[39px]">
      <div className="grid text-mono-16 text-moss">
        {slides.map((s, i) => (
          <TextLayer key={s.topLeft} pos={pos} i={i} reduce={reduce} current={i === index} className="flex items-start justify-between">
            <span>{s.topLeft}</span>
            <span className="text-right">{s.topRight}</span>
          </TextLayer>
        ))}
      </div>

      <div className="relative mx-auto flex w-[50%] max-w-[424px] flex-1 items-center justify-center py-5 lg:w-[64%] lg:py-6">
        <div className="grid w-full">
          {slides.map((s, i) => (
            <ImageLayer key={s.image} pos={pos} i={i} reduce={reduce} current={i === index}>
              <Image
                src={asset(s.image)}
                alt={s.alt}
                width={848}
                height={822}
                sizes="(min-width: 1024px) 424px, 60vw"
                className="h-auto w-full select-none"
                draggable={false}
              />
            </ImageLayer>
          ))}
        </div>
      </div>

      <div className="grid">
        {slides.map((s, i) => (
          <TextLayer
            key={s.figure}
            pos={pos}
            i={i}
            reduce={reduce}
            current={i === index}
            className="flex flex-col-reverse items-start gap-3 lg:flex-row lg:items-end lg:justify-between lg:gap-6"
          >
            <p className="flex items-center gap-2 text-mono-16 text-moss">
              <Marker color="bg-forest" />
              {s.caption}
            </p>
            <p className="text-dot-88 whitespace-nowrap text-[#333333] max-lg:text-[56px]">{s.figure}</p>
          </TextLayer>
        ))}
      </div>

      {/* step indicator — desktop only */}
      <ol className="absolute bottom-[42px] left-1/2 hidden -translate-x-1/2 gap-1.5 lg:flex" aria-label="Slide">
        {slides.map((s, i) => (
          <li
            key={s.topLeft}
            aria-current={i === index ? "step" : undefined}
            className={`h-1 rounded-full transition-all duration-300 ${i === index ? "w-6 bg-ink" : "w-2 bg-ink/25"}`}
          />
        ))}
      </ol>
    </div>
  );
}

type LayerProps = Omit<DeckProps, "index"> & { i: number; current: boolean; className?: string; children: React.ReactNode };

/** A stacked text layer (all layers share grid cell 1/1, so the row is sized by the tallest). */
function TextLayer({ pos, i, reduce, current, className = "", children }: LayerProps) {
  const style = useTextLayer(pos, i, reduce);
  return (
    <motion.div
      className={`col-start-1 row-start-1 ${current ? "" : "pointer-events-none"} ${className}`}
      style={style}
      aria-hidden={current ? undefined : true}
    >
      {children}
    </motion.div>
  );
}

function ImageLayer({ pos, i, reduce, current, children }: LayerProps) {
  const style = useImageLayer(pos, i, reduce);
  return (
    <motion.div
      className="col-start-1 row-start-1 w-full will-change-transform"
      style={style}
      aria-hidden={current ? undefined : true}
    >
      {children}
    </motion.div>
  );
}

function MobileSlider({
  pos,
  index,
  reduce,
  onChange,
}: DeckProps & { onChange: (i: number) => void }) {
  const go = (dir: number) => onChange(index + dir);
  return (
    <motion.div
      className="min-h-[352px] cursor-grab touch-pan-y active:cursor-grabbing lg:hidden"
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.12}
      onDrag={(_, info) => {
        // follow the finger: a 240px drag is one slide
        if (!reduce) pos.set(Math.min(N - 1, Math.max(0, index - info.offset.x / 240)));
      }}
      onDragEnd={(_, info) => {
        if (info.offset.x < -60 || info.velocity.x < -400) go(1);
        else if (info.offset.x > 60 || info.velocity.x > 400) go(-1);
        else onChange(index);
      }}
    >
      <SlideDeck pos={pos} index={index} reduce={reduce} />
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

