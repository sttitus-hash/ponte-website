import type { ReactNode } from "react";

/** Figma "Tag": forest pill, mint uppercase mono label, 40px tall, radius 2. */
export function Tag({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={`inline-flex h-10 items-center rounded-[2px] bg-forest px-[17px] text-mono-16 text-mint ${className}`}
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
    <span className="inline-flex items-center gap-2 rounded-[4px] bg-ink px-3 py-2 text-mono-12 tracking-[0.08em] text-cream-warm">
      <span aria-hidden="true" className="size-1.5 rounded-full bg-lime" />
      {children}
    </span>
  );
}
