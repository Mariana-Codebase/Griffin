/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "bg-base":      "#0A0A0A",
        "bg-surface":   "#141414",
        "bg-elevated":  "#1F1F1F",
        "text-primary":   "#F5F5F5",
        "text-secondary": "#A3A3A3",
        "text-tertiary":  "#525252",
        "accent-red":    "#FF3344",
        "accent-amber":  "#FFB020",
        "accent-mint":   "#4ADE80",
        "accent-violet": "#A78BFA",
        "border":        "#262626",
        "border-strong": "#404040",
      },
      fontFamily: {
        sans: ['ui-sans-serif', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'],
        mono: ['ui-monospace', '"Cascadia Code"', '"Fira Code"', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
};
