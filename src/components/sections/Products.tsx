"use client";

import Image from "next/image";
import { motion, useMotionValue, useMotionValueEvent, useScroll, useTransform, type MotionValue } from "motion/react";
import { useCallback, useRef, useState, type ReactNode } from "react";
import { useIsDesktop } from "@/hooks/useIsDesktop";
import { Button } from "@/components/ui/Button";
import {
  OtcQuote,
  OtcSize,
  OtcTerms,
  P2PClarity,
  P2PEscrow,
  P2PVerified,
  Whatsapp,
} from "@/components/ui/icons";
import { Marker, Tag } from "@/components/ui/Primitives";
import { GlassCard } from "@/components/ui/GlassCard";
import { Reveal, RevealGroup, RevealLines } from "@/components/ui/Reveal";
import { otc, p2p, whatsapp } from "@/lib/content";
import { ease } from "@/lib/motion";
import { links } from "@/lib/site";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { asset } from "@/lib/asset";

/* -------------------------------------------------------------------------- */
/* Data                                                                        */
/* -------------------------------------------------------------------------- */

const icons: Record<string, (p: { className?: string }) => ReactNode> = {
  "p2p-verified": (p) => <P2PVerified {...p} />,
  "p2p-escrow": (p) => <P2PEscrow {...p} />,
  "p2p-clarity": (p) => <P2PClarity {...p} />,
  "otc-quote": (p) => <OtcQuote {...p} />,
  "otc-size": (p) => <OtcSize {...p} />,
  "otc-terms": (p) => <OtcTerms {...p} />,
};

type Screen = {
  id: "p2p" | "otc" | "whatsapp";
  tag: string;
  title: readonly string[];
  body: string;
  cta: string;
  href: string;
  features?: { icon: string; title: string; body: string }[];
  /** Text column on the left (P2P, WhatsApp) or right (OTC) of the stage. */
  side: "left" | "right";
};

const screens: Screen[] = [
  { id: "p2p", ...p2p, href: links.p2p, side: "left" },
  { id: "otc", ...otc, href: links.otc, side: "right" },
  { id: "whatsapp", ...whatsapp, href: links.whatsapp, side: "left" },
];

/** Horizontal offset of the 170%-wide composition inside the mobile panel. */
const mobileOffset: Record<Screen["id"], string> = { p2p: "-42%", otc: "-7%", whatsapp: "-30%" };

/** Lime panel geometry per screen, as fractions of the 1600×900 stage (Figma frames). */
const PANEL = {
  p2p: { left: 0.333, top: 0, width: 0.734, height: 1.056 },
  otc: { left: -0.067, top: -0.034, width: 0.734, height: 1.056 },
  whatsapp: { left: 0.0144, top: 0.0244, width: 0.971, height: 0.949 },
} as const;
const panel = {
  p2p: { left: "33.3%", top: "0%", width: "73.4%", height: "105.6%" },
  otc: { left: "-6.7%", top: "-3.4%", width: "73.4%", height: "105.6%" },
  whatsapp: { left: "1.44%", top: "2.44%", width: "97.1%", height: "94.9%" },
};

/** Scroll-progress keyframes: screen 0 holds, morph, screen 1 holds, morph, screen 2 holds. */
const K = {
  a0: 0.26, // P2P → OTC morph starts
  a1: 0.4, // …ends
  b0: 0.6, // OTC → WhatsApp morph starts
  b1: 0.74, // …ends
};
const KEYS = [K.a0, K.a1, K.b0, K.b1];

/**
 * Slot of each composition on the strip, in stage widths. The OTC composition's content
 * ends at ~69% of its stage and the WhatsApp content starts at ~25%, so the third slot
 * is packed closer (0.67 instead of 1, just past the OTC hand's right edge): the window stays full while the strip moves.
 */
const STRIP = [0, 1, 1.67] as const;

