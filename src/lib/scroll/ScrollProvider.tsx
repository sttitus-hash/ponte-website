"use client";

import Lenis from "lenis";
import { createContext, useContext, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { Sequencer, easeOutExpo, type KeyframeSource } from "./sequencer";

type Ctx = { lenis: Lenis | null; sequencer: Sequencer; smooth: boolean };
const ScrollContext = createContext<Ctx | null>(null);

/**
 * Input, not layout: the wheel sequencer runs whenever a fine pointer exists (`any-pointer`, so
 * touchscreen laptops and desktops with a touch monitor keep it); layout is decided by width alone
 * in useIsDesktop and the CSS breakpoints.
 */
const desktopQuery = "(min-width: 1024px) and (any-pointer: fine)";
const reduceQuery = "(prefers-reduced-motion: reduce)";

/**
 * Smooth scrolling (Lenis) + the trigger sequencer wherever a fine pointer exists; touch
 * scrolling stays native everywhere (Lenis only smooths the wheel) and `prefers-reduced-motion`
 * keeps native scrolling. On the desktop layout a touch scroll settles to the nearest keyframe
 * once it stops. Anchor links are routed through Lenis so they land on the right keyframe.
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
        sequencer.onFrame(t);
        instance?.raf(t);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
      sequencer.attach(instance);
      window.addEventListener("keydown", sequencer.onKeyDown, { capture: true });
      setLenis(instance);
      setSmooth(true);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      instance?.destroy();
      instance = null;
      window.removeEventListener("keydown", sequencer.onKeyDown, { capture: true });
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
    // Resize / zoom / orientation: keep the reader on the same keyframe (audit A-02). The keyframe
    // is the one the page rested on before the burst of resize events; restored once layout settles.
    let snap: ReturnType<Sequencer["snapshot"]> = null;
    let settle: ReturnType<typeof setTimeout> | null = null;
    const onResize = () => {
      if (!snap) snap = sequencer.resting();
      if (settle) clearTimeout(settle);
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      settle = setTimeout(() => {
        settle = null;
        // the viewport moved again while this restore was pending: the newer resize's own
        // restore will handle it (a late restore against stale geometry must never scroll)
        if (window.innerWidth !== vw || window.innerHeight !== vh) return;
        instance?.resize();
        sequencer.restore(snap);
        snap = null;
      }, 120);
    };
    window.addEventListener("resize", onResize);
    return () => {
      mqDesktop.removeEventListener("change", sync);
      mqReduce.removeEventListener("change", sync);
      window.removeEventListener("resize", onResize);
      if (settle) clearTimeout(settle);
      stop();
    };
  }, [sequencer]);

  // Touch settle (audit A-08): after a touch-driven scroll stops inside a pinned range, settle to the
  // nearest keyframe. Armed only by a touch gesture, so mouse, scrollbar and keyboard are untouched;
  // the mobile layout registers no keyframes, so nothing happens there.
  useEffect(() => {
    if (window.matchMedia(reduceQuery).matches) return;
    let armed = false;
    let touching = false;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const settle = () => {
      timer = null;
      if (!armed || touching) return;
      armed = false;
      const y = window.scrollY;
      const target = sequencer.nearest(y);
      if (target === null || Math.abs(target - y) < 2) return;
      if (lenis) sequencer.scrollTo(target, 0.6, easeOutExpo);
      else window.scrollTo({ top: target, behavior: "smooth" });
    };
    const onTouchStart = () => {
      touching = true;
      armed = true;
      if (timer) clearTimeout(timer);
      // a finger takes over from a running wheel tween: stop it where it is (no fight, no lock)
      if (lenis && lenis.isScrolling === "smooth") {
        lenis.scrollTo(window.scrollY, { immediate: true, force: true });
        sequencer.release();
      }
    };
    const onTouchEnd = () => {
      touching = false;
      if (timer) clearTimeout(timer);
      timer = setTimeout(settle, 160);
    };
    const onScroll = () => {
      if (!armed) return;
      if (timer) clearTimeout(timer);
      timer = setTimeout(settle, 160);
    };
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("touchcancel", onTouchEnd, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchcancel", onTouchEnd);
      window.removeEventListener("scroll", onScroll);
      if (timer) clearTimeout(timer);
    };
  }, [lenis, sequencer]);

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
      if (lenis) sequencer.scrollTo(top, 1.2, easeOutExpo);
      else window.scrollTo({ top, behavior: window.matchMedia(reduceQuery).matches ? "auto" : "smooth" });
      if (id !== "top") history.replaceState(null, "", `#${id}`);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [lenis, sequencer]);

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
