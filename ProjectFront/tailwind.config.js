/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "gradient-combg": "linear-gradient(#8341ac, #0e74af)",
        "gradient-overcombg": "linear-gradient(#0e74af, #8341ac)",
        "gradient-cardBg":
          "linear-gradient(338deg, #c9bea0, #8a773c,#8a773c,#c9bea0)",
        "gradient-tip": "linear-gradient(0deg, #969696, #969696)",
        "gradient-success": "linear-gradient(180deg, #39b754, #a2ed95)",
        "gradient-error": "linear-gradient(180deg, #ff2c2c, #f19998)",
      },
      colors: {
        buttonBkColor: "#ca9d00",
        buttonAcColor: "#c5a841",
        combg: "#0e74af",
        cardLight: "#404040",
        cardDark: "#252525",
        tcDark: "rgba(0,0,0,0.5)",
      },
      borderRadius: {
        cardRound: "15px",
        litleCardRound: "10px",
      },
    },
    screens: {
      xs: "475px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
      "3xl": "1920px",
      "4xl": "2560px",
    },
  },
  plugins: [],
  content: ["./src/pages/**/*.tsx", "./src/components/**/*.tsx"],
};
