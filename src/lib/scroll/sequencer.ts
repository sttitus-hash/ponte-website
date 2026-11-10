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
const QUIET_COOLDOWN_MS = 90; // …unless no wheel input arrived near its end (a mouse click, a key): nothing to swallow
const QUIET_MS = 200; // no wheel event for this long before the tween ends = no inertia tail in flight
const NOTCH_MIN = 40; // a mouse-wheel click: an isolated integer delta of at least this many px (or a line delta)
const QUEUE_WINDOW = 0.55; // a click in the last 55 % of a click-started tween queues the next step instead of being lost
const NOTCH_GAP_MS = 300; // a click-started tween: its click followed at least this long a pause in wheel input
const COOLDOWN_EXTRA_MAX_MS = 240; // most the wheel cooldown stretches under frame starvation
const GESTURE_GAP_MS = 140; // a pause longer than this (in input time) starts a new gesture
const GROWTH = 1.5; // a delta this many times the previous one starts a new gesture (inertia only decays)
const GROWTH_MIN = 6; // …and at least this many px larger, so tiny deltas never "grow"

export class Sequencer {
  private sources = new Map<symbol, KeyframeSource>();
  private busyUntil = 0;
  private wheelBusyUntil = 0;
  private locked = false;
  private lenis: Lenis | null = null;
  private lastDelta = 0;
  private lastTs = -1e9;
  private tweenId = 0;
  private inGesture = false; // the current wheel stream already fired (or was released)
  private lastFrameMs = 16; // observed frame interval, to stretch the cooldown under jank
  private lastFrameTs = 0;
  private rest: { order: number; index: number } | null = null; // keyframe the page last rested on
  private restTs = 0;
  private notch = false; // the current tween was started by a mouse-wheel click
  private lastWheelAt = -1e9; // performance.now() of the last wheel event received
  private streamed = false; // a continuous wheel stream (not discrete clicks) arrived during the current tween
  private free = false; // the current wheel gesture is scrolling the page freely (outside the ranges)
  private queued: 1 | -1 | 0 = 0; // one step queued by a click that arrived during a tween
  private tweenDir: 1 | -1 | 0 = 0;
  private tweenStart = 0;
  private tweenDur = 0;

  attach(lenis: Lenis | null) {
    this.lenis?.off("scroll", this.onLenisScroll);
    this.lenis = lenis;
    this.rest = null;
    lenis?.on("scroll", this.onLenisScroll);
  }

  /** Any scroll invalidates the remembered resting keyframe until an idle frame re-samples it. */
  private onLenisScroll = () => {
    this.rest = null;
  };

  /** Called every animation frame by the scroll loop: tracks frame starvation (audit A-03). */
  onFrame(now: number) {
    if (this.lastFrameTs) this.lastFrameMs = Math.min(1000, now - this.lastFrameTs);
    this.lastFrameTs = now;
    // Remember the keyframe the page rests on, sampled on every idle frame, so a resize can
    // restore it from the geometry *before* the resize — by the time the resize event fires, the
    // keyframes already describe the new layout. (A tween's own completion records it too.)
    const lenis = this.lenis;
    if (lenis && !lenis.isScrolling) {
      this.restTs = now;
      this.rest = this.snapshot();
    }
  }

  /**
   * A resize (window, zoom, orientation) changes every keyframe's pixel offset while the scroll
   * offset stays, which would leave the reader mid-transition or on another screen (audit A-02).
   * Call `snapshot()` before layout changes and `restore()` after: the reader is kept on the same
   * keyframe index of the same range.
   */
  /** The keyframe the page was resting on before the current layout change (see `onFrame`). */
  resting() {
    return this.rest;
  }

  snapshot(): { order: number; index: number } | null {
    const lenis = this.lenis;
    if (!lenis) return null;
    const y = lenis.targetScroll;
    for (const r of [...this.sources.values()].sort((a, b) => a.order - b.order)) {
      const kf = r.keyframes();
      if (kf.length < 2 || y < kf[0] - EPS || y > kf[kf.length - 1] + EPS) continue;
      let index = 0;
      for (let i = 0; i < kf.length; i++) if (Math.abs(kf[i] - y) < Math.abs(kf[index] - y)) index = i;
      if (Math.abs(kf[index] - y) > EPS) continue; // mid-tween: nothing to pin
      return { order: r.order, index };
    }
    return null;
  }

  restore(snap: { order: number; index: number } | null) {
    const lenis = this.lenis;
    if (!lenis || !snap) return;
    const r = [...this.sources.values()].find((x) => x.order === snap.order);
    if (!r) return;
    const kf = r.keyframes();
    const target = kf[Math.min(snap.index, kf.length - 1)];
    if (target === undefined || Math.abs(target - lenis.targetScroll) <= EPS) return;
    lenis.scrollTo(target, { immediate: true, force: true });
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
    this.notch = false;
    this.go(target);
  };

