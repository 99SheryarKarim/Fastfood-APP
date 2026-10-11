"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { ScrollReveal } from "@/components/Effects";

const lines = [
  { who: "You", t: "Assalam o alaikum, mujhe do large fajita pizza chahiye." },
  { who: "Pizza King AI", t: "Ji zaroor! Do large Fajita King. Koi drink bhi add kar dun?" },
  { who: "You", t: "Ji, ek 1.5 litre cola. Address Skardu Road, house 12." },
  { who: "Pizza King AI", t: "Order confirm. Aapka pizza 35 minute mein pohanch jayega." },
];

export default function VoiceBanner({ onOpenVoice, onDemo }) {
  const [on, setOn] = useState(false);

  return (
    <ScrollReveal className="mx-auto max-w-6xl px-4 sm:px-6 py-12 sm:py-20">
      <section id="voice" aria-label="Voice AI Section">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-king/30 via-panel to-cheese/20 p-5 sm:p-14 border border-white/10 shadow-glow/30">
          <div className="grid items-center gap-8 lg:grid-cols-2">
            <div>
              <span className="rounded-full bg-cheese/20 px-3 py-1 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-cheese">
                Fast &amp; Conversational
              </span>
              <h2 className="mt-3 font-display text-3xl sm:text-5xl text-white">
                Order in Urdu. Any hour.
              </h2>
              <p className="mt-3 sm:mt-5 max-w-md text-xs sm:text-sm text-white/70 leading-relaxed">
                Our AI voice assistant answers 24/7, understands Urdu and Roman Urdu,
                takes your name, phone and address, and sends the order straight to the kitchen.
              </p>

              {/* Primary action: "Talk to the AI now" button */}
              <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={onOpenVoice}
                  className="flex min-h-[48px] items-center justify-center gap-2.5 rounded-full bg-cheese px-7 py-3.5 font-bold text-ink shadow-glow transition hover:bg-cheese/90 active:bg-cheese/80 text-sm sm:text-base focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
                >
                  <span className="relative flex h-3 w-3">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-king opacity-75" />
                    <span className="relative inline-flex h-3 w-3 rounded-full bg-king" />
                  </span>
                  Talk to the AI now
                </motion.button>

                <button
                  type="button"
                  onClick={() => setOn(!on)}
                  className="flex min-h-[48px] items-center justify-center rounded-full border border-white/20 px-5 py-3 text-xs sm:text-sm font-semibold text-white/80 hover:bg-white/10 hover:text-white transition"
                >
                  {on ? "Hide Urdu Script" : "Preview Urdu Script"}
                </button>
              </div>

              {onDemo && (
                <button
                  type="button"
                  onClick={onDemo}
                  className="mt-4 block text-xs sm:text-sm font-semibold text-white/50 underline underline-offset-4 hover:text-cheese transition min-h-[36px] flex items-center"
                >
                  Open manual checkout form instead
                </button>
              )}
            </div>

            <div className="min-h-[260px] sm:min-h-[300px] rounded-3xl bg-ink/80 p-4 sm:p-6 border border-white/5 shadow-inner">
              {!on ? (
                <div className="flex min-h-[220px] sm:min-h-[250px] flex-col items-center justify-center text-center p-4">
                  <span className="text-4xl mb-2 sm:mb-3">🎙️</span>
                  <p className="text-white/60 text-xs sm:text-sm max-w-xs">
                    Tap <strong className="text-white">&quot;Talk to the AI now&quot;</strong> to speak live in your browser, or preview the sample transcript script.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5 sm:space-y-3">
                  <div className="flex h-7 sm:h-8 items-end gap-1" aria-hidden="true">
                    {Array.from({ length: 24 }).map((_, i) => (
                      <motion.span
                        key={i}
                        className="w-1.5 rounded bg-king"
                        animate={{ height: [6, 28, 10, 22, 6] }}
                        transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.05 }}
                      />
                    ))}
                  </div>
                  {lines.map((l, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: l.who === "You" ? 20 : -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.3 }}
                      className={`max-w-[90%] sm:max-w-[85%] rounded-2xl px-3.5 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-sm ${
                        l.who === "You" ? "ml-auto bg-king text-white" : "bg-white/10 text-white"
                      }`}
                    >
                      <b className="block text-[11px] text-cheese">{l.who}</b>
                      {l.t}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </ScrollReveal>
  );
}
