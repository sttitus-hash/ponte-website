"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { Button } from "@/components/ui/Button";
import { Appstore, Googleplay } from "@/components/ui/icons";
import { Reveal, RevealLines } from "@/components/ui/Reveal";
import { hero } from "@/lib/content";
import { ease } from "@/lib/motion";
import { links } from "@/lib/site";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { asset } from "@/lib/asset";

/**
 * 01 Hero — pinned for ~1.6 viewports on desktop. While pinned: the rays
 * backdrop drifts slower than the page (parallax), the copy settles upward
 * and fades, and the device mockup rises from below the fold to take over
 * the frame. On mobile the section is a plain stacked layout.
 */
export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  // Backdrop: slow parallax + gentle darkening.
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "18%"]);
  const bgOpacity = useTransform(scrollYProgress, [0, 0.9], [1, 0.55]);

  // Copy: lifts and fades as the mockup takes over.
  const copyY = useTransform(scrollYProgress, [0, 0.6], [0, reduce ? 0 : -120]);
  const copyOpacity = useTransform(scrollYProgress, [0.15, 0.55], [1, 0]);

  // Mockup: from the fold (top ≈ 70vh) to the upper part of the frame.
  const deviceY = useTransform(scrollYProgress, [0, 1], ["0vh", reduce ? "0vh" : "-52vh"]);
  const deviceScale = useTransform(scrollYProgress, [0, 1], [1, reduce ? 1 : 1.06]);

  return (
    <section
      ref={ref}
      id="top"
      aria-labelledby="hero-title"
      className="relative bg-black lg:h-[190vh]"
    >
      <div className="relative overflow-hidden lg:sticky lg:top-0 lg:h-screen">
        {/* Backdrop ------------------------------------------------------ */}
        <motion.div
          aria-hidden="true"
          className="absolute inset-0 will-change-transform"
          style={{ y: bgY, opacity: bgOpacity }}
        >
          <Image
            src={asset("/images/rays-poster.png")}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-[50%_35%]"
          />
          {/* blurred ellipses (forest / teal) and vignette from the design */}
          <div className="absolute inset-0 bg-[radial-gradient(60%_55%_at_50%_30%,rgba(25,78,73,0.35),transparent_70%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(80%_70%_at_50%_15%,transparent_30%,rgba(0,0,0,0.75)_100%)]" />
          <div className="absolute inset-0 bg-black/30" />
        </motion.div>

        {/* Copy ---------------------------------------------------------- */}
        <motion.div
          className="relative z-10 mx-auto flex max-w-[954px] flex-col items-center px-5 pt-28 text-center sm:pt-36 lg:pt-[200px]"
          style={{ y: copyY, opacity: reduce ? 1 : copyOpacity }}
        >
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
          <Reveal
            immediate
            index={3}
            as="p"
            className="mt-5 max-w-[315px] text-body-s text-white/85 lg:mt-[53px] lg:max-w-[490px] lg:text-body-l lg:text-white/90"
          >
            {hero.body}
          </Reveal>

          <Reveal immediate index={5} className="mt-7 lg:hidden">
            <Button href={links.app}>Launch App</Button>
          </Reveal>

          <Reveal immediate index={5} className="mt-[52px] hidden items-center gap-[10px] lg:flex">
            <StoreButton href={links.appStore} label="App Store" icon={<Appstore className="h-5 w-[15px]" />} />
            <StoreButton href={links.googlePlay} label="Google Play" icon={<Googleplay className="h-5 w-[17px]" />} />
          </Reveal>
        </motion.div>

        {/* Mockup (desktop) ----------------------------------------------- */}
        <motion.div
          className="relative z-20 mx-auto hidden will-change-transform lg:absolute lg:left-1/2 lg:top-[70vh] lg:block lg:w-[50vw] lg:min-w-[640px] lg:max-w-[805px] lg:-translate-x-1/2"
          style={{ y: deviceY, scale: deviceScale }}
          initial={reduce ? false : { opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, ease: ease.out, delay: 0.5 }}
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
        </motion.div>

        {/* Mockup (mobile) — phone cut off at the fold, like the design --- */}
        <motion.div
          className="relative z-20 mx-auto mt-12 w-[256px] lg:hidden"
          initial={reduce ? false : { opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: ease.out, delay: 0.45 }}
        >
          <Image
            src={asset("/images/mobile-hero-phone.png")}
            alt="Ponte mobile app showing P2P buy offers"
            width={512}
            height={1064}
            priority
            sizes="256px"
            className="h-auto w-full"
          />
        </motion.div>

        {/* Bottom fade into the next section ------------------------------ */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 z-30 h-40 bg-gradient-to-b from-transparent to-near-black lg:h-64"
        />
      </div>
    </section>
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
