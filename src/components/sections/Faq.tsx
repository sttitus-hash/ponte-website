"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { useId, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Chip, Marker } from "@/components/ui/Primitives";
import { Reveal, RevealLines } from "@/components/ui/Reveal";
import { faq } from "@/lib/content";
import { ease, viewportOnce } from "@/lib/motion";
import { links } from "@/lib/site";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * 08 FAQ — accessible accordion (button + region, aria-expanded / aria-controls,
 * arrow-key navigation between questions). One item open at a time, like the design.
 */
export function Faq() {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState<number | null>(0);
  const baseId = useId();

  const onKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, i: number) => {
    const buttons = Array.from(
      e.currentTarget.closest("ol")?.querySelectorAll<HTMLButtonElement>("button[data-faq]") ?? [],
    );
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
    <section id="faq" aria-labelledby="faq-title" className="relative bg-black px-gutter pb-20 pt-16 text-cream lg:pb-[60px] lg:pt-[54px]">
      {/* Header */}
      <div className="flex flex-col gap-8 lg:grid lg:grid-cols-[1fr_440px] lg:gap-x-10 lg:items-start">
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
          <Reveal as="p" index={1} className="text-body-l max-w-[440px] text-grey">
            {faq.aside}
          </Reveal>
          <Reveal index={2} className="mt-8 lg:mt-[33px]">
            <Button href={links.support}>{faq.cta}</Button>
          </Reveal>
        </div>
      </div>

      {/* Rows */}
      <motion.ol
        className="mt-16 border-t border-divider lg:mt-[190px]"
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
                <button
                  id={buttonId}
                  data-faq
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setOpen(isOpen ? null : i)}
                  onKeyDown={(e) => onKeyDown(e, i)}
                  className="group grid w-full grid-cols-[auto_1fr_auto] items-start gap-x-4 py-6 text-left lg:grid-cols-[383px_1fr_auto] lg:gap-x-0 lg:py-[31px]"
                >
                  <span className="flex items-center gap-2 pt-[9px] text-mono-14 lg:gap-[10px]">
                    <Marker
                      className="transition-colors duration-300"
                      color={isOpen ? "bg-lime" : "bg-grey-dark group-hover:bg-grey-dim"}
                    />
                    <span className={isOpen ? "text-cream" : "text-grey"}>
                      0{i + 1}
                      <span className="hidden lg:inline">{isOpen ? " / answer" : ""}</span>
                    </span>
                  </span>
                  <span
                    className={`text-card-title max-w-[760px] transition-colors duration-300 ${
                      isOpen ? "text-cream" : "text-cream group-hover:text-white"
                    }`}
                  >
                    {item.question}
                  </span>
                  <span className="pt-[9px] text-mono-14 uppercase text-grey transition-colors duration-300 group-hover:text-cream">
                    <span className="relative">
                      {isOpen ? "Hide" : "Show"}
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
                    <div className="grid gap-8 pb-8 lg:grid-cols-[383px_1fr] lg:pb-[34px]">
                      <span aria-hidden="true" className="hidden lg:block" />
                      <div className="grid gap-8 lg:grid-cols-[585px_1fr] lg:gap-x-[59px]">
                        <div>
                          <p className="text-body-l text-grey">{item.answer}</p>
                          {item.chips ? (
                            <ul className="mt-10 flex flex-wrap gap-4 lg:mt-[43px]">
                              {item.chips.map((chip) => (
                                <li key={chip}>
                                  <Chip>{chip}</Chip>
                                </li>
                              ))}
                            </ul>
                          ) : null}
                        </div>
                        {i === 0 ? <OtcTile /> : null}
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

function OtcTile() {
  return (
    <div
      aria-hidden="true"
      className="relative aspect-[493/494] w-full max-w-[493px] overflow-hidden rounded-panel bg-forest lg:justify-self-end"
    >
      <span className="absolute left-[25px] top-[25px] text-mono-12 text-mint/80">OTC desk · Ponte</span>
      <div className="absolute left-[50px] top-[104px] w-[80%] overflow-hidden rounded-t-[36px]">
        <Image
          src="/images/otc-phone-screen.png"
          alt=""
          width={622}
          height={1392}
          sizes="400px"
          className="h-auto w-full"
        />
      </div>
    </div>
  );
}