/** Piecewise-linear interpolation over the morph keyframes (clamped). */
function lerpKeys(v: number, out: readonly number[]) {
  if (v <= KEYS[0]) return out[0];
  for (let i = 1; i < KEYS.length; i++) {
    if (v <= KEYS[i]) {
      const f = (v - KEYS[i - 1]) / (KEYS[i] - KEYS[i - 1]);
      return out[i - 1] + (out[i] - out[i - 1]) * f;
    }
  }
  return out[out.length - 1];
}
const ramp = (v: number, from: number, to: number, a: number, b: number) =>
  v <= from ? a : v >= to ? b : a + (b - a) * ((v - from) / (to - from));

/** Panel edge/size in px for the current timeline position. */
function usePanelGeo(t: MotionValue<number>, size: MotionValue<number>, key: "left" | "top" | "width" | "height") {
  return useTransform([t, size], ([v, s]: number[]) => lerpKeys(v, [PANEL.p2p[key], PANEL.otc[key], PANEL.otc[key], PANEL.whatsapp[key]]) * s);
}

/* -------------------------------------------------------------------------- */
/* Section                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * 03 P2P · 04 OTC · 05 WhatsApp — on desktop these are one pinned sequence driven by a
 * single scroll timeline. The lime panel is a window: the three compositions sit side by
 * side on a strip behind it (each laid out in stage coordinates), and as the panel slides
 * to its next position the strip pushes the outgoing composition out and the incoming one
 * in, so the window is never empty and the photos (opaque lime exports) are always clipped
 * by the panel. The copy columns on the black area cross over at the boundaries. Scrubbing,
 * stopping and reversing all follow the scroll position; under reduced motion the timeline
 * snaps between states instead of moving. On mobile the screens stack.
 */
