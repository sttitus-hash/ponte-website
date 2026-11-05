"use client";

import { useTransform, type MotionValue } from "motion/react";

/**
 * Scroll-driven slide decks (Track record, Trust).
 *
 * The deck has one continuous position `pos` in slide units (0 … n-1). Every layer's
 * opacity / offset / scale is a pure function of `pos`, so scrubbing, stopping half-way
 * and reversing are exact and nothing is ever queued behind a time-based exit.
 *
 * `useDeckPosition` maps the pinned section's scroll progress onto `pos` with equal
 * "hold" plateaus for each slide and short ramps between them (`ramp` = share of the
 * total scroll each ramp takes). Under reduced motion `pos` is stepped to whole slides.
 */
export const DECK_RAMP = 0.14;

export function useDeckPosition(progress: MotionValue<number>, n: number, reduce: boolean, ramp = DECK_RAMP) {
  const hold = (1 - (n - 1) * ramp) / n;
  const input: number[] = [];
  const output: number[] = [];
  for (let i = 0; i < n; i++) {
    const a = i * (hold + ramp);
    input.push(a, a + hold);
    output.push(i, i);
  }
  const smooth = useTransform(progress, input, output);
  const stepped = useTransform(smooth, (v) => Math.round(v));
  return reduce ? stepped : smooth;
}

/** Scroll offset (0–1 of the pinned travel) at the middle of slide `i`'s hold — for tab jumps. */
export function deckSlideCenter(i: number, n: number, ramp = DECK_RAMP) {
  const hold = (1 - (n - 1) * ramp) / n;
  return i * (hold + ramp) + hold / 2;
}

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const easeOut = (t: number) => 1 - (1 - t) * (1 - t) * (1 - t);

/**
 * Visibility of layer `i` at deck position `pos`: 1 while it is the current slide, ramping to 0
 * as the deck moves on. Two profiles:
 *  - "text": the leaving line clears over the first 45 % of the ramp and the arriving one enters
 *    from 40 %, so the two never read as doubled type (the hand-over is a quick slide-out /
 *    slide-in, while the illustration beneath keeps the panel populated);
 *  - "image": the leaving object dissolves over the first 60 % and the arriving one from 30 %,
 *    so there is always an object on the panel (the dissolve reads as one object becoming the next).
 */
export function layerVisibility(pos: number, i: number, profile: "text" | "image" = "text") {
  const d = pos - i;
  if (d >= 1 || d <= -1) return { v: 0, dir: d > 0 ? 1 : -1 };
  const [outEnd, inStart] = profile === "image" ? [0.6, 0.3] : [0.45, 0.4];
  if (d >= 0) {
    const t = clamp01(d / outEnd);
    return { v: 1 - t * t, dir: 1 }; // leaving (ease-in: holds, then clears)
  }
  return { v: easeOut(clamp01((d + 1 - inStart) / (1 - inStart))), dir: -1 }; // arriving (ease-out)
}

/** MotionValues for a text layer: fade with a short vertical travel. */
export function useTextLayer(
  pos: MotionValue<number>,
  i: number,
  reduce: boolean,
  travel = 14,
  profile: "text" | "image" = "text",
) {
  const opacity = useTransform(pos, (p) => layerVisibility(p, i, profile).v);
  const y = useTransform(pos, (p) => {
    if (reduce) return 0;
    const { v, dir } = layerVisibility(p, i, profile);
    return -dir * (1 - v) * travel;
  });
  return { opacity, y };
}

/** MotionValues for an illustration layer: fade with a slight scale and tilt, as in the approved motion. */
export function useImageLayer(pos: MotionValue<number>, i: number, reduce: boolean) {
  const opacity = useTransform(pos, (p) => layerVisibility(p, i, "image").v);
  const scale = useTransform(pos, (p) => {
    if (reduce) return 1;
    const { v, dir } = layerVisibility(p, i, "image");
    return 1 - (1 - v) * (dir > 0 ? 0.06 : 0.1);
  });
  const rotate = useTransform(pos, (p) => {
    if (reduce) return 0;
    const { v, dir } = layerVisibility(p, i, "image");
    return dir * (1 - v) * 4;
  });
  return { opacity, scale, rotate };
}
