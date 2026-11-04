/**
 * All marketing copy, verbatim from the approved Figma design (docs/figma-spec.md).
 * Anything marked `draft: true` was NOT in Figma and needs sign-off before launch.
 */

export const hero = {
  title: ["Money ", "moves.", " Confidence ", "stays."] as const,
  body: "Trade P2P with verified people. Execute larger trades via OTC. Buy and sell crypto in WhatsApp.",
};

export const trackRecord = {
  tag: "about us",
  title: ["Not just an idea.", "Already in motion."],
  body: "We have been building crypto-access products since 2022, growing from peer-to-peer verification into a broader platform for trading and moving digital assets.",
  slides: [
    {
      topLeft: "Origin story",
      topRight: "P2P → Platform",
      caption: "Where our journey began.",
      figure: "2022",
      image: "/images/about-cube.png",
      alt: "Lime 3D cube",
    },
    {
      topLeft: "Volume",
      topRight: "Since 2022",
      caption: "Total transaction volume.",
      figure: "$2.3M+",
      image: "/images/about-bars.png",
      alt: "Lime 3D bar chart",
    },
    {
      topLeft: "Compliance",
      topRight: "Crypto ↔ Fiat",
      caption: "Crypto–fiat operations.",
      figure: "LICENSED",
      image: "/images/about-sblock.png",
      alt: "Lime 3D S-shaped block",
    },
    {
      topLeft: "Access",
      topRight: "iOS · Android · Web · WhatsApp",
      caption: "Four ways to access the platform.",
      figure: "04",
      image: "/images/about-x.png",
      alt: "Lime 3D X shape",
    },
  ],
};

export const p2p = {
  tag: "Peer-to-peer trading",
  title: ["The right people.", "A better way to trade."],
  body: "Buy and sell crypto directly with verified users through an escrow-protected marketplace. Find an offer, agree on terms, and follow a clear process from payment to completion.",
  cta: "Open P2P",
  features: [
    {
      icon: "p2p-verified",
      title: "Know who you're trading with",
      body: "Counterparty verification makes for a more accountable marketplace",
    },
    {
      icon: "p2p-escrow",
      title: "Protection while you trade",
      body: "Escrow holds the crypto until the agreed conditions are met",
    },
    {
      icon: "p2p-clarity",
      title: "Clarity from start to finish",
      body: "Follow your trade through each stage, from offer to settlement",
    },
  ],
  fees: { makers: "0.3%", takers: "0%" },
};

export const otc = {
  tag: "OTC trading",
  title: ["Trade beyond", "the marketplace."],
  body: "A direct route for larger trades. See the quote, confirm the terms, and complete the trade in one focused flow, without working through the P2P offer book.",
  cta: "Explore OTC",
  features: [
    {
      icon: "otc-quote",
      title: "A quote, not an order book",
      body: "Review the amount, rate and total before you commit.",
    },
    {
      icon: "otc-size",
      title: "Built for size",
      body: "A route designed for trades that are too large for the marketplace.",
    },
    {
      icon: "otc-terms",
      title: "Terms upfront",
      body: "What you pay and what you receive, stated before you confirm.",
    },
  ],
};

export const whatsapp = {
  tag: "Crypto on WhatsApp",
  title: ["A message is all", "it takes."],
  body: "Buy and sell crypto through a conversation you already know. Our WhatsApp AI assistant guides you from request to quote to completion.",
  cta: "Start on WhatsApp",
  fee: "1%",
  steps: [
    { title: "Say what you need", body: "Start with a simple message." },
    {
      title: "See your quote",
      body: "Review the amount, rate and fee before you go ahead.",
    },
    {
      title: "Follow the conversation",
      body: "Complete each step with guidance along the way, and reach our team if you need a person.",
    },
  ],
};

export const trust = {
  title: ["Know what's happening.", "At every step."],
  body: "Every transaction deserves clarity. We build verification, transparent terms and the right safeguards for each product, so you can act on what you know, not what you hope.",
  tabs: [
    {
      label: "Verified counterparties",
      title: "Verification",
      body: "Checks designed to improve accountability across the platform.",
      action: "See how verification works",
      illustration: "rings",
      chips: ["Identity · Checked", "Phone · Confirmed", "Trades · 1,240 completed"],
    },
    {
      label: "Escrow · Quote · Confirm",
      title: "Safeguards built for each product",
      body: "Escrow protection in the P2P marketplace; clear quotes and confirmation steps across OTC and WhatsApp.",
      action: "See how escrow works",
      illustration: "spiral",
      chips: ["P2P · Escrow", "OTC · Quote", "WhatsApp · Confirm"],
    },
    {
      label: "Nothing after the fact",
      title: "Clear terms",
      body: "Rate, fee and what you receive, shown before you confirm.",
      action: "See an example quote",
      illustration: "lens",
      chips: ["Rate · 1 USDT = 1.00 USD", "Fee · 2.00 USD", "You receive · 200.00 USDT"],
    },
    {
      label: "Real people, fast replies",
      title: "Support when you need it",
      body: "Reach our team if you have a question or something needs a second look.",
      action: "Contact support",
      illustration: "support",
      chips: ["Trade #4821 · Need help?", "Replies · Within minutes", "Support · 7 days a week"],
    },
  ],
};