export function Products() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const isDesktop = useIsDesktop();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  const [active, setActive] = useState(0);

  // Stage size in px (the compositions are positioned in stage coordinates).
  const stageW = useMotionValue(1600);
  const stageH = useMotionValue(900);
  const stageRef = useCallback(
    (el: HTMLDivElement | null) => {
      if (!el) return;
      const update = () => {
        const r = el.getBoundingClientRect();
        stageW.set(r.width);
        stageH.set(r.height);
        el.style.setProperty("--stage-k", String(Math.min(1, r.width / 1600)));
        el.style.setProperty("--u", String(r.width / 1600));
      };
      update();
      const ro = new ResizeObserver(update);
      ro.observe(el);
      return () => ro.disconnect();
    },
    [stageW, stageH],
  );

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const next = v < (K.a0 + K.a1) / 2 ? 0 : v < (K.b0 + K.b1) / 2 ? 1 : 2;
    if (next !== active) setActive(next);
  });

  // Reduced motion: snap each morph at its midpoint instead of moving through it.
  const t = useTransform(scrollYProgress, (v) => {
    if (!reduce) return v;
    if (v > K.a0 && v < K.a1) return v < (K.a0 + K.a1) / 2 ? K.a0 : K.a1;
    if (v > K.b0 && v < K.b1) return v < (K.b0 + K.b1) / 2 ? K.b0 : K.b1;
    return v;
  });

  const left = usePanelGeo(t, stageW, "left");
  const top = usePanelGeo(t, stageH, "top");
  const width = usePanelGeo(t, stageW, "width");
  const height = usePanelGeo(t, stageH, "height");
  const negLeft = useTransform(left, (v) => -v);
  const negTop = useTransform(top, (v) => -v);

  // The strip of compositions moves to each composition's slot across the two morphs.
  const stripX = useTransform([t, stageW], ([v, w]: number[]) => -lerpKeys(v, [0, STRIP[1], STRIP[1], STRIP[2]]) * w);

  // Copy columns: the outgoing column leaves as the panel starts to move, the incoming one
  // settles once the panel has parked (its column sits where the moving panel passes).
  const copy = [
    { o: useTransform(t, (v) => ramp(v, K.a0, K.a0 + 0.04, 1, 0)), x: useTransform(t, (v) => ramp(v, K.a0, K.a0 + 0.04, 0, -40)) },
    {
      o: useTransform(t, (v) => (v < K.b0 - 0.03 ? ramp(v, K.a1 - 0.02, K.a1 + 0.05, 0, 1) : ramp(v, K.b0 - 0.03, K.b0 + 0.02, 1, 0))),
      x: useTransform(t, (v) => (v < K.b0 - 0.03 ? ramp(v, K.a1 - 0.02, K.a1 + 0.05, 40, 0) : ramp(v, K.b0 - 0.03, K.b0 + 0.02, 0, -40))),
    },
    { o: useTransform(t, (v) => ramp(v, K.b1 - 0.04, K.b1 + 0.04, 0, 1)), x: useTransform(t, (v) => ramp(v, K.b1 - 0.04, K.b1 + 0.04, 40, 0)) },
  ];

  // WhatsApp timeline fills as the last screen settles
  const timeline = useTransform(t, [K.b1, 0.95], [0, 1]);

  return (
    <div ref={ref} className="relative bg-black lg:h-[340vh]">
      {/* Desktop stage ------------------------------------------------------ */}
      <div className="hidden lg:sticky lg:top-0 lg:flex lg:h-screen lg:items-center lg:justify-center lg:overflow-hidden">
        <motion.div
          ref={stageRef}
          className="relative aspect-[16/9] max-h-screen w-full overflow-hidden"
          initial={reduce ? false : { opacity: 0, y: 48 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.9, ease: ease.out }}
        >
          {/* Lime panel = the window onto the composition strip */}
          <motion.div
            aria-hidden="true"
            className="absolute overflow-hidden rounded-panel bg-lime will-change-[left,top,width,height]"
            style={{ left, top, width, height }}
          >
            <motion.div className="absolute" style={{ left: negLeft, top: negTop, width: stageW, height: stageH }}>
              <motion.div className="absolute inset-0 will-change-transform" style={{ x: stripX }}>
                {screens.map((screen, i) => (
                  <Composition key={screen.id} id={screen.id} index={i} stageW={stageW} stripX={stripX} />
                ))}
              </motion.div>
            </motion.div>
          </motion.div>

          {screens.map((screen, i) => (
            <DesktopScreen
              key={screen.id}
              screen={screen}
              index={i}
              active={active === i}
              opacity={copy[i].o}
              x={copy[i].x}
              timeline={timeline}
            />
          ))}
        </motion.div>
      </div>

      {/* Sentinels: give the nav + anchors something in normal flow to target */}
      {isDesktop ? (
        <>
          <div id="p2p" className="pointer-events-none absolute left-0 top-0 h-[28%] w-px" />
          <div id="otc" className="pointer-events-none absolute left-0 top-[28%] h-[24%] w-px" />
          <div id="whatsapp" className="pointer-events-none absolute left-0 top-[52%] h-[48%] w-px" />
        </>
      ) : null}

      {/* Mobile stack ------------------------------------------------------- */}
      <div className="lg:hidden">
        {screens.map((screen) => (
          <MobileScreen key={screen.id} screen={screen} withId={!isDesktop} />
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Desktop copy column                                                         */
/* -------------------------------------------------------------------------- */

function DesktopScreen({
  screen,
  index,
  active,
  opacity,
  x,
  timeline,
}: {
  screen: Screen;
  index: number;
  active: boolean;
  opacity: MotionValue<number>;
  x: MotionValue<number>;
  timeline: MotionValue<number>;
}) {
  const pointerEvents = useTransform(opacity, (v) => (v > 0.5 ? "auto" : "none"));
  const isWA = screen.id === "whatsapp";
  const textX = screen.side === "left" ? (isWA ? "3.9%" : "2.5%") : "69.6%";
  const onLime = isWA;

  return (
    <motion.section
      aria-labelledby={`${screen.id}-title`}
      aria-hidden={!active}
      className={`absolute inset-0 ${onLime ? "on-lime text-ink" : "text-white"}`}
      style={{ opacity, pointerEvents }}
    >
      {/* Copy column + feature list: laid out in 1600×900 frame pixels and scaled with the
          stage (--stage-k), so the Figma rhythm holds and the list never collides with the
          CTA or runs past the stage on 1280–1440 laptops and landscape tablets. */}
      <motion.div
        className="absolute top-[4.4%] w-[464px] origin-top-left"
        style={{ left: textX, x, scale: "var(--stage-k, 1)" }}
      >
        <div className="relative w-full">
          <Tag>{screen.tag}</Tag>
          <h2 id={`${screen.id}-title`} className={`text-h3 mt-[54px] ${isWA ? "max-w-[320px]" : "max-w-[470px]"}`}>
            {screen.title.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h2>
          <p
            className={`text-body-l mt-[30px] ${isWA ? "max-w-[447px] text-forest" : "max-w-[425px] text-grey"} ${
              screen.id === "otc" ? "max-w-[415px]" : ""
            }`}
          >
            {screen.body}
          </p>
          <div className="mt-[46px]">
            {isWA ? (
              <Button href={screen.href} variant="ink" circleIcon={<Whatsapp className="size-[18px]" />}>
                {screen.cta}
              </Button>
            ) : (
              <Button href={screen.href}>{screen.cta}</Button>
            )}
          </div>
        </div>

        {/* Feature list (P2P / OTC) */}
        {screen.features ? (
          <ul className="absolute left-0 top-[553px] flex w-[376px] flex-col gap-[35px]">
            {screen.features.map((f) => (
              <li key={f.title} className="grid grid-cols-[62px_1fr] gap-x-[2px]">
                <span className="flex size-[62px] items-start justify-center pt-1 text-lime">
                  {icons[f.icon]({ className: "h-[34px] w-auto max-w-[36px]" })}
                </span>
                <div>
                  <h3 className="text-mono-14 text-gradient-lime uppercase">{f.title}</h3>
                  <p className="text-body-s mt-[9px] max-w-[312px] text-grey">{f.body}</p>
                </div>
              </li>
            ))}
          </ul>
        ) : null}
      </motion.div>
      {isWA ? <Timeline active={active} progress={timeline} className="absolute left-[66.4%] top-[16.2%] w-[31%]" /> : null}

      <span className="sr-only">Screen {index + 1} of 3</span>
    </motion.section>
  );
}

/* -------------------------------------------------------------------------- */
/* Desktop compositions on the strip (stage coordinates, one stage width apart) */
/* -------------------------------------------------------------------------- */

function Composition({ id, index, stageW, stripX }: { id: Screen["id"]; index: number; stageW: MotionValue<number>; stripX: MotionValue<number> }) {
  const x = useTransform(stageW, (w) => w * STRIP[index]);
  // The pattern tile is periodic (19.8px), so offsetting it by the strip position keeps
  // the hairlines continuous across the seam between two compositions.
  const patternX = useTransform(stageW, (w) => -w * STRIP[index]);
  // Subtle parallax: cards drift a little further than the phone while the strip moves.
  const parallax = useTransform([stripX, stageW], ([s, w]: number[]) => (s + w * STRIP[index]) * 0.08);
  return (
    <motion.div aria-hidden="true" className="absolute inset-0" style={{ x }}>
      <Visual id={id} patternX={patternX} parallax={parallax} />
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/* Visual compositions (phone + glass cards) — % of the 1600×900 stage        */
/* -------------------------------------------------------------------------- */

function Visual({
  id,
  mobile,
  patternX,
  parallax,
}: {
  id: Screen["id"];
  mobile?: boolean;
  patternX?: MotionValue<number>;
  parallax?: MotionValue<number>;
}) {
  // Mobile: `--u` = composition width ÷ 1600 (desktop sets it on the stage).
  const rootRef = useCallback(
    (el: HTMLDivElement | null) => {
      if (!el || !mobile) return;
      const update = () => el.style.setProperty("--u", String(el.getBoundingClientRect().width / 1600));
      update();
      const ro = new ResizeObserver(update);
      ro.observe(el);
      return () => ro.disconnect();
    },
    [mobile],
  );

  // The phone / hand photos ship with the lime background baked in (opaque exports), so the
  // panel's hairline pattern is drawn as an overlay above them (Figma layers the pattern tile
  // above the photo) — otherwise the photo's rectangle reads as a boundary on the panel.
  const pattern = (
    <motion.div
      aria-hidden="true"
      className="bg-pattern-lines pointer-events-none absolute"
      style={{ inset: mobile ? "-100%" : 0, backgroundPositionX: patternX }}
    />
  );
  const cardStyle = parallax ? { x: parallax } : undefined;

  if (id === "p2p") {
    return (
      <div ref={rootRef} aria-hidden="true" className="absolute inset-0">
        <div className="absolute left-[43%] top-[8.9%] w-[54.4%]">
          <Image src={asset("/images/p2p-phone.png")} alt="" width={1766} height={1766} sizes="55vw" className="h-auto w-full" />
        </div>
        {pattern}
        <motion.div className="absolute left-[40.75%] top-[18%]" style={cardStyle}>
          <GlassCard variant="takers" />
        </motion.div>
        <motion.div className="absolute left-[74.3%] top-[50.2%]" style={cardStyle}>
          <GlassCard variant="makers" />
        </motion.div>
      </div>
    );
  }
  if (id === "otc") {
    // otc-hand.png is exported with an opaque lime background that is 2.5% wider than the
    // lime panel, so the photo is clipped to the panel's own geometry — otherwise a lime step
    // shows beside the OTC TRADING label (not in Figma, where the panel clips it).
    return (
      <div ref={rootRef} aria-hidden="true" className="absolute inset-0">
        <div
          className="rounded-panel absolute overflow-hidden"
          style={{ left: panel.otc.left, top: panel.otc.top, width: panel.otc.width, height: panel.otc.height }}
        >
          <div className="absolute left-[13.49%] top-[9.47%] w-[89.92%]">
            <Image src={asset("/images/otc-hand.png")} alt="" width={2114} height={1738} sizes="66vw" className="h-auto w-full" />
            {/* phone screen overlay, positioned relative to the hand image */}
            <div className="absolute left-[29.9%] top-[5.3%] w-[29.4%] overflow-hidden rounded-[8%]">
              <Image src={asset("/images/otc-phone-screen.png")} alt="" width={622} height={1392} sizes="20vw" className="h-auto w-full" />
            </div>
          </div>
        </div>
        {pattern}
        <motion.div className="absolute left-[5.375%] top-[21.9%]" style={cardStyle}>
          <GlassCard variant="otcQuote" />
        </motion.div>
        <motion.div className="absolute left-[39%] top-[56.7%]" style={cardStyle}>
          <GlassCard variant="otcTerms" />
        </motion.div>
      </div>
    );
  }
  return (
    <div ref={rootRef} aria-hidden="true" className="absolute inset-0">
      <div className="absolute left-[33.4%] top-[13.2%] w-[46%]">
        <Image src={asset("/images/wa-phone.png")} alt="" width={1472} height={1516} sizes="46vw" className="h-auto w-full" />
      </div>
      {pattern}
      <motion.div className="absolute left-[25.3%] top-[43.65%]" style={cardStyle}>
        <GlassCard variant="whatsapp" />
      </motion.div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* WhatsApp steps timeline                                                     */
/* -------------------------------------------------------------------------- */

function Timeline({
  active,
  progress,
  className = "",
  inView,
  dark,
}: {
  active: boolean;
  progress?: MotionValue<number>;
  className?: string;
  /** Mobile: fill when scrolled into view instead of by stage progress. */
  inView?: boolean;
  /** On black (mobile): lime accents instead of ink. */
  dark?: boolean;
}) {
  const reduce = useReducedMotion();
  const scaleY = progress ?? undefined;
  const accent = dark ? "bg-lime" : "bg-ink";
  return (
    <div className={`relative ${className}`}>
      {/* vertical line + squares */}
      <div className={`absolute left-[4px] top-[11px] h-[calc(100%-70px)] w-px ${dark ? "bg-lime/25" : "bg-ink/25"}`} aria-hidden="true">
        <motion.div
          className={`absolute inset-x-0 top-0 origin-top ${accent}`}
          style={scaleY ? { scaleY, height: "100%" } : undefined}
          initial={inView ? { height: "0%" } : undefined}
          whileInView={inView ? { height: "100%" } : undefined}
          viewport={inView ? { once: true, amount: 0.4 } : undefined}
          transition={{ duration: reduce ? 0 : 1.6, ease: ease.inOut }}
        />
      </div>
      <ol className="flex flex-col gap-[38px] lg:gap-[40px]">
        {whatsapp.steps.map((step, i) => (
          <motion.li
            key={step.title}
            className="grid grid-cols-[24px_80px_1fr] items-start lg:grid-cols-[32px_86px_1fr]"
            initial={reduce ? false : { opacity: 0, x: 16 }}
            animate={inView ? undefined : active ? { opacity: 1, x: 0 } : { opacity: 0, x: 16 }}
            whileInView={inView ? { opacity: 1, x: 0 } : undefined}
            viewport={inView ? { once: true, amount: 0.4 } : undefined}
            transition={{ duration: 0.6, ease: ease.out, delay: 0.25 + i * 0.18 }}
          >
            <Marker color={accent} className="mt-[3px]" />
            <span className={`text-dot-51 max-lg:text-[40px] ${dark ? "text-lime" : "text-ink"}`}>0{i + 1}</span>
            <div className="pt-1">
              <h3 className={`text-mono-14 uppercase ${dark ? "text-lime" : "text-black"}`}>{step.title}</h3>
              <p className={`text-body-s mt-[9px] max-w-[312px] ${dark ? "text-grey" : "text-forest"}`}>{step.body}</p>
            </div>
          </motion.li>
        ))}
      </ol>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Mobile screen                                                               */
/* -------------------------------------------------------------------------- */

function MobileScreen({ screen, withId }: { screen: Screen; withId: boolean }) {
  const isWA = screen.id === "whatsapp";
  return (
    <section
      id={withId ? screen.id : undefined}
      aria-labelledby={`${screen.id}-m-title`}
      className="bg-black px-5 pb-16 pt-16 text-white"
    >
      <RevealGroup>
        <Reveal>
          <Tag>{screen.tag}</Tag>
        </Reveal>
        <RevealLines
          as="h2"
          id={`${screen.id}-m-title`}
          lines={screen.title}
          className="text-h3 mt-[26px]"
        />
        <Reveal as="p" index={2} className="text-body-s mt-[10px] text-grey">
          {screen.body}
        </Reveal>
      </RevealGroup>

      {/* Lime image panel */}
      <Reveal className="relative -mx-5 mt-12 aspect-[375/372] overflow-hidden bg-lime">
        <div
          className="absolute top-0 aspect-[16/9] w-[170%]"
          style={{ left: mobileOffset[screen.id] }}
        >
          <Visual id={screen.id} mobile />
        </div>
      </Reveal>

      <div className="mt-12">
        {screen.features ? (
          <RevealGroup className="flex flex-col gap-10">
            {screen.features.map((f, i) => (
              <Reveal key={f.title} index={i} as="div">
                <span className="flex h-6 items-center text-lime">
                  {icons[f.icon]({ className: "h-[22px] w-auto" })}
                </span>
                <h3 className="text-mono-14 mt-4 uppercase text-lime">{f.title}</h3>
                <p className="text-body-s mt-2 text-grey">{f.body}</p>
              </Reveal>
            ))}
          </RevealGroup>
        ) : (
          <Timeline active inView dark />
        )}
      </div>

      <Reveal className="mt-12">
        <Button
          href={screen.href}
          circleIcon={isWA ? <Whatsapp className="size-[18px]" /> : undefined}
          className="w-full justify-between"
        >
          {screen.cta}
        </Button>
      </Reveal>
    </section>
  );
}

