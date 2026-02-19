/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81",
          950: "#1e1b4b",
        },
        cyber: {
          green: "#00ff88",
          blue: "#00d4ff",
          purple: "#a855f7",
          red: "#ff3366",
          orange: "#ff8800",
        },
        dark: {
          900: "#0a0e1a",
          800: "#111827",
          700: "#1a2035",
          600: "#232b3e",
          500: "#2d3748",
        },
      },
    },
  },
  plugins: [],
};
