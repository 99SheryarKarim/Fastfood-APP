"use client";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fmt } from "@/lib/menu";
import { ConfettiBurst } from "@/components/Effects";

// text-base on mobile prevents iOS Safari from automatically zooming in on inputs!
const input =
  "w-full rounded-xl border border-white/10 bg-ink px-4 py-3 text-base sm:text-sm text-white outline-none focus:border-cheese transition-colors min-h-[44px]";

export default function CheckoutModal({ open, onClose, cart, setQty, onClear }) {
  const [form, setForm] = useState({ name: "", phone: "", address: "" });
  const [done, setDone] = useState(null);

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const valid =
    form.name.trim() &&
    /^[0-9+\-\s]{10,}$/.test(form.phone) &&
    form.address.trim() &&
    cart.length;

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const close = useCallback(() => {
    setDone(null);
    onClose();
  }, [onClose]);

  const submit = (e) => {
    e.preventDefault();
    setDone("PK-" + Math.floor(1000 + Math.random() * 9000));
    onClear();
  };

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, close]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={close}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Checkout"
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.9, y: 25, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 25, opacity: 0 }}
            transition={{ type: "spring", damping: 26, stiffness: 320 }}
            className="relative max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-3xl border border-white/10 bg-panel p-5 sm:p-7 shadow-glow"
          >
            {done ? (
              <div className="relative py-6 sm:py-8 text-center">
                {/* Confetti burst on successful order placement */}
                <ConfettiBurst />

                <div className="text-5xl sm:text-6xl animate-bounce">👑</div>
                <h3 className="mt-3 sm:mt-4 font-display text-2xl sm:text-3xl text-white">
                  Order placed
                </h3>
                <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-white/70">
                  Order <strong className="text-cheese">{done}</strong> is confirmed.
                  This is a simulation, so nothing was sent anywhere.
                </p>
                <button
                  type="button"
                  onClick={close}
                  className="mt-6 sm:mt-8 min-h-[44px] rounded-full bg-king px-8 py-3.5 font-bold text-white shadow-glow hover:bg-ember active:bg-ember transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-cheese"
                >
                  Back to menu
                </button>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-3.5 sm:space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-xl sm:text-2xl text-white">
                    Your order
                  </h3>
                  <button
                    type="button"
                    onClick={close}
                    aria-label="Close checkout modal"
                    className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-2xl text-white/60 hover:bg-white/10 hover:text-white transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-cheese"
                  >
                    ×
                  </button>
                </div>

                {cart.length === 0 ? (
                  <p className="rounded-xl bg-ink p-4 text-xs sm:text-sm text-white/60">
                    Your cart is empty. Add something delicious from the menu.
                  </p>
                ) : (
                  <ul className="space-y-2 max-h-44 sm:max-h-52 overflow-y-auto pr-1">
                    {cart.map((i) => (
                      <li
                        key={i.id}
                        className="flex items-center justify-between gap-2 rounded-xl bg-ink px-3.5 py-2.5 text-xs sm:text-sm"
                      >
                        <span className="text-white truncate">
                          {i.emoji} {i.name}
                        </span>
                        <span className="flex items-center gap-2 sm:gap-3 shrink-0">
                          <button
                            type="button"
                            aria-label="Decrease quantity"
                            onClick={() => setQty(i.id, i.qty - 1)}
                            className="flex min-h-[36px] min-w-[36px] items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 active:bg-white/30 transition text-base"
                          >
                            −
                          </button>
                          <span className="font-bold text-white min-w-[16px] text-center">
                            {i.qty}
                          </span>
                          <button
                            type="button"
                            aria-label="Increase quantity"
                            onClick={() => setQty(i.id, i.qty + 1)}
                            className="flex min-h-[36px] min-w-[36px] items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 active:bg-white/30 transition text-base"
                          >
                            +
                          </button>
                          <span className="w-20 text-right text-cheese font-bold text-xs sm:text-sm">
                            {fmt(i.price * i.qty)}
                          </span>
                        </span>
                      </li>
                    ))}
                  </ul>
                )}

                <input
                  className={input}
                  placeholder="Full name"
                  value={form.name}
                  onChange={set("name")}
                  autoComplete="name"
                  required
                />
                <input
                  className={input}
                  placeholder="Phone (03XX XXXXXXX)"
                  value={form.phone}
                  onChange={set("phone")}
                  inputMode="tel"
                  autoComplete="tel"
                  required
                />
                <textarea
                  className={input}
                  placeholder="Delivery address"
                  rows={2}
                  value={form.address}
                  onChange={set("address")}
                  required
                />

                <div className="flex items-center justify-between border-t border-white/10 pt-3 text-base sm:text-lg text-white">
                  <span>Total</span>
                  <b className="text-cheese font-display text-lg sm:text-xl">
                    {fmt(total)}
                  </b>
                </div>

                <button
                  type="submit"
                  disabled={!valid}
                  className="w-full min-h-[48px] rounded-xl bg-gradient-to-r from-king to-ember py-3.5 font-bold text-white shadow-glow disabled:cursor-not-allowed disabled:opacity-40 transition hover:opacity-95 active:opacity-85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cheese text-sm sm:text-base"
                >
                  Place order
                </button>

                {!valid && cart.length > 0 && (
                  <p className="text-center text-[11px] sm:text-xs text-white/50">
                    Enter your name, a valid phone number and an address to continue.
                  </p>
                )}
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
