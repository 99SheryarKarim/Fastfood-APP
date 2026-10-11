/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0F0F0F",
        panel: "#181818",
        king: "#FF4757",
        ember: "#FF6B81",
        cheese: "#FFA502",
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
      },
      boxShadow: {
        glow: "0 0 40px -8px rgba(255,71,87,.6)",
        "glow-lg": "0 0 60px -4px rgba(255,71,87,.75)",
        "cheese-glow": "0 0 40px -8px rgba(255,165,2,.6)",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        "pulse-glow": {
          "0%, 100%": {
            boxShadow: "0 0 25px -4px rgba(255,71,87,0.65), 0 0 10px rgba(255,165,2,0.35)",
            transform: "scale(1)",
          },
          "50%": {
            boxShadow: "0 0 45px 2px rgba(255,71,87,0.9), 0 0 22px rgba(255,165,2,0.6)",
            transform: "scale(1.03)",
          },
        },
        ripple: {
          "0%": { transform: "scale(1)", opacity: "0.75" },
          "100%": { transform: "scale(2.3)", opacity: "0" },
        },
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        shimmer: "shimmer 5s ease infinite",
        "pulse-glow": "pulse-glow 2.5s ease-in-out infinite",
        ripple: "ripple 2.4s cubic-bezier(0, 0.2, 0.8, 1) infinite",
        marquee: "marquee 22s linear infinite",
      },
    },
  },
  plugins: [],
};
