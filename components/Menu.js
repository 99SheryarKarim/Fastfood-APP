"use client";
import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { categories, menu, fmt } from "@/lib/menu";
import { ScrollReveal } from "@/components/Effects";

function Card({ item, onAdd, i }) {
  const [added, setAdded] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const handleTilt = (e) => {
    if (shouldReduceMotion) return;
    // Turn off 3D tilt on touch devices
    if (
      typeof window !== "undefined" &&
      !window.matchMedia("(hover: hover) and (pointer: fine)").matches
    ) {
      return;
    }
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    e.currentTarget.style.transform = `perspective(900px) rotateY(${x * 16}deg) rotateX(${-y * 16}deg) scale(1.02)`;
  };

  const handleReset = (e) => {
    e.currentTarget.style.transform = "";
  };

  const handleAddToCart = () => {
    onAdd(item);
    setAdded(true);
    setTimeout(() => setAdded(false), 1000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ delay: i * 0.04 }}
      className="w-full"
    >
      <div
        onMouseMove={handleTilt}
        onMouseLeave={handleReset}
        className="glow-border rounded-3xl bg-panel p-5 sm:p-6 transition-transform duration-200 will-change-transform border border-white/5 shadow-lg hover:shadow-glow/20 flex flex-col justify-between h-full"
      >
        <div>
          <div className="flex h-32 sm:h-36 items-center justify-center rounded-2xl bg-gradient-to-br from-king/20 via-panel to-cheese/10 text-6xl sm:text-7xl">
            <motion.span
              whileHover={shouldReduceMotion ? {} : { scale: 1.2, rotate: 10 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="select-none"
            >
              {item.emoji}
            </motion.span>
          </div>

          <div className="mt-4 flex items-start justify-between gap-2">
            <h3 className="font-display text-lg sm:text-xl text-white leading-tight">
              {item.name}
            </h3>
            <span className="shrink-0 rounded-full bg-cheese px-2.5 py-1 text-xs sm:text-sm font-bold text-ink shadow-sm">
              {fmt(item.price)}
            </span>
          </div>

          <p className="mt-2 min-h-[40px] text-xs sm:text-sm text-white/60 leading-relaxed">
            {item.desc}
          </p>
        </div>

        <motion.button
          type="button"
          whileTap={{ scale: 0.94 }}
          onClick={handleAddToCart}
          className={`mt-4 w-full min-h-[44px] rounded-xl py-3 text-sm sm:text-base font-bold transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cheese ${
            added
              ? "bg-green-500 text-ink shadow-[0_0_20px_rgba(34,197,94,0.6)]"
              : "bg-king text-white hover:bg-ember shadow-glow/40 active:bg-ember"
          }`}
        >
          {added ? "Added to cart" : "Add to cart"}
        </motion.button>
      </div>
    </motion.div>
  );
}

export default function Menu({ onAdd }) {
  const [tab, setTab] = useState(categories[0]);

  return (
    <ScrollReveal className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-28">
      <section id="menu" aria-label="Menu">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
          <div>
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-cheese">
              Fresh from the oven
            </span>
            <h2 className="font-display text-3xl sm:text-5xl text-white">
              Pick your throne
            </h2>
          </div>
        </div>

        {/* Categories Tab list - Horizontally scrollable on mobile */}
        <div
          role="tablist"
          aria-label="Menu categories"
          className="mt-6 sm:mt-8 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none scroll-smooth -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap"
        >
          {categories.map((c) => (
            <button
              key={c}
              role="tab"
              aria-selected={tab === c}
              onClick={() => setTab(c)}
              className={`relative shrink-0 whitespace-nowrap min-h-[44px] rounded-full px-5 py-2.5 text-xs sm:text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-cheese ${
                tab === c
                  ? "text-ink font-bold"
                  : "text-white/70 hover:text-white"
              }`}
            >
              {tab === c && (
                <motion.span
                  layoutId="activeTabUnderline"
                  className="absolute inset-0 rounded-full bg-cheese shadow-cheese-glow/40"
                  transition={{ type: "spring", stiffness: 450, damping: 32 }}
                />
              )}
              <span className="relative z-10">{c}</span>
            </button>
          ))}
        </div>

        {/* Menu Cards Grid */}
        <div className="mt-8 sm:mt-10 grid gap-4 sm:gap-6 grid-cols-1 xs:grid-cols-2 lg:grid-cols-4">
          <AnimatePresence mode="popLayout">
            {menu[tab].map((item, i) => (
              <Card key={item.id} item={item} i={i} onAdd={onAdd} />
            ))}
          </AnimatePresence>
        </div>
      </section>
    </ScrollReveal>
  );
}
