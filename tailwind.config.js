/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
      },
      colors: {
        'gradient-start': '#6366f1',
        'gradient-end': '#ec4899',
      },
    },
  },
  plugins: [],
  darkMode: 'class',
}

