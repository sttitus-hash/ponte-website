"use client";

import { useEffect, useState } from "react";

/**
 * True at the `lg` breakpoint and up. Layout follows viewport width only (the approved
 * breakpoints); input capabilities decide the scroll behaviour in ScrollProvider, never the
 * layout. Defaults to true during SSR.
 */
export const DESKTOP_QUERY = "(min-width: 1024px)";

export function useIsDesktop() {
  const [desktop, setDesktop] = useState(true);
  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_QUERY);
    const update = () => setDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return desktop;
}