  private go(target: number, entering = false) {
    const lenis = this.lenis;
    if (!lenis) return;
    const dir: 1 | -1 = target > lenis.targetScroll ? 1 : -1;
    if (entering) {
      // Entering a range from free scrolling: the page is already moving, so the landing only
      // decelerates (ease-out from the current speed) instead of stopping and re-accelerating.
      const travel = Math.abs(target - lenis.animatedScroll);
      this.scrollTo(target, Math.min(0.8, Math.max(0.45, 0.35 + travel / (window.innerHeight * 1.5))), easeOutCubic);
      this.tweenDir = dir;
      return;
    }
    const distance = Math.abs(target - lenis.targetScroll);
    // One consistent pace for every step (~0.9 s for the standard 0.8-viewport step). The curve is a
    // sine in-out rather than a steep quartic: with the quartic, the middle half of each step went by
    // in 16 % of the tween, so any choreography placed mid-step flashed past in ~0.15 s while the
    // ends crawled, which read as "fast in some places, slow in others". The sine spreads the
    // travel (middle half in a third of the time), so a transition plays at a readable speed
    // wherever it sits in its step.
    const duration = Math.min(1.0, Math.max(0.7, 0.6 + distance / (window.innerHeight * 2.4)));
    this.scrollTo(target, duration, easeInOutSine);
    this.tweenDir = dir; // only keyframe steps accept a queued click (not anchors or tab jumps)
  }

  /**
   * Programmatic scroll through the sequencer (anchors, tab jumps, keyframe steps). Any
   * scroll started here supersedes a running tween, so the lock can never be left behind.
   */
  scrollTo(target: number, duration = 1.2, easing: (t: number) => number = easeOutExpo) {
    const lenis = this.lenis;
    if (!lenis) return;
    this.locked = true;
    this.queued = 0;
    this.tweenDir = 0;
    this.streamed = false;
    const token = ++this.tweenId;
    this.tweenStart = performance.now();
    this.tweenDur = duration * 1000;
    lenis.scrollTo(target, {
      duration,
      easing,
      lock: true,
      force: true,
      onComplete: () => {
        if (token !== this.tweenId) return; // superseded
        this.release();
        this.rest = this.snapshot(); // the keyframe just reached, recorded without waiting for a frame
        // a mouse-wheel click that arrived during the tween plays the next step straight away
        const q = this.queued;
        this.queued = 0;
        if (q && this.lenis) {
          const next = this.next(this.lenis.targetScroll, q);
          if (next !== null) this.go(next);
        }
      },
    });
  }

