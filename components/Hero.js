"use client";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";

const floaters = [
  { e: "🍕", cls: "left-[4%] top-[14%] sm:left-[6%] sm:top-[18%] text-5xl sm:text-7xl lg:text-8xl", d: 0, depth: -120 },
  { e: "🍔", cls: "right-[4%] top-[18%] sm:right-[8%] sm:top-[22%] text-4xl sm:text-6xl lg:text-7xl", d: 0.6, depth: -200 },
  { e: "🍟", cls: "left-[8%] bottom-[12%] sm:left-[14%] sm:bottom-[14%] text-4xl sm:text-5xl lg:text-6xl", d: 1.2, depth: -60 },
  { e: "🧀", cls: "right-[8%] bottom-[14%] sm:right-[16%] sm:bottom-[18%] text-5xl sm:text-6xl lg:text-7xl", d: 0.3, depth: -160 },
];

function Floater({ f, scrollY }) {
  const shouldReduceMotion = useReducedMotion();
  const y = useTransform(scrollY, [0, 600], [0, f.depth]);

  return (
    <motion.span
      aria-hidden="true"
      style={shouldReduceMotion ? {} : { y }}
      className={`absolute select-none pointer-events-none drop-shadow-[0_20px_30px_rgba(255,71,87,.4)] ${f.cls}`}
    >
      <motion.span
        className="block"
        animate={shouldReduceMotion ? {} : { y: [0, -18, 0], rotate: [-6, 6, -6] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: f.d }}
      >
        {f.e}
      </motion.span>
    </motion.span>
  );
}

export default function Hero({ onOpenVoice }) {
  const { scrollY } = useScroll();
  const shouldReduceMotion = useReducedMotion();
  const y1 = useTransform(scrollY, [0, 600], [0, 120]);

  return (
    <section className="relative flex min-h-[90vh] sm:min-h-screen items-center justify-center overflow-hidden px-4 sm:px-6 pt-24 pb-12">
      <motion.div
        aria-hidden="true"
        style={shouldReduceMotion ? {} : { y: y1 }}
        className="absolute left-1/2 top-1/2 h-[380px] w-[380px] sm:h-[620px] sm:w-[620px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-king/25 blur-[100px] sm:blur-[130px]"
      />

      {floaters.map((f) => (
        <Floater key={f.e} f={f} scrollY={scrollY} />
      ))}

      <div className="relative z-10 max-w-4xl text-center w-full">
        <motion.h1
          initial={{ opacity: 0, y: 30, rotateX: -20 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{ perspective: 800 }}
          className="font-display text-4xl leading-[1.08] xs:text-5xl sm:text-7xl lg:text-8xl text-white"
        >
          The King of{" "}
          <span className="bg-gradient-to-r from-king via-cheese to-king bg-[length:200%_auto] bg-clip-text text-transparent animate-shimmer inline-block">
            Crust
          </span>{" "}
          &amp; Flavor
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mx-auto mt-4 sm:mt-6 max-w-xl text-sm sm:text-lg text-white/70 px-2"
        >
          Hand-stretched dough, molten cheese and bold toppings, hot at your door.
          Order online or just say it in Urdu.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 w-full max-w-xs sm:max-w-none mx-auto"
        >
          <motion.a
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
            href="#menu"
            className="flex min-h-[48px] items-center justify-center rounded-full bg-gradient-to-r from-king to-ember px-7 py-3.5 font-bold text-white shadow-glow animate-pulse-glow text-center text-sm sm:text-base"
          >
            Order Now
          </motion.a>

          {/* Hero button must be a <button>, not an anchor */}
          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
            onClick={onOpenVoice}
            className="flex min-h-[48px] items-center justify-center rounded-full border-2 border-cheese px-7 py-3.5 font-bold text-cheese hover:bg-cheese/10 active:bg-cheese/20 text-center text-sm sm:text-base focus-visible:outline focus-visible:outline-2 focus-visible:outline-cheese"
          >
            Test AI Voice Assistant
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
