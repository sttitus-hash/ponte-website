"use client";

import { motion, useMotionValueEvent, useScroll, useTransform } from "motion/react";
import { useRef, useState } from "react";
import { useIsDesktop } from "@/hooks/useIsDesktop";
import { Button } from "@/components/ui/Button";
import { BrandMark } from "@/components/ui/icons";
import { Reveal, RevealLines } from "@/components/ui/Reveal";
import { finalCta } from "@/lib/content";
import { ease, viewportOnce } from "@/lib/motion";
import { links } from "@/lib/site";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { LightBridge } from "@/components/ui/LightBridge";
import { useKeyframes, pageTop } from "@/lib/scroll/ScrollProvider";
import { STEP_VH } from "@/components/sections/Journey";

/**
 * 08b Final CTA — full-bleed lime panel with four "routes" that draw toward the Launch App
 * button. Desktop (row 34): the section pins for one step; in that step the panel shrinks
 * until its margins are equal on all sides (the page gutter) and the animated gradient
 * rises in behind it (row 35); it never shrinks further. Afterwards the page scrolls on
 * and the panel moves up, revealing the footer that sits fixed beneath (sticky bottom).
 * Mobile: 8px margins, the routes drawing and the gradient behind (row 54).
 */
export function FinalCta() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const isDesktop = useIsDesktop();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [rise, setRise] = useState(false);
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (!rise && v > 0.04) setRise(true);
  });

  useKeyframes(
    4,
    () => {
      const el = ref.current;
      if (!el) return [];
      const top = pageTop(el);
      return [top, top + window.innerHeight * STEP_VH];
    },
    isDesktop,
  );

  const gutter = "clamp(1rem, 2.5vw, 2.5rem)";
  const k = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const inset = useTransform(k, (v) => `calc(${gutter} * ${v})`);
  const radius = useTransform(k, (v) => `${3 * v}px`);
  const contentScale = useTransform(k, (v) => 1 - 0.03 * v);

  return (
    <section
      ref={ref}
      id="launch"
      aria-labelledby="cta-title"
      className="relative z-[2] bg-black lg:h-[calc(100vh+80vh)]"
    >
      {/* Animated gradient revealed as the margins open: the Light Bridge shader (Figma video fill) */}
      <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
        <div className="sticky top-0 h-screen">
          <LightBridge className="absolute inset-0" reveal={isDesktop ? "armed" : true} rise={rise} params={{ uRiseDur: 2.4, uZoom: isDesktop ? 1.1 : 1.8 }} />
        </div>
      </div>

      <div className="relative p-2 lg:sticky lg:top-0 lg:z-10 lg:h-screen lg:overflow-hidden lg:p-0">
        <motion.div
          className="on-lime relative overflow-hidden rounded-panel bg-lime text-ink lg:absolute"
          style={reduce || !isDesktop ? undefined : { left: inset, right: inset, top: inset, bottom: inset, borderRadius: radius }}
        >
          <div className="relative mx-auto flex w-full items-center justify-center px-5 pb-6 pt-16 lg:h-screen lg:px-0 lg:py-0">
            <motion.div className="relative w-full lg:aspect-[16/9] lg:max-h-screen" style={reduce || !isDesktop ? undefined : { scale: contentScale }}>
              <Routes />
              <MobileRoutes />

              <div className="relative z-10 mx-auto flex max-w-[620px] flex-col items-center text-center lg:absolute lg:inset-x-0 lg:top-[17.6%]">
                <Reveal>
                  <BrandMark className="size-12 lg:size-[65px]" />
                </Reveal>
                <RevealLines id="cta-title" as="h2" lines={finalCta.title} className="text-h2 mt-[26px] lg:mt-[41px]" delay={1} />
                <Reveal as="p" index={3} className="text-body-l mt-4 max-w-[428px] text-olive max-lg:text-body-s lg:mt-[30px]">
                  {finalCta.body}
                </Reveal>
                <Reveal index={4} className="mt-9 w-full max-w-[319px] lg:mt-[60px] lg:w-auto lg:max-w-none">
                  <Button href={links.app} variant="ink" className="max-lg:w-full max-lg:justify-between">
                    {finalCta.cta}
                  </Button>
                </Reveal>
              </div>

              {/* Mobile: room for the routes drawing under the button (Figma 9710:31488) */}
              <div aria-hidden="true" className="h-[300px] lg:hidden" />

              <p className="text-mono-16 text-center text-grey-mid lg:absolute lg:inset-x-0 lg:bottom-[4.1%] lg:mt-0">{finalCta.caption}</p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Routes graphic — rebuilt from the Figma vectors (viewBox 1374×578)          */
/* -------------------------------------------------------------------------- */

/** Button centre x (687) ± equal clearance: every route leaves the button at the same distance (row 33). */
const RIGHT_X = 799;
const LEFT_X = 575;

const routes = [
  {
    key: "p2p",
    d: `M${RIGHT_X} 414H1079C1094.46 414 1107 401.46 1107 386V59C1107 43.54 1119.54 31 1135 31H1352`,
    station: { x: 1360, y: 24 },
    label: finalCta.routes.p2p,
    labelAt: { x: 1374, y: 10, anchor: "end" as const },
  },
  {
    key: "otc",
    d: `M${RIGHT_X} 414H1009C1024.46 414 1037 426.54 1037 442V543C1037 558.46 1049.54 571 1065 571H1352`,
    station: { x: 1360, y: 564 },
    label: finalCta.routes.otc,
    labelAt: { x: 1374, y: 550, anchor: "end" as const },
  },
  {
    key: "whatsapp",
    d: `M${LEFT_X} 414H295C279.54 414 267 401.46 267 386V109C267 93.54 254.46 81 239 81H22`,
    station: { x: 0, y: 74 },
    label: finalCta.routes.whatsapp,
    labelAt: { x: 0, y: 60, anchor: "start" as const },
  },
  {
    key: "more",
    d: `M${LEFT_X} 414H365C349.54 414 337 426.54 337 442V533C337 548.46 324.46 561 309 561H22`,
    station: { x: 0, y: 554 },
    label: finalCta.routes.more,
    labelAt: { x: 0, y: 540, anchor: "start" as const },
    dashed: true,
  },
];

const MONO = { fontFamily: "var(--font-geist-mono), monospace", letterSpacing: "0.02em" };

function Routes() {
  const reduce = useReducedMotion();
  return (
    <motion.svg
      viewBox="0 0 1374 578"
      aria-hidden="true"
      className="absolute left-[7.06%] top-[17.6%] hidden w-[85.9%] lg:block"
      initial={reduce ? false : "hidden"}
      whileInView="show"
      viewport={viewportOnce}
    >
      {routes.map((r, i) => (
        <g key={r.key} className={r.dashed ? "opacity-35" : undefined}>
          <motion.path
            d={r.d}
            fill="none"
            stroke="#100F0F"
            strokeWidth={1.5}
            vectorEffect="non-scaling-stroke"
            strokeDasharray={r.dashed ? "4 6" : undefined}
            pathLength={1}
            variants={{
              hidden: { pathLength: 0 },
              show: { pathLength: 1, transition: { duration: 1.6, ease: ease.inOut, delay: 0.15 + i * 0.12 } },
            }}
          />
          <motion.rect
            x={r.station.x}
            y={r.station.y}
            width={14}
            height={14}
            fill="#E8EE81"
            stroke="#100F0F"
            strokeWidth={1.5}
            vectorEffect="non-scaling-stroke"
            variants={{
              hidden: { opacity: 0, scale: 0.6 },
              show: { opacity: 1, scale: 1, transition: { duration: 0.4, delay: 0.3 + i * 0.12 } },
            }}
            style={{ transformBox: "fill-box", transformOrigin: "center" }}
          />
          <motion.text
            x={r.labelAt.x}
            y={r.labelAt.y}
            textAnchor={r.labelAt.anchor}
            fill="#3A3D1E"
            fontSize={12}
            style={MONO}
            variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.5, delay: 0.5 + i * 0.12 } } }}
          >
            {r.label.toUpperCase()}
          </motion.text>
        </g>
      ))}
      {/* origin squares, equidistant from the button (687 ± 328) and drawn with even strokes */}
      {[1011, 351].map((x) => (
        <motion.rect
          key={x}
          x={x}
          y={409}
          width={8}
          height={8}
          fill="#100F0F"
          stroke="#E8EE81"
          strokeWidth={2}
          vectorEffect="non-scaling-stroke"
          variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { delay: 0.1 } } }}
        />
      ))}
    </motion.svg>
  );
}

