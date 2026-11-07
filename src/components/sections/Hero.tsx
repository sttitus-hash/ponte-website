"use client";

import Image from "next/image";
import { motion, useMotionValueEvent, useScroll, useTransform } from "motion/react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Appstore, Googleplay } from "@/components/ui/icons";
import { Reveal, RevealLines } from "@/components/ui/Reveal";
import { hero } from "@/lib/content";
import { ease } from "@/lib/motion";
import { links } from "@/lib/site";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useIsDesktop } from "@/hooks/useIsDesktop";
import { asset } from "@/lib/asset";
import { LightBridge } from "@/components/ui/LightBridge";
import { HeroScreen } from "@/components/sections/HeroScreen";
import { useKeyframes, pageTop } from "@/lib/scroll/ScrollProvider";
import { STEP_VH } from "@/components/sections/Journey";

/** Desktop: mockup travel (step) + one viewport in which the About cards slide over the hero. */
const HERO_TRAVEL_VH = STEP_VH * 100;

/** Shader framing: desktop crop as in the Figma "videoframe" (zoomed in), mobile tighter still (rows 6 / 37). */
const SHADER_DESKTOP = { uZoom: 1.35, uOffY: 0.02, uRiseDur: 2.4 };
const SHADER_MOBILE = { uZoom: 2.2, uOffY: 0.12, uRiseDur: 2.4 };

/**
 * 01 Hero. Desktop: pinned; the Light Bridge rises in, then moves up with scroll (its lower
 * part visible at the end), the copy stays while the mockup slides up over it, and the
 * About cards then slide up over the whole hero (designer notes "1 screen" / "2 screen").
 * Mobile: the copy stays put until the phone rises over it, then fades as one block.
 */
export function Hero() {
  const isDesktop = useIsDesktop();
  return isDesktop ? <HeroDesktop /> : <HeroMobile />;
}

function HeroDesktop() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  // travel = STEP (mockup) + 100vh (cover): mockup phase ends at STEP / (STEP + 1)
  const A = STEP_VH / (STEP_VH + 1);

  useKeyframes(0, () => {
    const el = ref.current;
    if (!el) return [];
    const top = pageTop(el);
    const vh = window.innerHeight;
    return [top, top + vh * STEP_VH, top + vh * STEP_VH + vh];
  });

  // Backdrop: starts low (about half its height below) and moves up with scroll (row 7)
  const bgY = useTransform(scrollYProgress, [0, A], ["0%", reduce ? "0%" : "-26%"]);
  // Copy: fades only once the mockup overlaps it
  const copyOpacity = useTransform(scrollYProgress, [A * 0.45, A * 0.95], [1, 0]);
  const copyY = useTransform(scrollYProgress, [0, A], [0, reduce ? 0 : -40]);
  // Mockup: from the fold to the upper part of the frame, scaling up (row 8)
  const deviceY = useTransform(scrollYProgress, [0, A], ["0vh", reduce ? "0vh" : "-54vh"]);
  const deviceScale = useTransform(scrollYProgress, [0, A], [1, reduce ? 1 : 1.08]);
  // Cover: the About cards slide over; once they cover 50 % the mockup and gradient fade out
  const heroOpacity = useTransform(scrollYProgress, [A + (1 - A) * 0.5, A + (1 - A) * 0.9], [1, 0]);
  const [shown, setShown] = useState(true); // shader stops once the About cards have covered the hero (audit A-06)
  useMotionValueEvent(heroOpacity, "change", (v) => {
    const s = v > 0.02;
    if (s !== shown) setShown(s);
  });

  return (
    <section
      ref={ref}
      id="top"
      aria-labelledby="hero-title"
      className="relative z-0 bg-black"
      style={{ height: `calc(200vh + ${HERO_TRAVEL_VH}vh)` }}
    >
      <motion.div className="sticky top-0 h-screen overflow-hidden" style={{ opacity: heroOpacity }}>
        {/* Backdrop ------------------------------------------------------ */}
        <motion.div aria-hidden="true" className="absolute inset-x-0 top-0 h-[150%] will-change-transform" style={{ y: bgY }}>
          <LightBridge className="absolute inset-0" priority reveal active={shown} params={SHADER_DESKTOP} />
        </motion.div>

        {/* Copy ---------------------------------------------------------- */}
        <motion.div
          className="relative z-10 mx-auto flex max-w-[954px] flex-col items-center px-5 pt-[200px] text-center"
          style={{ y: copyY, opacity: reduce ? 1 : copyOpacity }}
        >
          <HeroCopy desktop />
        </motion.div>

        {/* Mockup ---------------------------------------------------------- */}
        <motion.div
          className="absolute left-1/2 top-[70vh] z-20 w-[50vw] min-w-[640px] max-w-[805px] -translate-x-1/2 will-change-transform"
          style={{ y: deviceY, scale: deviceScale }}
          initial={reduce ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: ease.out, delay: 0.35 }}
        >
          <Image
            src={asset("/images/hero-device.png")}
            alt="Ponte web app showing an OTC trade on a desktop display"
            width={1610}
            height={1498}
            priority
            sizes="(min-width: 1024px) 50vw, 0px"
            className="h-auto w-full drop-shadow-[0_40px_80px_rgba(0,0,0,0.6)]"
          />
          <HeroScreen />
        </motion.div>

        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 z-30 h-64 bg-gradient-to-b from-transparent to-near-black" />
      </motion.div>
    </section>
  );
}

