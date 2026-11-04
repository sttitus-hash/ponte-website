import { Button } from "@/components/ui/Button";
import { BlackHole } from "@/components/ui/BlackHole";
import { asset } from "@/lib/asset";

/** 404 — "This bridge leads nowhere." with the official black-hole shader behind it. */
export default function NotFound() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-5 text-center text-white lg:mb-[32vh]">
      <div aria-hidden="true" className="absolute inset-0">
        <BlackHole />
      </div>
      <div className="pointer-events-none relative flex flex-col items-center [&_a]:pointer-events-auto">
        <p className="text-dot-88 text-lime">404</p>
        <h1 className="text-h3 mt-6 max-w-[420px] lg:text-h2 lg:max-w-[520px]">
          This bridge leads <span className="text-lime">nowhere.</span>
        </h1>
        <div className="mt-10">
          <Button href={asset("/")}>Back to home</Button>
        </div>
      </div>
    </section>
  );
}
