/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      screens: {
        sm: "280px",
        md: "760px",
        lg: "1024px",
        xlg: "1280px",
        xl: "1440px",
        xxl: "1780px",
      },
      colors: {
        "custom-blue": "#0A5BFF",
      },
      fontFamily: {
        jost: ["Jost", "sans-serif"],
        beau: ["Beau_Rivage", "sans-serif"],
      },
    },
  },
  plugins: [],
};