function HeroMobile() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  // Phone: 256px at y 458 → 288px at y 100 (Figma hero → hero 3), i.e. rises ~360px and scales 1.125
  const phoneY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -358]);
  const phoneScale = useTransform(scrollYProgress, [0, 1], [1, reduce ? 1 : 1.125]);
  // Copy block fades as one once the phone's top reaches it (~ 40 % of the travel)
  const copyOpacity = useTransform(scrollYProgress, [0.32, 0.6], [1, 0]);
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "-12%"]);

  return (
    <section ref={ref} id="top" aria-labelledby="hero-title" className="relative z-0 bg-black" style={{ height: "calc(100svh + 360px)" }}>
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <motion.div aria-hidden="true" className="absolute inset-x-0 top-0 h-[130%] will-change-transform" style={{ y: bgY }}>
          <LightBridge className="absolute inset-0" priority reveal params={SHADER_MOBILE} />
        </motion.div>
        {/* Darkening at the top so the header and copy stay readable (row 38) */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[460px] bg-gradient-to-b from-black/85 via-black/45 to-transparent" />
        {/* soft glow behind the phone (Figma ellipse) */}
        <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-[498px] h-[260px] w-[320px] -translate-x-1/2 rounded-full bg-lime/20 blur-[60px]" />

        <motion.div className="relative z-10 mx-auto flex flex-col items-center px-5 pt-[149px] text-center" style={{ opacity: reduce ? 1 : copyOpacity }}>
          <HeroCopy />
        </motion.div>

        <motion.div className="absolute left-1/2 top-[458px] z-20 w-[256px] -translate-x-1/2 origin-top will-change-transform" style={{ y: phoneY, scale: phoneScale }}
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease: ease.out, delay: 0.35 }}
        >
          <Image src={asset("/images/mobile-hero-phone.png")} alt="Ponte mobile app showing P2P buy offers" width={512} height={1064} priority sizes="288px" className="h-auto w-full" />
        </motion.div>

        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 z-30 h-40 bg-gradient-to-b from-transparent to-near-black" />
      </div>
    </section>
  );
}

function HeroCopy({ desktop }: { desktop?: boolean }) {
  return (
    <>
      <RevealLines
        id="hero-title"
        as="h1"
        immediate
        label={hero.title.join("")}
        className="text-h1 text-white max-lg:text-[clamp(2.5rem,11vw,3rem)] max-lg:leading-[1]"
        lines={[
          <>
            Money <span className="text-lime">moves.</span>
          </>,
          <>
            Confidence <span className="text-lime">stays.</span>
          </>,
        ]}
      />
      <Reveal immediate index={3} as="p" className="mt-5 max-w-[315px] text-body-s text-white/85 lg:mt-[31px] lg:max-w-[490px] lg:text-body-l lg:text-white/90">
        {hero.body}
      </Reveal>
      {desktop ? (
        <Reveal immediate index={5} className="mt-[52px] flex items-center gap-[10px]">
          <StoreButton href={links.appStore} label="App Store" icon={<Appstore className="h-5 w-[15px]" />} />
          <StoreButton href={links.googlePlay} label="Google Play" icon={<Googleplay className="h-5 w-[17px]" />} />
        </Reveal>
      ) : (
        <Reveal immediate index={5} className="mt-7">
          <Button href={links.app}>Launch App</Button>
        </Reveal>
      )}
    </>
  );
}

function StoreButton({ href, label, icon }: { href: string; label: string; icon: React.ReactNode }) {
  return (
    <Button href={href} variant="pale" chevron={false} className="gap-3">
      <span className="flex items-center gap-3">
        {label}
        <span aria-hidden="true" className="flex">
          {icon}
        </span>
      </span>
    </Button>
  );
}
