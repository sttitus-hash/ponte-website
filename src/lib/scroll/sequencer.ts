/**
 * Scroll sequencer — the trigger layer over the scroll-driven choreography.
 *
 * Every pinned section keeps its visuals as pure functions of scroll position (so the
 * scrollbar, keyboard, touch and reduced motion all work). Sections additionally register
 * their *keyframes* here: the absolute scroll offsets at which a composition is at rest.
 * On desktop, one wheel / trackpad gesture inside a registered range tweens the page to the
 * next keyframe in that direction with input locked, so a transition always plays to 100 %
 * and a second gesture during the tween (or trackpad inertia right after it) cannot start
 * another one. At the first / last keyframe the gesture is released to normal scrolling, so
 * there is never a scroll trap.
 */
import type Lenis from "lenis";

export type KeyframeSource = {
  /** DOM order index — earlier ranges win when two share a keyframe (section hand-overs). */
  order: number;
  /** Absolute scroll offsets (px), ascending. Re-read on every gesture so resizes are free. */
  keyframes: () => number[];
};

const EPS = 6; // px: within this distance a keyframe counts as "current"
const MIN_DELTA = 2; // ignore sub-pixel trackpad noise
const COOLDOWN_MS = 420; // after a tween: swallow trackpad inertia
const GESTURE_GAP_MS = 140; // a pause longer than this starts a new gesture
const GROWTH = 4; // a delta clearly larger than the previous one starts a new gesture (inertia only decays)

export class Sequencer {
  private sources = new Map<symbol, KeyframeSource>();
  private busyUntil = 0;
  private locked = false;
  private lenis: Lenis | null = null;
  private lastDelta = 0;
  private lastTs = -1e9;
  private tweenId = 0;
  private inGesture = false; // the current wheel stream already fired (or was released)

  attach(lenis: Lenis | null) {
    this.lenis = lenis;
  }

  /** Keyboard: inside a registered range, Space / PageDown / ArrowDown (and the reverse keys) step one keyframe. */
  onKeyDown = (e: KeyboardEvent) => {
    const lenis = this.lenis;
    if (!lenis || e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
    const t = e.target as HTMLElement | null;
    if (t && (t.closest("input, textarea, select, [contenteditable=true]") || t.closest("[data-lenis-prevent]"))) return;
    let dir: 1 | -1 | 0 = 0;
    if (e.key === "ArrowDown" || e.key === "PageDown" || (e.key === " " && !e.shiftKey)) dir = 1;
    if (e.key === "ArrowUp" || e.key === "PageUp" || (e.key === " " && e.shiftKey)) dir = -1;
    if (!dir) return;
    if (this.isLocked() || performance.now() < this.busyUntil) {
      e.preventDefault();
      return;
    }
    const target = this.next(lenis.targetScroll, dir);
    if (target === null) return; // native keyboard scrolling outside the ranges
    e.preventDefault();
    this.go(target);
  };

  private go(target: number) {
    const lenis = this.lenis;
    if (!lenis) return;
    const distance = Math.abs(target - lenis.targetScroll);
    // ~1 s for a full step, a little quicker for short hops; never sluggish
    const duration = Math.min(1.15, Math.max(0.55, 0.55 + distance / (window.innerHeight * 1.6)));
    this.scrollTo(target, duration, easeInOutQuart);
  }

  /**
   * Programmatic scroll through the sequencer (anchors, tab jumps, keyframe steps). Any
   * scroll started here supersedes a running tween, so the lock can never be left behind.
   */
  scrollTo(target: number, duration = 1.2, easing: (t: number) => number = easeOutExpo) {
    const lenis = this.lenis;
    if (!lenis) return;
    this.locked = true;
    const token = ++this.tweenId;
    lenis.scrollTo(target, {
      duration,
      easing,
      lock: true,
      force: true,
      onComplete: () => {
        if (token !== this.tweenId) return; // superseded
        this.release();
      },
    });
  }

  /** Clear the lock (with the inertia cooldown). */
  release() {
    this.locked = false;
    this.busyUntil = performance.now() + COOLDOWN_MS;
  }

  /** The lock is only real while Lenis is animating a locked scroll; otherwise heal it. */
  private isLocked() {
    const lenis = this.lenis;
    if (this.locked && lenis && !lenis.isLocked && !lenis.isScrolling) this.locked = false;
    return this.locked;
  }

  register(source: KeyframeSource) {
    const key = Symbol();
    this.sources.set(key, source);
    return () => {
      this.sources.delete(key);
    };
  }

  /** Next keyframe (and its range) in `dir` from scroll position `y`, or null to release. */
  next(y: number, dir: 1 | -1): number | null {
    const ranges = [...this.sources.values()].sort((a, b) => a.order - b.order);
    for (const r of ranges) {
      const kf = r.keyframes();
      if (kf.length < 2) continue;
      if (y < kf[0] - EPS || y > kf[kf.length - 1] + EPS) continue;
      if (dir > 0) {
        const n = kf.find((k) => k > y + EPS);
        if (n !== undefined) return n;
      } else {
        const n = [...kf].reverse().find((k) => k < y - EPS);
        if (n !== undefined) return n;
      }
      // inside this range but at its edge: fall through so a later range sharing the
      // keyframe (section hand-over) can take it; otherwise release to native scrolling
    }
    return null;
  }

  /**
   * Lenis `virtualScroll` hook. Returns false when the gesture was consumed.
   */
  onVirtualScroll = ({ deltaY, event }: { deltaX: number; deltaY: number; event: WheelEvent | TouchEvent }) => {
    const lenis = this.lenis;
    if (!lenis || !event.type.includes("wheel")) return true;
    const now = performance.now();
    const swallow = () => {
      if (event.cancelable) event.preventDefault();
      return false;
    };
    // Gesture detection: trackpad inertia is a stream of decaying deltas; only a pause or a
    // growing delta (a finger starting to move again) counts as a new action, so one swipe
    // and its whole inertia tail trigger exactly one transition.
    const mag = Math.abs(deltaY);
    const sameSign = Math.sign(deltaY) === Math.sign(this.lastDelta);
    const newGesture = now - this.lastTs > GESTURE_GAP_MS || !sameSign || mag > Math.abs(this.lastDelta) + GROWTH;
    this.lastTs = now;
    this.lastDelta = deltaY;
    if (this.isLocked() || now < this.busyUntil) return swallow();
    if (mag < MIN_DELTA) return true;
    const dir: 1 | -1 = deltaY > 0 ? 1 : -1;
    const y = lenis.targetScroll;
    const target = this.next(y, dir);
    if (target === null) {
      this.inGesture = false;
      return true;
    }
    if (!newGesture && this.inGesture) return swallow();
    this.inGesture = true;
    this.go(target);
    return swallow();
  };
}

export const easeInOutQuart = (t: number) => (t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2);
export const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));
