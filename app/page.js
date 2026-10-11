"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import Hero from "@/components/Hero";
import Menu from "@/components/Menu";
import VoiceBanner from "@/components/VoiceBanner";
import CheckoutModal from "@/components/CheckoutModal";
import VoiceCall from "@/components/VoiceCall";
import { CursorGlow, RisingEmbers, MarqueeTicker } from "@/components/Effects";

export default function Home() {
  const [cart, setCart] = useState([]);
  const [open, setOpen] = useState(false);
  const [voice, setVoice] = useState(false);

  const add = (item) =>
    setCart((c) =>
      c.find((i) => i.id === item.id)
        ? c.map((i) => (i.id === item.id ? { ...i, qty: i.qty + 1 } : i))
        : [...c, { ...item, qty: 1 }]
    );

  const setQty = (id, q) =>
    setCart((c) =>
      c.map((i) => (i.id === id ? { ...i, qty: q } : i)).filter((i) => i.qty > 0)
    );

  const count = cart.reduce((s, i) => s + i.qty, 0);

  return (
    <main className="relative min-h-screen w-full overflow-x-hidden bg-ink text-[#f5f0e8]">
      {/* Background Ambience Effects */}
      <RisingEmbers />
      <CursorGlow />

      {/* Navigation - Responsive & Safe Area Padded */}
      <nav className="fixed inset-x-0 top-0 z-40 flex items-center justify-between border-b border-white/5 bg-ink/80 px-3.5 py-2.5 sm:px-6 sm:py-3.5 backdrop-blur-md pt-[max(0.625rem,env(safe-area-inset-top))]">
        <a
          href="#"
          className="font-display text-base xs:text-lg sm:text-xl tracking-wide text-white hover:text-cheese transition-colors shrink-0"
        >
          👑 Pizza King
        </a>

        <div className="flex items-center gap-2 xs:gap-4 sm:gap-6 text-xs xs:text-sm font-semibold">
          <a
            href="#menu"
            className="text-white/80 transition-colors hover:text-cheese hidden xs:inline-block"
          >
            Menu
          </a>

          <button
            type="button"
            onClick={() => setVoice(true)}
            className="flex min-h-[44px] items-center gap-1.5 px-2 py-1.5 text-white/80 transition-colors hover:text-cheese focus-visible:outline focus-visible:outline-2 focus-visible:outline-cheese"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cheese opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-cheese" />
            </span>
            <span>Voice AI</span>
          </button>

          <motion.button
            key={count}
            type="button"
            animate={count > 0 ? { scale: [1, 1.2, 0.95, 1] } : { scale: 1 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            onClick={() => setOpen(true)}
            aria-label={`Shopping Cart with ${count} items`}
            className="flex min-h-[44px] items-center rounded-full bg-king px-3.5 py-1.5 xs:px-5 font-bold text-white shadow-glow transition hover:bg-ember focus-visible:outline focus-visible:outline-2 focus-visible:outline-cheese"
          >
            Cart ({count})
          </motion.button>
        </div>
      </nav>

      {/* Hero Section */}
      <Hero onOpenVoice={() => setVoice(true)} />

      {/* Tilted Infinite Marquee Ticker */}
      <MarqueeTicker />

      {/* Menu Section */}
      <Menu onAdd={add} />

      {/* Voice Assistant Banner Section */}
      <VoiceBanner
        onOpenVoice={() => setVoice(true)}
        onDemo={() => setOpen(true)}
      />

      {/* Footer */}
      <footer className="border-t border-white/5 px-6 py-12 text-center text-xs sm:text-sm text-white/40 pb-[max(3rem,env(safe-area-inset-bottom))]">
        © Pizza King. Frontend demo only, no live orders are processed.
      </footer>

      {/* Checkout Modal */}
      <CheckoutModal
        open={open}
        onClose={() => setOpen(false)}
        cart={cart}
        setQty={setQty}
        onClear={() => setCart([])}
      />

      {/* Vapi AI Voice Assistant Modal */}
      <VoiceCall open={voice} onClose={() => setVoice(false)} />
    </main>
  );
}
