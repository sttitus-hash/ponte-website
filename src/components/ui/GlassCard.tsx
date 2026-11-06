"use client";

import type { CSSProperties } from "react";
import { motion, useTransform, type MotionValue } from "motion/react";
import { quadMatrix, type Quad } from "@/lib/quad";

/**
 * The floating "glass" fee / quote cards of the product panels, rebuilt as HTML from the
 * Figma source frames ("UI / Fees — takers / makers / WhatsApp", "OTC — Quote / Terms
 * card") so they are transparent, sharp at any DPR and keep their gradients, hairline
 * highlight and rounded corners. Every value is in Figma frame pixels at the 1600×900
 * desktop frame; the card is scaled by the `--u` custom property (stage width ÷ 1600) that
 * the product stage sets, so `font-size`s stay vector and nothing is resampled.
 *
 * P2P and WhatsApp cards are drawn in perspective in Figma (a `glass` trapezoid plus a
 * warped `content` image); the same quads are applied here with a projective transform.
 */

export type GlassCardVariant = "takers" | "makers" | "whatsapp" | "otcQuote" | "otcTerms";

type Spec = {
  /** Frame size in Figma px (the two sizes used: 332×279.1 and 273×229.5). */
  w: number;
  h: number;
  label: string;
  status: string;
  sub: string;
  big: string;
  note: string;
  title: string;
  detail: string;
  badge?: string;
  /** Soft highlight / shade ellipse, as in Figma (x, y, w, h, colour). */
  blob?: { x: number; y: number; w: number; h: number; color: string };
  /** Bounding box of the perspective wrapper and the quad its edges follow (Figma px). */
  box?: { w: number; h: number; quad: Quad };
};

const LARGE = { w: 332, h: 279.1 };
const SMALL = { w: 273.016, h: 229.518 };

const SPECS: Record<GlassCardVariant, Spec> = {
  takers: {
    ...LARGE,
    label: "Fees · Takers",
    status: "You accept an offer",
    sub: "Taker fee",
    big: "0%",
    note: "No fee on any trade",
    title: "500.00 USDT trade",
    detail: "Fee · 0.00 USDT",
    badge: "✓ Free",
    box: { w: 270, h: 290, quad: [[1.88, 16.81], [268.12, 1.19], [268.12, 288.38], [1.88, 287.82]] },
  },
  makers: {
    ...SMALL,
    label: "Fees · Makers",
    status: "You create the offer",
    sub: "Maker fee",
    big: "0.3%",
    note: "Of the trade amount",
    title: "500.00 USDT trade",
    detail: "Fee · 1.50 USDT",
    box: { w: 221, h: 238, quad: [[1.04, 12.83], [219.97, 1.17], [219.97, 236.14], [1.04, 236.86]] },
  },
  whatsapp: {
    ...SMALL,
    label: "Fees · WhatsApp",
    status: "You trade in the chat",
    sub: "Fee",
    big: "1%",
    note: "Per transaction",
    title: "500.00 USDT trade",
    detail: "Fee · 5.00 USDT",
    blob: { x: 104.75, y: 27.57, w: 96.48, h: 104.75, color: "rgba(0,0,0,0.16)" },
    box: { w: 250.852, h: 197.558, quad: [[9.65, 0.92], [240.75, 0.92], [249.48, 195.72], [0.92, 195.72]] },
  },
  otcQuote: {
    ...LARGE,
    label: "OTC · Quote",
    status: "Sized for large trades",
    sub: "You buy",
    big: "250,000 USDT",
    note: "1 USDT = 1,612.40 NGN",
    title: "Quote held for 15:00",
    detail: "Rate, amount and total fixed",
    badge: "Locked",
  },
  otcTerms: {
    ...SMALL,
    label: "OTC · Terms",
    status: "Stated before you confirm",
    sub: "You pay",
    big: "403.1M NGN",
    note: "Rate and fee included",
    title: "250,000 USDT to receive",
    detail: "Straight to your wallet",
    blob: { x: 16, y: 17, w: 157, h: 144, color: "rgba(255,255,255,0.6)" },
  },
};

