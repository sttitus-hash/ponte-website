"use client";

import { motion } from "motion/react";
import type { ElementType, ReactNode } from "react";
import { lineReveal, rise, stagger, viewportOnce } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Stagger index (×80ms). */
  index?: number;
  as?: "div" | "p" | "span" | "li" | "section" | "figure";
  /** Animate immediately instead of waiting for the viewport (hero). */
  immediate?: boolean;
};

/** Fade + 28px rise when the element enters the viewport. Respects reduced motion. */
export function Reveal({ children, className, index = 0, as = "div", immediate }: RevealProps) {
  const reduce = useReducedMotion();
  const Tag = motion[as];
  if (reduce) {
    const Static = as as ElementType;
    return <Static className={className}>{children}</Static>;
  }
  return (
    <Tag
      className={className}
      variants={rise}
      custom={index}
      initial="hidden"
      {...(immediate ? { animate: "show" } : { whileInView: "show", viewport: viewportOnce })}
    >
      {children}
    </Tag>
  );
}

/** Stagger container for a group of `Reveal`s. */
export function RevealGroup({
  children,
  className,
  delay = 0,
  gap = 0.08,
  immediate,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  gap?: number;
  immediate?: boolean;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      variants={stagger(delay, gap)}
      initial="hidden"
      {...(immediate ? { animate: "show" } : { whileInView: "show", viewport: viewportOnce })}
    >
      {children}
    </motion.div>
  );
}

type LinesProps = {
  lines: readonly ReactNode[];
  as?: "h1" | "h2" | "h3" | "p";
  className?: string;
  lineClassName?: string;
  immediate?: boolean;
  delay?: number;
  id?: string;
  /** Accessible text when `lines` contain JSX. */
  label?: string;
};

/**
 * Headline reveal: each line slides up from behind a clip mask.
 * Screen readers get the whole string; the visual lines are aria-hidden.
 */
export function RevealLines({
  lines,
  as = "h2",
  className = "",
  lineClassName = "",
  immediate,
  delay = 0,
  id,
  label,
}: LinesProps) {
  const reduce = useReducedMotion();
  const Heading = as;
  const text = label ?? lines.map((l) => (typeof l === "string" ? l : "")).join(" ");

  if (reduce) {
    return (
      <Heading id={id} className={className}>
        {lines.map((line, i) => (
          <span key={i} className={`block ${lineClassName}`}>
            {line}
          </span>
        ))}
      </Heading>
    );
  }

  const MotionHeading = motion[as];
  return (
    <MotionHeading
      id={id}
      className={className}
      aria-label={text || undefined}
      initial="hidden"
      {...(immediate ? { animate: "show" } : { whileInView: "show", viewport: viewportOnce })}
    >
      {lines.map((line, i) => (
        <span key={i} className="block [overflow:clip] [overflow-clip-margin:0.15em]" aria-hidden="true">
          <motion.span
            className={`block will-change-transform ${lineClassName}`}
            variants={lineReveal}
            custom={i + delay}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </MotionHeading>
  );
}
