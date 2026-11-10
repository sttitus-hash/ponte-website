"use client";

import { motion, useMotionValue, useMotionValueEvent, useScroll, useSpring, useTransform, type MotionValue } from "motion/react";
import { useCallback, useRef, useState } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useIsDesktop } from "@/hooks/useIsDesktop";
import { useKeyframes, pageTop } from "@/lib/scroll/ScrollProvider";
import { AboutMint, N as ABOUT_N, SlideDeck, TrackRecordMobile } from "@/components/sections/TrackRecord";
import { DesktopCopy, MobileProducts, Visual, screens } from "@/components/sections/Products";

/**
 * 02 Track record → 03 P2P → 04 OTC → 05 WhatsApp as ONE pinned journey on desktop.
 *
 * Every layer is a pure function of the deck position `p` (0 … STEPS), which the scroll
 * sequencer moves one keyframe per gesture:
 *
 *   0–3  the four milestones (lime card deck)
 *   3→4  mint card scales to 0.9 and fades; the lime card's content exits in reverse and
 *        the card itself grows into the P2P panel; P2P copy and visuals arrive
 *   4→5  P2P copy exits → panel expands to the left edge while the P2P visuals fade →
 *        panel shrinks from the right while the OTC visuals and copy arrive
 *   5→6  OTC copy exits → panel fills the screen → WhatsApp visuals → margins → copy + step 01
 *   6→8  WhatsApp steps 02 and 03 (messages appear on the phone, timeline fills)
 *   8→9  the stage scales to 0.9 and fades, revealing Trust underneath
 *
 * The journey overlaps the hero by one viewport (its cards slide up over the pinned hero)
 * and the next section overlaps its last step (it fades out over that section).
 * Mobile renders the stacked layouts instead.
 */
export const JOURNEY_STEPS = 9;
/** Scroll per step, as a share of the viewport height (keep in sync with the CSS height below). */
export const STEP_VH = 0.8;

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
/** 0→1 over [a, b] of p, eased. */
const seg = (p: number, a: number, b: number, e = easeInOut) => e(clamp01((p - a) / (b - a)));
/** 1→0 over [a, b]. */
const out = (p: number, a: number, b: number, e = easeInOut) => 1 - seg(p, a, b, e);

type Edges = { l: number; r: number; t: number; b: number };
const lerpE = (a: Edges, b: Edges, k: number): Edges => ({
  l: a.l + (b.l - a.l) * k,
  r: a.r + (b.r - a.r) * k,
  t: a.t + (b.t - a.t) * k,
  b: a.b + (b.b - a.b) * k,
});

/** Stage metrics from the viewport size. */
function metrics(W: number, H: number) {
  const g = Math.min(40, Math.max(16, 0.025 * W)); // page gutter (clamp(1rem, 2.5vw, 2.5rem))
  const cw = (W - 2 * g - 10) / 2; // About card width (two columns, 10px gap)
  const boxW = Math.min(W, (H * 16) / 9); // 16:9 composition box (Figma 1600×900)
  const boxH = (boxW * 9) / 16;
  const boxL = (W - boxW) / 2;
  const boxT = (H - boxH) / 2;
  const over = 24; // bleed past the viewport so no edge ever shows
  const about: Edges = { l: g + cw + 10, r: W - g, t: g, b: H - g };
  const p2p: Edges = { l: boxL + 0.333 * boxW, r: W + over, t: -over, b: H + over };
  const otc: Edges = { l: -over, r: boxL + 0.667 * boxW, t: -over, b: H + over };
  const full: Edges = { l: -over, r: W + over, t: -over, b: H + over };
  // WhatsApp panel (23,22) 1553×854 in the 1600×900 frame
  const wa: Edges = { l: boxL + 0.0144 * boxW, r: boxL + 0.985 * boxW, t: boxT + 0.0244 * boxH, b: boxT + 0.9733 * boxH };
  return { W, H, over, g, cw, boxW, boxH, boxL, boxT, about, p2p, otc, full, wa };
}

/** Lime panel edges at deck position p. */
function panelAt(p: number, m: ReturnType<typeof metrics>): Edges {
  if (p <= 3.3) return m.about;
  if (p < 4) return lerpE(m.about, m.p2p, seg(p, 3.3, 4));
  if (p <= 4.22) return m.p2p;
  if (p < 4.55) {
    // left edge travels to the viewport edge (top/bottom already full-bleed)
    const k = seg(p, 4.22, 4.55);
    return { ...m.p2p, l: m.p2p.l + (m.full.l - m.p2p.l) * k };
  }
  if (p < 4.85) {
    // right edge retracts to the OTC geometry
    const k = seg(p, 4.55, 4.85);
    return { ...m.full, r: m.full.r + (m.otc.r - m.full.r) * k };
  }
  if (p <= 5.2) return m.otc;
  if (p < 5.5) return lerpE(m.otc, m.full, seg(p, 5.2, 5.5));
  if (p <= 5.7) return m.full;
  if (p < 5.95) return lerpE(m.full, m.wa, seg(p, 5.7, 5.95));
  return m.wa;
}

