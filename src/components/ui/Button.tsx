"use client";

import { motion } from "motion/react";
import type { MouseEventHandler, ReactNode } from "react";
import { Chevron } from "./icons";
import { externalProps } from "@/lib/site";
import { springSoft } from "@/lib/motion";

type Variant = "lime" | "ink" | "pale";

type ButtonProps = {
  href: string;
  variant?: Variant;
  /** Leading icon (WhatsApp button). */
  leadingIcon?: ReactNode;
  /** Show the trailing chevron circle. Off for store buttons. */
  chevron?: boolean;
  children: ReactNode;
  className?: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  "aria-label"?: string;
};

const surface: Record<Variant, string> = {
  lime: "bg-lime text-ink",
  ink: "bg-ink text-lime",
  pale: "bg-lime-pale text-ink",
};

const circle: Record<Variant, string> = {
  lime: "bg-ink text-lime",
  ink: "bg-lime text-ink",
  pale: "bg-ink text-lime",
};

/**
 * Figma "Button / pill": 51px tall, radius 999, label left, 47px circle with a chevron on the right.
 * Hover: the circle nudges forward and the chevron slides through; press: slight compress.
 */
export function Button({
  href,
  variant = "lime",
  leadingIcon,
  chevron = true,
  children,
  className = "",
  ...rest
}: ButtonProps) {
  return (
    <motion.a
      href={href}
      {...externalProps(href)}
      {...rest}
      className={`group inline-flex h-[51px] shrink-0 items-center gap-4 rounded-full ${surface[variant]} ${
        chevron ? "pl-6 pr-0.5" : "px-9"
      } text-mono-16 select-none ${className}`}
      whileHover="hover"
      whileTap={{ scale: 0.97 }}
      transition={springSoft}
    >
      {leadingIcon ? (
        <span className="flex size-5 items-center justify-center" aria-hidden="true">
          {leadingIcon}
        </span>
      ) : null}
      <span className="pt-px">{children}</span>
      {!chevron ? null : (
        <motion.span
          aria-hidden="true"
          className={`relative flex size-[47px] items-center justify-center overflow-hidden rounded-full ${circle[variant]}`}
          variants={{ hover: { x: 2 } }}
          transition={springSoft}
        >
          <motion.span
            className="absolute flex"
            variants={{ hover: { x: 28 } }}
            transition={{ duration: 0.4, ease: [0.76, 0, 0.24, 1] }}
          >
            <Chevron className="h-[17px] w-[9px]" />
          </motion.span>
          <motion.span
            className="absolute flex"
            initial={{ x: -28 }}
            variants={{ hover: { x: 0 } }}
            transition={{ duration: 0.4, ease: [0.76, 0, 0.24, 1] }}
          >
            <Chevron className="h-[17px] w-[9px]" />
          </motion.span>
        </motion.span>
      )}
    </motion.a>
  );
}
