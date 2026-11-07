"use client";

import { motion, useTransform, type MotionValue } from "motion/react";
import type { ReactNode } from "react";

/**
 * The WhatsApp conversation on the phone screen, rebuilt as HTML so the messages can
 * appear step by step (CSV row 22). The copy is the approved mockup's conversation,
 * verbatim; the layer sits exactly over the photo's message area (status bar, chat header
 * and composer stay from the photo), sized with container units so it tracks the phone at
 * any width.
 *
 * `reveal` is 0–3 (which step's messages are shown, fractional while a step animates in):
 *  step 1 → "Hi! I'd like to buy 500 USDT"
 *  step 2 → the quote
 *  step 3 → Confirm, the escrow instruction and "Payment received"
 */

/** Message area over the photo (fractions of the 1472×1516 image). */
export const CHAT_RECT = { left: 0.2024, top: 0.2414, width: 0.3329, height: 0.5594 };

type Msg = { side: "in" | "out"; time: string; body: ReactNode; step: number; order: number };

function Quote() {
  const row = (k: string, v: string, strong = false) => (
    <div className="flex items-baseline justify-between gap-[1.5em]" style={{ fontWeight: strong ? 600 : 400 }}>
      <span style={{ color: strong ? "#e9edef" : "#8696a0" }}>{k}</span>
      <span style={{ color: "#e9edef" }}>{v}</span>
    </div>
  );
  return (
    <div>
      <div style={{ color: "#e9edef" }}>Here&apos;s your quote:</div>
      <div className="mt-[0.5em] rounded-[0.5em] px-[0.7em] py-[0.5em]" style={{ background: "rgba(0,0,0,0.22)" }}>
        {row("You buy", "500 USDT")}
        {row("Rate", "1 USDT = 1,612.40 NGN")}
        {row("Fee · 1%", "8,062 NGN")}
        <div className="my-[0.35em] h-px" style={{ background: "rgba(255,255,255,0.12)" }} />
        {row("You pay", "814,262 NGN", true)}
      </div>
      <div className="mt-[0.5em]" style={{ color: "#8696a0" }}>Price held for 15:00</div>
    </div>
  );
}

const MESSAGES: Msg[] = [
  { side: "out", time: "10:24", step: 1, order: 0, body: "Hi! I'd like to buy 500 USDT" },
  { side: "in", time: "10:24", step: 2, order: 0, body: <Quote /> },
  { side: "in", time: "", step: 2, order: 1, body: <QuoteActions /> },
  { side: "out", time: "10:25", step: 3, order: 0, body: "Confirm" },
  {
    side: "in",
    time: "10:25",
    step: 3,
    order: 1,
    body: (
      <div>
        Send 814,262 NGN to the account below. Your USDT stays in escrow until the payment lands.
        <div className="mt-[0.45em] rounded-[0.35em] px-[0.6em] py-[0.35em]" style={{ background: "rgba(0,0,0,0.22)", color: "#e9edef" }}>
          Ponte Escrow · 0123 456 789
        </div>
      </div>
    ),
  },
  {
    side: "in",
    time: "10:31",
    step: 3,
    order: 2,
    body: (
      <div>
        Payment received. 500 USDT is on its way to your wallet ending d90k.
        <span className="mt-[0.5em] inline-block rounded-[0.25em] px-[0.5em] py-[0.15em] font-medium" style={{ background: "#e8ee81", color: "#100f0f" }}>
          Completed
        </span>
      </div>
    ),
  },
];

function QuoteActions() {
  return (
    <div className="flex flex-col gap-[0.35em] text-center" style={{ color: "#53bdeb" }}>
      <div className="rounded-[0.35em] py-[0.35em]" style={{ background: "rgba(0,0,0,0.22)" }}>Confirm</div>
      <div className="rounded-[0.35em] py-[0.35em]" style={{ background: "rgba(0,0,0,0.22)" }}>Change amount</div>
    </div>
  );
}

/** Visibility of message (step, order) at reveal value r: each step's messages stagger in. */
function visibility(r: number, step: number, order: number) {
  const t = r - (step - 1) - order * 0.28;
  return Math.max(0, Math.min(1, t / 0.45));
}

export function WhatsAppChat({ reveal, className = "" }: { reveal: MotionValue<number>; className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`absolute overflow-hidden ${className}`}
      style={{
        left: `${CHAT_RECT.left * 100}%`,
        top: `${CHAT_RECT.top * 100}%`,
        width: `${CHAT_RECT.width * 100}%`,
        height: `${CHAT_RECT.height * 100}%`,
        background: "#0b141a",
        containerType: "inline-size",
      }}
    >
      <div
        className="absolute inset-0 flex flex-col justify-end"
        style={{ padding: "4.5cqw 3.4cqw", gap: "2.4cqw", fontSize: "5.6cqw", lineHeight: 1.3, fontFamily: "var(--font-body)", fontWeight: 400 }}
      >
        {MESSAGES.map((m) => (
          <Bubble key={`${m.step}-${m.order}`} msg={m} reveal={reveal} />
        ))}
      </div>
    </div>
  );
}

function Bubble({ msg, reveal }: { msg: Msg; reveal: MotionValue<number> }) {
  const v = useTransform(reveal, (r) => visibility(r, msg.step, msg.order));
  const opacity = v;
  const y = useTransform(v, (t) => (1 - t) * 10);
  const scale = useTransform(v, (t) => 0.96 + 0.04 * t);
  // collapse fully hidden messages so the thread hugs the bottom like the real app
  const display = useTransform(v, (t) => (t <= 0 ? "none" : "flex"));
  const out = msg.side === "out";
  return (
    <motion.div className={`${out ? "self-end" : "self-start"} max-w-[86%]`} style={{ opacity, y, scale, display, transformOrigin: out ? "100% 100%" : "0% 100%" }}>
      <div
        className="relative"
        style={{
          background: out ? "#005c4b" : "#202c33",
          color: "#e9edef",
          borderRadius: "2.2cqw",
          padding: "2.2cqw 3cqw 1.6cqw",
        }}
      >
        <div>{msg.body}</div>
        {msg.time ? (
          <div className="flex items-center justify-end gap-[0.4em]" style={{ fontSize: "0.72em", color: out ? "rgba(233,237,239,0.7)" : "#8696a0", marginTop: "0.25em" }}>
            {msg.time}
            {out ? <Ticks /> : null}
          </div>
        ) : null}
      </div>
    </motion.div>
  );
}

function Ticks() {
  return (
    <svg viewBox="0 0 16 11" style={{ width: "1.1em", height: "0.8em" }} aria-hidden="true">
      <path d="M1 6l3 3 6-7" fill="none" stroke="#53bdeb" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 6l3 3 6-7" fill="none" stroke="#53bdeb" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