  /** Clear the lock (with the inertia cooldown). */
  release() {
    this.locked = false;
    const now = performance.now();
    // The cooldown exists to swallow a trackpad's inertia tail. If no wheel input arrived near the
    // end of the tween (a mouse-wheel click, a key press), there is no tail in flight and the next
    // click or key is honoured almost at once instead of being dropped for 0.4 s.
    const quiet = now - this.lastWheelAt > QUIET_MS;
    this.busyUntil = now + (quiet ? QUIET_COOLDOWN_MS : COOLDOWN_MS);
    // Under frame starvation wheel events are coalesced and delivered late, so an inertia tail can
    // outlive the fixed cooldown; wheel input (only) waits a little longer, capped so a slow
    // machine never feels stuck.
    this.wheelBusyUntil = this.busyUntil + (quiet ? 0 : Math.min(COOLDOWN_EXTRA_MAX_MS, Math.max(0, this.lastFrameMs - 16) * 4));
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

  /**
   * Nearest keyframe to `y` inside a registered range, or null outside the ranges. Used to settle a
   * touch scroll on the desktop layout (audit A-08): the choreography is a pure function of scroll,
   * so a finger can stop it anywhere; settling to the nearest rest state keeps every transition
   * complete without ever trapping the reader (outside the ranges nothing happens).
   */
  nearest(y: number): number | null {
    let best: number | null = null;
    for (const r of this.sources.values()) {
      const kf = r.keyframes();
      if (kf.length < 2 || y < kf[0] || y > kf[kf.length - 1]) continue;
      for (const k of kf) if (best === null || Math.abs(k - y) < Math.abs(best - y)) best = k;
    }
    return best;
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

  /** The registered keyframe within EPS of `y`, if any. */
  private at(y: number): number | null {
    for (const r of this.sources.values()) for (const k of r.keyframes()) if (Math.abs(k - y) <= EPS) return k;
    return null;
  }

  /**
   * Free scrolling that would cross into a registered range lands on that range's resting keyframe
   * (its first keyframe going down, its last going up) instead of stopping part-way into the
   * range's first transition, so the hand-over between free and stepped scrolling is seamless.
   */
  entry(y: number, projected: number, dir: 1 | -1): number | null {
    let best: number | null = null;
    for (const r of this.sources.values()) {
      const kf = r.keyframes();
      if (kf.length < 2) continue;
      const k = dir > 0 ? kf[0] : kf[kf.length - 1];
      const crosses = dir > 0 ? k > y + EPS && k <= projected : k < y - EPS && k >= projected;
      if (crosses && (best === null || (dir > 0 ? k < best : k > best))) best = k;
    }
    return best;
  }

  /**
   * Lenis `virtualScroll` hook. Returns false when the gesture was consumed.
   */
  onVirtualScroll = ({ deltaY, event }: { deltaX: number; deltaY: number; event: WheelEvent | TouchEvent }) => {
    const lenis = this.lenis;
    if (!lenis || !event.type.includes("wheel")) return true;
    const now = performance.now();
    // Input time, not delivery time: when the main thread stalls, a burst of wheel events is
    // delivered late and close together, but their `timeStamp`s still show the real cadence.
    const ts = event.timeStamp || now;
    const swallow = () => {
      if (event.cancelable) event.preventDefault();
      return false;
    };
    // Gesture detection: trackpad inertia is a stream of decaying deltas; only a pause or a
    // clearly growing delta (a finger starting to move again) counts as a new action, so one
    // swipe and its whole inertia tail trigger exactly one transition. Growth is a ratio with a
    // floor, because a stalled frame coalesces two or three inertia deltas into one bigger one.
    const mag = Math.abs(deltaY);
    const prev = Math.abs(this.lastDelta);
    const sameSign = Math.sign(deltaY) === Math.sign(this.lastDelta);
    const grew = mag > Math.max(prev * GROWTH, prev + GROWTH_MIN);
    const gap = ts - this.lastTs;
    const isolated = gap > GESTURE_GAP_MS;
    const newGesture = isolated || !sameSign || grew;
    this.lastTs = ts;
    this.lastDelta = deltaY;
    this.lastWheelAt = now;
    const wheel = event as WheelEvent;
    // A mouse-wheel click is one isolated delta of a fixed size (or a line delta); a trackpad sends
    // a continuous stream of varying deltas. A click during the second half of a click-started
    // tween is queued rather than dropped, so clicking at a steady pace steps through the page
    // without waiting. (Isolated, by input timestamps: a stalled, coalesced inertia burst never
    // qualifies.)
    const isNotch = isolated && (wheel.deltaMode === 1 || (mag >= NOTCH_MIN && Number.isInteger(deltaY) && wheel.deltaX === 0));
    // only a click after a real pause starts a click tween; a trackpad stream that merely hiccuped does not
    const startsNotch = isNotch && gap > NOTCH_GAP_MS;
    const dir: 1 | -1 = deltaY > 0 ? 1 : -1;
    if (this.isLocked()) {
      if (!isolated) this.streamed = true; // an inertia tail is running: never queue on top of it
      if (isNotch && this.notch && !this.streamed && dir === this.tweenDir && now - this.tweenStart > this.tweenDur * (1 - QUEUE_WINDOW)) this.queued = dir;
      return swallow();
    }
    if (now < this.wheelBusyUntil) return swallow();
    if (mag < MIN_DELTA) return true;
    const y = lenis.targetScroll;
    const target = this.next(y, dir);
    if (target !== null && this.free && !newGesture) {
      // a free-scrolling gesture has just reached a range's edge keyframe (within EPS): it lands
      // there, exactly, and the rest of the gesture is absorbed instead of starting a step
      this.free = false;
      this.inGesture = true;
      const edge = this.at(y);
      if (edge !== null && Math.abs(edge - lenis.animatedScroll) > 0.5) {
        this.notch = false;
        this.go(edge, true);
      }
      return swallow();
    }
    this.free = false;
    if (target === null) {
      // free scrolling: land exactly on a range's resting keyframe when this delta would cross it
      // (Lenis has already applied wheelMultiplier and line-height scaling to deltaY)
      const enter = this.entry(y, y + deltaY, dir);
      if (enter !== null) {
        this.notch = startsNotch;
        this.inGesture = true;
        this.go(enter, true);
        return swallow();
      }
      this.inGesture = false;
      this.free = true;
      return true;
    }
    if (!newGesture && this.inGesture) return swallow();
    this.notch = startsNotch;
    this.inGesture = true;
    this.go(target);
    return swallow();
  };
}

export const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
export const easeInOutSine = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2;
export const easeInOutQuart = (t: number) => (t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2);
export const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));
