import { Faq } from "@/components/sections/Faq";
import { FinalCta } from "@/components/sections/FinalCta";
import { Hero } from "@/components/sections/Hero";
import { Products } from "@/components/sections/Products";
import { Story } from "@/components/sections/Story";
import { TrackRecord } from "@/components/sections/TrackRecord";
import { Trust } from "@/components/sections/Trust";

export default function HomePage() {
  return (
    <>
      <Hero />
      <TrackRecord />
      <Products />
      <Trust />
      <Story />
      <Faq />
      <FinalCta />
    </>
  );
}
