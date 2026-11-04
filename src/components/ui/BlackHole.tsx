"use client";

import { useEffect, useRef, useState } from "react";
import { mountBlackHole } from "@/lib/blackHole";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * Ponte's official black-hole piece (404 page). Fills its parent; pauses when the
 * tab is hidden; `prefers-reduced-motion` slows it to a quarter speed, as in the
 * designer's file. Without WebGL the parent's plain black background remains.
 */
export function BlackHole({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    let handle: ReturnType<typeof mountBlackHole> = null;
    try {
      handle = mountBlackHole(cv, { reduce });
    } catch {
      handle = null;
    }
    if (!handle) return;
    const h = handle;
    const sync = () => h.setPlaying(document.visibilityState === "visible");
    sync();
    setReady(true);
    document.addEventListener("visibilitychange", sync);
    return () => {
      document.removeEventListener("visibilitychange", sync);
      h.destroy();
    };
  }, [reduce]);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className={`block h-full w-full touch-none transition-opacity duration-1000 ${ready ? "opacity-100" : "opacity-0"} ${className}`}
    />
  );
}
