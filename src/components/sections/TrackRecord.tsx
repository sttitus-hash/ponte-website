"use client";

import Image from "next/image";
import { motion, type MotionValue } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Marker, Tag } from "@/components/ui/Primitives";
import { ChevronSmall } from "@/components/ui/icons";
import { Reveal, RevealLines } from "@/components/ui/Reveal";
import { TypeReveal } from "@/components/ui/TypeReveal";
import { trackRecord } from "@/lib/content";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useImageLayer, useTextLayer } from "@/hooks/useSlideDeck";
import { Lottie } from "@/components/ui/Lottie";
import { asset } from "@/lib/asset";

export const slides = trackRecord.slides;
export const N = slides.length;

/* -------------------------------------------------------------------------- */
/* Shared pieces (desktop journey + mobile)                                    */
/* -------------------------------------------------------------------------- */

/** Escrow loops — the official "spring" Lottie (draw / retract loop), tinted forest as in Figma. */
export function DrawnLoops() {
  return <Lottie src="/animations/spring.json" tint className="aspect-[466/264] w-full" />;
}

/** The mint card's content (tag, loops, headline, body). */
export function AboutMint({ inView = true }: { inView?: boolean }) {
  return (
    <>
      <div className="flex items-start justify-between">
        <Tag>
          <TypeReveal text={trackRecord.tag} active={inView} />
        </Tag>
      </div>
      <div className="pointer-events-none absolute right-0 top-[27px] hidden w-[57%] text-forest lg:block">
        <DrawnLoops />
      </div>
      <div className="relative mt-8 w-[70%] text-forest lg:hidden">
        <DrawnLoops />
      </div>
      <div className="mt-10 lg:mt-0">
        <RevealLines id="track-title" as="h2" lines={trackRecord.title} className="text-h2 max-w-[623px]" />
        <Reveal as="p" index={2} className="mt-6 max-w-[520px] text-body-l lg:mt-[22px]">
          {trackRecord.body}
        </Reveal>
      </div>
    </>
  );
}

/**
 * Milestone media: the four 3D objects. Prepared for the looping videos the design calls
 * for (CSV row 11): drop `/videos/about-<key>.mp4|webm` in and they play, muted, inline,
 * paused off-screen, with the PNG as poster and as the reduced-motion still. Until the
 * files are delivered the PNG renders alone.
 */
const VIDEO_SOURCES: Partial<Record<string, { mp4?: string; webm?: string }>> = {};

function SlideMedia({ slide, current }: { slide: (typeof slides)[number]; current: boolean }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLVideoElement>(null);
  const key = slide.image.replace(/^.*about-/, "").replace(/\.png$/, "");
  const video = VIDEO_SOURCES[key];
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (current && !reduce) v.play().catch(() => {});
    else v.pause();
  }, [current, reduce]);
  if (!video || reduce) {
    return (
      <Image
        src={asset(slide.image)}
        alt={slide.alt}
        width={848}
        height={822}
        sizes="(min-width: 1024px) 424px, 60vw"
        className="h-auto w-full select-none"
        draggable={false}
      />
    );
  }
  return (
    <video ref={ref} className="h-auto w-full select-none" muted playsInline loop preload="metadata" poster={asset(slide.image)} aria-label={slide.alt}>
      {video.webm ? <source src={asset(video.webm)} type="video/webm" /> : null}
      {video.mp4 ? <source src={asset(video.mp4)} type="video/mp4" /> : null}
    </video>
  );
}

type DeckProps = { pos: MotionValue<number>; index: number; reduce: boolean };

/**
 * The lime card's desktop content: all four slides are stacked (every illustration is
 * decoded before it is needed) and each layer follows the deck position. No pagination
 * on desktop (CSV row 10 — not in the Figma frames).
 */
export function SlideDeck({ pos, index, reduce }: DeckProps) {
  return (
    <div className="relative flex h-full flex-col justify-between p-6 sm:p-10 lg:p-[39px]">
      <div className="grid text-mono-16 text-moss">
        {slides.map((s, i) => (
          <TextLayer key={s.topLeft} pos={pos} i={i} reduce={reduce} current={i === index} className="flex items-start justify-between">
            <span>
              <TypeReveal text={s.topLeft} active={i === index} />
            </span>
            <span className="text-right">
              <TypeReveal text={s.topRight} active={i === index} />
            </span>
          </TextLayer>
        ))}
      </div>

      <div className="relative mx-auto flex w-[50%] max-w-[424px] flex-1 items-center justify-center py-5 lg:w-[64%] lg:py-6">
        <div className="grid w-full">
          {slides.map((s, i) => (
            <ImageLayer key={s.image} pos={pos} i={i} reduce={reduce} current={i === index}>
              <SlideMedia slide={s} current={i === index} />
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
            <p className="flex min-w-0 items-center gap-2 text-mono-16 text-moss">
              <Marker color="bg-forest" />
              <TypeReveal text={s.caption} active={i === index} />
            </p>
            {/* Ponte Dot 88 at the 1600 frame → 5.5vw, so "LICENSED" fits the card on 1024–1440 laptops */}
            <p className="text-dot-88 whitespace-nowrap text-[#333333] max-lg:text-[56px] lg:text-[clamp(2.5rem,5.5vw,5.5rem)]">{s.figure}</p>
          </TextLayer>
        ))}
      </div>
    </div>
  );
}