export function Journey() {
  const isDesktop = useIsDesktop();
  return (
    <>
      {isDesktop ? <JourneyDesktop /> : null}
      <div className={isDesktop ? "hidden" : ""}>
        <TrackRecordMobile />
        <MobileProducts />
      </div>
    </>
  );
}

function JourneyDesktop() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  // Viewport size → stage metrics
  const W = useMotionValue(1600);
  const H = useMotionValue(900);
  const stageRef = useCallback(
    (el: HTMLDivElement | null) => {
      if (!el) return;
      const update = () => {
        const r = el.getBoundingClientRect();
        W.set(r.width);
        H.set(r.height);
        const m = metrics(r.width, r.height);
        el.style.setProperty("--stage-k", String(Math.min(1, m.boxW / 1600)));
        el.style.setProperty("--u", String(m.boxW / 1600));
      };
      update();
      const ro = new ResizeObserver(update);
      ro.observe(el);
      return () => ro.disconnect();
    },
    [W, H],
  );

  // Deck position in steps; stepped under reduced motion.
  const p = useTransform(scrollYProgress, (v) => {
    const raw = v * JOURNEY_STEPS;
    return reduce ? Math.round(raw) : raw;
  });

  // Keyframes for the sequencer: one per step.
  useKeyframes(
    1,
    () => {
      const el = ref.current;
      if (!el) return [];
      const top = pageTop(el);
      const step = window.innerHeight * STEP_VH;
      return Array.from({ length: JOURNEY_STEPS + 1 }, (_, i) => top + i * step);
    },
  );

  // Discrete state for ARIA / tab indexes
  const [aboutIndex, setAboutIndex] = useState(0);
  const [screen, setScreen] = useState(-1);
  // Pre-decode the composition images one step before the first of them appears, so the first
  // frame of the P2P transition does not pay for decoding (audit A-04). `visibility: hidden`
  // subtrees are laid out but never painted, hence never decoded on their own.
  const decoded = useRef(false);
  useMotionValueEvent(p, "change", (v) => {
    if (!decoded.current && v > 2.5) {
      decoded.current = true;
      const imgs = ref.current?.querySelectorAll<HTMLImageElement>("img[decoding=async]") ?? [];
      imgs.forEach((img) => img.decode().catch(() => {}));
    }
    // Discrete state flips late in each ramp (0.85), when the tween is decelerating, rather than at
    // its midpoint: the typewriter labels then never compete with the busiest frames (audit A-07).
    const ai = Math.min(ABOUT_N - 1, Math.max(0, Math.floor(v + 0.15)));
    if (ai !== aboutIndex) setAboutIndex(ai);
    const sc = v < 3.85 ? -1 : v < 4.85 ? 0 : v < 5.85 ? 1 : 2;
    if (sc !== screen) setScreen(sc);
  });

  /* ---- panel geometry --------------------------------------------------- */
  type Geo = { m: ReturnType<typeof metrics>; e: Edges };
  const geo = useTransform([p, W, H], ([v, w, h]: number[]): Geo => {
    const mm = metrics(w, h);
    return { m: mm, e: panelAt(v, mm) };
  });
  // The lime panel is one fixed full-bleed layer (the `full` edges) whose visible rectangle is a
  // rounded clip-path, rather than a box whose left/top/width/height change on every frame of a
  // transition: a geometry change re-lays-out the panel and every composition inside it each
  // frame, a clip change only repaints (audit A-05). Its content no longer moves with the panel's
  // origin, so the compositions and the About deck simply sit at their own screen positions.
  // Edges snap to device pixels, as a laid-out box's do, so a resting panel's edges stay crisp.
  const panelClip = useTransform(geo, ({ m, e }) => {
    const dpr = (typeof window !== "undefined" && window.devicePixelRatio) || 1;
    const px = (v: number) => Math.round(v * dpr) / dpr;
    return `inset(${px(e.t + m.over)}px ${px(m.W + m.over - e.r)}px ${px(m.H + m.over - e.b)}px ${px(e.l + m.over)}px round var(--radius-panel))`;
  });
  // compositions in box coordinates (constant: the panel layer itself never moves)
  const compL = useTransform(geo, (g) => g.m.boxL + g.m.over);
  const compT = useTransform(geo, (g) => g.m.boxT + g.m.over);
  const boxW = useTransform(geo, (g) => g.m.boxW);
  const boxH = useTransform(geo, (g) => g.m.boxH);
  const boxL = useTransform(geo, (g) => g.m.boxL);
  const boxT = useTransform(geo, (g) => g.m.boxT);
  // About deck keeps the card's size inside the growing panel
  const aboutW = useTransform(geo, (g) => g.m.cw);
  const aboutH = useTransform(geo, (g) => g.m.about.b - g.m.about.t);
  const deckL = useTransform(geo, (g) => g.m.about.l + g.m.over);
  const deckT = useTransform(geo, (g) => g.m.about.t + g.m.over);
  const mintL = useTransform(geo, (g) => g.m.g);
  const mintT = useTransform(geo, (g) => g.m.g);

  /* ---- About layers ----------------------------------------------------- */
  const deckPos = useTransform(p, (v) => Math.min(ABOUT_N - 1, v));
  const aboutContentO = useTransform(p, (v) => out(v, 3.0, 3.4));
  const aboutContentY = useTransform(p, (v) => -24 * seg(v, 3.0, 3.4));
  const mintScale = useTransform(p, (v) => 1 - 0.1 * seg(v, 3.1, 3.6));
  const mintO = useTransform(p, (v) => out(v, 3.1, 3.6));
  const mintVisibility = useTransform(p, (v) => (v >= 3.6 ? "hidden" : "visible"));

  /* ---- product layers --------------------------------------------------- */
  const p2pVis = useTransform(p, (v) => (v < 4.1 ? seg(v, 3.45, 3.95, easeOut) : out(v, 4.25, 4.5)));
  const otcVis = useTransform(p, (v) => (v < 5.1 ? seg(v, 4.45, 4.85, easeOut) : out(v, 5.2, 5.45)));
  const waVis = useTransform(p, (v) => (v < 8 ? seg(v, 5.4, 5.75, easeOut) : out(v, 8.0, 8.8)));
  const p2pCopyO = useTransform(p, (v) => (v < 4.1 ? seg(v, 3.7, 4.0, easeOut) : out(v, 4.0, 4.25)));
  const p2pCopyY = useTransform(p2pCopyO, (o) => (1 - o) * 28);
  const otcCopyO = useTransform(p, (v) => (v < 5.1 ? seg(v, 4.8, 5.0, easeOut) : out(v, 5.0, 5.25)));
  const otcCopyY = useTransform(otcCopyO, (o) => (1 - o) * 28);
  const waCopyO = useTransform(p, (v) => (v < 8 ? seg(v, 5.85, 6.0, easeOut) : out(v, 8.0, 8.8)));
  const waCopyY = useTransform(waCopyO, (o) => (1 - o) * 28);
  // WhatsApp: 0–3 steps reached (step 1 with the copy; 2 and 3 on the next keyframes)
  // steps 02 and 03 play across most of their scroll step (not a narrow slice of it), so the messages
  // arrive at the same unhurried pace as the panel moves around them
  const waStep = useTransform(p, (v) => (v < 6 ? seg(v, 5.85, 6.0, easeOut) : v < 7 ? 1 + seg(v, 6.1, 6.9, easeOut) : 2 + seg(v, 7.1, 7.9, easeOut)));
  // Stage backdrop (audit A-01): the stage must be opaque beneath its own content from the moment
  // the lime card grows into a panel, because the next section is pulled up under the stage one
  // step early (so the stage's exit fade can reveal it) and would otherwise show through the
  // WhatsApp panel's margins at steps 7–8. Transparent while the About cards slide over the hero.
  const backdropO = useTransform(p, (v) => seg(v, 3.0, 3.4));
  // exit: the whole stage scales to 0.9 and fades, revealing the next section beneath
  const stageScale = useTransform(p, (v) => 1 - 0.1 * seg(v, 8.0, 8.8));
  const stageO = useTransform(p, (v) => out(v, 8.0, 8.8));

  /* ---- pointer parallax (row 16): a few px, clamped ---------------------- */
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 20, mass: 0.8 });
  const sy = useSpring(my, { stiffness: 60, damping: 20, mass: 0.8 });
  const phonePar = { x: useTransform(sx, (v) => v * 4), y: useTransform(sy, (v) => Math.min(0, v * 4)) };
  const cardPar = { x: useTransform(sx, (v) => v * 10), y: useTransform(sy, (v) => v * 8) };
  const onPointerMove = (e: React.PointerEvent) => {
    if (reduce) return;
    const r = e.currentTarget.getBoundingClientRect();
    mx.set(((e.clientX - r.left) / r.width - 0.5) * 2);
    my.set(((e.clientY - r.top) / r.height - 0.5) * 2);
  };

  return (
    <div
      ref={ref}
      className="relative z-10 hidden lg:block"
      style={{ height: `calc(100vh + ${JOURNEY_STEPS * STEP_VH * 100}vh)`, marginTop: "-100vh" }}
    >
      {/* Sentinels for the nav + anchors, at the keyframes of each screen */}
      <div id="about" className="pointer-events-none absolute left-0 top-0 h-px w-px" />
      <div id="p2p" className="pointer-events-none absolute left-0 h-px w-px" style={{ top: `calc(4 * ${STEP_VH * 100}vh)` }} />
      <div id="otc" className="pointer-events-none absolute left-0 h-px w-px" style={{ top: `calc(5 * ${STEP_VH * 100}vh)` }} />
      <div id="whatsapp" className="pointer-events-none absolute left-0 h-px w-px" style={{ top: `calc(6 * ${STEP_VH * 100}vh)` }} />

      <motion.div
        ref={stageRef}
        className="sticky top-0 h-screen overflow-hidden"
        style={{ scale: stageScale, opacity: stageO }}
        onPointerMove={onPointerMove}
        onPointerLeave={() => {
          mx.set(0);
          my.set(0);
        }}
        aria-label="About Ponte and products"
      >
        <motion.div aria-hidden="true" className="absolute inset-0 bg-black" style={{ opacity: backdropO }} />
        {/* Mint card -------------------------------------------------------- */}
        <motion.section
          aria-labelledby="track-title"
          className="absolute flex flex-col justify-between overflow-hidden rounded-panel bg-mint p-[39px] text-black"
          style={{ left: mintL, top: mintT, width: aboutW, height: aboutH, scale: mintScale, opacity: mintO, visibility: mintVisibility }}
        >
          <AboutMint />
        </motion.section>

        {/* Lime card → panel ------------------------------------------------ */}
        {/* (-inset-6 = the 24px bleed of the `full` edges in metrics()) */}
        <motion.div className="on-lime absolute -inset-6 bg-lime text-ink" style={{ clipPath: panelClip }}>
          {/* About slide deck (card-sized, at the lime card's position) */}
          <motion.div className="absolute" style={{ left: deckL, top: deckT, width: aboutW, height: aboutH, opacity: aboutContentO, y: aboutContentY }} aria-hidden={screen >= 0}>
            <SlideDeck pos={deckPos} index={aboutIndex} reduce={reduce} />
          </motion.div>

          {/* Product compositions in box coordinates */}
          <motion.div className="absolute" style={{ left: compL, top: compT, width: boxW, height: boxH }}>
            <CompositionLayer vis={p2pVis} id="p2p" parallax={{ phone: phonePar, cards: cardPar }} />
            <CompositionLayer vis={otcVis} id="otc" parallax={{ phone: phonePar, cards: cardPar }} />
            <CompositionLayer vis={waVis} id="whatsapp" parallax={{ phone: phonePar, cards: cardPar }} chatReveal={waStep} />
          </motion.div>
        </motion.div>

        {/* Copy columns in the box ------------------------------------------- */}
        <motion.div className="absolute" style={{ left: boxL, top: boxT, width: boxW, height: boxH }}>
          <DesktopCopy screen={screens[0]} index={0} active={screen === 0} opacity={p2pCopyO} y={p2pCopyY} />
          <DesktopCopy screen={screens[1]} index={1} active={screen === 1} opacity={otcCopyO} y={otcCopyY} />
          <DesktopCopy screen={screens[2]} index={2} active={screen === 2} opacity={waCopyO} y={waCopyY} timelineStep={waStep} />
        </motion.div>
      </motion.div>
    </div>
  );
}

function CompositionLayer({
  vis,
  id,
  parallax,
  chatReveal,
}: {
  vis: MotionValue<number>;
  id: (typeof screens)[number]["id"];
  parallax: Parameters<typeof Visual>[0]["parallax"];
  chatReveal?: MotionValue<number>;
}) {
  // `visibility`, not `display`: the subtree stays laid out and its images stay decoded, so the
  // first frame of a transition does not pay for decode + layout (audit A-04).
  const visibility = useTransform(vis, (v) => (v <= 0 ? "hidden" : "visible"));
  return (
    <motion.div className="absolute inset-0" style={{ visibility }} aria-hidden="true">
      <Visual id={id} entrance={vis} parallax={parallax} chatReveal={chatReveal} />
    </motion.div>
  );
}
