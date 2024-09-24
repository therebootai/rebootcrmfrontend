/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    screens: {
      sm: "280px",
      md: "760px",
      lg: "1024px",
      xlg: "1280px",
      xl: "1440px",
      xxl: "1780px",
    },
    extend: {
      fontFamily: {
        jost: ["Jost", "sans-serif"],
        beau: ["Beau_Rivage", "sans-serif"],
      },
    },
  },
  plugins: [],
};
