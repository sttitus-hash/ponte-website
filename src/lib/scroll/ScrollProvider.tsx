"use client";

import Lenis from "lenis";
import { createContext, useContext, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { Sequencer, easeOutExpo, type KeyframeSource } from "./sequencer";

type Ctx = { lenis: Lenis | null; sequencer: Sequencer; smooth: boolean };
const ScrollContext = createContext<Ctx | null>(null);

const desktopQuery = "(min-width: 1024px) and (pointer: fine)";
const reduceQuery = "(prefers-reduced-motion: reduce)";

/**
 * Smooth scrolling (Lenis) + the trigger sequencer, desktop fine-pointer only; touch
 * devices and `prefers-reduced-motion` keep native scrolling. Anchor links are routed
 * through Lenis so they land on the right keyframe.
 */
export function ScrollProvider({ children }: { children: ReactNode }) {
  const [sequencer] = useState(() => new Sequencer());
  const [lenis, setLenis] = useState<Lenis | null>(null);
  const [smooth, setSmooth] = useState(false);

  useEffect(() => {
    const mqDesktop = window.matchMedia(desktopQuery);
    const mqReduce = window.matchMedia(reduceQuery);
    let instance: Lenis | null = null;
    let raf = 0;

    const start = () => {
      if (instance) return;
      instance = new Lenis({
        lerp: 0.1,
        wheelMultiplier: 1,
        smoothWheel: true,
        syncTouch: false,
        anchors: false,
        virtualScroll: sequencer.onVirtualScroll,
        prevent: (node) => node.hasAttribute("data-lenis-prevent"),
      });
      const loop = (t: number) => {
        instance?.raf(t);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
      sequencer.attach(instance);
      setLenis(instance);
      setSmooth(true);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      instance?.destroy();
      instance = null;
      sequencer.attach(null);
      setLenis(null);
      setSmooth(false);
    };
    const sync = () => {
      if (mqDesktop.matches && !mqReduce.matches) start();
      else stop();
    };
    sync();
    mqDesktop.addEventListener("change", sync);
    mqReduce.addEventListener("change", sync);
    return () => {
      mqDesktop.removeEventListener("change", sync);
      mqReduce.removeEventListener("change", sync);
      stop();
    };
  }, [sequencer]);

  // Anchor navigation: same-page hashes go through Lenis (or native smooth scroll).
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as HTMLElement | null)?.closest?.("a[href^='#']") as HTMLAnchorElement | null;
      if (!a) return;
      const id = a.getAttribute("href")!.slice(1);
      const el = id === "top" ? document.body : document.getElementById(id);
      if (!el) return;
      e.preventDefault();
      const top = id === "top" ? 0 : el.getBoundingClientRect().top + window.scrollY;
      if (lenis) lenis.scrollTo(top, { duration: 1.2, easing: easeOutExpo, lock: true, force: true });
      else window.scrollTo({ top, behavior: window.matchMedia(reduceQuery).matches ? "auto" : "smooth" });
      if (id !== "top") history.replaceState(null, "", `#${id}`);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [lenis]);

  return <ScrollContext.Provider value={{ lenis, sequencer, smooth }}>{children}</ScrollContext.Provider>;
}

export function useScrollDriver() {
  const ctx = useContext(ScrollContext);
  if (!ctx) throw new Error("useScrollDriver must be used inside <ScrollProvider>");
  return ctx;
}

/** Register a pinned section's keyframes (absolute scroll offsets) with the sequencer. */
export function useKeyframes(order: number, keyframes: KeyframeSource["keyframes"], enabled = true) {
  const { sequencer } = useScrollDriver();
  const fn = useRef(keyframes);
  useLayoutEffect(() => {
    fn.current = keyframes;
  });
  useEffect(() => {
    if (!enabled) return;
    return sequencer.register({ order, keyframes: () => fn.current() });
  }, [sequencer, order, enabled]);
}

/** Absolute page offset of an element's top. */
export function pageTop(el: HTMLElement) {
  return el.getBoundingClientRect().top + window.scrollY;
}
