"use client";

import { useEffect, useState } from "react";

/**
 * Device performance probe for the scroll audit. Renders nothing unless the page is opened
 * with `?perf=1`; then it records frame intervals, long tasks and the scroll position for as
 * long as the page is open, shows live numbers in a corner badge and copies a JSON report to
 * the clipboard on click. No effect on production traffic (the flag is never set there).
 */
type Report = {
  ua: string;
  vp: number[];
  gpu: string | null;
  cores: number;
  frames: number;
  fps: { median: number; p5: number; over33: number; over100: number };
  longTasks: { n: number; totalMs: number; maxMs: number };
  bySection: Record<string, { n: number; medMs: number; p95Ms: number; over33: number }>;
  seconds: number;
};

export function PerfProbe() {
  const [on, setOn] = useState(false);
  const [badge, setBadge] = useState("perf: recording…");

  useEffect(() => {
    if (!new URLSearchParams(location.search).has("perf")) return;
    setOn(true);
    const t0 = performance.now();
    const frames: [number, number][] = []; // [scrollY, dt]
    const longs: number[] = [];
    let last = t0;
    let raf = 0;
    const loop = (t: number) => {
      frames.push([window.scrollY, t - last]);
      last = t;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    const po = new PerformanceObserver((l) => l.getEntries().forEach((e) => longs.push(e.duration)));
    try {
      po.observe({ entryTypes: ["longtask"] });
    } catch {}

    const ids = ["about", "p2p", "otc", "whatsapp", "trust", "story", "faq", "launch"];
    const sectionOf = (y: number) => {
      let name = "hero";
      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        const top = el.getBoundingClientRect().top + window.scrollY;
        if (y >= top - 1) name = id;
      }
      return name;
    };
    const stat = (a: number[]) => {
      const s = [...a].sort((x, y) => x - y);
      return { n: s.length, medMs: +(s[s.length >> 1] ?? 0).toFixed(1), p95Ms: +(s[Math.floor(s.length * 0.95)] ?? 0).toFixed(1), over33: s.filter((v) => v > 33).length };
    };
    const build = (): Report => {
      const dts = frames.slice(1).map((f) => f[1]);
      const sorted = [...dts].sort((a, b) => a - b);
      const by: Record<string, number[]> = {};
      for (const [y, dt] of frames.slice(1)) (by[sectionOf(y)] ||= []).push(dt);
      let gpu: string | null = null;
      try {
        const gl = document.createElement("canvas").getContext("webgl");
        const d = gl?.getExtension("WEBGL_debug_renderer_info");
        gpu = gl && d ? String(gl.getParameter(d.UNMASKED_RENDERER_WEBGL)) : null;
      } catch {}
      return {
        ua: navigator.userAgent,
        vp: [innerWidth, innerHeight, devicePixelRatio],
        gpu,
        cores: navigator.hardwareConcurrency,
        frames: dts.length,
        fps: {
          median: +(1000 / (sorted[sorted.length >> 1] || 16.7)).toFixed(1),
          p5: +(1000 / (sorted[Math.floor(sorted.length * 0.95)] || 16.7)).toFixed(1),
          over33: dts.filter((v) => v > 33).length,
          over100: dts.filter((v) => v > 100).length,
        },
        longTasks: { n: longs.length, totalMs: Math.round(longs.reduce((s, v) => s + v, 0)), maxMs: Math.round(Math.max(0, ...longs)) },
        bySection: Object.fromEntries(Object.entries(by).map(([k, v]) => [k, stat(v)])),
        seconds: Math.round((performance.now() - t0) / 1000),
      };
    };
    const tick = setInterval(() => {
      const recent = frames.slice(-60).map((f) => f[1]);
      const fps = recent.length ? Math.round(1000 / (recent.reduce((s, v) => s + v, 0) / recent.length)) : 0;
      setBadge(`perf: ${fps} fps · ${longs.length} long tasks · ${Math.round((performance.now() - t0) / 1000)}s — click to copy report`);
    }, 500);
    (window as unknown as { __perfReport?: () => Report }).__perfReport = build;
    return () => {
      cancelAnimationFrame(raf);
      po.disconnect();
      clearInterval(tick);
    };
  }, []);

  if (!on) return null;
  return (
    <button
      type="button"
      onClick={async () => {
        const r = (window as unknown as { __perfReport?: () => Report }).__perfReport?.();
        const text = JSON.stringify(r);
        try {
          await navigator.clipboard.writeText(text);
          setBadge("perf: report copied — paste it to Claude");
        } catch {
          prompt("Copy this report:", text);
        }
      }}
      style={{ position: "fixed", left: 8, bottom: 8, zIndex: 9999, font: "12px/1.4 monospace", background: "#100F0F", color: "#E8EE81", border: "1px solid #E8EE81", borderRadius: 6, padding: "6px 10px", cursor: "pointer" }}
    >
      {badge}
    </button>
  );
}
