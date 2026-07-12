/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-dark': '#1c1f2e',
        'brand-yellow': '#f5a623',
        'status-available': '#28a745',
        'status-trip': '#007bff',
        'status-shop': '#fd7e14',
        'status-retired': '#dc3545',
      }
    },
  },
  plugins: [],
}
