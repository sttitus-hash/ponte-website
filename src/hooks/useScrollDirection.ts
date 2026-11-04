"use client";

import { useMotionValueEvent, useScroll } from "motion/react";
import { useState } from "react";

export type ScrollState = {
  y: number;
  direction: "up" | "down";
};

/** Current scroll offset and direction, throttled to animation frames by Motion. */
export function useScrollDirection(threshold = 6): ScrollState {
  const { scrollY } = useScroll();
  const [state, setState] = useState<ScrollState>({ y: 0, direction: "up" });

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? latest;
    const delta = latest - previous;
    setState((prev) => {
      const direction =
        Math.abs(delta) < threshold ? prev.direction : delta > 0 ? "down" : "up";
      if (prev.direction === direction && Math.abs(prev.y - latest) < 1) return prev;
      return { y: latest, direction };
    });
  });

  return state;
}
