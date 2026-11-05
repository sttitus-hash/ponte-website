"use client";

import Image from "next/image";
import { motion, useMotionValueEvent, useScroll, useTransform, type MotionValue } from "motion/react";
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

/** Lime panel geometry per screen, in % of the 1600×900 stage. */
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

/* -------------------------------------------------------------------------- */
/* Section                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * 03 P2P · 04 OTC · 05 WhatsApp — on desktop these are one pinned sequence:
 * the lime panel slides and resizes between the three layouts while the
 * copy and phone compositions crossfade. On mobile they stack as three
 * ordinary sections with in-view entrances.
 */
export function Products() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const isDesktop = useIsDesktop();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  const [active, setActive] = useState(0);

  // Scale factor of the stage relative to the 1600×900 Figma frame (drives the copy column).
  const stageRef = useCallback((el: HTMLDivElement | null) => {
    if (!el) return;
    const update = () => el.style.setProperty("--stage-k", String(Math.min(1, el.getBoundingClientRect().width / 1600)));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const next = v < (K.a0 + K.a1) / 2 ? 0 : v < (K.b0 + K.b1) / 2 ? 1 : 2;
    if (next !== active) setActive(next);
  });

  const left = useTransform(scrollYProgress, [K.a0, K.a1, K.b0, K.b1], [panel.p2p.left, panel.otc.left, panel.otc.left, panel.whatsapp.left]);
  const top = useTransform(scrollYProgress, [K.a0, K.a1, K.b0, K.b1], [panel.p2p.top, panel.otc.top, panel.otc.top, panel.whatsapp.top]);
  const width = useTransform(scrollYProgress, [K.a0, K.a1, K.b0, K.b1], [panel.p2p.width, panel.otc.width, panel.otc.width, panel.whatsapp.width]);
  const height = useTransform(scrollYProgress, [K.a0, K.a1, K.b0, K.b1], [panel.p2p.height, panel.otc.height, panel.otc.height, panel.whatsapp.height]);

  // Per-screen opacity envelopes
  // Compositions fade out before the panel starts moving and fade in once it has arrived,
  // so the photos (exported with the lime background baked in) never sit over black.
  const o0 = useTransform(scrollYProgress, [K.a0 - 0.06, K.a0], [1, 0]);
  const o1 = useTransform(scrollYProgress, [K.a1 - 0.01, K.a1 + 0.07, K.b0 - 0.06, K.b0], [0, 1, 1, 0]);
  const o2 = useTransform(scrollYProgress, [K.b1 - 0.01, K.b1 + 0.07], [0, 1]);
  const envelopes = [o0, o1, o2];

  // WhatsApp timeline fills as the last screen settles
  const timeline = useTransform(scrollYProgress, [K.b1, 0.95], [0, 1]);

  return (
    <div ref={ref} className="relative bg-black lg:h-[340vh]">
      {/* Desktop stage ------------------------------------------------------ */}
      <div className="hidden lg:sticky lg:top-0 lg:flex lg:h-screen lg:items-center lg:justify-center lg:overflow-hidden">
        <div ref={stageRef} className="relative aspect-[16/9] max-h-screen w-full overflow-hidden">
          <motion.div
            aria-hidden="true"
            className="absolute rounded-panel bg-lime will-change-[left,top,width,height]"
            style={{ left, top, width, height }}
          />
          {screens.map((screen, i) => (
            <DesktopScreen
              key={screen.id}
              screen={screen}
              index={i}
              active={active === i}
              opacity={envelopes[i]}
              timeline={timeline}
              reduce={!!reduce}
            />
          ))}
        </div>
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
/* Desktop screen                                                              */
/* -------------------------------------------------------------------------- */

function DesktopScreen({
  screen,
  index,
  active,
  opacity,
  timeline,
  reduce,
}: {
  screen: Screen;
  index: number;
  active: boolean;
  opacity: MotionValue<number>;
  timeline: MotionValue<number>;
  reduce: boolean;
}) {
  const pointerEvents = useTransform(opacity, (v) => (v > 0.5 ? "auto" : "none"));
  const isWA = screen.id === "whatsapp";
  const textX = screen.side === "left" ? (isWA ? "3.9%" : "2.5%") : "69.6%";
  const onLime = isWA;

  const group = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
  };
  const item = reduce
    ? { hidden: { opacity: 1 }, show: { opacity: 1 } }
    : {
        hidden: { opacity: 0, y: 24 },
        show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: ease.out } },
      };

  return (
    <motion.section
      aria-labelledby={`${screen.id}-title`}
      aria-hidden={!active}
      className={`absolute inset-0 ${onLime ? "on-lime text-ink" : "text-white"}`}
      style={{ opacity, pointerEvents }}
    >
      {/* Visual composition */}
      <Visual id={screen.id} active={active} reduce={reduce} />

      {/* Copy column + feature list: laid out in 1600×900 frame pixels and scaled with the
          stage (--stage-k), so the Figma rhythm holds and the list never collides with the
          CTA or runs past the stage on 1280–1440 laptops and landscape tablets. */}
      <div
        className="absolute top-[4.4%] w-[464px] origin-top-left"
        style={{ left: textX, transform: "scale(var(--stage-k, 1))" }}
      >
      <motion.div
        className="relative w-full"
        variants={group}
        initial="hidden"
        animate={active ? "show" : "hidden"}
      >
        <motion.div variants={item}>
          <Tag>{screen.tag}</Tag>
        </motion.div>
        <motion.h2
          id={`${screen.id}-title`}
          variants={item}
          className={`text-h3 mt-[54px] ${isWA ? "max-w-[320px]" : "max-w-[470px]"}`}
        >
          {screen.title.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </motion.h2>
        <motion.p
          variants={item}
          className={`text-body-l mt-[30px] ${isWA ? "max-w-[447px] text-forest" : "max-w-[425px] text-grey"} ${
            screen.id === "otc" ? "max-w-[415px]" : ""
          }`}
        >
          {screen.body}
        </motion.p>
        <motion.div variants={item} className="mt-[46px]">
          {isWA ? (
            <Button href={screen.href} variant="ink" circleIcon={<Whatsapp className="size-[18px]" />}>
              {screen.cta}
            </Button>
          ) : (
            <Button href={screen.href}>{screen.cta}</Button>
          )}
        </motion.div>
      </motion.div>

      {/* Feature list (P2P / OTC) or steps timeline (WhatsApp) */}
      {screen.features ? (
        <motion.ul
          className="absolute left-0 top-[553px] flex w-[376px] flex-col gap-[35px]"
          variants={group}
          initial="hidden"
          animate={active ? "show" : "hidden"}
        >
          {screen.features.map((f) => (
            <motion.li key={f.title} variants={item} className="grid grid-cols-[62px_1fr] gap-x-[2px]">
              <span className="flex size-[62px] items-start justify-center pt-1 text-lime">
                {icons[f.icon]({ className: "h-[34px] w-auto max-w-[36px]" })}
              </span>
              <div>
                <h3 className="text-mono-14 text-gradient-lime uppercase">{f.title}</h3>
                <p className="text-body-s mt-[9px] max-w-[312px] text-grey">{f.body}</p>
              </div>
            </motion.li>
          ))}
        </motion.ul>
      ) : null}
      </div>
      {isWA ? <Timeline active={active} progress={timeline} className="absolute left-[66.4%] top-[16.2%] w-[31%]" /> : null}

      {/* Index chip, bottom right of stage (desktop only, subtle wayfinding) */}
      <span className="sr-only">Screen {index + 1} of 3</span>
    </motion.section>
  );
}

