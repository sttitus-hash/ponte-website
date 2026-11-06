"use client";

import { AnimatePresence, motion, useScroll, useTransform } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Appstore, BrandLogo, BrandMark, Chevron, Close, Googleplay, Menu } from "@/components/ui/icons";
import { Marker } from "@/components/ui/Primitives";
import { useActiveSection } from "@/hooks/useActiveSection";
import { useScrollDirection } from "@/hooks/useScrollDirection";
import { ease } from "@/lib/motion";
import { links, nav } from "@/lib/site";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const sectionIds = nav.map((n) => n.href.slice(1));

const menuDescriptors: Record<string, string> = {
  "#p2p": "Peer-to-peer",
  "#otc": "Large trades",
  "#whatsapp": "Trade in chat",
  "#about": "Since 2022",
  "#faq": "Questions",
};

/** Height of the hero before the compact header is allowed to appear. */
const COMPACT_AFTER = 640;

export function Header() {
  const active = useActiveSection(sectionIds);
  const { y, direction } = useScrollDirection();
  const reduce = useReducedMotion();
  const [menuOpen, setMenuOpen] = useState(false);

  const showCompact = y > COMPACT_AFTER && direction === "up";
  // Full header stays pinned over the hero until the mockup slides over it, then fades out
  // (designer note "Header & navigation"); after that the page scrolls without a header.
  const { scrollY } = useScroll();
  const fullOpacity = useTransform(scrollY, (v) => {
    const vh = typeof window === "undefined" ? 900 : window.innerHeight;
    return 1 - Math.min(1, Math.max(0, (v - vh * 0.18) / (vh * 0.3)));
  });
  const fullEvents = useTransform(fullOpacity, (o) => (o > 0.2 ? "auto" : "none"));
  const hideMobileBar = y > 80 && direction === "down" && !menuOpen;

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  return (
    <>
      {/* ------------------------------------------------------------------ */}
      {/* Desktop — full nav laid over the hero                               */}
      {/* ------------------------------------------------------------------ */}
      <motion.header className="fixed inset-x-0 top-0 z-40 hidden h-[91px] lg:block" style={{ opacity: fullOpacity, pointerEvents: fullEvents }}>
        <nav aria-label="Primary" className="relative flex h-full items-center">
          <a
            href="#top"
            aria-label="Ponte — home"
            className="absolute left-[31px] top-[31px] text-white"
          >
            <BrandLogo className="h-7 w-auto" />
          </a>

          <ul className="absolute left-1/2 top-[39px] flex -translate-x-1/2 items-center gap-6">
            {nav.map((item) => {
              const isActive = active ? active === item.href.slice(1) : item.href === "#p2p";
              return (
                <li key={item.href}>
                  <NavLink href={item.href} active={isActive} layoutId="desktop-marker">
                    {item.label}
                  </NavLink>
                </li>
              );
            })}
          </ul>

          <div className="absolute right-5 top-5">
            <Button href={links.app}>Launch App</Button>
          </div>
        </nav>
      </motion.header>

      {/* ------------------------------------------------------------------ */}
      {/* Desktop — compact header (scroll up, after the hero)                */}
      {/* ------------------------------------------------------------------ */}
      <AnimatePresence>
        {showCompact ? (
          <motion.div
            key="compact"
            className="fixed left-1/2 top-0 z-40 hidden lg:block"
            initial={reduce ? { opacity: 0, x: "-50%" } : { y: -64, x: "-50%", opacity: 0 }}
            animate={{ y: 0, x: "-50%", opacity: 1 }}
            exit={reduce ? { opacity: 0, x: "-50%" } : { y: -64, x: "-50%", opacity: 0 }}
            transition={{ duration: 0.45, ease: ease.out }}
          >
            <nav
              aria-label="Compact"
              className="relative flex h-[52px] w-[445px] items-center justify-between pl-[34px] pr-[22px]"
            >
              <svg
                aria-hidden="true"
                className="absolute inset-0 h-full w-full text-black"
                viewBox="0 0 445 52"
                preserveAspectRatio="none"
              >
                <path
                  fill="currentColor"
                  d="M0 0H445C437.268 0 431 6.2678 431 14V32C431 43.046 422.046 52 411 52H34C22.954 52 14 43.046 14 32V14C14 6.2678 7.7322 0 0 0Z"
                />
              </svg>
              <a href="#top" aria-label="Ponte — home" className="relative text-white">
                <BrandMark className="size-5" />
              </a>
              <ul className="relative flex items-center gap-[22px]">
                {nav.map((item) => {
                  const isActive = active === item.href.slice(1);
                  return (
                    <li key={item.href}>
                      <NavLink href={item.href} active={isActive} small layoutId="compact-marker">
                        {item.label}
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
              <motion.a
                href={links.app}
                aria-label="Launch App"
                className="relative flex size-9 items-center justify-center overflow-hidden rounded-full bg-lime text-ink"
                initial="rest"
                whileHover="hover"
                animate="rest"
                whileTap={{ scale: 0.95 }}
              >
                {/* chevron slides through on hover, as on the buttons; +1px for optical centring */}
                <motion.span className="absolute flex translate-x-px" variants={{ hover: { x: 22 } }} transition={{ duration: 0.4, ease: ease.inOut }}>
                  <Chevron className="h-[14px] w-[7px]" />
                </motion.span>
                <motion.span className="absolute flex translate-x-px" initial={{ x: -22 }} variants={{ rest: { x: -22 }, hover: { x: 0 } }} transition={{ duration: 0.4, ease: ease.inOut }}>
                  <Chevron className="h-[14px] w-[7px]" />
                </motion.span>
              </motion.a>
            </nav>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* ------------------------------------------------------------------ */}
      {/* Mobile — top bar + full-screen menu                                 */}
      {/* ------------------------------------------------------------------ */}
      <motion.header
        className="fixed inset-x-0 top-0 z-50 flex h-[68px] items-center justify-between bg-gradient-to-b from-black/80 to-transparent px-5 lg:hidden"
        animate={{ y: hideMobileBar ? -72 : 0 }}
        transition={{ duration: 0.4, ease: ease.out }}
      >
        <a href="#top" aria-label="Ponte — home" className="relative z-10 text-white" onClick={closeMenu}>
          <BrandLogo className="h-6 w-auto" />
        </a>
        <button
          type="button"
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMenuOpen((o) => !o)}
          className="relative z-10 flex size-11 items-center justify-center rounded-full bg-lime text-ink"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={menuOpen ? "close" : "open"}
              className="flex"
              initial={{ rotate: -45, opacity: 0, scale: 0.8 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: 45, opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2, ease: ease.out }}
            >
              {menuOpen ? <Close className="size-6" /> : <Menu className="size-[18px]" />}
            </motion.span>
          </AnimatePresence>
        </button>
      </motion.header>

      <MobileMenu open={menuOpen} onClose={closeMenu} active={active} />
    </>
  );
}

/* -------------------------------------------------------------------------- */

function NavLink({
  href,
  active,
  small,
  children,
}: {
  href: string;
  active: boolean;
  small?: boolean;
  layoutId?: string;
  children: string;
}) {
  const [hover, setHover] = useState(false);
  const reduce = useReducedMotion();
  const show = active || hover;
  const size = small ? 8 : 10;
  return (
    <a
      href={href}
      aria-current={active ? "true" : undefined}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
      className={`group relative flex items-center ${small ? "text-mono-13" : "text-mono-16"} ${active ? "text-lime" : "text-mint"} transition-colors duration-300 hover:text-lime`}
    >
      {/* The square shrinks away and re-appears next to the active (or hovered) item — it never travels. */}
      <motion.span
        aria-hidden="true"
        className="flex items-center overflow-visible"
        initial={false}
        animate={{ width: show ? size + 8 : 0 }}
        transition={{ duration: reduce ? 0 : 0.28, ease: ease.out }}
      >
        <AnimatePresence initial={false}>
          {show ? (
            <motion.span
              key="sq"
              className="flex"
              initial={reduce ? { opacity: 0 } : { scale: 0.9, rotate: 90, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              exit={reduce ? { opacity: 0 } : { scale: 0, rotate: 45, opacity: 0, transition: { duration: 0.18 } }}
              transition={{ duration: 0.3, ease: ease.out }}
            >
              <Marker size={size} />
            </motion.span>
          ) : null}
        </AnimatePresence>
      </motion.span>
      <span className="pt-px">{children}</span>
    </a>
  );
}

/* -------------------------------------------------------------------------- */

function MobileMenu({
  open,
  onClose,
  active,
}: {
  open: boolean;
  onClose: () => void;
  active: string | null;
}) {
  const reduce = useReducedMotion();
  const firstLink = useRef<HTMLAnchorElement>(null);

  // Lock scroll, close on Escape, move focus in/out.
  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const id = window.setTimeout(() => firstLink.current?.focus(), 250);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", onKey);
      window.clearTimeout(id);
      previouslyFocused?.focus?.();
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          data-lenis-prevent
          className="fixed inset-0 z-40 flex flex-col justify-between overflow-y-auto bg-black px-5 pb-8 pt-[116px] lg:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0.15 : 0.3 }}
        >
          <nav aria-label="Mobile">
            <ul className="flex flex-col border-t border-divider">
              {nav.map((item, i) => {
                const isActive = active === item.href.slice(1);
                return (
                  <motion.li
                    key={item.href}
                    className="border-b border-divider"
                    initial={reduce ? false : { opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 12, transition: { duration: 0.2 } }}
                    transition={{ duration: 0.5, ease: ease.out, delay: 0.06 * i + 0.1 }}
                  >
                    <a
                      ref={i === 0 ? firstLink : undefined}
                      href={item.href}
                      onClick={onClose}
                      aria-current={isActive ? "true" : undefined}
                      className="grid grid-cols-[44px_1fr_auto] items-center py-[18px]"
                    >
                      <span className="text-mono-12 text-grey-dim">0{i + 1}</span>
                      <span className={`text-[32px] leading-[1.1] tracking-[-0.03em] font-display ${isActive ? "text-lime" : "text-cream"}`}>
                        {item.label}
                      </span>
                      <span className="text-mono-12 text-grey-dim">{menuDescriptors[item.href]}</span>
                    </a>
                  </motion.li>
                );
              })}
            </ul>
          </nav>

          <motion.div
            className="flex flex-col gap-[9px]"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            transition={{ duration: 0.5, ease: ease.out, delay: 0.45 }}
          >
            <Button href={links.app} className="w-full justify-between" onClick={onClose}>
              Launch App
            </Button>
            <div className="grid grid-cols-2 gap-[9px]">
              <OutlineStore href={links.appStore} label="App Store" icon={<Appstore className="h-[15px] w-3" />} />
              <OutlineStore href={links.googlePlay} label="Google Play" icon={<Googleplay className="h-[15px] w-[14px]" />} />
            </div>
            <p className="mt-6 flex items-center gap-2 text-mono-12 text-grey">
              <Marker size={6} />
              Money moves. Confidence stays.
            </p>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function OutlineStore({ href, label, icon }: { href: string; label: string; icon: React.ReactNode }) {
  return (
    <a
      href={href}
      className="flex h-[51px] items-center justify-center gap-2 rounded-full border border-white/20 text-mono-14 uppercase text-cream"
    >
      {label}
      <span aria-hidden="true" className="flex">
        {icon}
      </span>
    </a>
  );
}