export const story = {
  eyebrow: ["We started with trust.", "We kept building."],
  slides: [
    {
      word: "2022",
      chip: "2022",
      body: "Our story began in 2022 with a simple belief: people should be able to trade crypto ",
      highlight: "with greater confidence.",
    },
    {
      word: "P2P",
      chip: "P2P",
      body: "We started with counterparty verification and ",
      highlight: "protected peer-to-peer trades.",
    },
    {
      word: "OTC",
      chip: "OTC",
      body: "As our users’ needs grew, we added ",
      highlight: "OTC trading and crypto access through WhatsApp.",
    },
    {
      word: "RAMP",
      chip: "Ramp",
      body: "Today it all comes together on ",
      highlight: "one platform for accessing and moving digital assets.",
    },
  ],
};

export type FaqItem = {
  question: string;
  answer: string;
  chips?: string[];
  /** Not present in the Figma file — assembled from approved on-page copy only. Needs sign-off. */
  draft?: boolean;
};

export const faq = {
  title: ["Questions?", "Let’s make things clear."],
  aside: "Can’t find your answer? Our team replies on WhatsApp, usually within minutes.",
  cta: "Ask support",
  items: [
    {
      question: "What can I do on the platform?",
      answer:
        "Trade crypto with verified people in the P2P marketplace, execute larger trades through OTC, and buy or sell crypto through our WhatsApp assistant. Availability varies by product and country.",
      chips: ["P2P marketplace", "OTC desk", "W/A assistant"],
    },
    {
      question: "How does P2P trading work?",
      answer:
        "Buy and sell crypto directly with verified users through an escrow-protected marketplace. Find an offer, agree on terms, and follow a clear process from payment to completion. Escrow holds the crypto until the agreed conditions are met.",
      chips: ["Verified users", "Escrow"],
      draft: true,
    },
    {
      question: "What is OTC trading?",
      answer:
        "A direct route for larger trades. See the quote, confirm the terms, and complete the trade in one focused flow, without working through the P2P offer book.",
      chips: ["Quote", "Terms upfront"],
      draft: true,
    },
    {
      question: "Can I buy and sell crypto through WhatsApp?",
      answer:
        "Yes. Buy and sell crypto through a conversation you already know. Our WhatsApp AI assistant guides you from request to quote to completion.",
      chips: ["WhatsApp assistant"],
      draft: true,
    },
    {
      question: "What are the fees?",
      answer:
        "P2P marketplace: makers 0.3%, takers 0%. WhatsApp: 1%. For OTC, the rate, fee and what you receive are shown before you confirm.",
      chips: ["Makers 0.3%", "Takers 0%", "WhatsApp 1%"],
      draft: true,
    },
    {
      question: "What happens if something goes wrong?",
      answer:
        "Reach our team if you have a question or something needs a second look. Replies usually arrive within minutes, seven days a week.",
      chips: ["Support"],
      draft: true,
    },
    {
      question: "Where can I use the platform?",
      answer:
        "The platform is available on web, iOS, Android and WhatsApp. Availability varies by product and country.",
      chips: ["Web", "iOS", "Android", "WhatsApp"],
      draft: true,
    },
    {
      question: "How do I get started?",
      answer:
        "Launch the web app or download the app for iOS or Android, or start a conversation with our WhatsApp assistant.",
      chips: ["Launch app", "WhatsApp"],
      draft: true,
    },
  ] satisfies FaqItem[],
};

export const finalCta = {
  title: ["Your next move", "starts here."],
  body: "Trade peer-to-peer, request an OTC quote or buy crypto on WhatsApp. One account, the same clear rules.",
  cta: "Launch App",
  caption: "Web · iOS · Android",
  routes: {
    p2p: "P2P marketplace",
    otc: "OTC desk",
    whatsapp: "WhatsApp assistant",
    more: "More routes soon",
  },
};

export const footer = {
  title: ["One bridge.", "Every route."],
  cta: "Launch App",
  copyright: "© 2026 Ponte. All rights reserved.",
  tagline: "Money moves. Confidence stays.",
};
