"use client";

import Image from "next/image";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { useRef, useState } from "react";
import { Marker, Tag } from "@/components/ui/Primitives";
import { Reveal, RevealLines } from "@/components/ui/Reveal";
import { trackRecord } from "@/lib/content";
import { ease, viewportOnce } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const slides = trackRecord.slides;

/**
 * 02 Track record — two cards. On desktop the section pins for 4 viewports and
 * the right card steps through the four facts as the user scrolls (labels,
 * 3D object and figure crossfade). On mobile the right card is a swipeable slider.
 */
export function TrackRecord() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const next = Math.min(slides.length - 1, Math.max(0, Math.floor(v * slides.length)));
    if (next !== index) setIndex(next);
  });

  return (
    <section
      ref={ref}
      id="about"
      aria-labelledby="track-title"
      className="relative bg-near-black lg:h-[400vh]"
    >
      <div className="px-gutter py-10 lg:sticky lg:top-0 lg:flex lg:h-screen lg:items-center">
        <div className="grid w-full gap-[10px] lg:grid-cols-2 lg:[height:min(755px,calc(100vh-80px))]">
          {/* Left — mint card -------------------------------------------- */}
          <motion.div
            className="relative flex flex-col justify-between overflow-hidden rounded-panel bg-mint p-6 text-black sm:p-10 lg:p-[39px]"
            initial={reduce ? false : { opacity: 0, y: 48 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewportOnce}
            transition={{ duration: 0.8, ease: ease.out }}
          >
            <div className="flex items-start justify-between">
              <Tag>{trackRecord.tag}</Tag>
            </div>

            {/* Escrow loops — the line draws itself in */}
            <div className="pointer-events-none absolute right-0 top-[27px] hidden w-[57%] text-forest lg:block">
              <DrawnLoops />
              <Marker className="absolute bottom-[-2px] left-[-10px] bg-forest" />
            </div>
            <div className="relative mt-8 w-[70%] text-forest lg:hidden">
              <DrawnLoops />
            </div>

            <div className="mt-10 lg:mt-0">
              <RevealLines
                id="track-title"
                as="h2"
                lines={trackRecord.title}
                className="text-h2 max-w-[623px]"
              />
              <Reveal as="p" index={2} className="mt-6 max-w-[520px] text-body-l lg:mt-[22px]">
                {trackRecord.body}
              </Reveal>
            </div>
          </motion.div>

          {/* Right — lime card ------------------------------------------- */}
          <motion.div
            className="on-lime relative overflow-hidden rounded-panel bg-lime text-ink"
            initial={reduce ? false : { opacity: 0, y: 48 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewportOnce}
            transition={{ duration: 0.8, ease: ease.out, delay: 0.1 }}
          >
            {/* Desktop: scroll-driven */}
            <div className="hidden h-full lg:block">
              <SlideCard index={index} />
            </div>
            {/* Mobile: swipeable */}
            <MobileSlider />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */

function DrawnLoops() {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : "hidden"}
      whileInView="show"
      viewport={viewportOnce}
      className="[&_path]:[stroke-dasharray:1] [&_path]:[stroke-dashoffset:0]"
    >
      <motion.svg
        viewBox="0 0 394 257"
        className="h-auto w-full"
        fill="none"
        aria-hidden="true"
      >
        <motion.path
          d={LOOPS_PATH}
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          pathLength={1}
          variants={{
            hidden: { pathLength: 0, opacity: 0 },
            show: { pathLength: 1, opacity: 1, transition: { duration: 2.2, ease: ease.inOut, delay: 0.2 } },
          }}
        />
      </motion.svg>
    </motion.div>
  );
}

/** Slide content for the lime card; animated by `key` on index change. */
function SlideCard({ index }: { index: number }) {
  const reduce = useReducedMotion();
  const slide = slides[index];
  const fade = {
    initial: reduce ? { opacity: 0 } : { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    exit: reduce ? { opacity: 0 } : { opacity: 0, y: -12 },
  };

  return (
    <div className="relative flex h-full flex-col justify-between p-6 sm:p-10 lg:p-[39px]">
      <div className="flex items-start justify-between text-mono-16 text-moss" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span key={`tl-${index}`} {...fade} transition={{ duration: 0.35 }}>
            {slide.topLeft}
          </motion.span>
        </AnimatePresence>
        <AnimatePresence mode="wait" initial={false}>
          <motion.span key={`tr-${index}`} {...fade} transition={{ duration: 0.35 }} className="text-right">
            {slide.topRight}
          </motion.span>
        </AnimatePresence>
      </div>

      <div className="relative mx-auto flex w-[56%] max-w-[424px] flex-1 items-center justify-center py-6">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={`img-${index}`}
            className="w-full"
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.9, rotate: -4 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.94, rotate: 4 }}
            transition={{ duration: 0.55, ease: ease.out }}
          >
            <Image
              src={slide.image}
              alt={slide.alt}
              width={848}
              height={822}
              sizes="(min-width: 1024px) 424px, 60vw"
              className="h-auto w-full"
            />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-end justify-between gap-6">
        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={`cap-${index}`}
            {...fade}
            transition={{ duration: 0.35 }}
            className="flex items-center gap-2 text-mono-16 text-moss"
          >
            <Marker color="bg-forest" />
            {slide.caption}
          </motion.p>
        </AnimatePresence>
        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={`fig-${index}`}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -10 }}
            transition={{ duration: 0.45, ease: ease.out }}
            className="text-dot-88 whitespace-nowrap text-[#333333]"
          >
            {slide.figure}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* step indicator — desktop only */}
      <ol className="absolute bottom-[42px] left-1/2 hidden -translate-x-1/2 gap-1.5 lg:flex" aria-label="Slide">
        {slides.map((s, i) => (
          <li
            key={s.topLeft}
            aria-current={i === index ? "step" : undefined}
            className={`h-1 rounded-full transition-all duration-500 ${i === index ? "w-6 bg-ink" : "w-2 bg-ink/25"}`}
          />
        ))}
      </ol>
    </div>
  );
}

