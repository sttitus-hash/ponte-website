"use client";

import { useEffect, useState } from "react";

/**
 * True at the `lg` breakpoint and up — which, as in globals.css, also requires a fine pointer
 * (audit A-08): touch-only devices get the stacked layouts at any width. Defaults to true during SSR.
 */
export const DESKTOP_QUERY = "(min-width: 1024px)";

export function useIsDesktop() {
  const [desktop, setDesktop] = useState(true);
  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_QUERY);
    const update = () => setDesktop(mq.matches && !document.documentElement.hasAttribute("data-touch"));
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return desktop;
}
