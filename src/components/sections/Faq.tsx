"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { useId, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Chip, Marker } from "@/components/ui/Primitives";
import { Reveal, RevealLines } from "@/components/ui/Reveal";
import { TypeReveal } from "@/components/ui/TypeReveal";
import { faq } from "@/lib/content";
import { ease, viewportOnce } from "@/lib/motion";
import { links } from "@/lib/site";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { asset } from "@/lib/asset";

/**
 * 08 FAQ — accessible accordion (button + region, aria-expanded / aria-controls,
 * arrow-key navigation between questions). One item open at a time, like the design.
 * On desktop the section starts one viewport early, beneath Our story, which fades out
 * over it (row 29).
 */
export function Faq() {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState<number | null>(0);
  const baseId = useId();

  const onKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, i: number) => {
    const buttons = Array.from(e.currentTarget.closest("ol")?.querySelectorAll<HTMLButtonElement>("button[data-faq]") ?? []);
    const move = (to: number) => buttons[(to + buttons.length) % buttons.length]?.focus();
    if (e.key === "ArrowDown") {
      e.preventDefault();
      move(i + 1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      move(i - 1);
    } else if (e.key === "Home") {
      e.preventDefault();
      move(0);
    } else if (e.key === "End") {
      e.preventDefault();
      move(buttons.length - 1);
    }
  };

  return (
    <section id="faq" aria-labelledby="faq-title" className="relative z-[3] bg-black px-5 pb-20 lg:px-gutter pt-[58px] text-cream lg:-mt-[100vh] lg:pb-[60px] lg:pt-[54px]">
      {/* Header */}
      <div className="flex flex-col gap-8 lg:grid lg:grid-cols-[1fr_493px] lg:items-start lg:gap-x-10">
        <RevealLines
          id="faq-title"
          as="h2"
          lines={[
            <span key="a">{faq.title[0]}</span>,
            <span key="b" className="text-lime">
              {faq.title[1]}
            </span>,
          ]}
          label={faq.title.join(" ")}
          className="text-h2 max-w-[664px]"
        />
        <div className="lg:pt-1.5">
          <Reveal as="p" index={1} className="text-body-l max-w-[440px] text-grey max-lg:text-body-s">
            {faq.aside}
          </Reveal>
          <Reveal index={2} className="mt-8 lg:mt-[33px]">
            <Button href={links.support} className="max-lg:w-full max-lg:justify-between">
              {faq.cta}
            </Button>
          </Reveal>
        </div>
      </div>

      {/* Rows */}
      <motion.ol
        className="-mx-5 mt-12 border-t border-divider lg:mx-0 lg:mt-[125px]"
        initial={reduce ? false : "hidden"}
        whileInView="show"
        viewport={viewportOnce}
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
      >
        {faq.items.map((item, i) => {
          const isOpen = open === i;
          const panelId = `${baseId}-panel-${i}`;
          const buttonId = `${baseId}-button-${i}`;
          return (
            <motion.li
              key={item.question}
              className="border-b border-divider"
              variants={{
                hidden: { opacity: 0, y: 16 },
                show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: ease.out } },
              }}
            >
              <h3>
                {/* Mobile (row 52): number row, then the question full-width; the whole row is the control.
                    Desktop: number · question · Show/Hide on one row, answer aligned to the question column (row 30). */}
                <button
                  id={buttonId}
                  data-faq
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setOpen(isOpen ? null : i)}
                  onKeyDown={(e) => onKeyDown(e, i)}
                  className="group grid w-full grid-cols-[auto_1fr_auto] grid-rows-[auto_auto] items-start px-5 py-[31px] text-left lg:grid-cols-[383px_1fr_auto] lg:grid-rows-1 lg:px-0"
                >
                  <span className="col-start-1 row-start-1 flex items-center gap-2 text-mono-14 lg:gap-[10px] lg:pt-[9px]">
                    <Marker className="transition-colors duration-300" color={isOpen ? "bg-lime" : "bg-grey-dark group-hover:bg-grey-dim"} />
                    <span className={isOpen ? "text-cream" : "text-grey"}>
                      <TypeReveal text={isOpen ? `0${i + 1} / answer` : `0${i + 1}`} active duration={0.45} />
                    </span>
                  </span>
                  <span
                    className={`text-card-title col-span-3 col-start-1 row-start-2 mt-[6px] max-w-[760px] transition-colors duration-300 lg:col-span-1 lg:col-start-2 lg:row-start-1 lg:mt-0 ${
                      isOpen ? "text-cream" : "text-cream group-hover:text-white"
                    }`}
                  >
                    {item.question}
                  </span>
                  <span className="col-start-3 row-start-1 text-mono-14 uppercase text-grey transition-colors duration-300 group-hover:text-cream lg:pt-[9px]">
                    <span className="relative">
                      <TypeReveal text={isOpen ? "Hide" : "Show"} active duration={0.35} />
                      <span
                        aria-hidden="true"
                        className={`absolute inset-x-0 -bottom-0.5 h-px origin-left bg-current transition-transform duration-300 ${
                          isOpen ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                        }`}
                      />
                    </span>
                  </span>
                </button>
              </h3>

              <AnimatePresence initial={false}>
                {isOpen ? (
                  <motion.div
                    id={panelId}
                    role="region"
                    aria-labelledby={buttonId}
                    key="panel"
                    initial={reduce ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={reduce ? { height: 0, opacity: 0, transition: { duration: 0 } } : { height: 0, opacity: 0 }}
                    transition={{ duration: 0.5, ease: ease.inOut }}
                    className="overflow-hidden"
                  >
                    <div className="grid px-5 pb-8 lg:grid-cols-[383px_1fr] lg:px-0 lg:pb-[34px]">
                      <span aria-hidden="true" className="hidden lg:block" />
                      <div className="grid gap-8 lg:grid-cols-[585px_1fr] lg:gap-x-[59px]">
                        <motion.div
                          initial={reduce ? false : "hidden"}
                          animate="show"
                          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } } }}
                        >
                          <motion.p className="text-body-l text-grey max-lg:text-body-s" variants={riseIn}>
                            {item.answer}
                          </motion.p>
                          {item.chips ? (
                            <motion.ul className="mt-8 flex flex-wrap gap-2 lg:mt-[43px] lg:gap-4" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}>
                              {item.chips.map((chip) => (
                                <motion.li key={chip} variants={riseIn}>
                                  <Chip>{chip}</Chip>
                                </motion.li>
                              ))}
                            </motion.ul>
                          ) : null}
                        </motion.div>
                        {i === 0 ? (
                          <motion.div variants={riseIn} initial={reduce ? false : "hidden"} animate="show" transition={{ delay: 0.2 }}>
                            <OtcTile />
                          </motion.div>
                        ) : null}
                      </div>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </motion.li>
          );
        })}
      </motion.ol>
    </section>
  );
}

const riseIn = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: ease.out } },
};

/** Figma "Tile / OTC desk": forest plate with the OTC mobile screen clipped at the bottom (r36). */
function OtcTile() {
  return (
    <div aria-hidden="true" className="relative aspect-[493/494] w-full max-w-[493px] overflow-hidden rounded-panel bg-forest lg:justify-self-end">
      <span className="absolute left-[25px] top-[25px] text-mono-12 text-mint/80">OTC desk · Ponte</span>
      <div className="absolute left-[10.1%] top-[21%] w-[79.7%] overflow-hidden rounded-t-[36px]">
        <Image src={asset("/images/otc-phone-screen.png")} alt="" width={622} height={1392} sizes="(min-width: 1024px) 400px, 80vw" className="h-auto w-full" />
      </div>
    </div>
  );
}