function MobileSlider() {
  const [index, setIndex] = useState(0);
  const go = (dir: number) => setIndex((i) => Math.min(slides.length - 1, Math.max(0, i + dir)));

  return (
    <div className="relative lg:hidden">
      <motion.div
        className="min-h-[520px] cursor-grab active:cursor-grabbing"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={(_, info) => {
          if (info.offset.x < -60) go(1);
          else if (info.offset.x > 60) go(-1);
        }}
      >
        <SlideCard index={index} />
      </motion.div>

      <div className="flex items-center justify-between px-6 pb-6">
        <div className="relative h-px flex-1 bg-ink/20">
          <motion.div
            className="absolute inset-y-0 left-0 bg-ink"
            animate={{ width: `${((index + 1) / slides.length) * 100}%` }}
            transition={{ duration: 0.4, ease: ease.out }}
          />
        </div>
        <div className="ml-5 flex gap-2">
          <SliderButton label="Previous" onClick={() => go(-1)} disabled={index === 0} flip />
          <SliderButton label="Next" onClick={() => go(1)} disabled={index === slides.length - 1} />
        </div>
      </div>
    </div>
  );
}

function SliderButton({
  label,
  onClick,
  disabled,
  flip,
}: {
  label: string;
  onClick: () => void;
  disabled: boolean;
  flip?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="flex size-9 items-center justify-center rounded-full bg-ink text-lime disabled:opacity-30"
    >
      <svg width="7" height="12" viewBox="0 0 7 12" fill="none" aria-hidden="true" className={flip ? "rotate-180" : ""}>
        <path d="M0.5 0.5 6 6 0.5 11.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    </button>
  );
}

