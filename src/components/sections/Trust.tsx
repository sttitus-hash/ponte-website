"use client";

import { motion, useMotionValueEvent, useScroll, useTransform, type MotionValue } from "motion/react";
import { useCallback, useRef, useState } from "react";
import { ChevronSmall } from "@/components/ui/icons";
import { LightBridge } from "@/components/ui/LightBridge";
import { Lottie } from "@/components/ui/Lottie";
import { DotChip } from "@/components/ui/Primitives";
import { Reveal, RevealLines } from "@/components/ui/Reveal";
import { TypeReveal } from "@/components/ui/TypeReveal";
import { trust } from "@/lib/content";
import { ease, viewportOnce } from "@/lib/motion";
import { links } from "@/lib/site";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useIsDesktop } from "@/hooks/useIsDesktop";
import { useTextLayer } from "@/hooks/useSlideDeck";
import { useKeyframes, pageTop } from "@/lib/scroll/ScrollProvider";
import { useScrollDriver } from "@/lib/scroll/ScrollProvider";
import { easeOutExpo } from "@/lib/scroll/sequencer";
import { STEP_VH } from "@/components/sections/Journey";

const tabs = trust.tabs;
const LOTTIE: Record<string, string> = {
  rings: "/animations/rings.json",
  spiral: "/animations/spiral.json",
  lens: "/animations/circle.json",
  support: "/animations/support.json",
};
const actionHref: Record<number, string> = { 0: links.app, 1: links.app, 2: links.app, 3: links.support };

/** Steps on the pinned timeline: hold (under the journey's exit) + 3 tab changes + exit. */
const STEPS = 5;

/**
 * 06 Trust — headline + four tabs. Desktop: pinned; one scroll = one tab (designer note
 * "6 screen"); the lime tab background expands left→right, the panel's line drawing draws
 * 0→100 % on activation, the gradient rises in on entry and everything exits in reverse on
 * the last scroll, revealing Our story beneath. Mobile: four stacked cards that scale in.
 */
export function Trust() {
  const isDesktop = useIsDesktop();
  return isDesktop ? <TrustDesktop /> : <TrustMobile />;
}

