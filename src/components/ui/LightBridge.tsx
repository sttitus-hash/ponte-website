"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { mountLightBridge, type LightBridgeHandle } from "@/lib/lightBridge";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { asset } from "@/lib/asset";

type Props = {
  className?: string;
  /** Uniform overrides (see LIGHT_BRIDGE_HERO). */
  params?: Record<string, number | string>;
  /** Play the one-shot rise reveal on mount, or `"armed"`: stay dark until `rise` becomes true. */
  reveal?: boolean | "armed";
  /** With `reveal="armed"`: flips to true to start the rise. */
  rise?: boolean;
  /** Poster shown before the first frame and when WebGL is unavailable. */
  poster?: string;
  posterClassName?: string;
  priority?: boolean;
};

/**
 * Ponte's "Light Bridge" shader as a fill. Renders only while on screen and
 * the tab is visible; under `prefers-reduced-motion` it draws one still frame.
 * Falls back to the still poster when WebGL is unavailable.
 */
export function LightBridge({
  className = "absolute inset-0",
  params,
  reveal = false,
  rise = false,
  poster = "/images/rays-poster.png",
  posterClassName = "object-cover object-[50%_35%]",
  priority,
}: Props) {
  const reduce = useReducedMotion();
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const handleRef = useRef<LightBridgeHandle | null>(null);
  const riseRef = useRef(rise);
  useEffect(() => {
    riseRef.current = rise;
    if (rise) handleRef.current?.rise();
  }, [rise]);

  // Callback ref (with cleanup) rather than useEffect: it re-runs whenever React hands us a
  // new <canvas>, including after a hydration-mismatch recovery that swaps the DOM node.
  const attach = useCallback(
    (canvas: HTMLCanvasElement | null) => {
      if (!canvas) return;
      let handle: LightBridgeHandle | null = null;
      try {
        handle = mountLightBridge(canvas, { params, reveal, still: reduce, onReady: () => setReady(true) });
      } catch {
        handle = null;
      }
      if (!handle) {
        setFailed(true);
        return;
      }
      const h = handle;
      handleRef.current = h;
      if (riseRef.current) h.rise();
      let visible = false;
      const sync = () => h.setPlaying(visible && document.visibilityState === "visible");
      const io = new IntersectionObserver(
        (entries) => {
          visible = entries.some((e) => e.isIntersecting);
          sync();
        },
        { threshold: 0 },
      );
      io.observe(canvas);
      document.addEventListener("visibilitychange", sync);
      return () => {
        io.disconnect();
        document.removeEventListener("visibilitychange", sync);
        handleRef.current = null;
        h.destroy();
      };
    },
    // params are static per mount site
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [reduce, reveal],
  );

  return (
    <div className={`overflow-hidden bg-[#050807] ${className}`} aria-hidden="true">
      {(!ready || failed) && (
        <Image src={asset(poster)} alt="" fill priority={priority} sizes="100vw" className={posterClassName} />
      )}
      {failed ? null : (
        <canvas
          ref={attach}
          className={`absolute inset-0 block h-full w-full transition-opacity duration-700 ${ready ? "opacity-100" : "opacity-0"}`}
        />
      )}
    </div>
  );
}
