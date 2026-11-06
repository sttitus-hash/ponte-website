import type { ReactNode } from "react";

/** Figma "Tag": forest pill, mint uppercase mono label, 40px tall, radius 2 (mobile: 26px tall, 14px label — row 57). */
export function Tag({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={`inline-flex h-[26px] items-center rounded-[2px] bg-forest px-[7px] text-mono-14 uppercase text-mint lg:h-10 lg:px-[17px] lg:text-mono-16 ${className}`}
    >
      {children}
    </span>
  );
}

/** 10×10 lime square marker (nav active state, timelines, bullets). */
export function Marker({
  className = "",
  size = 10,
  color = "bg-lime",
}: {
  className?: string;
  size?: number;
  color?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block shrink-0 rounded-[1px] ${color} ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

/** Small forest/mint chip used under FAQ answers. */
export function Chip({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-[2px] bg-forest px-[18px] py-3 text-mono-16 text-mint">
      {children}
    </span>
  );
}

/** Ink chip with a lime dot — Trust illustration tiles. */
export function DotChip({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 whitespace-nowrap rounded-[4px] bg-ink px-2.5 py-2 text-mono-12 text-[11px] text-cream-warm xl:px-3 xl:text-[12px]">
      <span aria-hidden="true" className="size-1.5 rounded-full bg-lime" />
      {children}
    </span>
  );
}
