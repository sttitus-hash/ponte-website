import { Button } from "@/components/ui/Button";
import { BrandLogoLarge, External } from "@/components/ui/icons";
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

export function Footer() {
  return (
    <footer id="footer" className="relative z-0 bg-black px-gutter pb-10 pt-6 lg:-mt-[32vh] lg:bg-transparent lg:pt-0">
      <div className="relative rounded-panel border border-white/[0.06] bg-card px-6 pb-8 pt-12 lg:px-12 lg:pb-6 lg:pt-[59px]">
        {/* Top row: cut-out wordmark · headline · CTA */}
        <div className="flex flex-col gap-10 lg:grid lg:grid-cols-[1fr_auto_auto] lg:items-start lg:gap-x-16">
          <Reveal>
            <BrandLogoLarge className="h-auto w-[240px] text-[#272727] lg:w-[402px]" />
          </Reveal>
          <RevealLines
            as="h2"
            lines={footer.title}
            className="text-h2 text-gradient-light lg:max-w-[326px] lg:pt-1"
            delay={1}
          />
          <Reveal index={2} className="lg:pt-[65px]">
            <Button href={links.app}>{footer.cta}</Button>
          </Reveal>
        </div>

        <hr className="my-10 border-divider lg:mb-10 lg:mt-[100px]" />

        <nav aria-label="Footer" className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-6">
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
                      {item.external ? (
                        <External className="mt-[3px] h-1 w-[7px] opacity-60 transition-opacity group-hover:opacity-100" />
                      ) : null}
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
    </footer>
  );
}
