"use client";

import { useCallback, useState, type CSSProperties, type ReactNode } from "react";
import { BrandLogo, BrandMark } from "@/components/ui/icons";

/**
 * The OTC trade screen shown inside the hero's desktop display, rebuilt as live HTML so
 * it stays crisp at every pixel density. Figma places the screen as a 740.32×512.92
 * trapezoid (top edge inset 6.91px each side, 16.3px corners) at (32.85, 9.60) inside
 * the 805×748.9 device group; this component maps a 1480×1026 "natural" layout onto that
 * quad with a projective (matrix3d) transform, so it tracks the monitor at any width.
 * All figures mirror the approved mockup ($PONTE is an illustrative token only).
 */

// Quad corners in device-group units (1x), relative to the screen box origin.
const SCREEN = { x: 32.8475, y: 9.6014, w: 740.3178, h: 512.9164, inset: 6.9139, radius: 16.3 };
const DEVICE = { w: 805.001, h: 748.908 };
const NAT = { w: 1480, h: 1026 }; // natural layout size (2× of the 1x screen box)

/** Projective transform mapping the NAT rectangle onto an arbitrary quad (CSS matrix3d). */
function quadMatrix(w: number, h: number, q: [number, number][]) {
  const [[x0, y0], [x1, y1], [x2, y2], [x3, y3]] = q; // TL, TR, BR, BL
  // Solve the 8 homography coefficients (a..h) for (0,0)->p0, (w,0)->p1, (w,h)->p2, (0,h)->p3.
  const dx1 = x1 - x2, dx2 = x3 - x2, dx3 = x0 - x1 + x2 - x3;
  const dy1 = y1 - y2, dy2 = y3 - y2, dy3 = y0 - y1 + y2 - y3;
  const det = dx1 * dy2 - dx2 * dy1;
  const g = (dx3 * dy2 - dx2 * dy3) / det;
  const hh = (dx1 * dy3 - dx3 * dy1) / det;
  const a = x1 - x0 + g * x1, b = x3 - x0 + hh * x3, c = x0;
  const d = y1 - y0 + g * y1, e = y3 - y0 + hh * y3, f = y0;
  // Unit square -> quad; prepend the scale from the NAT rectangle to the unit square.
  const m = [a / w, d / w, 0, g / w, b / h, e / h, 0, hh / h, 0, 0, 1, 0, c, f, 0, 1];
  return `matrix3d(${m.map((v) => +v.toFixed(6)).join(",")})`;
}