/** Mobile routes (Figma 9710:31488): two origins under the button, four stations at the panel edges. */
function MobileRoutes() {
  const reduce = useReducedMotion();
  const lines = [
    { d: "M180 364V396", dashed: false },
    { d: "M180 412V452Q180 472 160 472H42", dashed: false },
    { d: "M180 412V452Q180 472 200 472H317", dashed: false },
    { d: "M180 412V528", dashed: false },
    { d: "M180 544V584Q180 604 160 604H42", dashed: true },
    { d: "M180 544V584Q180 604 200 604H317", dashed: false },
  ];
  const labels = [
    { x: 48, y: 462, t: finalCta.routes.whatsapp, anchor: "start" as const },
    { x: 311, y: 462, t: finalCta.routes.p2p, anchor: "end" as const },
    { x: 48, y: 594, t: finalCta.routes.more, anchor: "start" as const, dim: true },
    { x: 311, y: 594, t: finalCta.routes.otc, anchor: "end" as const },
  ];
  return (
    <motion.svg
      viewBox="0 360 359 260"
      aria-hidden="true"
      className="absolute bottom-[60px] left-1/2 w-full max-w-[360px] -translate-x-1/2 lg:hidden"
      initial={reduce ? false : "hidden"}
      whileInView="show"
      viewport={viewportOnce}
    >
      {lines.map((l, i) => (
        <motion.path
          key={l.d}
          d={l.d}
          fill="none"
          stroke="#100F0F"
          strokeWidth={1.5}
          vectorEffect="non-scaling-stroke"
          strokeDasharray={l.dashed ? "4 6" : undefined}
          className={l.dashed ? "opacity-35" : undefined}
          pathLength={1}
          variants={{ hidden: { pathLength: 0 }, show: { pathLength: 1, transition: { duration: 1.2, ease: ease.inOut, delay: 0.1 + i * 0.1 } } }}
        />
      ))}
      {[400, 532].map((y) => (
        <rect key={y} x={176} y={y} width={8} height={8} fill="#100F0F" stroke="#E8EE81" strokeWidth={2} vectorEffect="non-scaling-stroke" />
      ))}
      {[
        [30, 466],
        [317, 466],
        [30, 598],
        [317, 598],
      ].map(([x, y]) => (
        <motion.rect key={`${x}-${y}`} x={x} y={y} width={12} height={12} fill="#E8EE81" stroke="#100F0F" strokeWidth={1.5} vectorEffect="non-scaling-stroke" variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { delay: 0.6 } } }} />
      ))}
      {labels.map((l) => (
        <motion.text key={l.t} x={l.x} y={l.y} textAnchor={l.anchor} fill="#3A3D1E" fontSize={11} style={MONO} className={l.dim ? "opacity-35" : undefined} variants={{ hidden: { opacity: 0 }, show: { opacity: l.dim ? 0.35 : 1, transition: { delay: 0.8 } } }}>
          {l.t.toUpperCase()}
        </motion.text>
      ))}
    </motion.svg>
  );
}
