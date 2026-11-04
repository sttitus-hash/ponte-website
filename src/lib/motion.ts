import type { Transition, Variants } from "motion/react";

/** Shared easing curves (match the CSS tokens in globals.css). */
export const ease = {
  out: [0.16, 1, 0.3, 1] as const,
  inOut: [0.76, 0, 0.24, 1] as const,
};

export const dur = {
  fast: 0.35,
  base: 0.6,
  slow: 0.9,
};

export const springSoft: Transition = {
  type: "spring",
  stiffness: 170,
  damping: 26,
  mass: 0.9,
};

/** Default viewport for in-view entrances: fire once, slightly before fully visible. */
export const viewportOnce = { once: true, amount: 0.25, margin: "0px 0px -8% 0px" } as const;

/** Block-level fade/rise used for section content. */
export const rise: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: dur.base, ease: ease.out, delay: i * 0.08 },
  }),
};

/** Container that staggers `rise` children. */
export const stagger = (delayChildren = 0, staggerChildren = 0.08): Variants => ({
  hidden: {},
  show: { transition: { delayChildren, staggerChildren } },
});

/** Soft scale-in used for cards and mockups. */
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: dur.slow, ease: ease.out },
  },
};

/** Per-line reveal: lines slide up from behind a clip mask. */
export const lineReveal: Variants = {
  hidden: { y: "125%" },
  show: (i: number = 0) => ({
    y: "0%",
    transition: { duration: 0.8, ease: ease.out, delay: 0.06 * i },
  }),
};