export function HeroScreen() {
  const [transform, setTransform] = useState<string>(() => {
    const k = 1; // SSR fallback at 805px; corrected on mount before paint
    return quadMatrix(NAT.w, NAT.h, [
      [SCREEN.inset * k, 0],
      [(SCREEN.w - SCREEN.inset) * k, 0],
      [SCREEN.w * k, SCREEN.h * k],
      [0, SCREEN.h * k],
    ]);
  });

  const ref = useCallback((el: HTMLDivElement | null) => {
    if (!el) return;
    const update = () => {
      const k = el.getBoundingClientRect().width / SCREEN.w;
      setTransform(
        quadMatrix(NAT.w, NAT.h, [
          [SCREEN.inset * k, 0],
          [(SCREEN.w - SCREEN.inset) * k, 0],
          [SCREEN.w * k, SCREEN.h * k],
          [0, SCREEN.h * k],
        ]),
      );
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none absolute select-none"
      style={{
        left: `${(SCREEN.x / DEVICE.w) * 100}%`,
        top: `${(SCREEN.y / DEVICE.h) * 100}%`,
        width: `${(SCREEN.w / DEVICE.w) * 100}%`,
        height: `${(SCREEN.h / DEVICE.h) * 100}%`,
      }}
    >
      <div
        className="absolute left-0 top-0 overflow-hidden bg-[#0b0b0b] text-[#f1efe8]"
        style={{
          width: NAT.w,
          height: NAT.h,
          transform,
          transformOrigin: "0 0",
          borderRadius: SCREEN.radius * 2,
          fontFamily: "var(--font-body)",
          WebkitFontSmoothing: "antialiased",
        }}
      >
        <SafariChrome />
        <AppNav />
        <div className="absolute" style={{ left: 36, top: 178, fontSize: 17, color: "#e6e4de" }}>
          <span className="inline-block align-middle" style={{ width: 14, marginRight: 14 }}>
            <Arrow />
          </span>
          Back
        </div>
        <Pill style={{ right: 43, top: 178, height: 38, padding: "0 16px" }}>TOKEN INFORMATION</Pill>

        {/* Left column ------------------------------------------------------ */}
        <Card style={{ left: 34, top: 240, width: 460, height: 103 }}>
          <div className="absolute flex items-center justify-center rounded-full bg-[#173b2f]" style={{ left: 26, top: 23, width: 54, height: 54 }}>
            <BrandMark className="text-white" style={{ width: 22, height: 22 }} />
          </div>
          <div className="absolute" style={{ left: 97, top: 23, fontFamily: "var(--font-display)", fontSize: 22, lineHeight: "26px" }}>
            $PONTE <span style={{ fontSize: 16, verticalAlign: 2 }}>↗</span>
          </div>
          <Chip style={{ left: 97, top: 56 }}>0x38…2345 <Copy /></Chip>
          <div className="absolute text-right" style={{ right: 26, top: 23, fontSize: 15, lineHeight: "18px", color: "#e6e4de" }}>
            20% Filled
            <div className="mt-[6px] flex justify-end gap-[3px]">
              {Array.from({ length: 10 }, (_, i) => (
                <span key={i} className="block" style={{ width: 8, height: 8, background: i < 2 ? "#e8ee81" : "#3a3a3a" }} />
              ))}
            </div>
            <div style={{ fontSize: 13, color: "#8c8c8c", marginTop: 6 }}>470.20 $PONTE of 2,351 $PONTE</div>
          </div>
        </Card>

        <Card style={{ left: 34, top: 362, width: 460, height: 358 }}>
          <div className="absolute" style={{ left: 20, top: 22, fontFamily: "var(--font-display)", fontSize: 34, lineHeight: "40px", letterSpacing: "-0.01em" }}>
            357.35
          </div>
          <div className="absolute flex items-center" style={{ right: 26, top: 28, fontFamily: "var(--font-display)", fontSize: 22, lineHeight: "26px", gap: 6 }}>
            $PONTE
            <span className="flex items-center justify-center rounded-full bg-[#f1efe8]" style={{ width: 16, height: 16 }}>
              <BrandMark className="text-[#0b0b0b]" style={{ width: 8, height: 8 }} />
            </span>
          </div>
          <div className="absolute" style={{ left: 20, top: 72, fontSize: 13, color: "#8c8c8c" }}>
            $478.85
          </div>
          {/* slider */}
          <div className="absolute" style={{ left: 20, top: 98, width: 320, height: 3, background: "#333" }}>
            <div className="absolute left-0 top-0 h-full" style={{ width: 128, background: "#e8ee81" }} />
            <span className="absolute rounded-full" style={{ left: 120, top: -7, width: 17, height: 17, background: "#e8ee81" }} />
          </div>
          <div className="absolute" style={{ left: 352, top: 90, fontSize: 13, color: "#8c8c8c" }}>19%</div>
          <Pill style={{ right: 26, top: 84, height: 28, padding: "0 10px", fontSize: 12 }}>MAX</Pill>
          <div className="absolute rounded-[10px] border border-[#2a2a2a] bg-[#1b1b1b]" style={{ left: 20, top: 133, width: 414, height: 78 }}>
            <Row label="You Pay" info value="478.85 USDT" note="($479)" top={15} />
            <Row label="Platform fee (0.1%)" info value="0.48 USDT" note="($0.48)" top={48} />
          </div>
          <div className="absolute flex items-center rounded-full bg-[#e8ee81] text-[#100f0f]" style={{ left: 20, top: 254, width: 412, height: 60, paddingLeft: 32, fontFamily: "var(--font-mono)", fontSize: 15, letterSpacing: "0.02em" }}>
            PAY 478.85 USDT
            <span className="absolute flex items-center justify-center rounded-full bg-[#100f0f] text-[#e8ee81]" style={{ right: 5, top: 5, width: 50, height: 50 }}>
              <ChevronGlyph />
            </span>
          </div>
        </Card>

        {/* Middle column ---------------------------------------------------- */}
        <Card style={{ left: 507, top: 240, width: 464, height: 175 }}>
          <div className="absolute" style={{ left: 27, top: 28, fontSize: 14, color: "#8c8c8c" }}>Offer</div>
          <div className="absolute flex items-center" style={{ right: 26, top: 22, gap: 6 }}>
            <span style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 500 }}>0.00</span>
            <span style={{ fontSize: 13, color: "#8c8c8c" }}>PONTE</span>
            <BrandMark className="text-[#e8ee81]" style={{ width: 11, height: 11 }} />
          </div>
          <div className="absolute" style={{ left: 27, top: 68, fontSize: 14, color: "#8c8c8c" }}>To Receive</div>
          <div className="absolute flex items-center" style={{ right: 26, top: 62, gap: 6 }}>
            <span style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 500 }}>0.00</span>
            <span style={{ fontSize: 13, color: "#8c8c8c" }}>USDT</span>
            <span className="flex items-center justify-center rounded-full bg-[#26a17b] text-white" style={{ width: 16, height: 16, fontSize: 10, fontWeight: 700, fontFamily: "var(--font-mono)" }}>T</span>
          </div>
          <div className="absolute flex items-center rounded-full border border-[#343434] bg-[#232323]" style={{ left: 27, top: 108, width: 238, height: 44, paddingLeft: 24, fontFamily: "var(--font-mono)", fontSize: 15, letterSpacing: "0.02em", color: "#f1efe8" }}>
            SEND COUNTER OFFER
            <span className="absolute flex items-center justify-center rounded-full bg-[#2f2f2f]" style={{ right: 4, top: 4, width: 34, height: 34 }}>
              <ChevronGlyph small />
            </span>
          </div>
        </Card>

        <Card style={{ left: 507, top: 432, width: 464, height: 341 }}>
          <div className="absolute" style={{ left: 26, top: 26, fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 500 }}>Offer Details</div>
          <Detail top={70} label="Order ID" value="0xf7…557b" mono copy />
          <Detail top={108} label="Created by" value="0xf7…557b" mono copy />
          <Detail top={146} label="Price/Token" value="1.34 USDT" mono />
          <Detail top={185} label="Fill type" value="Partial Fill" />
          <Detail top={223} label="Whitelist" value="No" />
          <Detail top={261} label="Gain relative to Chart Prices:" value="—" dim />
          <Detail top={299} label="Date published" value="12 June, 2026" />
        </Card>

        {/* Right column ----------------------------------------------------- */}
        <Card style={{ left: 988, top: 240, width: 464, height: 320 }}>
          <div className="absolute" style={{ left: 24, top: 22, fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.08em", color: "#8c8c8c" }}>
            SETTLEMENT · ESCROW PROTECTED
          </div>
          <div className="absolute" style={{ left: 24, top: 44, fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 500 }}>How this trade settles</div>
          <Step top={100} n="01" label="Set the amount" status="DONE" mode="done" />
          <Step top={151} label="Pay into escrow" n="02" status="NOW" mode="now" />
          <Step top={203} label="Seller confirms" n="03" status="NEXT" mode="next" />
          <Step top={254} label="$PONTE released to you" n="04" status="NEXT" mode="next" last />
        </Card>

        <Card style={{ left: 988, top: 580, width: 464, height: 205 }}>
          <div className="absolute" style={{ left: 24, top: 24, fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 500 }}>Order History</div>
          <div className="absolute flex items-center justify-between rounded-[8px] bg-[#1b1b1b]" style={{ left: 12, top: 60, width: 440, height: 44, padding: "0 18px", fontSize: 14, color: "#e6e4de" }}>
            <span>Date/Time</span>
            <span>Filled Amount</span>
            <span>Paid Amount</span>
            <span>Tx</span>
          </div>
          <div className="absolute w-full text-center" style={{ top: 140, fontSize: 14, color: "#8c8c8c" }}>No orders yet</div>
        </Card>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------------- */
/* Pieces                                                                        */
/* ---------------------------------------------------------------------------- */

function Card({ style, children }: { style: CSSProperties; children: ReactNode }) {
  return (
    <div className="absolute rounded-[14px] bg-[#161616]" style={style}>
      {children}
    </div>
  );
}

function Pill({ style, children }: { style: CSSProperties; children: ReactNode }) {
  return (
    <div
      className="absolute flex items-center rounded-full border border-[#3a3a3a] text-[#f1efe8]"
      style={{ fontFamily: "var(--font-mono)", fontSize: 15, letterSpacing: "0.02em", ...style }}
    >
      {children}
    </div>
  );
}

function Chip({ style, children }: { style: CSSProperties; children: ReactNode }) {
  return (
    <div
      className="absolute flex items-center rounded-[4px] bg-[#262626] text-[#d8d6cf]"
      style={{ height: 24, padding: "0 7px", gap: 6, fontFamily: "var(--font-mono)", fontSize: 13, ...style }}
    >
      {children}
    </div>
  );
}

function Row({ label, value, note, top, info }: { label: string; value: string; note: string; top: number; info?: boolean }) {
  return (
    <>
      <div className="absolute flex items-center" style={{ left: 14, top, fontSize: 14, color: "#8c8c8c", gap: 5 }}>
        {label}
        {info ? <Info /> : null}
      </div>
      <div className="absolute" style={{ right: 14, top: top - 1, fontSize: 14 }}>
        <span style={{ fontFamily: "var(--font-mono)" }}>{value}</span>{" "}
        <span style={{ color: "#8c8c8c", fontSize: 13 }}>{note}</span>
      </div>
    </>
  );
}

function Detail({ top, label, value, mono, copy, dim }: { top: number; label: string; value: string; mono?: boolean; copy?: boolean; dim?: boolean }) {
  return (
    <>
      <div className="absolute flex items-center" style={{ left: 26, top, fontSize: 14, color: "#8c8c8c", gap: 5 }}>
        {label}
        <Info />
      </div>
      <div className="absolute flex items-center" style={{ right: 24, top: top - 1, fontSize: 14, gap: 6, color: dim ? "#8c8c8c" : "#f1efe8", fontFamily: mono ? "var(--font-mono)" : undefined }}>
        {value}
        {copy ? <Copy /> : null}
      </div>
    </>
  );
}

function Step({ top, n, label, status, mode, last }: { top: number; n: string; label: string; status: string; mode: "done" | "now" | "next"; last?: boolean }) {
  const dim = mode === "next";
  return (
    <div className="absolute flex items-center" style={{ left: 24, right: 24, top, height: 51, borderBottom: last ? "none" : "1px solid #262626", gap: 14 }}>
      <span
        className="block"
        style={{
          width: 10,
          height: 10,
          background: mode === "done" ? "#e8ee81" : mode === "now" ? "transparent" : "#3a3a3a",
          border: mode === "now" ? "1.5px solid #e8ee81" : "none",
          borderRadius: 1,
        }}
      />
      <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "#8c8c8c", width: 20 }}>{n}</span>
      <span style={{ fontSize: 15, color: dim ? "#8c8c8c" : "#f1efe8" }}>{label}</span>
      <span className="ml-auto" style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.06em", color: mode === "now" ? "#e8ee81" : "#6b6b6b" }}>
        {status}
      </span>
    </div>
  );
}

