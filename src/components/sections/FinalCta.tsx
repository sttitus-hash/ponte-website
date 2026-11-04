"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { useIsDesktop } from "@/hooks/useIsDesktop";
import { Button } from "@/components/ui/Button";
import { BrandMark } from "@/components/ui/icons";
import { Reveal, RevealLines } from "@/components/ui/Reveal";
import { finalCta } from "@/lib/content";
import { ease, viewportOnce } from "@/lib/motion";
import { links } from "@/lib/site";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * 08b Final CTA — full-bleed lime panel with four "routes" that draw toward the
 * Launch App button. On desktop the section pins; in the second half of the
 * scroll the panel shrinks to a plate, revealing the animated gradient behind
 * it, and the footer slides in underneath (see Footer's negative top margin).
 */
export function FinalCta() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const isDesktop = useIsDesktop();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  const shrink = [0.45, 1];
  const inset = useTransform(scrollYProgress, shrink, ["0px", "40px"]);
  const top = useTransform(scrollYProgress, shrink, ["-6%", "-16%"]);
  const bottom = useTransform(scrollYProgress, shrink, ["-6%", "30%"]);
  const radius = useTransform(scrollYProgress, shrink, ["0px", "3px"]);
  const contentY = useTransform(scrollYProgress, shrink, ["0%", "-8%"]);

  return (
    <section
      ref={ref}
      id="launch"
      aria-labelledby="cta-title"
      className="relative bg-black lg:h-[200vh]"
    >
      {/* Animated gradient revealed as the panel shrinks (replaces the Figma video fill) */}
      <div aria-hidden="true" className="absolute inset-0 hidden overflow-hidden lg:block">
        <div className="aurora" />
      </div>

      <div className="relative lg:sticky lg:top-0 lg:z-10 lg:h-screen lg:overflow-hidden">
        <motion.div
          className="on-lime relative overflow-hidden bg-lime text-ink lg:absolute"
          style={
            reduce || !isDesktop
              ? undefined
              : { left: inset, right: inset, top, bottom, borderRadius: radius }
          }
        >
          {/* 16:9 stage keeps the route geometry aligned with the copy */}
          <div className="relative mx-auto flex min-h-[100vh] w-full items-center justify-center px-5 py-24 lg:min-h-0 lg:h-screen lg:px-0 lg:py-0">
            <motion.div
              className="relative w-full lg:aspect-[16/9] lg:max-h-screen"
              style={reduce || !isDesktop ? undefined : { y: contentY }}
            >
              <Routes />

              <div className="relative z-10 mx-auto flex max-w-[620px] flex-col items-center text-center lg:absolute lg:inset-x-0 lg:top-[17.6%]">
                <Reveal>
                  <BrandMark className="size-12 lg:size-[65px]" />
                </Reveal>
                <RevealLines
                  id="cta-title"
                  as="h2"
                  lines={finalCta.title}
                  className="text-h2 mt-10 lg:mt-[41px]"
                  delay={1}
                />
                <Reveal as="p" index={3} className="text-body-l mt-6 max-w-[428px] text-olive lg:mt-[30px]">
                  {finalCta.body}
                </Reveal>
                <Reveal index={4} className="mt-10 lg:mt-[78px]">
                  <Button href={links.app} variant="ink">
                    {finalCta.cta}
                  </Button>
                </Reveal>
              </div>

              <p className="text-mono-16 mt-16 text-center text-grey-mid lg:absolute lg:inset-x-0 lg:bottom-[5.5%] lg:mt-0">
                {finalCta.caption}
              </p>
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

const routes = [
  {
    key: "p2p",
    d: "M793 414H1079C1094.46 414 1107 401.46 1107 386V59C1107 43.54 1119.54 31 1135 31H1352",
    station: { x: 1360, y: 24 },
    label: finalCta.routes.p2p,
    labelAt: { x: 1374, y: 10, anchor: "end" as const },
  },
  {
    key: "otc",
    d: "M780.149 414H1009C1024.46 414 1037 426.54 1037 442V543C1037 558.46 1049.54 571 1065 571H1352",
    station: { x: 1360, y: 564 },
    label: finalCta.routes.otc,
    labelAt: { x: 1374, y: 550, anchor: "end" as const },
  },
  {
    key: "whatsapp",
    d: "M578.803 414H295C279.54 414 267 401.46 267 386V109C267 93.54 254.46 81 239 81H22",
    station: { x: 0, y: 74 },
    label: finalCta.routes.whatsapp,
    labelAt: { x: 0, y: 60, anchor: "start" as const },
  },
  {
    key: "more",
    d: "M558 414H365C349.54 414 337 426.54 337 442V533C337 548.46 324.46 561 309 561H22",
    station: { x: 0, y: 554 },
    label: finalCta.routes.more,
    labelAt: { x: 0, y: 540, anchor: "start" as const },
    dashed: true,
  },
];

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
            strokeDasharray={r.dashed ? "4 6" : undefined}
            pathLength={1}
            variants={{
              hidden: { pathLength: 0 },
              show: {
                pathLength: 1,
                transition: { duration: 1.6, ease: ease.inOut, delay: 0.15 + i * 0.12 },
              },
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
            letterSpacing={2}
            style={{ fontFamily: "var(--font-geist-mono), monospace" }}
            variants={{
              hidden: { opacity: 0 },
              show: { opacity: 1, transition: { duration: 0.5, delay: 0.5 + i * 0.12 } },
            }}
          >
            {r.label.toUpperCase()}
          </motion.text>
        </g>
      ))}
      {/* origin squares either side of the button */}
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
          variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { delay: 0.1 } } }}
        />
      ))}
    </motion.svg>
  );
}
