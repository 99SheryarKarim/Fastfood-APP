"use client";
import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";

/**
 * Soft red blurred circle that follows the mouse with a spring (desktop only).
 * Completely disabled on touch devices and coarse pointers.
 */
export function CursorGlow() {
  const shouldReduceMotion = useReducedMotion();
  const [isDesktop, setIsDesktop] = useState(false);

  const mouseX = useMotionValue(-300);
  const mouseY = useMotionValue(-300);

  const springConfig = { damping: 25, stiffness: 200, mass: 0.5 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  useEffect(() => {
    // Only enable on true desktop pointer devices with fine hover capability
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    setIsDesktop(mq.matches);

    const onMediaChange = (e) => setIsDesktop(e.matches);
    mq.addEventListener?.("change", onMediaChange);

    const onMouseMove = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    window.addEventListener("mousemove", onMouseMove);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      mq.removeEventListener?.("change", onMediaChange);
    };
  }, [mouseX, mouseY]);

  if (!isDesktop || shouldReduceMotion) return null;

  return (
    <motion.div
      aria-hidden="true"
      style={{
        x: smoothX,
        y: smoothY,
        translateX: "-50%",
        translateY: "-50%",
      }}
      className="pointer-events-none fixed left-0 top-0 z-30 h-80 w-80 rounded-full bg-king/20 blur-[110px]"
    />
  );
}

/**
 * Deterministic particles floating up behind the page.
 * Uses hardcoded values to prevent SSR/CSR hydration mismatch.
 * Touch / mobile devices run a lightweight subset (6 embers) to keep 60fps.
 */
const ALL_EMBERS = [
  { id: 1, left: "4%", size: 4, duration: 11, delay: 0, drift: 24, color: "#FF4757", opacity: 0.7 },
  { id: 2, left: "15%", size: 5, duration: 9.5, delay: 1.5, drift: 30, color: "#FF6B81", opacity: 0.75 },
  { id: 3, left: "33%", size: 2.5, duration: 15, delay: 4.4, drift: -15, color: "#FFA502", opacity: 0.5 },
  { id: 4, left: "49%", size: 5.5, duration: 9.8, delay: 1.1, drift: 35, color: "#FF4757", opacity: 0.85 },
  { id: 5, left: "69%", size: 4.5, duration: 10, delay: 0.4, drift: 32, color: "#FF4757", opacity: 0.75 },
  { id: 6, left: "89%", size: 4, duration: 11.8, delay: 2.3, drift: 21, color: "#FF4757", opacity: 0.7 },
  // Extra embers for desktop
  { id: 7, left: "9%", size: 3, duration: 14, delay: 3.2, drift: -18, color: "#FFA502", opacity: 0.6 },
  { id: 8, left: "21%", size: 3.5, duration: 13, delay: 5.1, drift: -25, color: "#FFA502", opacity: 0.55 },
  { id: 9, left: "27%", size: 4.5, duration: 10.5, delay: 0.8, drift: 20, color: "#FF4757", opacity: 0.8 },
  { id: 10, left: "38%", size: 4, duration: 12, delay: 2.1, drift: 22, color: "#FF6B81", opacity: 0.65 },
  { id: 11, left: "44%", size: 3, duration: 13.5, delay: 6.0, drift: -28, color: "#FFA502", opacity: 0.6 },
  { id: 12, left: "54%", size: 3, duration: 14.5, delay: 4.9, drift: -16, color: "#FFA502", opacity: 0.5 },
  { id: 13, left: "59%", size: 4, duration: 11.5, delay: 2.7, drift: 25, color: "#FF6B81", opacity: 0.7 },
  { id: 14, left: "64%", size: 2.5, duration: 16, delay: 7.2, drift: -20, color: "#FFA502", opacity: 0.55 },
  { id: 15, left: "74%", size: 3, duration: 12.8, delay: 3.8, drift: -22, color: "#FFA502", opacity: 0.65 },
  { id: 16, left: "79%", size: 5, duration: 10.2, delay: 1.9, drift: 28, color: "#FF6B81", opacity: 0.8 },
  { id: 17, left: "84%", size: 3.5, duration: 14.2, delay: 5.6, drift: -19, color: "#FFA502", opacity: 0.5 },
  { id: 18, left: "94%", size: 3, duration: 13.2, delay: 6.5, drift: -25, color: "#FFA502", opacity: 0.6 },
  { id: 19, left: "12%", size: 3.5, duration: 12.4, delay: 7.8, drift: 18, color: "#FF4757", opacity: 0.6 },
  { id: 20, left: "41%", size: 4.5, duration: 10.8, delay: 8.3, drift: -30, color: "#FF6B81", opacity: 0.7 },
  { id: 21, left: "62%", size: 3, duration: 15.2, delay: 8.9, drift: 22, color: "#FFA502", opacity: 0.55 },
  { id: 22, left: "82%", size: 4.5, duration: 11.2, delay: 9.4, drift: -24, color: "#FF4757", opacity: 0.75 },
];

