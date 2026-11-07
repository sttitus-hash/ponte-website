"use client";

import Image from "next/image";
import { motion, useMotionValue, useScroll, useSpring, useTransform, type MotionValue } from "motion/react";
import { useCallback, useRef, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { OtcQuote, OtcSize, OtcTerms, P2PClarity, P2PEscrow, P2PVerified, Whatsapp } from "@/components/ui/icons";
import { Marker, Tag } from "@/components/ui/Primitives";
import { GlassCard } from "@/components/ui/GlassCard";
import { Reveal, RevealGroup, RevealLines } from "@/components/ui/Reveal";
import { TypeReveal } from "@/components/ui/TypeReveal";
import { otc, p2p, whatsapp } from "@/lib/content";
import { ease, viewportOnce } from "@/lib/motion";
import { links } from "@/lib/site";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { asset } from "@/lib/asset";
import { WhatsAppChat } from "@/components/sections/WhatsAppChat";

/* -------------------------------------------------------------------------- */
/* Data                                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Feature glyphs sit in a 62×62 box in Figma; each icon is drawn at its own natural size
 * inside it, so the box (not the glyph height) is the unit (CSV row 18).
 */
export const icons: Record<string, (p: { className?: string }) => ReactNode> = {
  "p2p-verified": (p) => <P2PVerified {...p} />,
  "p2p-escrow": (p) => <P2PEscrow {...p} />,
  "p2p-clarity": (p) => <P2PClarity {...p} />,
  "otc-quote": (p) => <OtcQuote {...p} />,
  "otc-size": (p) => <OtcSize {...p} />,
  "otc-terms": (p) => <OtcTerms {...p} />,
};
/** Optical size of each glyph as a share of the glyph box (Figma: verified/quote fill it, the others are smaller). */
const glyphScale: Record<string, number> = {
  "p2p-verified": 1,
  "p2p-escrow": 0.62,
  "p2p-clarity": 0.7,
  "otc-quote": 1,
  "otc-size": 0.68,
  "otc-terms": 0.7,
};

export type Screen = {
  id: "p2p" | "otc" | "whatsapp";
  tag: string;
  title: readonly string[];
  body: string;
  cta: string;
  href: string;
  features?: { icon: string; title: string; body: string }[];
  side: "left" | "right";
};

export const screens: Screen[] = [
  { id: "p2p", ...p2p, href: links.p2p, side: "left" },
  { id: "otc", ...otc, href: links.otc, side: "right" },
  { id: "whatsapp", ...whatsapp, href: links.whatsapp, side: "left" },
];

/**
 * Composition placement inside the 375×372 mobile panel, from the mobile Figma slides
 * (P2P 9710:31441: 640-wide composition at (−235, 6); OTC 9710:29435: hand not cropped, so the
 * composition is scaled to 150 %; WhatsApp 9710:29994: 743-wide at (−165, −34), which puts the
 * photo's cut edge exactly on the panel's bottom) — CSV rows 43 / 45 / 46.
 */
const mobileComp: Record<Screen["id"], { width: number; left: number; top: number }> = {
  p2p: { width: 1.7, left: -0.367, top: 0.016 },
  otc: { width: 1.5, left: -0.04, top: 0.005 },
  whatsapp: { width: 1.98, left: -0.44, top: -0.09 },
};
/** The 375px mobile frame scales up to 480px, then the band stays that size and centres (tablets). */
const MW = "min(100vw, 480px)";
const compStyle = (id: Screen["id"]) => {
  const c = mobileComp[id];
  return {
    width: `calc(${c.width} * ${MW})`,
    left: `calc(50% - ${MW} / 2 + ${c.left} * ${MW})`,
    top: `calc(${c.top} * ${MW} * 372 / 375)`,
  };
};

/* -------------------------------------------------------------------------- */
/* Feature list (desktop copy column + mobile)                                 */
/* -------------------------------------------------------------------------- */

function FeatureIcon({ icon, box }: { icon: string; box: number }) {
  const s = glyphScale[icon] ?? 0.7;
  return (
    <span className="flex shrink-0 items-center justify-center text-lime" style={{ width: box, height: box }}>
      <span className="flex items-center justify-center" style={{ width: box * s, height: box * s }}>
        {icons[icon]({ className: "h-full w-full" })}
      </span>
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* Desktop copy column                                                         */
/* -------------------------------------------------------------------------- */

export function DesktopCopy({
  screen,
  index,
  active,
  opacity,
  y,
  timelineStep,
}: {
  screen: Screen;
  index: number;
  active: boolean;
  opacity: MotionValue<number>;
  y: MotionValue<number>;
  /** WhatsApp: 0–3, which step is reached (fractional while animating). */
  timelineStep?: MotionValue<number>;
}) {
  const pointerEvents = useTransform(opacity, (v) => (v > 0.5 ? "auto" : "none"));
  const isWA = screen.id === "whatsapp";
  const textX = screen.side === "left" ? (isWA ? "3.125%" : "2.5%") : "69.6%"; // WA copy at x50 (Figma)
  const onLime = isWA;

  return (
    <motion.section
      aria-labelledby={`${screen.id}-title`}
      aria-hidden={!active}
      className={`absolute inset-0 ${onLime ? "on-lime text-ink" : "text-white"}`}
      style={{ opacity, pointerEvents }}
    >
      {/* Copy column + feature list in 1600×900 frame pixels, scaled with the stage (--stage-k). */}
      <motion.div className={`absolute w-[464px] origin-top-left ${isWA ? "top-[5.44%]" : "top-[4.4%]"}`} style={{ left: textX, y, scale: "var(--stage-k, 1)" }}>
        <div className="relative w-full">
          <Tag>
            <TypeReveal text={screen.tag} active={active} />
          </Tag>
          <h2 id={`${screen.id}-title`} className={`text-h3 ${isWA ? "mt-[52px] max-w-[320px]" : "mt-[60px] max-w-[470px]"}`}>
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

        {/* Feature list (P2P / OTC): Figma y 593 / 693 / 795 in the frame = 553 inside this column (top 40) → last item ends at 860, 40px bottom margin = 40px top (row 15) */}
        {screen.features ? (
          <ul className="absolute left-0 top-[553px] flex w-[376px] flex-col gap-[35px]">
            {screen.features.map((f) => (
              <li key={f.title} className="grid grid-cols-[62px_1fr] items-start gap-x-[2px]">
                <FeatureIcon icon={f.icon} box={62} />
                <div className="pt-1">
                  <h3 className="text-mono-14 text-gradient-lime uppercase">
                    <TypeReveal text={f.title} active={active} />
                  </h3>
                  <p className="text-body-s mt-[9px] max-w-[312px] text-grey">{f.body}</p>
                </div>
              </li>
            ))}
          </ul>
        ) : null}
      </motion.div>
      {isWA && timelineStep ? <Timeline step={timelineStep} className="absolute left-[66.4%] top-[16.2%] w-[31%]" /> : null}

      <span className="sr-only">Screen {index + 1} of 3</span>
    </motion.section>
  );
}

/* -------------------------------------------------------------------------- */
/* Visual compositions (phone + glass cards) — % of the 1600×900 stage        */
/* -------------------------------------------------------------------------- */

export function Visual({
  id,
  mobile,
  parallax,
  chatReveal,
  entrance,
}: {
  id: Screen["id"];
  mobile?: boolean;
  /** Pointer / scroll parallax offsets in px: [phone, cards]. */
  parallax?: { phone: { x: MotionValue<number>; y: MotionValue<number> }; cards: { x: MotionValue<number>; y: MotionValue<number> } };
  /** WhatsApp chat reveal 0–3. */
  chatReveal?: MotionValue<number>;
  /** 0–1: mockup and cards rise in one after the other (rows 16 / 44). */
  entrance?: MotionValue<number>;
}) {
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
  const one = useMotionValue(1);
  const e = entrance ?? one;
  const phoneO = useTransform(e, [0, 0.6], [0, 1]);
  const phoneRise = useTransform(e, [0, 0.6], [48, 0]);
  const cardAO = useTransform(e, [0.3, 0.85], [0, 1]);
  const cardARise = useTransform(e, [0.3, 0.85], [56, 0]);
  const cardBO = useTransform(e, [0.45, 1], [0, 1]);
  const cardBRise = useTransform(e, [0.45, 1], [56, 0]);
  const zero = useMotionValue(0);
  const px = parallax?.phone.x ?? zero;
  const py = useTransform([parallax?.phone.y ?? zero, phoneRise], ([a, b]: number[]) => a + b);
  const cx = parallax?.cards.x ?? zero;
  const cay = useTransform([parallax?.cards.y ?? zero, cardARise], ([a, b]: number[]) => a + b);
  const cby = useTransform([parallax?.cards.y ?? zero, cardBRise], ([a, b]: number[]) => a + b);
  const phoneStyle = { x: px, y: py, opacity: phoneO };
  const cardA = { x: cx, y: cay, opacity: cardAO };
  const cardB = { x: cx, y: cby, opacity: cardBO };

  if (id === "p2p") {
    return (
      <div ref={rootRef} aria-hidden="true" className="absolute inset-0">
        <motion.div className="absolute left-[43%] top-[8.9%] w-[54.4%]" style={phoneStyle}>
          <Image src={asset("/images/p2p-phone.png")} alt="" width={1766} height={1766} sizes="55vw" className="h-auto w-full" />
        </motion.div>
        <motion.div className="absolute left-[40.75%] top-[18%]" style={cardA}>
          <GlassCard variant="takers" count={e} />
        </motion.div>
        <motion.div className="absolute left-[74.3%] top-[50.2%]" style={cardB}>
          <GlassCard variant="makers" count={e} />
        </motion.div>
      </div>
    );
  }
  if (id === "otc") {
    // otc-hand.png carries an opaque lime background 2.5% wider than the OTC panel; clip it
    // to the panel's own geometry so no lime step shows beside the label.
    return (
      <div ref={rootRef} aria-hidden="true" className="absolute inset-0">
        <div className="rounded-panel absolute overflow-hidden" style={{ left: "-6.7%", top: "-3.4%", width: "73.4%", height: "105.6%" }}>
          <motion.div className="absolute left-[13.49%] top-[9.47%] w-[89.92%]" style={phoneStyle}>
            <Image src={asset("/images/otc-hand.png")} alt="" width={2114} height={1738} sizes="66vw" className="h-auto w-full" />
            <div className="absolute left-[29.9%] top-[5.3%] w-[29.4%] overflow-hidden rounded-[8%]">
              <Image src={asset("/images/otc-phone-screen.png")} alt="" width={622} height={1392} sizes="20vw" className="h-auto w-full" />
            </div>
          </motion.div>
        </div>
        <motion.div className="absolute left-[5.375%] top-[21.9%]" style={cardA}>
          <GlassCard variant="otcQuote" count={e} />
        </motion.div>
        <motion.div className="absolute left-[39%] top-[56.7%]" style={cardB}>
          <GlassCard variant="otcTerms" count={e} />
        </motion.div>
      </div>
    );
  }
  return (
    <div ref={rootRef} aria-hidden="true" className="absolute inset-0">
      <motion.div className="absolute left-[33.4%] top-[13.2%] w-[46%]" style={phoneStyle}>
        <Image src={asset("/images/wa-phone.png")} alt="" width={1472} height={1516} sizes="46vw" className="h-auto w-full" />
        {chatReveal ? <WhatsAppChat reveal={chatReveal} /> : null}
      </motion.div>
      <motion.div className="absolute left-[25.3%] top-[43.65%]" style={cardA}>
        <GlassCard variant="whatsapp" count={e} />
      </motion.div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* WhatsApp steps timeline                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Steps + the line that fills between them. `step` is 0–3 (fractional while a step
 * arrives): a step is highlighted once reached, dimmed before (designer note: "the active
 * step is highlighted, the rest are dimmed").
 */
export function Timeline({ step, className = "", dark }: { step: MotionValue<number>; className?: string; dark?: boolean }) {
  const accent = dark ? "bg-lime" : "bg-ink";
  const fill = useTransform(step, [1, 3], [0, 1]);
  return (
    <div className={`relative ${className}`}>
      <div className={`absolute left-[4px] top-[11px] h-[calc(100%-70px)] w-px ${dark ? "bg-lime/25" : "bg-ink/25"}`} aria-hidden="true">
        <motion.div className={`absolute inset-x-0 top-0 h-full origin-top ${accent}`} style={{ scaleY: fill }} />
      </div>
      <ol className="flex flex-col gap-[38px] lg:gap-[40px]">
        {whatsapp.steps.map((s, i) => (
          <TimelineStep key={s.title} i={i} step={step} dark={dark} accent={accent} title={s.title} body={s.body} />
        ))}
      </ol>
    </div>
  );
}

function TimelineStep({
  i,
  step,
  dark,
  accent,
  title,
  body,
}: {
  i: number;
  step: MotionValue<number>;
  dark?: boolean;
  accent: string;
  title: string;
  body: string;
}) {
  const reached = useTransform(step, (s) => Math.max(0, Math.min(1, s - i)));
  const opacity = useTransform(reached, [0, 1], [0.28, 1]);
  const x = useTransform(reached, [0, 1], [12, 0]);
  return (
    <motion.li className="grid grid-cols-[24px_80px_1fr] items-start lg:grid-cols-[32px_86px_1fr]" style={{ opacity, x }}>
      {/* marker centred on the 1px line (x = 4px): 10px square → left -0.5px */}
      <Marker color={accent} className="mt-[3px] -translate-x-px" />
      <span className={`text-dot-51 max-lg:text-[40px] ${dark ? "text-lime" : "text-ink"}`}>0{i + 1}</span>
      <div className="pt-1">
        <h3 className={`text-mono-14 uppercase ${dark ? "text-lime" : "text-black"}`}>{title}</h3>
        <p className={`text-body-s mt-[9px] max-w-[312px] ${dark ? "text-grey" : "text-forest"}`}>{body}</p>
      </div>
    </motion.li>
  );
}

/* -------------------------------------------------------------------------- */
/* Mobile screens (stacked; no pinning — Figma "For Mobile")                   */
/* -------------------------------------------------------------------------- */

export function MobileProducts() {
  return (
    <div className="lg:hidden">
      {screens.map((screen) => (
        <MobileScreen key={screen.id} screen={screen} />
      ))}
    </div>
  );
}

function MobileScreen({ screen }: { screen: Screen }) {
  const isWA = screen.id === "whatsapp";
  const reduce = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);
  // Entrance + light parallax driven by the band's position in the viewport (rows 44 / 47).
  const { scrollYProgress } = useScroll({ target: panelRef, offset: ["start 95%", "end 40%"] });
  const entranceRaw = useTransform(scrollYProgress, [0, 0.55], [0, 1]);
  const entrance = useSpring(entranceRaw, { stiffness: 120, damping: 24, mass: 0.6 });
  const one = useMotionValue(1);
  const zero = useMotionValue(0);
  const phoneY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -10]);
  const cardsY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -26]);
  // WhatsApp: steps + messages arrive as the band and the timeline scroll in
  const stepsRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: stepsProgress } = useScroll({ target: stepsRef, offset: ["start 90%", "end 70%"] });
  const step = useTransform(stepsProgress, [0, 1], [0.9, 3]);
  const chatReveal = useTransform([entrance, step], ([e, s]: number[]) => Math.max(e, s - 0.05));

  return (
    <section id={screen.id} aria-labelledby={`${screen.id}-m-title`} className="bg-black px-5 pb-16 pt-16 text-white">
      <RevealGroup>
        <Reveal>
          <Tag>
            <TypeReveal text={screen.tag} inView />
          </Tag>
        </Reveal>
        <RevealLines as="h2" id={`${screen.id}-m-title`} lines={screen.title} className="text-h3 mt-[26px]" />
        <Reveal as="p" index={2} className="text-body-s mt-[10px] text-grey">
          {screen.body}
        </Reveal>
      </RevealGroup>

      {/* Lime image panel */}
      <div ref={panelRef} className="relative -mx-5 mt-12 overflow-hidden bg-lime" style={{ height: `calc(${MW} * 372 / 375)` }}>
        <div className="absolute aspect-[16/9]" style={compStyle(screen.id)}>
          <Visual
            id={screen.id}
            mobile
            entrance={reduce ? one : entrance}
            parallax={{ phone: { x: zero, y: phoneY }, cards: { x: zero, y: cardsY } }}
            chatReveal={isWA ? chatReveal : undefined}
          />
        </div>
      </div>

      <div className="mt-12" ref={stepsRef}>
        {screen.features ? (
          <RevealGroup className="flex flex-col gap-10">
            {screen.features.map((f, i) => (
              <Reveal key={f.title} index={i} as="div">
                <FeatureIcon icon={f.icon} box={28} />
                <h3 className="text-mono-14 mt-4 uppercase text-lime">
                  <TypeReveal text={f.title} inView />
                </h3>
                <p className="text-body-s mt-2 text-grey">{f.body}</p>
              </Reveal>
            ))}
          </RevealGroup>
        ) : (
          <Timeline step={step} dark />
        )}
      </div>

      <Reveal className="mt-12">
        <Button href={screen.href} circleIcon={isWA ? <Whatsapp className="size-[18px]" /> : undefined} className="w-full justify-between">
          {screen.cta}
        </Button>
      </Reveal>
    </section>
  );
}

export { ease, viewportOnce };