function TrustDesktop() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { lenis, sequencer } = useScrollDriver();
  const [active, setActive] = useState(0);
  const [entered, setEntered] = useState(false);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  const p = useTransform(scrollYProgress, (v) => (reduce ? Math.round(v * STEPS) : v * STEPS));
  // deck position of the panel: tab 0 held through step 0 (the journey's exit), then 1 per step
  const pos = useTransform(p, (v) => Math.min(tabs.length - 1, Math.max(0, v - 1)));
  useMotionValueEvent(p, "change", (v) => {
    const next = Math.min(tabs.length - 1, Math.max(0, Math.round(v - 1)));
    if (next !== active) setActive(next);
    if (!entered && v > 0.05) setEntered(true);
  });
  // exit (last step): content leaves in reverse, gradient fades
  const exitO = useTransform(p, (v) => 1 - Math.min(1, Math.max(0, (v - 4) / 0.8)));
  const exitY = useTransform(p, (v) => -24 * Math.min(1, Math.max(0, (v - 4) / 0.8)));
  const exitScale = useTransform(p, (v) => 1 - 0.04 * Math.min(1, Math.max(0, (v - 4) / 0.8)));

  useKeyframes(2, () => {
    const el = ref.current;
    if (!el) return [];
    const top = pageTop(el);
    const step = window.innerHeight * STEP_VH;
    return Array.from({ length: STEPS + 1 }, (_, i) => top + i * step);
  });

  const jumpTo = useCallback(
    (i: number) => {
      const el = ref.current;
      if (!el) return;
      const target = pageTop(el) + window.innerHeight * STEP_VH * (i + 1);
      if (lenis) sequencer.scrollTo(target, 1, easeOutExpo);
      else window.scrollTo({ top: target, behavior: reduce ? "auto" : "smooth" });
      setActive(i);
    },
    [lenis, sequencer, reduce],
  );

  return (
    <section
      ref={ref}
      id="trust"
      aria-labelledby="trust-title"
      className="relative z-[5]"
      style={{ height: `calc(100vh + ${STEPS * STEP_VH * 100}vh)`, marginTop: `calc(-100vh - ${STEP_VH * 100}vh)` }}
    >
      {/* no section background: the next section sits beneath and is revealed as this one fades out */}
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* Backdrop: the Light Bridge turned on its side (Figma: rotated video frame); rises in on entry (row 26) */}
        <motion.div aria-hidden="true" className="absolute inset-0 bg-black" style={{ opacity: exitO }}>
          <div className="absolute left-1/2 top-1/2 h-[100vw] w-[100vh] min-h-[1200px] min-w-[1000px] -translate-x-1/2 -translate-y-1/2 rotate-90 scale-[1.15]">
            <LightBridge className="absolute inset-0" posterClassName="object-cover object-[50%_35%]" reveal="armed" rise={entered} params={{ uRiseDur: 2.6 }} />
          </div>
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.7)_0%,rgba(0,0,0,0.2)_45%,rgba(0,0,0,0.4)_100%)]" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-black" />
        </motion.div>

        <motion.div
          className="relative grid h-full grid-cols-[minmax(360px,537px)_1fr] grid-rows-[auto_1fr] gap-x-[clamp(40px,calc(31.6vw-283.6px),222px)] px-gutter pb-[clamp(48px,13vh,118px)] pt-[clamp(56px,13vh,118px)]"
          style={{ opacity: exitO, y: exitY, scale: exitScale }}
        >
          <RevealLines
            id="trust-title"
            as="h2"
            lines={[
              <span key="a" className="text-gradient-light">
                {trust.title[0]}
              </span>,
              <span key="b" className="text-lime">
                {trust.title[1]}
              </span>,
            ]}
            label={trust.title.join(" ")}
            className="text-h2 w-[min(660px,52vw)] max-w-none"
          />
          <Reveal as="p" index={2} className="text-body-l mt-1.5 max-w-[559px] text-white">
            {trust.body}
          </Reveal>

          {/* Tab list ------------------------------------------------------- */}
          <div role="tablist" aria-label="Trust" aria-orientation="vertical" className="flex flex-col gap-3 self-end">
            {tabs.map((tab, i) => {
              const isActive = i === active;
              return (
                <button
                  key={tab.title}
                  role="tab"
                  id={`trust-tab-${i}`}
                  aria-selected={isActive}
                  aria-controls="trust-panel"
                  tabIndex={isActive ? 0 : -1}
                  onClick={() => jumpTo(i)}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowDown") jumpTo(Math.min(tabs.length - 1, i + 1));
                    if (e.key === "ArrowUp") jumpTo(Math.max(0, i - 1));
                  }}
                  className={`group relative grid h-[111px] grid-cols-[1fr_auto] grid-rows-[auto_1fr] overflow-hidden rounded-panel border px-6 pb-5 pt-[21px] text-left transition-colors duration-500 ${
                    isActive ? "border-lime" : "border-card-stroke bg-card/90 backdrop-blur-sm hover:border-[#2c2c2c]"
                  }`}
                >
                  {/* lime fill expands from the left edge (row 24) */}
                  <motion.span
                    aria-hidden="true"
                    className="absolute inset-0 origin-left bg-lime"
                    initial={false}
                    animate={{ scaleX: isActive ? 1 : 0 }}
                    transition={{ duration: reduce ? 0 : 0.55, ease: ease.inOut }}
                  />
                  <span className={`relative col-start-1 row-start-1 font-dot text-[36px] leading-none tracking-[-0.02em] transition-colors duration-500 ${isActive ? "text-ink" : "text-grey-dark"}`}>
                    0{i + 1}
                  </span>
                  <span className={`text-mono-12 relative col-start-2 row-start-1 self-start pt-1 transition-colors duration-500 ${isActive ? "text-olive" : "text-grey-dim"}`}>
                    <TypeReveal text={tab.label} active={isActive} />
                  </span>
                  <span
                    className={`text-tab-title relative col-span-2 col-start-1 row-start-2 self-end truncate pr-12 pt-2 transition-colors duration-500 ${
                      isActive ? "text-black" : "text-grey"
                    }`}
                  >
                    {tab.title}
                  </span>
                  <span
                    aria-hidden="true"
                    className={`absolute bottom-5 right-6 flex size-8 items-center justify-center rounded-full border transition-all duration-500 ${
                      isActive ? "border-lime-dim bg-lime-dim text-ink" : "border-[#333] text-grey group-hover:border-grey-dim"
                    }`}
                  >
                    <ChevronSmall className="h-[10px] w-[6px]" />
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active panel ----------------------------------------------------- */}
          <div id="trust-panel" role="tabpanel" aria-labelledby={`trust-tab-${active}`} className="on-lime relative min-h-[480px] self-end overflow-hidden rounded-panel bg-lime text-ink">
            {tabs.map((tab, i) => (
              <PanelLayer key={tab.title} pos={pos} i={i} reduce={reduce} current={i === active} />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/** One stacked panel; fades / drifts with the deck position; its line drawing draws in on activation. */
function PanelLayer({ pos, i, reduce, current }: { pos: MotionValue<number>; i: number; reduce: boolean; current: boolean }) {
  const style = useTextLayer(pos, i, reduce, 18);
  return (
    <motion.div className={`absolute inset-0 ${current ? "" : "pointer-events-none"}`} style={style} aria-hidden={current ? undefined : true}>
      <PanelContent index={i} active={current} />
    </motion.div>
  );
}

function PanelContent({ index, stacked, tone = "lime", active }: { index: number; stacked?: boolean; tone?: "lime" | "mint"; active: boolean }) {
  const tab = tabs[index];
  const dim = tone === "mint" ? "bg-[#bfeedd]" : "bg-lime-dim";
  const hover = tone === "mint" ? "hover:bg-[#aee5d1]" : "hover:bg-[#d2d86c]";
  return (
    <div className={`relative flex h-full flex-col ${stacked ? "p-5" : "p-[19px] pl-[25px]"} lg:flex-row`}>
      <div className="flex flex-1 flex-col lg:pr-6">
        <div className="flex items-start justify-between">
          <span className="text-dot-66 text-ink">0{index + 1}</span>
          <span className="text-mono-12 whitespace-nowrap pr-[7px] pt-[8px] text-olive">
            0{index + 1} / 04
          </span>
        </div>

        {stacked ? <Illustration kind={tab.illustration} chips={tab.chips} active={active} className={`mt-6 ${dim}`} /> : null}

        <div className="mt-auto pt-8">
          <h3 className="text-card-title max-w-[360px] text-ink">{tab.title}</h3>
          <p className="text-body-s mt-3 max-w-[360px] text-olive">{tab.body}</p>
          <a
            href={actionHref[index]}
            className={`mt-6 flex h-11 w-full max-w-[360px] items-center justify-between rounded-full ${dim} pl-4 pr-1 text-mono-12 text-ink transition-colors duration-300 ${hover}`}
          >
            {tab.action}
            <span aria-hidden="true" className="flex size-9 items-center justify-center rounded-full bg-ink text-lime">
              <ChevronSmall className="h-[10px] w-[6px]" />
            </span>
          </a>
        </div>
      </div>

      {stacked ? null : <Illustration kind={tab.illustration} chips={tab.chips} active={active} className="w-[clamp(256px,45%,348px)] shrink-0 bg-lime-dim" />}
    </div>
  );
}

function Illustration({ kind, chips, active, className = "" }: { kind: string; chips: readonly string[]; active: boolean; className?: string }) {
  return (
    <div className={`relative flex flex-col justify-between rounded-panel p-6 text-ink lg:min-h-[442px] ${className}`}>
      <div className="flex flex-1 items-center justify-center py-2">
        {/* Official Lottie line drawings: draw 0 → 100 % when the tab activates (row 25) */}
        <Lottie src={LOTTIE[kind] ?? LOTTIE.rings} className="h-[240px] w-full max-w-[300px] lg:h-[262px]" drawOnce drawKey={active} />
      </div>
      <ul className="hidden flex-col items-start gap-2 lg:flex">
        {chips.map((chip) => (
          <li key={chip}>
            <DotChip>{chip}</DotChip>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Mobile: stacked cards, vertical gradient (rows 48–50)                        */
/* -------------------------------------------------------------------------- */

function TrustMobile() {
  const reduce = useReducedMotion();
  return (
    <section id="trust" aria-labelledby="trust-title" className="relative overflow-hidden bg-black">
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-[906px]">
        {/* vertical (unrotated) Light Bridge on mobile (row 50) */}
        <LightBridge className="absolute inset-0" posterClassName="object-cover object-[50%_35%]" params={{ uZoom: 1.6, uOffY: 0.1 }} />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.55)_0%,rgba(0,0,0,0.25)_45%,rgba(0,0,0,0.9)_100%)]" />
      </div>
      <div className="relative px-5 pb-16 pt-[58px]">
        <RevealLines
          id="trust-title"
          as="h2"
          lines={[
            <span key="a" className="text-gradient-light">
              {trust.title[0]}
            </span>,
            <span key="b" className="text-lime">
              {trust.title[1]}
            </span>,
          ]}
          label={trust.title.join(" ")}
          className="text-h2"
        />
        {/* regular 16px body on mobile (row 48) */}
        <Reveal as="p" index={2} className="text-body-s mt-6 text-white">
          {trust.body}
        </Reveal>

        <ol className="mt-10 flex flex-col gap-3">
          {tabs.map((tab, i) => (
            <MobileCard key={tab.title} index={i} reduce={reduce} />
          ))}
        </ol>
      </div>
    </section>
  );
}

function MobileCard({ index, reduce }: { index: number; reduce: boolean }) {
  const [seen, setSeen] = useState(false);
  return (
    <motion.li
      className={`on-lime relative overflow-hidden rounded-panel text-ink ${index % 2 ? "bg-mint" : "bg-lime"}`}
      initial={reduce ? false : { opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={viewportOnce}
      onViewportEnter={() => setSeen(true)}
      transition={{ duration: 0.7, ease: ease.out }}
    >
      <PanelContent index={index} stacked tone={index % 2 ? "mint" : "lime"} active={seen} />
    </motion.li>
  );
}
