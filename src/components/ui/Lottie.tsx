"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { AnimationItem } from "lottie-web";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { asset } from "@/lib/asset";

type Props = {
  /** Path under /public, e.g. "/animations/rings.json" */
  src: string;
  className?: string;
  loop?: boolean;
  /** Play only while in the viewport (default) or as soon as mounted. */
  playWhenVisible?: boolean;
  /** Frame to show when motion is reduced: a frame number, a 0–1 fraction of the loop, "first" or "last".
   *  Defaults to the middle of the loop, where the brand draw/retract loops are fully drawn. */
  reducedMotionFrame?: number | "first" | "last";
  /** Accessible description; omitted → decorative. */
  label?: string;
  /** Recolour every stroke/fill to `currentColor` (the files ship in ink #100F0F). */
  tint?: boolean;
  /**
   * Draw-once mode (CSV row 25): play from the first frame to `drawTo` (fraction of the loop,
   * where the brand files are fully drawn) each time `drawKey` changes to a truthy value, then
   * hold the drawn frame. No retract.
   */
  drawOnce?: boolean;
  drawTo?: number;
  drawKey?: number | boolean;
};

/**
 * Lightweight Lottie player: lottie-web's SVG-only build is loaded on demand,
 * the JSON is fetched once, playback is tied to viewport visibility and
 * `prefers-reduced-motion` freezes the animation on a still frame.
 */
export function Lottie({
  src,
  className,
  loop = true,
  playWhenVisible = true,
  reducedMotionFrame = 0.5,
  label,
  tint = false,
  drawOnce = false,
  drawTo = 0.5,
  drawKey,
}: Props) {
  const animRef = useRef<AnimationItem | null>(null);
  const reduce = useReducedMotion();
  const [ready, setReady] = useState(false);
  const drawKeyRef = useRef(drawKey);

  // Draw-once trigger: play 0 → drawn frame, then stop (no retract).
  useEffect(() => {
    drawKeyRef.current = drawKey;
    const anim = animRef.current;
    if (!drawOnce || !anim) return;
    if (!drawKey) {
      anim.goToAndStop(0, true);
      return;
    }
    const end = Math.round(drawTo * (anim.totalFrames - 1));
    if (reduce) {
      anim.goToAndStop(end, true);
      return;
    }
    anim.playSegments([0, end], true);
  }, [drawOnce, drawKey, drawTo, reduce, ready]);

  // Callback ref with cleanup: re-runs if React hands us a new node (hydration recovery).
  const attach = useCallback(
    (container: HTMLDivElement | null) => {
      if (!container) return;
      let cancelled = false;
      let observer: IntersectionObserver | null = null;

      (async () => {
        const [{ default: lottie }, res] = await Promise.all([
          import("lottie-web/build/player/lottie_light"),
          fetch(asset(src)),
        ]);
        if (cancelled) return;
        const animationData = await res.json();
        if (cancelled) return;
        const anim = lottie.loadAnimation({
          container,
          renderer: "svg",
          loop: drawOnce ? false : loop,
          autoplay: false,
          animationData,
          rendererSettings: { preserveAspectRatio: "xMidYMid meet", progressiveLoad: true },
        });
        animRef.current = anim;
        setReady(true);

        if (drawOnce) {
          // hold frame 0 (undrawn) until triggered; the draw effect takes over
          const end = Math.round(drawTo * (anim.totalFrames - 1));
          anim.goToAndStop(drawKeyRef.current ? end : 0, true);
          return;
        }
        if (reduce) {
          const frame =
            reducedMotionFrame === "last"
              ? anim.totalFrames - 1
              : reducedMotionFrame === "first"
                ? 0
                : reducedMotionFrame <= 1
                  ? Math.round(reducedMotionFrame * (anim.totalFrames - 1))
                  : reducedMotionFrame;
          anim.goToAndStop(frame, true);
          return;
        }
        if (!playWhenVisible) {
          anim.play();
          return;
        }
        observer = new IntersectionObserver(
          (entries) => {
            for (const e of entries) {
              if (e.isIntersecting) anim.play();
              else anim.pause();
            }
          },
          { threshold: 0.15 },
        );
        observer.observe(container);
      })();

      return () => {
        cancelled = true;
        observer?.disconnect();
        animRef.current?.destroy();
        animRef.current = null;
      };
    },
    [src, loop, playWhenVisible, reduce, reducedMotionFrame, drawOnce, drawTo],
  );

  return (
    <div
      ref={attach}
      className={`${tint ? "lottie-tint " : ""}${className ?? ""}`}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      data-ready={ready ? "" : undefined}
    />
  );
}