export function RisingEmbers() {
  const shouldReduceMotion = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(pointer: coarse), (hover: none)");
    setIsMobile(mq.matches);
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener?.("change", handler);
    return () => mq.removeEventListener?.("change", handler);
  }, []);

  if (shouldReduceMotion) return null;

  const activeEmbers = isMobile ? ALL_EMBERS.slice(0, 6) : ALL_EMBERS;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {activeEmbers.map((e) => (
        <motion.span
          key={e.id}
          initial={{ y: "105vh", x: 0, opacity: 0 }}
          animate={{
            y: ["105vh", "-10vh"],
            x: [0, e.drift, 0],
            opacity: [0, e.opacity, e.opacity * 0.9, 0],
          }}
          transition={{
            duration: e.duration,
            delay: e.delay,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{
            left: e.left,
            width: e.size,
            height: e.size,
            backgroundColor: e.color,
            boxShadow: `0 0 ${e.size * 2}px ${e.color}`,
          }}
          className="absolute rounded-full"
        />
      ))}
    </div>
  );
}

/**
 * Tilted infinite marquee ticker between hero and menu
 */
const TICKER_ITEMS = [
  "Hot & Fresh",
  "Cheese Pull",
  "Urdu AI Ordering",
  "Pizza Fries",
  "Open 24/7",
];

export function MarqueeTicker() {
  const shouldReduceMotion = useReducedMotion();
  const repeated = [...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS];

  return (
    <div className="relative my-6 -rotate-1 overflow-hidden border-y border-white/10 bg-panel/80 py-2.5 backdrop-blur-md sm:my-8 sm:-rotate-2 sm:py-3">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-ink to-transparent sm:w-24" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-ink to-transparent sm:w-24" />

      <motion.div
        animate={shouldReduceMotion ? {} : { x: ["0%", "-50%"] }}
        transition={{
          repeat: Infinity,
          ease: "linear",
          duration: 20,
        }}
        className="flex w-max items-center gap-6 whitespace-nowrap will-change-transform sm:gap-8"
      >
        {repeated.map((item, idx) => (
          <span key={idx} className="flex items-center gap-4 font-display text-xs tracking-wider uppercase text-white/90 sm:gap-6 sm:text-base">
            <span className="text-cheese">👑</span>
            <span className={idx % 2 === 0 ? "text-white" : "text-cheese"}>{item}</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}

/**
 * Reusable scroll reveal wrapper (rise, fade, slight scale)
 */
export function ScrollReveal({ children, className = "" }) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 35, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.65, ease: [0.21, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Confetti burst using Framer Motion particles (deterministic)
 */
const CONFETTI_PARTICLES = Array.from({ length: 32 }, (_, i) => {
  const angle = (i / 32) * (Math.PI * 2);
  const distance = 80 + (i % 6) * 35;
  const x = Math.cos(angle) * distance;
  const y = Math.sin(angle) * distance + (i % 3) * 30;
  const colors = ["#FF4757", "#FFA502", "#FF6B81", "#FFF275", "#FFFFFF"];
  const color = colors[i % colors.length];
  const size = 6 + (i % 4) * 2;
  const rotate = (i * 45) % 360;
  return { id: i, x, y, color, size, rotate };
});

export function ConfettiBurst() {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-visible">
      {CONFETTI_PARTICLES.map((p) => (
        <motion.span
          key={p.id}
          initial={{ x: 0, y: 0, scale: 0, opacity: 1, rotate: 0 }}
          animate={{
            x: p.x,
            y: p.y,
            scale: [0, 1.2, 0.9, 0],
            opacity: [1, 1, 0.8, 0],
            rotate: [0, p.rotate + 360],
          }}
          transition={{
            duration: 1.4,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
          style={{
            position: "absolute",
            width: p.size,
            height: p.size * (p.id % 2 === 0 ? 1 : 1.6),
            backgroundColor: p.color,
            borderRadius: p.id % 3 === 0 ? "50%" : "2px",
          }}
        />
      ))}
    </div>
  );
}