const LOOPS_PATH =
  "M0.776855 249.719L3.32864 247.57L5.81328 245.018L8.29792 242.265L10.7154 239.109L13.0657 235.751L15.4161 232.058L17.6321 228.096L19.8481 223.933L21.9298 219.433L24.0116 214.733L25.959 209.831L27.9064 204.66L29.6524 199.288L31.3983 193.781L33.0771 188.073L34.6216 182.231L36.0318 176.187L37.442 170.076L38.6508 163.831L39.8595 157.519L40.9339 151.072L41.8741 144.626L42.7471 138.112L43.4857 131.598L44.1573 125.017L44.6945 118.503L45.1645 111.99L45.5003 105.543L45.7689 99.0964L45.9032 92.7841L45.9704 86.5389L45.9032 80.4281L45.7689 74.3843L45.5003 68.5421L45.2317 62.8341L44.8288 57.3277L44.2916 51.9555L43.7543 46.8519L43.0828 41.8826L42.3441 37.2491L41.5383 32.7499L40.6653 28.5193L39.7252 24.6245L38.7179 20.9311L37.6435 17.5735L36.569 14.4173L35.4275 11.6641L34.2187 9.17944L33.01 6.96341L31.7341 5.1503L30.4582 3.6058L29.1823 2.39706L27.8392 1.52408L26.4962 0.986857L25.1532 0.7854L23.8101 0.919705L22.4671 1.38977L21.124 2.1956L19.8481 3.33719L18.5722 4.81454L17.2963 6.5605L16.0876 8.70937L14.8788 11.1269L13.6701 13.8801L12.5957 16.902L11.5212 20.1924L10.5139 23.8186L9.57381 27.7135L8.70083 31.8769L7.895 36.309L7.08917 40.9425L6.41765 45.8446L5.88043 50.9482L5.34321 56.1861L4.87315 61.6926L4.53739 67.4005L4.33593 73.1756L4.13447 79.1522L4.06732 85.263L4.13447 91.5082L4.26878 97.8205L4.47023 104.2L4.80599 110.647L5.20891 117.16L5.74613 123.674L6.41765 130.255L7.15633 136.769L7.96215 143.283L8.90229 149.796L9.97672 156.176L11.1183 162.555L12.3942 168.801L13.6701 174.979L15.1475 181.022L16.692 186.864L18.3036 192.64L19.9824 198.213L21.7955 203.585L23.6758 208.756L25.6232 213.725L27.6378 218.493L29.7867 222.992L31.9355 227.29L34.1516 231.252L36.5019 235.013L38.8522 238.437L41.2697 241.661L43.6872 244.481L46.1718 247.033L48.7236 249.316L51.2754 251.196L53.8943 252.808L56.5133 254.084L59.1322 255.024L61.8183 255.696L64.4373 255.964L67.1234 255.897L69.7423 255.494L72.4284 254.755L75.0473 253.681L77.6663 252.338L80.2181 250.592L82.7698 248.577L85.3216 246.227L87.8063 243.541L90.2238 240.586L92.6412 237.296L94.9244 233.737L97.2076 229.909L99.4236 225.813L101.573 221.448L103.654 216.882L105.669 212.047L107.616 207.01L109.496 201.772L111.242 196.266L112.921 190.692L114.466 184.85L116.01 178.941L117.42 172.83L118.696 166.652L119.905 160.339L121.047 153.96L122.054 147.513L122.927 141.067L123.733 134.486L124.471 127.972L125.076 121.458L125.546 114.877L125.949 108.431L126.217 101.984L126.419 95.6045L126.553 89.3593V83.1813L126.419 77.0704L126.217 71.161L125.949 65.3859L125.546 59.8123L125.143 54.373L124.606 49.1351L123.934 44.0986L123.263 39.2637L122.457 34.6973L121.651 30.3996L120.711 26.3704L119.771 22.5428L118.696 19.0508L117.622 15.8275L116.547 12.8728L115.339 10.2539L114.13 7.90355L112.921 5.95613L111.645 4.27732L110.302 2.86712L109.026 1.85984L107.683 1.18831L106.34 0.852553H104.997L103.654 1.12116L102.311 1.79269L101.035 2.79997L99.6922 4.07586L98.4163 5.75467L97.2076 7.70209L95.9989 9.98527L94.7901 12.6042L93.6485 15.4918L92.5741 18.7151L91.5668 22.207L90.5595 25.9675L89.6865 29.9967L88.8136 34.2944L88.0077 38.7936L87.3362 43.6286L86.6647 48.5979L86.1275 53.8357L85.6574 59.2079L85.2545 64.7816L84.9859 70.5567L84.7844 76.4661L84.7173 82.5098L84.6501 88.6878L84.7844 94.933L84.9187 101.312L85.2545 107.759L85.5902 114.273L86.1275 120.787L86.6647 127.3L87.4034 133.881L88.2092 140.395L89.0822 146.909L90.0894 153.355L91.1639 159.735L92.3726 166.047L93.6485 172.225L95.0587 178.336L96.5361 184.246L98.1477 190.088L99.8265 195.729L101.573 201.168L103.386 206.473L105.333 211.509L107.348 216.412L109.362 221.045L111.511 225.41L113.727 229.506L116.01 233.401L118.361 236.96L120.711 240.251L123.196 243.272L125.613 245.959L128.165 248.309L130.717 250.391L133.268 252.137L135.887 253.547L138.506 254.688L141.192 255.427L143.811 255.83L146.497 255.964L149.116 255.696L151.802 255.158L154.421 254.218L157.04 253.01L159.659 251.398L162.211 249.518L164.763 247.302L167.247 244.75L169.732 241.929L172.15 238.773L174.5 235.348L176.783 231.655L179.066 227.693L181.215 223.463L183.364 218.963L185.379 214.263L187.326 209.293L189.206 204.123L191.019 198.75L192.765 193.177L194.377 187.469L195.922 181.627L197.332 175.583L198.742 169.472L199.951 163.227L201.092 156.847L202.167 150.468L203.107 143.954L203.98 137.44L204.718 130.927L205.39 124.346L205.927 117.832L206.33 111.318L206.666 104.871L206.934 98.492L207.069 92.1126L207.136 85.9345L207.069 79.8237L206.934 73.78L206.666 67.9377L206.33 62.2969L205.927 56.7904L205.39 51.4183L204.853 46.3147L204.181 41.4126L203.443 36.779L202.637 32.347L201.697 28.1164L200.756 24.2216L199.749 20.5953L198.742 17.2377L197.6 14.1487L196.459 11.3955L195.25 8.91083L194.041 6.76196L192.765 4.94884L191.489 3.47149L190.214 2.26275L188.871 1.45692L187.527 0.986857L186.184 0.7854L184.841 0.986857L183.498 1.45692L182.155 2.26275L180.879 3.47149L179.604 4.94884L178.328 6.76196L177.119 8.91083L175.91 11.3955L174.769 14.1487L173.627 17.2377L172.62 20.5953L171.612 24.2216L170.672 28.1164L169.732 32.347L168.926 36.779L168.188 41.4126L167.516 46.3147L166.979 51.4183L166.442 56.7904L166.039 62.2969L165.703 67.9377L165.434 73.78L165.3 79.8237L165.233 85.9345L165.3 92.1126L165.434 98.492L165.703 104.871L166.039 111.318L166.442 117.832L166.979 124.346L167.65 130.927L168.389 137.44L169.262 143.954L170.202 150.468L171.277 156.847L172.418 163.227L173.627 169.472L175.037 175.583L176.447 181.627L177.992 187.469L179.604 193.177L181.349 198.75L183.163 204.123L185.043 209.293L186.99 214.263L189.005 218.963L191.154 223.463L193.303 227.693L195.586 231.655L197.869 235.348L200.219 238.773L202.637 241.929L205.121 244.75L207.606 247.302L210.158 249.518L212.71 251.398L215.329 253.01L217.947 254.218L220.566 255.158L223.253 255.696L225.871 255.964L228.558 255.83L231.176 255.427L233.863 254.688L236.482 253.547L239.1 252.137L241.652 250.391L244.204 248.309L246.756 245.959L249.173 243.272L251.658 240.251L254.008 236.96L256.359 233.401L258.642 229.506L260.858 225.41L263.007 221.045L265.021 216.412L267.036 211.509L268.983 206.473L270.796 201.168L272.542 195.729L274.221 190.088L275.833 184.246L277.31 178.336L278.72 172.225L279.996 166.047L281.205 159.735L282.279 153.355L283.287 146.909L284.16 140.395L284.966 133.881L285.704 127.3L286.241 120.787L286.779 114.273L287.114 107.759L287.45 101.312L287.584 94.933L287.719 88.6878L287.652 82.5098L287.584 76.4661L287.383 70.5567L287.114 64.7816L286.711 59.2079L286.241 53.8357L285.704 48.5979L285.033 43.6286L284.361 38.7936L283.555 34.2944L282.682 29.9967L281.809 25.9675L280.802 22.207L279.795 18.7151L278.72 15.4918L277.579 12.6042L276.37 9.98527L275.161 7.70209L273.953 5.75467L272.677 4.07586L271.334 2.79997L270.058 1.79269L268.715 1.12116L267.372 0.852553H266.029L264.686 1.18831L263.342 1.85984L262.067 2.86712L260.724 4.27732L259.448 5.95613L258.239 7.90355L257.03 10.2539L255.821 12.8728L254.747 15.8275L253.673 19.0508L252.598 22.5428L251.658 26.3704L250.718 30.3996L249.912 34.6973L249.106 39.2637L248.435 44.0986L247.763 49.1351L247.226 54.373L246.823 59.8123L246.42 65.3859L246.151 71.161L245.95 77.0704L245.816 83.1813V89.3593L245.95 95.6045L246.151 101.984L246.42 108.431L246.823 114.877L247.293 121.458L247.897 127.972L248.636 134.486L249.442 141.067L250.315 147.513L251.322 153.96L252.464 160.339L253.673 166.652L254.948 172.83L256.359 178.941L257.903 184.85L259.448 190.692L261.126 196.266L262.872 201.772L264.753 207.01L266.7 212.047L268.715 216.882L270.796 221.448L272.945 225.813L275.161 229.909L277.444 233.737L279.728 237.296L282.145 240.586L284.563 243.541L287.047 246.227L289.599 248.577L292.151 250.592L294.703 252.338L297.322 253.681L299.94 254.755L302.627 255.494L305.246 255.897L307.932 255.964L310.551 255.696L313.237 255.024L315.856 254.084L318.475 252.808L321.093 251.196L323.645 249.316L326.197 247.033L328.682 244.481L331.099 241.661L333.517 238.437L335.867 235.013L338.217 231.252L340.433 227.29L342.582 222.992L344.731 218.493L346.746 213.725L348.693 208.756L350.573 203.585L352.386 198.213L354.065 192.64L355.677 186.864L357.221 181.022L358.699 174.979L359.975 168.801L361.251 162.555L362.392 156.176L363.467 149.796L364.407 143.283L365.213 136.769L365.951 130.255L366.623 123.674L367.16 117.16L367.563 110.647L367.899 104.2L368.1 97.8205L368.234 91.5082L368.302 85.263L368.234 79.1522L368.033 73.1756L367.831 67.4005L367.496 61.6926L367.026 56.1861L366.488 50.9482L365.951 45.8446L365.28 40.9425L364.474 36.309L363.668 31.8769L362.795 27.7135L361.855 23.8186L360.848 20.1924L359.773 16.902L358.699 13.8801L357.49 11.1269L356.281 8.70937L355.073 6.5605L353.797 4.81454L352.521 3.33719L351.245 2.1956L349.902 1.38977L348.559 0.919705L347.216 0.7854L345.873 0.986857L344.53 1.52408L343.187 2.39706L341.911 3.6058L340.635 5.1503L339.359 6.96341L338.15 9.17944L336.941 11.6641L335.8 14.4173L334.725 17.5735L333.651 20.9311L332.644 24.6245L331.704 28.5193L330.831 32.7499L330.025 37.2491L329.286 41.8826L328.615 46.8519L328.077 51.9555L327.54 57.3277L327.137 62.8341L326.869 68.5421L326.6 74.3843L326.466 80.4281L326.398 86.5389L326.466 92.7841L326.6 99.0964L326.869 105.543L327.204 111.99L327.674 118.503L328.212 125.017L328.883 131.598L329.622 138.112L330.495 144.626L331.435 151.072L332.509 157.519L333.718 163.831L334.927 170.076L336.337 176.187L337.747 182.231L339.292 188.073L340.971 193.781L342.717 199.288L344.462 204.66L346.41 209.831L348.357 214.733L350.439 219.433L352.521 223.933L354.737 228.096L356.953 232.058L359.303 235.751L361.653 239.109L364.071 242.265L366.556 245.018L369.04 247.57L371.592 249.719C374.192 251.741 380.991 255.785 385.391 255.785";
