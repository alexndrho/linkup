/** @type {import('tailwindcss').Config} */
import daisyui from "daisyui";

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      keyframes: {
        "fade-out": { "0%": { opacity: "1" }, "100%": { opacity: "0" } },
      },
      animation: { "fade-out": "fade-out 5s ease-in forwards" },
    },
  },
  plugins: [daisyui],
  daisyui: {
    themes: ["bumblebee"],
  },
  safelist: ["badge-success", "badge-info", "badge-warning", "badge-error"],
};
