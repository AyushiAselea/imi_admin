/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Space Grotesk", "Inter", "system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          DEFAULT: "hsl(180 80% 45%)",
          light: "hsl(180 60% 55%)",
          dark: "hsl(180 80% 30%)",
        },
        surface: {
          DEFAULT: "hsl(0 0% 8%)",
          card: "hsl(0 0% 6%)",
          hover: "hsl(0 0% 12%)",
          border: "hsl(0 0% 14%)",
        },
      },
      borderRadius: {
        xl: "0.75rem",
      },
    },
  },
  plugins: [],
};