function SafariChrome() {
  return (
    <div className="absolute inset-x-0 top-0 bg-[#1c1c1e]" style={{ height: 56 }}>
      <span className="absolute rounded-full" style={{ left: 45, top: 21, width: 14, height: 14, background: "#ff5f57" }} />
      <span className="absolute rounded-full" style={{ left: 69, top: 21, width: 14, height: 14, background: "#febc2e" }} />
      <span className="absolute rounded-full" style={{ left: 93, top: 21, width: 14, height: 14, background: "#28c840" }} />
      <Glyph x={160} y={18}>
        <rect x="1" y="2" width="18" height="15" rx="3" stroke="#9a9a9a" strokeWidth="1.6" fill="none" />
        <path d="M7 2v15" stroke="#9a9a9a" strokeWidth="1.6" />
      </Glyph>
      <Glyph x={243} y={19}>
        <path d="M11 3l-6 6 6 6" stroke="#9a9a9a" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      </Glyph>
      <Glyph x={270} y={19}>
        <path d="M7 3l6 6-6 6" stroke="#9a9a9a" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      </Glyph>
      <div className="absolute flex items-center justify-center rounded-[8px] bg-[#2a2a2c]" style={{ left: 420, top: 11, width: 620, height: 34, fontSize: 14, color: "#b9b9b9", gap: 8 }}>
        <svg width="12" height="14" viewBox="0 0 12 14" fill="none"><rect x="1" y="6" width="10" height="7" rx="1.5" fill="#b9b9b9" /><path d="M3 6V4a3 3 0 016 0v2" stroke="#b9b9b9" strokeWidth="1.5" /></svg>
        app.ponte.com
      </div>
      <Glyph x={978} y={19}>
        <circle cx="9" cy="9" r="7" stroke="#9a9a9a" strokeWidth="1.6" fill="none" />
        <path d="M9 5v4l3 2" stroke="#9a9a9a" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      </Glyph>
      <Glyph x={1262} y={19}>
        <circle cx="9" cy="9" r="7.5" stroke="#9a9a9a" strokeWidth="1.6" fill="none" />
        <path d="M9 5v7m-3-3l3 3 3-3" stroke="#9a9a9a" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      </Glyph>
      <Glyph x={1311} y={19}>
        <path d="M8 3H4a1 1 0 00-1 1v10a1 1 0 001 1h10a1 1 0 001-1v-4M11 3h4v4M15 3l-7 7" stroke="#9a9a9a" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      </Glyph>
      <Glyph x={1362} y={19}>
        <path d="M9 3v12M3 9h12" stroke="#9a9a9a" strokeWidth="1.8" strokeLinecap="round" />
      </Glyph>
      <Glyph x={1408} y={19}>
        <rect x="2" y="6" width="10" height="10" rx="2" stroke="#9a9a9a" strokeWidth="1.6" fill="none" />
        <path d="M6 6V4a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2h-2" stroke="#9a9a9a" strokeWidth="1.6" fill="none" />
      </Glyph>
    </div>
  );
}