type LayerProps = Omit<DeckProps, "index"> & { i: number; current: boolean; className?: string; children: React.ReactNode };

function TextLayer({ pos, i, reduce, current, className = "", children }: LayerProps) {
  const style = useTextLayer(pos, i, reduce);
  return (
    <motion.div className={`col-start-1 row-start-1 ${current ? "" : "pointer-events-none"} ${className}`} style={style} aria-hidden={current ? undefined : true}>
      {children}
    </motion.div>
  );
}

function ImageLayer({ pos, i, reduce, current, children }: LayerProps) {
  const style = useImageLayer(pos, i, reduce);
  return (
    <motion.div className="col-start-1 row-start-1 w-full will-change-transform" style={style} aria-hidden={current ? undefined : true}>
      {children}
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/* Mobile: the lime card itself slides (CSV row 42) — a native scroll-snap track */
/* -------------------------------------------------------------------------- */

export function TrackRecordMobile() {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

  const onScroll = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const w = el.clientWidth;
    const i = Math.round(el.scrollLeft / (w + 10));
    setIndex(Math.min(N - 1, Math.max(0, i)));
  }, []);

  const goTo = (i: number) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollTo({ left: i * (el.clientWidth + 10), behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <section id="about" aria-labelledby="track-title" className="relative bg-near-black px-5 py-10 lg:hidden">
      <motion.div
        className="relative flex flex-col justify-between overflow-hidden rounded-panel bg-mint p-6 text-black sm:p-10"
        initial={reduce ? false : { opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <AboutMint />
      </motion.div>

      {/* Track: four lime cards, one per fact; the whole card moves with the swipe */}
      <div
        ref={trackRef}
        onScroll={onScroll}
        className="scrollbar-none -mx-5 mt-[10px] flex snap-x snap-mandatory gap-[10px] overflow-x-auto px-5"
        style={{ scrollPaddingInline: 20 }}
        role="group"
        aria-roledescription="carousel"
        aria-label="Milestones"
        data-lenis-prevent
      >
        {slides.map((s, i) => (
          <article
            key={s.topLeft}
            className="on-lime relative flex min-h-[350px] w-full shrink-0 snap-start flex-col justify-between rounded-panel bg-lime p-5 text-ink"
            aria-hidden={i !== index}
            aria-label={`${i + 1} of ${N}`}
          >
            <div className="flex items-start justify-between text-mono-14 uppercase text-moss">
              <span>{s.topLeft}</span>
              <span className="text-right">{s.topRight}</span>
            </div>
            <div className="mx-auto w-[52%] max-w-[220px] py-5">
              <SlideMedia slide={s} current={i === index} />
            </div>
            <div className="flex flex-col-reverse items-start gap-3">
              <p className="flex items-center gap-2 text-mono-14 uppercase text-moss">
                <Marker size={8} color="bg-forest" />
                {s.caption}
              </p>
              <p className="text-dot-88 whitespace-nowrap text-[#333333] max-lg:text-[56px]">{s.figure}</p>
            </div>
          </article>
        ))}
      </div>

      <MobileRail index={index} onChange={goTo} />
    </section>
  );
}

/** Progress line with four square stops, "01 / 04" and a SWIPE hint (Figma mobile "about"): 32px under the card (row 41). */
function MobileRail({ index, onChange }: { index: number; onChange: (i: number) => void }) {
  return (
    <div className="mt-8">
      <div className="relative h-[14px]" role="tablist" aria-label="Milestones">
        <div className="absolute inset-x-[5px] top-1/2 h-px -translate-y-1/2 bg-cream-warm/25" />
        <motion.div
          className="absolute left-[5px] top-1/2 h-px -translate-y-1/2 bg-lime"
          animate={{ width: `calc((100% - 10px) * ${index / (N - 1)})` }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
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
            style={{ left: `calc(5px + (100% - 10px) * ${i / (N - 1)})` }}
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
        <span aria-live="polite">
          0{index + 1} / 0{N}
        </span>
        <span className="flex items-center gap-2 text-grey">
          Swipe <ChevronSmall className="h-[10px] w-[6px]" />
        </span>
      </div>
    </div>
  );
}
