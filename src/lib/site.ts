/**
 * Site-wide configuration.
 *
 * External destinations are NOT invented: each one reads from an environment
 * variable and falls back to a safe in-page anchor until the real URL is supplied.
 * See README.md → "Configuration" for the full list.
 */
const env = (key: string, fallback: string) =>
  (process.env[key] ?? "").trim() || fallback;

export const site = {
  name: "Ponte",
  tagline: "Money moves. Confidence stays.",
  description:
    "Trade P2P with verified people. Execute larger trades via OTC. Buy and sell crypto in WhatsApp.",
  url: env("NEXT_PUBLIC_SITE_URL", "https://ponte.example"),
  locale: "en",
  copyrightYear: 2026,
} as const;

export const links = {
  /** Web app entry point (Launch App CTA). */
  app: env("NEXT_PUBLIC_APP_URL", "#launch"),
  /** Product deep links inside the app. Fall back to the app root. */
  p2p: env("NEXT_PUBLIC_P2P_URL", env("NEXT_PUBLIC_APP_URL", "#launch")),
  otc: env("NEXT_PUBLIC_OTC_URL", env("NEXT_PUBLIC_APP_URL", "#launch")),
  /** WhatsApp assistant (wa.me / click-to-chat). */
  whatsapp: env("NEXT_PUBLIC_WHATSAPP_URL", "#whatsapp"),
  /** Support channel (WhatsApp or help desk). */
  support: env("NEXT_PUBLIC_SUPPORT_URL", env("NEXT_PUBLIC_WHATSAPP_URL", "#faq")),
  appStore: env("NEXT_PUBLIC_APP_STORE_URL", "#launch"),
  googlePlay: env("NEXT_PUBLIC_GOOGLE_PLAY_URL", "#launch"),
  contact: env("NEXT_PUBLIC_CONTACT_URL", "#faq"),
  helpCentre: env("NEXT_PUBLIC_HELP_CENTRE_URL", "#faq"),
  terms: env("NEXT_PUBLIC_TERMS_URL", "#"),
  privacy: env("NEXT_PUBLIC_PRIVACY_URL", "#"),
  riskDisclosure: env("NEXT_PUBLIC_RISK_DISCLOSURE_URL", "#"),
  x: env("NEXT_PUBLIC_X_URL", "#"),
  telegram: env("NEXT_PUBLIC_TELEGRAM_URL", "#"),
} as const;

/** True when a link still points at a placeholder anchor rather than a real URL. */
export const isPlaceholder = (href: string) => href.startsWith("#");

/** Attributes for external links; placeholders stay same-tab. */
export const externalProps = (href: string) =>
  isPlaceholder(href)
    ? {}
    : ({ target: "_blank", rel: "noopener noreferrer" } as const);

export const nav = [
  { label: "P2P", href: "#p2p" },
  { label: "OTC", href: "#otc" },
  { label: "WhatsApp", href: "#whatsapp" },
  { label: "About", href: "#about" },
  { label: "FAQ", href: "#faq" },
] as const;
