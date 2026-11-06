import { Faq } from "@/components/sections/Faq";
import { FinalCta } from "@/components/sections/FinalCta";
import { Hero } from "@/components/sections/Hero";
import { Journey } from "@/components/sections/Journey";
import { Story } from "@/components/sections/Story";
import { Trust } from "@/components/sections/Trust";

export default function HomePage() {
  return (
    <>
      <Hero />
      {/* 02 About → 03 P2P → 04 OTC → 05 WhatsApp: one pinned journey on desktop */}
      <Journey />
      <Trust />
      <Story />
      <Faq />
      <FinalCta />
    </>
  );
}