const MONO = "var(--font-mono)";
const SG = "\"Space Grotesk\", var(--font-geist-sans), sans-serif";

/** "250,000 USDT" → counts 0 → 250,000 while `count` runs 0‥1 (CSV row 16: optional counter on the figures). */
function CountUp({ text, count, style }: { text: string; count: MotionValue<number>; style: CSSProperties }) {
  const m = /^([\d,]+(?:\.\d+)?)(.*)$/.exec(text);
  const target = m ? parseFloat(m[1].replace(/,/g, "")) : 0;
  const decimals = m && m[1].includes(".") ? m[1].split(".")[1].length : 0;
  const suffix = m ? m[2] : text;
  const shown = useTransform(count, (c) => {
    if (!m) return text;
    const k = Math.min(1, Math.max(0, (c - 0.35) / 0.65));
    const v = target * (1 - Math.pow(1 - k, 3));
    return v.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix;
  });
  return (
    <motion.div className="absolute whitespace-nowrap" style={style}>
      {shown}
    </motion.div>
  );
}

export function GlassCard({ variant, className = "", count }: { variant: GlassCardVariant; className?: string; count?: MotionValue<number> }) {
  const s = SPECS[variant];
  const k = s.w / LARGE.w; // 1 for the large card, 0.8224 for the small one
  const px = (n: number) => n * k;
  // Card in its own frame px; scaled by --u (stage ÷ 1600), then (optionally) warped.
  const warp = s.box ? quadMatrix(s.w, s.h, s.box.quad) : "";
  const outer: CSSProperties = s.box
    ? { width: s.box.w, height: s.box.h }
    : { width: s.w, height: s.h };

  return (
    <div
      aria-hidden="true"
      className={`relative origin-top-left ${className}`}
      style={{ ...outer, transform: "scale(var(--u, 1))", transformOrigin: "0 0" }}
    >
      <div
        className="absolute left-0 top-0 overflow-hidden"
        style={{
          width: s.w,
          height: s.h,
          transform: warp || undefined,
          transformOrigin: "0 0",
          borderRadius: px(14.72),
          // Figma: radial fill #fdffda → #eef3a6 centred top-right, hairline white highlight,
          // "glass" effect (refraction, light from top-left) — rendered as inset rims.
          // Slightly translucent with a backdrop blur: Figma's GLASS effect (refraction 1, depth 31)
          // lets the phone show faintly through the card.
          background: "radial-gradient(78% 50% at 75% 18%, rgba(253,255,218,0.84) 0%, rgba(238,243,166,0.84) 100%)",
          backdropFilter: "blur(14px) saturate(1.15)",
          WebkitBackdropFilter: "blur(14px) saturate(1.15)",
          boxShadow:
            "inset 0.6px 0.6px 0 rgba(255,255,255,0.75), inset -0.6px -0.6px 0 rgba(255,255,255,0.35), 0 18px 40px -18px rgba(44,52,0,0.22)",
          fontFamily: SG,
          color: "#100f0f",
          WebkitFontSmoothing: "antialiased",
        }}
      >
        {/* hairline gradient stroke (white → transparent from both the top-left and bottom-right) */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            borderRadius: px(14.72),
            padding: 0.5,
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0) 50%), linear-gradient(315deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 50%)",
            WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
            WebkitMaskComposite: "xor",
            mask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
            maskComposite: "exclude",
          }}
        />
        {s.blob ? (
          <div
            className="pointer-events-none absolute rounded-full"
            style={{
              left: s.blob.x, top: s.blob.y, width: s.blob.w, height: s.blob.h,
              background: s.blob.color,
              filter: `blur(${px(48)}px)`,
            }}
          />
        ) : null}

        {/* label */}
        <div
          className="absolute uppercase"
          style={{ left: px(20), top: px(20), fontFamily: MONO, fontSize: px(11), lineHeight: 1.2, letterSpacing: "0.02em", color: "#8c8c8c", mixBlendMode: "multiply" }}
        >
          {s.label}
        </div>
        {/* status chip */}
        <div
          className="absolute flex items-center"
          style={{ left: px(20), top: px(43), height: px(23.1), padding: `0 ${px(8.66)}px`, gap: px(5.77), borderRadius: px(3), background: "#2e2e2e", fontFamily: MONO, fontSize: px(11), lineHeight: 1.2, letterSpacing: "0.02em", color: "#e4e4e4" }}
        >
          <span className="block rounded-full" style={{ width: px(5.77), height: px(5.77), background: "#e8ee81" }} />
          {s.status}
        </div>
        <div className="absolute" style={{ left: px(20), top: px(90.1), fontSize: px(12), lineHeight: 1.4, color: "#8c8c8c", mixBlendMode: "multiply" }}>
          {s.sub}
        </div>
        {count ? (
          <CountUp text={s.big} count={count} style={{ left: px(20), top: px(111.1), fontSize: px(40), lineHeight: 1, letterSpacing: "-0.04em", color: "#000" }} />
        ) : (
          <div className="absolute whitespace-nowrap" style={{ left: px(20), top: px(111.1), fontSize: px(40), lineHeight: 1, letterSpacing: "-0.04em", color: "#000" }}>
            {s.big}
          </div>
        )}
        <div className="absolute" style={{ left: px(20), top: px(157.1), fontSize: px(14), lineHeight: 1.5, fontWeight: 300, color: "#8c8c8c", mixBlendMode: "multiply" }}>
          {s.note}
        </div>
        {/* counterparty row */}
        <div className="absolute" style={{ left: px(20), top: px(196.1), width: px(291.58), height: px(63), borderRadius: px(6), background: "#f1eee5" }}>
          <div className="absolute flex items-center justify-center rounded-full" style={{ left: px(11.79), top: px(17.07), width: px(28.87), height: px(28.87), background: "#4a4a4a" }}>
            <WalletGlyph size={px(13.05)} />
          </div>
          <div className="absolute whitespace-nowrap" style={{ left: px(50.52), top: px(11), fontSize: px(16), lineHeight: 1.5, fontWeight: 300, color: "#100f0f" }}>
            {s.title}
          </div>
          <div className="absolute whitespace-nowrap" style={{ left: px(50.52), top: px(35), fontSize: px(12), lineHeight: 1.4, color: "#8c8c8c" }}>
            {s.detail}
          </div>
          {s.badge ? (
            <div className="absolute whitespace-nowrap" style={{ right: px(13), top: px(21.39), padding: `${px(3.6)}px ${px(7.2)}px`, fontFamily: MONO, fontSize: px(11), lineHeight: 1.2, letterSpacing: "0.02em", color: "#587b00" }}>
              {s.badge}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/** Wallet glyph from the Figma card (vector 9710:28306), 13.05×12.09. */
function WalletGlyph({ size }: { size: number }) {
  return (
    <svg width={size} height={(size * 12.09) / 13.05} viewBox="0 0 13.05 12.09" fill="#f4f2ec" aria-hidden="true">
      <path d="M10.47 6.56a.53.53 0 1 1 0 1.07.53.53 0 0 1 0-1.07Z" />
      <path
        fillRule="evenodd"
        d="M9.12.08c.51-.15.99-.08 1.34.17.36.25.55.66.55 1.12v.73c1.13.02 2.04.94 2.04 2.07v5.85a2.07 2.07 0 0 1-2.07 2.07H2.07A2.07 2.07 0 0 1 0 10.03V4.17C0 3.03.93 2.1 2.07 2.1h.21L9.11.08h.01ZM2.07 2.68c-.83 0-1.5.67-1.5 1.5v5.85c0 .83.67 1.5 1.5 1.5h8.91c.83 0 1.5-.67 1.5-1.5V8.53a2.06 2.06 0 0 1-1.5.64h-.89a2.07 2.07 0 0 1 0-4.14h.89c.59 0 1.12.25 1.5.64V4.17c0-.83-.67-1.5-1.5-1.5H2.07Zm8.02 2.92a1.5 1.5 0 0 0 0 3h.89a1.5 1.5 0 0 0 0-3h-.89ZM10.13.71c-.19-.13-.48-.19-.86-.08L4.3 2.1h6.14v-.73c0-.3-.12-.53-.31-.66Z"
      />
    </svg>
  );
}
