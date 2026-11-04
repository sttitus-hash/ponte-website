"use client";

import Image from "next/image";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { useCallback, useRef, useState } from "react";
import { ChevronSmall, IlloTrustLens, IlloTrustRings } from "@/components/ui/icons";
import { DotChip } from "@/components/ui/Primitives";
import { Reveal, RevealLines } from "@/components/ui/Reveal";
import { trust } from "@/lib/content";
import { ease, viewportOnce } from "@/lib/motion";
import { links } from "@/lib/site";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { asset } from "@/lib/asset";

const tabs = trust.tabs;
const actionHref: Record<number, string> = { 0: links.app, 1: links.app, 2: links.app, 3: links.support };

/**
 * 06 Trust — headline + four tabs. On desktop the section pins and the active
 * tab follows scroll (tabs are also clickable/keyboard operable, which jumps
 * the scroll position). On mobile the four panels stack as cards that scale in.
 */
export function Trust() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const next = Math.min(tabs.length - 1, Math.max(0, Math.floor(v * tabs.length)));
    if (next !== active) setActive(next);
  });

  const jumpTo = useCallback((i: number) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const top = rect.top + window.scrollY;
    const travel = el.offsetHeight - window.innerHeight;
    const target = top + travel * ((i + 0.5) / tabs.length);
    window.scrollTo({ top: target, behavior: "smooth" });
    setActive(i);
  }, []);

  return (
    <section
      ref={ref}
      id="trust"
      aria-labelledby="trust-title"
      className="relative bg-black lg:h-[400vh]"
    >
      <div className="relative overflow-hidden lg:sticky lg:top-0 lg:h-screen">
        {/* Backdrop: rays, flowing horizontally */}
        <div aria-hidden="true" className="absolute inset-0">
          <Image
            src={asset("/images/rays-poster.png")}
            alt=""
            fill
            sizes="100vw"
            className="rotate-90 scale-[1.9] object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.85)_0%,rgba(0,0,0,0.35)_45%,rgba(0,0,0,0.55)_100%)]" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-black" />
        </div>

        <div className="relative px-gutter pb-16 pt-24 lg:grid lg:h-full lg:grid-cols-[537px_1fr] lg:grid-rows-[auto_1fr] lg:gap-x-[222px] lg:gap-y-0 lg:pb-[118px] lg:pt-[118px]">
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
            className="text-h2 lg:w-[660px] lg:max-w-none"
          />
          <Reveal as="p" index={2} className="text-body-l mt-6 max-w-[559px] text-white lg:mt-1.5">
            {trust.body}
          </Reveal>

          {/* Desktop: tab list ---------------------------------------- */}
          <div role="tablist" aria-label="Trust" aria-orientation="vertical" className="mt-10 hidden flex-col gap-3 self-end lg:mt-0 lg:flex">
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
                  className={`group relative grid h-[111px] grid-cols-[1fr_auto] grid-rows-[auto_1fr] rounded-panel border px-6 pb-5 pt-[21px] text-left transition-colors duration-500 ${
                    isActive
                      ? "border-lime bg-lime"
                      : "border-card-stroke bg-card/90 backdrop-blur-sm hover:border-[#2c2c2c]"
                  }`}
                >
                  <span
                    className={`text-dot-41 col-start-1 row-start-1 transition-colors duration-500 ${
                      isActive ? "text-ink" : "text-grey-dark"
                    }`}
                  >
                    0{i + 1}
                  </span>
                  <span
                    className={`text-mono-12 col-start-2 row-start-1 self-start pt-1 transition-colors duration-500 ${
                      isActive ? "text-olive" : "text-grey-dim"
                    }`}
                  >
                    {tab.label}
                  </span>
                  <span
                    className={`text-tab-title col-span-2 col-start-1 row-start-2 self-end truncate pr-12 transition-colors duration-500 ${
                      isActive ? "text-black" : "text-grey"
                    }`}
                  >
                    {tab.title}
                  </span>
                  <span
                    aria-hidden="true"
                    className={`absolute bottom-5 right-6 flex size-8 items-center justify-center rounded-full border transition-all duration-500 ${
                      isActive
                        ? "border-lime-dim bg-lime-dim text-ink"
                        : "border-[#333] text-grey group-hover:border-grey-dim"
                    }`}
                  >
                    <ChevronSmall className="h-[10px] w-[6px]" />
                  </span>
                </button>
              );
            })}
          </div>

          {/* Desktop: active panel ------------------------------------- */}
          <div
            id="trust-panel"
            role="tabpanel"
            aria-labelledby={`trust-tab-${active}`}
            className="on-lime relative mt-6 hidden min-h-[480px] overflow-hidden rounded-panel bg-lime text-ink lg:mt-0 lg:block lg:self-end"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={active}
                className="absolute inset-0"
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, y: -12 }}
                transition={{ duration: 0.45, ease: ease.out }}
              >
                <PanelContent index={active} />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Mobile: stacked cards -------------------------------------- */}
          <ol className="mt-10 flex flex-col gap-3 lg:hidden">
            {tabs.map((tab, i) => (
              <motion.li
                key={tab.title}
                className="on-lime relative overflow-hidden rounded-panel bg-lime text-ink"
                initial={reduce ? false : { opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={viewportOnce}
                transition={{ duration: 0.7, ease: ease.out }}
              >
                <PanelContent index={i} stacked />
              </motion.li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */

function PanelContent({ index, stacked }: { index: number; stacked?: boolean }) {
  const tab = tabs[index];
  return (
    <div className={`relative flex h-full flex-col ${stacked ? "p-5" : "p-[19px] pl-[25px]"} lg:flex-row`}>
      <div className="flex flex-1 flex-col lg:pr-6">
        <div className="flex items-start justify-between">
          <span className="text-dot-66 text-ink">0{index + 1}</span>
          <span className="text-mono-12 pr-[7px] pt-[8px] text-olive">0{index + 1} / 04</span>
        </div>

        {stacked ? <Illustration kind={tab.illustration} chips={tab.chips} className="mt-6" /> : null}

        <div className="mt-auto pt-8">
          <h3 className="text-card-title max-w-[360px] text-ink">{tab.title}</h3>
          <p className="text-body-s mt-3 max-w-[360px] text-olive">{tab.body}</p>
          <a
            href={actionHref[index]}
            className="mt-6 flex h-11 w-full max-w-[360px] items-center justify-between rounded-full bg-lime-dim pl-4 pr-1 text-mono-12 text-ink transition-colors duration-300 hover:bg-[#d2d86c]"
          >
            {tab.action}
            <span aria-hidden="true" className="flex size-9 items-center justify-center rounded-full bg-ink text-lime">
              <ChevronSmall className="h-[10px] w-[6px]" />
            </span>
          </a>
        </div>
      </div>

      {stacked ? null : <Illustration kind={tab.illustration} chips={tab.chips} className="w-[348px] shrink-0" />}
    </div>
  );
}

function Illustration({
  kind,
  chips,
  className = "",
}: {
  kind: string;
  chips: readonly string[];
  className?: string;
}) {
  return (
    <div className={`relative flex flex-col justify-between rounded-panel bg-lime-dim p-6 text-ink lg:min-h-[442px] ${className}`}>
      <div className="flex flex-1 items-center justify-center py-4 lg:py-6">
        <div className="w-full max-w-[280px]">
          {kind === "rings" ? <IlloTrustRings className="h-auto w-full" /> : null}
          {kind === "lens" ? <IlloTrustLens className="h-auto w-full" /> : null}
          {kind === "spiral" ? (
            <Image src={asset("/illustrations/trust-spiral.png")} alt="" width={578} height={596} sizes="280px" className="h-auto w-full" />
          ) : null}
          {kind === "support" ? (
            <Image src={asset("/illustrations/trust-support.png")} alt="" width={578} height={616} sizes="280px" className="h-auto w-full" />
          ) : null}
        </div>
      </div>
      <ul className="flex flex-col items-start gap-2">
        {chips.map((chip) => (
          <li key={chip}>
            <DotChip>{chip}</DotChip>
          </li>
        ))}
      </ul>
    </div>
  );
}
