"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * Typewriter-style entrance for labels and small headings (designer reference: the
 * "TypeWriter" pen), with the requested easing: the reveal starts slowly, accelerates
 * through the middle and slows down at the end (ease-in-out over the whole string).
 *
 * The full text is laid out from the start (characters are only made visible), so nothing
 * reflows, and screen readers get the whole string via `aria-label`.
 *
 * Trigger: `active` (controlled), or `inView` (reveals when it enters the viewport).
 */
export function TypeReveal({
  text,
  active,
  inView,
  duration,
  delay = 0,
  className = "",
}: {
  text: string;
  active?: boolean;
  inView?: boolean;
  /** Seconds; defaults to 0.5s + 20ms per character, capped at 1.1s. */
  duration?: number;
  delay?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const [seen, setSeen] = useState(false);
  const [t, setT] = useState(0); // 0‥1 progress
  const chars = useMemo(() => Array.from(text), [text]);
  const total = duration ?? Math.min(1.1, 0.5 + chars.length * 0.02);
  const on = active ?? (inView ? seen : true);

  useEffect(() => {
    if (!inView || seen) return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [inView, seen]);

  useEffect(() => {
    if (reduce) return;
    let raf = 0;
    const start = performance.now() + delay * 1000;
    const from = t;
    const to = on ? 1 : 0;
    if (from === to) return;
    const dur = total * 1000 * Math.abs(to - from);
    const tick = (now: number) => {
      const k = Math.min(1, Math.max(0, (now - start) / dur));
      setT(from + (to - from) * k);
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [on, reduce]);

  // ease-in-out (quart): slow – fast – slow across the string
  const eased = t < 0.5 ? 8 * t ** 4 : 1 - Math.pow(-2 * t + 2, 4) / 2;
  const shown = reduce ? (on ? chars.length : 0) : Math.round(eased * chars.length);

  return (
    <span ref={ref} className={`inline-block whitespace-pre-wrap ${className}`}>
      <span className="sr-only">{text}</span>
      {chars.map((c, i) => (
        <span key={i} aria-hidden="true" style={{ opacity: i < shown ? 1 : 0 }}>
          {c}
        </span>
      ))}
    </span>
  );
}