function AppNav() {
  const item = (x: number, label: string, icon: ReactNode, active?: boolean) => (
    <div
      key={label}
      className="absolute flex items-center"
      style={{
        left: x,
        top: 97,
        height: 26,
        gap: 9,
        fontSize: active ? 15 : 17,
        color: active ? "#e8ee81" : "#e6e4de",
        fontFamily: active ? "var(--font-mono)" : undefined,
        letterSpacing: active ? "0.02em" : undefined,
      }}
    >
      <span className="flex items-center justify-center" style={{ width: 16, height: 16, color: active ? "#e8ee81" : "#d8d6cf" }}>{icon}</span>
      {label}
    </div>
  );
  return (
    <>
      <BrandLogo className="absolute text-[#f1efe8]" style={{ left: 60, top: 98, width: 100, height: 24 }} />
      {item(342, "Home", <svg viewBox="0 0 16 16" width="16" height="16"><path d="M2 7.5L8 2l6 5.5V14H2z" fill="currentColor" /><rect x="6.5" y="9" width="3" height="5" fill="#161616" /></svg>)}
      {item(444, "Wallet", <svg viewBox="0 0 16 16" width="16" height="16"><rect x="1" y="4" width="14" height="10" rx="2" fill="currentColor" /><rect x="10" y="7.5" width="4" height="3" rx="0.5" fill="#161616" /></svg>)}
      {item(552, "P2P", <svg viewBox="0 0 16 16" width="16" height="16"><circle cx="5" cy="5" r="3" fill="currentColor" /><circle cx="11" cy="11" r="3" fill="currentColor" /><circle cx="12" cy="4" r="1.5" fill="currentColor" /></svg>)}
      {item(636, "OTC", <svg viewBox="0 0 16 16" width="16" height="16"><rect x="2" y="2" width="12" height="3" fill="currentColor" /><rect x="2" y="6.5" width="12" height="3" fill="currentColor" /><rect x="2" y="11" width="12" height="3" fill="currentColor" /></svg>, true)}
      {item(724, "Swap", <svg viewBox="0 0 16 16" width="16" height="16"><path d="M3 5h9l-3-3M13 11H4l3 3" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>)}
      {item(820, "Point Market", <svg viewBox="0 0 16 16" width="16" height="16"><path d="M2 2h6l6 6-6 6-6-6z" fill="currentColor" /><circle cx="5.5" cy="5.5" r="1.2" fill="#161616" /></svg>)}

      <div className="absolute flex items-center" style={{ left: 1088, top: 96, height: 28, gap: 8, fontFamily: "var(--font-mono)", fontSize: 13, letterSpacing: "0.02em", color: "#e6e4de" }}>
        <svg width="16" height="24" viewBox="0 0 16 24"><path d="M8 0l8 12-8 4.5L0 12z" fill="#c9c9c9" /><path d="M8 18l8-4.5L8 24 0 13.5z" fill="#8c8c8c" /></svg>
        ETHEREUM
        <ChevronDown />
      </div>
      <div className="absolute flex items-center rounded-full bg-[#1f1f1f]" style={{ left: 1222, top: 90, height: 40, padding: "0 12px 0 16px", gap: 10, fontFamily: "var(--font-mono)", fontSize: 13, letterSpacing: "0.02em", color: "#e6e4de" }}>
        0x94…d90k
        <span className="flex items-end justify-center overflow-hidden rounded-[3px]" style={{ width: 16, height: 20, background: "#d9a07a" }}>
          <span style={{ width: 10, height: 11, background: "#f4ede6", borderRadius: "4px 4px 0 0" }} />
        </span>
        <ChevronDown />
      </div>
      <div className="absolute flex items-center justify-center rounded-full bg-[#2a2a2a]" style={{ left: 1392, top: 92, width: 36, height: 36 }}>
        <svg width="16" height="16" viewBox="0 0 16 16"><path d="M8 1.5a4 4 0 00-4 4V9l-1.5 2.5h11L12 9V5.5a4 4 0 00-4-4z" fill="#e8ee81" /><path d="M6.5 13a1.5 1.5 0 003 0" fill="#e8ee81" /></svg>
      </div>
    </>
  );
}