/* -------------------------------------------------------------------------- */
/* Visual compositions (phone + glass cards) — % of the 1600×900 stage        */
/* -------------------------------------------------------------------------- */

function Visual({ id, active, reduce, mobile }: { id: Screen["id"]; active: boolean; reduce: boolean; mobile?: boolean }) {
  // Under reduced motion the pieces must still be driven to their resting state: `reduce`
  // is false during hydration, so the hidden `initial` pose has already been applied.
  const float = (delay: number) =>
    reduce
      ? { animate: { opacity: 1, y: 0, scale: 1 }, transition: { duration: 0 } }
      : {
          initial: { opacity: 0, y: 30, scale: 0.96 },
          animate: active ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 30, scale: 0.96 },
          transition: { duration: 0.8, ease: ease.out, delay },
        };

  // `--u` = stage width ÷ 1600: the glass cards are laid out in Figma frame px and scaled by it.
  const rootRef = useCallback((el: HTMLDivElement | null) => {
    if (!el) return;
    const update = () => el.style.setProperty("--u", String(el.getBoundingClientRect().width / 1600));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // The phone / hand photos ship with the lime background baked in (opaque exports), so the
  // panel's hairline pattern is drawn as an overlay above them (Figma layers the pattern tile
  // above the photo) — otherwise the photo's rectangle reads as a boundary on the panel.
  const pattern = (
    <div
      aria-hidden="true"
      className="rounded-panel bg-pattern-lines pointer-events-none absolute"
      style={mobile ? { inset: "-100%" } : { left: panel[id].left, top: panel[id].top, width: panel[id].width, height: panel[id].height }}
    />
  );

  if (id === "p2p") {
    return (
      <div ref={rootRef} aria-hidden="true" className="absolute inset-0">
        <motion.div className="absolute left-[43%] top-[8.9%] w-[54.4%]" {...float(0.05)}>
          <Image src={asset("/images/p2p-phone.png")} alt="" width={1766} height={1766} sizes="55vw" className="h-auto w-full" />
        </motion.div>
        {pattern}
        <motion.div className="absolute left-[40.75%] top-[18%]" {...float(0.25)}>
          <GlassCard variant="takers" />
        </motion.div>
        <motion.div className="absolute left-[74.3%] top-[50.2%]" {...float(0.35)}>
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
          <motion.div className="absolute left-[13.49%] top-[9.47%] w-[89.92%]" {...float(0.05)}>
            <Image src={asset("/images/otc-hand.png")} alt="" width={2114} height={1738} sizes="66vw" className="h-auto w-full" />
            {/* phone screen overlay, positioned relative to the hand image */}
            <div className="absolute left-[29.9%] top-[5.3%] w-[29.4%] overflow-hidden rounded-[8%]">
              <Image src={asset("/images/otc-phone-screen.png")} alt="" width={622} height={1392} sizes="20vw" className="h-auto w-full" />
            </div>
          </motion.div>
        </div>
        {pattern}
        <motion.div className="absolute left-[5.375%] top-[21.9%]" {...float(0.25)}>
          <GlassCard variant="otcQuote" />
        </motion.div>
        <motion.div className="absolute left-[39%] top-[56.7%]" {...float(0.35)}>
          <GlassCard variant="otcTerms" />
        </motion.div>
      </div>
    );
  }
  return (
    <div ref={rootRef} aria-hidden="true" className="absolute inset-0">
      <motion.div className="absolute left-[33.4%] top-[13.2%] w-[46%]" {...float(0.05)}>
        <Image src={asset("/images/wa-phone.png")} alt="" width={1472} height={1516} sizes="46vw" className="h-auto w-full" />
      </motion.div>
      {pattern}
      <motion.div className="absolute left-[25.3%] top-[43.65%]" {...float(0.25)}>
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
          <Visual id={screen.id} active reduce={false} mobile />
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

