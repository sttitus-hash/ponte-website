"use client";

import type { MouseEventHandler, ReactNode } from "react";
import { Chevron } from "./icons";
import { externalProps } from "@/lib/site";

type Variant = "lime" | "ink" | "pale";

type ButtonProps = {
  href: string;
  variant?: Variant;
  /** Leading icon (WhatsApp button). */
  leadingIcon?: ReactNode;
  /** Show the trailing chevron circle. Off for store buttons. */
  chevron?: boolean;
  /** Replace the chevron inside the trailing circle with a static icon (WhatsApp button). */
  circleIcon?: ReactNode;
  children: ReactNode;
  className?: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  "aria-label"?: string;
};

/**
 * UI kit "Desktop/Button" (Figma 9455:46) and "Desktop/Store Button" (9455:83), read from the
 * kit's component states on 7 Nov 2026 (row 1 — no provisional colours):
 *
 *   Primary  (lime)  pill color/bg/accent #E8EE81 · label color/text/on-accent #100F0F · circle 47 color/bg/inverse #100F0F · chevron color/icon/accent #E8EE81
 *   Inverse  (ink)   pill color/bg/inverse #100F0F · label color/text/accent #E8EE81 · circle color/bg/accent #E8EE81 · chevron color/icon/on-accent #100F0F
 *   Store    (pale)  pill color/bg/cream #FDFFDF · label + store icon #100F0F
 *
 *   Hover:   a capsule in the circle's colour grows from the circle (right) to fill the pill at
 *            inset 2 (185×51 → 181×47); label and chevron switch to the capsule's contrast colour;
 *            chevron +2px.  240ms cubic-bezier(.2,.8,.2,1).
 *   Pressed: the capsule sits at inset 4 (177×43), so the pill looks pushed in.
 */
const kit: Record<
  Variant,
  { pill: string; label: string; labelOn: string; capsule: string; circleText: string; circleTextOn: string }
> = {
  lime: {
    pill: "bg-lime",
    label: "text-ink",
    labelOn: "group-hover:text-lime group-active:text-lime group-focus-visible:text-lime",
    capsule: "bg-ink",
    circleText: "text-lime",
    circleTextOn: "",
  },
  ink: {
    pill: "bg-ink",
    label: "text-lime",
    labelOn: "group-hover:text-ink group-active:text-ink group-focus-visible:text-ink",
    capsule: "bg-lime",
    circleText: "text-ink",
    circleTextOn: "",
  },
  pale: {
    pill: "bg-lime-pale",
    label: "text-ink",
    labelOn: "group-hover:text-lime-pale group-active:text-lime-pale group-focus-visible:text-lime-pale",
    capsule: "bg-ink",
    circleText: "text-lime-pale",
    circleTextOn: "",
  },
};

const EASE = "[transition-timing-function:cubic-bezier(.2,.8,.2,1)]";

export function Button({
  href,
  variant = "lime",
  leadingIcon,
  chevron = true,
  circleIcon,
  children,
  className = "",
  ...rest
}: ButtonProps) {
  const k = kit[variant];
  return (
    <a
      href={href}
      {...externalProps(href)}
      {...rest}
      className={`group relative isolate inline-flex h-[51px] shrink-0 items-center gap-4 overflow-hidden rounded-full ${k.pill} ${
        chevron ? "pl-6 pr-0.5" : "px-9"
      } text-mono-16 select-none ${className}`}
    >
      {/* the capsule: grows from the circle side to fill the pill (hover, inset 2; pressed, inset 4) */}
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute inset-y-0.5 right-0.5 -z-10 rounded-full ${k.capsule} ${EASE} transition-[left,inset] duration-[240ms] left-[calc(100%-49px)] group-hover:left-0.5 group-focus-visible:left-0.5 group-active:inset-1 group-active:left-1 ${
          chevron ? "" : "opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 group-active:opacity-100"
        }`}
      />
      {leadingIcon ? (
        <span className={`flex size-5 items-center justify-center ${k.label} ${k.labelOn} ${EASE} transition-colors duration-[240ms]`} aria-hidden="true">
          {leadingIcon}
        </span>
      ) : null}
      <span className={`pt-px ${k.label} ${k.labelOn} ${EASE} transition-colors duration-[240ms]`}>{children}</span>
      {!chevron ? null : (
        <span aria-hidden="true" className={`relative flex size-[47px] items-center justify-center rounded-full ${k.circleText}`}>
          <span className={`flex ${EASE} transition-transform duration-[240ms] group-hover:translate-x-0.5 group-focus-visible:translate-x-0.5`}>
            {circleIcon ?? <Chevron className="h-[17px] w-[9px]" />}
          </span>
        </span>
      )}
    </a>
  );
}