function Glyph({ x, y, children }: { x: number; y: number; children: ReactNode }) {
  return (
    <svg className="absolute" style={{ left: x, top: y }} width="18" height="18" viewBox="0 0 18 18" fill="none">
      {children}
    </svg>
  );
}

function Arrow() {
  return (
    <svg width="14" height="12" viewBox="0 0 14 12" fill="none">
      <path d="M6 1L1 6l5 5M1 6h12" stroke="#e6e4de" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronGlyph({ small }: { small?: boolean }) {
  const s = small ? 12 : 14;
  return (
    <svg width={s} height={s} viewBox="0 0 14 14" fill="none">
      <path d="M5 2.5L9.5 7 5 11.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronDown() {
  return (
    <svg width="10" height="7" viewBox="0 0 10 7" fill="none">
      <path d="M1 1l4 4 4-4" stroke="#b9b9b9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Info() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <circle cx="6" cy="6" r="5" stroke="#8c8c8c" strokeWidth="1.1" />
      <path d="M6 5.3V9M6 3.3v.6" stroke="#8c8c8c" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function Copy() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <rect x="4" y="4" width="7" height="7" rx="1.2" stroke="#cfcdc6" strokeWidth="1.1" />
      <path d="M8 4V2.2A1.2 1.2 0 006.8 1H2.2A1.2 1.2 0 001 2.2v4.6A1.2 1.2 0 002.2 8H4" stroke="#cfcdc6" strokeWidth="1.1" />
    </svg>
  );
}
