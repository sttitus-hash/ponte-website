import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { asset } from "@/lib/asset";

/** 404 — mirrors the "This bridge leads nowhere." frame on the Dev Handoff page. */
export default function NotFound() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-5 text-center text-white">
      <div aria-hidden="true" className="absolute inset-0">
        <Image src={asset("/images/rays-poster.png")} alt="" fill sizes="100vw" className="object-cover opacity-70" />
        <div className="absolute inset-0 bg-[radial-gradient(70%_60%_at_50%_50%,transparent_20%,rgba(0,0,0,0.85)_100%)]" />
      </div>
      <div className="relative flex flex-col items-center">
        <p className="text-dot-88 text-lime">404</p>
        <h1 className="text-h2 mt-6">
          This bridge leads <span className="text-lime">nowhere.</span>
        </h1>
        <div className="mt-10">
          <Button href={asset("/")}>Back to home</Button>
        </div>
      </div>
    </section>
  );
}
