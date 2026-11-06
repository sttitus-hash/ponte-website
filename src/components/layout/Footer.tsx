import { Button } from "@/components/ui/Button";
import { BrandLogoLarge, External } from "@/components/ui/icons";
import { LightBridge } from "@/components/ui/LightBridge";
import { Marker } from "@/components/ui/Primitives";
import { Reveal, RevealLines } from "@/components/ui/Reveal";
import { footer } from "@/lib/content";
import { externalProps, links } from "@/lib/site";

type FooterLink = { label: string; href: string; external?: boolean };
const columns: { heading: string; items: FooterLink[] }[] = [
  {
    heading: "Products",
    items: [
      { label: "P2P Trading", href: "#p2p" },
      { label: "OTC Trading", href: "#otc" },
      { label: "WhatsApp Ramp", href: "#whatsapp" },
    ],
  },
  {
    heading: "Company",
    items: [
      { label: "About", href: "#about" },
      { label: "Contact", href: links.contact },
      { label: "Support", href: links.support },
    ],
  },
  {
    heading: "Resources",
    items: [
      { label: "FAQs", href: "#faq" },
      { label: "Help Centre", href: links.helpCentre },
    ],
  },
  {
    heading: "Legal",
    items: [
      { label: "Terms", href: links.terms },
      { label: "Policy", href: links.privacy },
      { label: "Risk Disclosure", href: links.riskDisclosure },
    ],
  },
  {
    heading: "Connect",
    items: [
      { label: "X", href: links.x, external: true },
      { label: "Telegram", href: links.telegram, external: true },
    ],
  },
  {
    heading: "Get the app",
    items: [
      { label: "App Store", href: links.appStore },
      { label: "Google Play", href: links.googlePlay },
    ],
  },
];

/**
 * 09 Footer plate. Desktop: fixed beneath the page (`sticky bottom-0` under `main`), so the
 * final CTA scrolls up and reveals it (row 34). Mobile: the plate sits on the gradient with
 * 8px side margins, a full-width button and no external arrows (row 55).
 */
export function Footer() {
  return (
    <footer id="footer" className="relative z-0 bg-black lg:sticky lg:bottom-0">
      {/* Mobile gradient behind the plate (Figma mobile footer background) */}
      <div aria-hidden="true" className="absolute inset-0 overflow-hidden lg:hidden">
        <LightBridge className="absolute inset-0" params={{ uZoom: 1.8, uOffY: 0.15, uExpo: 0.3 }} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/30 to-black/80" />
      </div>

      <div className="relative px-2 pb-2 pt-0 lg:px-gutter lg:pb-10 lg:pt-6">
        <div className="relative rounded-panel border border-white/[0.06] bg-card px-5 pb-6 pt-[140px] lg:px-12 lg:pb-6 lg:pt-[59px]">
          {/* Top row: cut-out wordmark · headline (from the plate's centre) · CTA */}
          <div className="flex flex-col gap-8 lg:grid lg:grid-cols-[1fr_1fr_auto] lg:items-start lg:gap-x-8">
            <Reveal className="max-lg:absolute max-lg:left-5 max-lg:top-8">
              <BrandLogoLarge className="h-auto w-[240px] text-[#272727] lg:w-[402px]" />
            </Reveal>
            <RevealLines as="h2" lines={footer.title} className="text-h2 text-gradient-light lg:max-w-[326px] lg:pt-1" delay={1} />
            <Reveal index={2} className="lg:pt-[65px]">
              <Button href={links.app} className="max-lg:w-full max-lg:justify-between">
                {footer.cta}
              </Button>
            </Reveal>
          </div>

          <hr className="my-10 border-divider lg:mb-10 lg:mt-[100px]" />

          <nav aria-label="Footer" className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-6">
            {columns.map((col) => (
              <div key={col.heading}>
                <h3 className="text-mono-12 text-grey">{col.heading}</h3>
                <ul className="mt-6 flex flex-col gap-[14px]">
                  {col.items.map((item) => (
                    <li key={item.label}>
                      <a
                        href={item.href}
                        {...externalProps(item.href)}
                        className="group inline-flex items-start gap-1.5 text-mono-16 normal-case text-cream transition-colors duration-300 hover:text-lime"
                      >
                        <span>{item.label}</span>
                        {item.external ? <External className="mt-[3px] hidden h-1 w-[7px] opacity-60 transition-opacity group-hover:opacity-100 lg:block" /> : null}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>

          <hr className="mb-5 mt-12 border-divider lg:mt-[100px]" />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-mono-12 normal-case tracking-normal text-grey">{footer.copyright}</p>
            <p className="flex items-center gap-2 text-mono-12 normal-case tracking-normal text-grey">
              <Marker size={8} />
              {footer.tagline}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
