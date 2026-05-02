/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "dark": {
          "50": "#434343",
          "100": "#393939",
          "200": "#2f2f2f",
          "300": "#252525",
          "400": "#1b1b1b",
          "500": "#111111",
          "600": "#070707",
          "700": "#000000",
          "800": "#000000",
          "900": "#000000"
        },
        "batik": {
          "gold": "#D4AF37",
          "sogan": "#4B3621",
          "indigo": "#00416A",
          "cream": "#F5F5DC"
        },
        "space": {
          "nebula": "#240046",
          "star": "#FFF5F2"
        }
      },
    },
  },
  plugins: [],
}