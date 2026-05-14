/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1A4D8F',
        navy: '#0D2B5E',
        gold: '#F5C518',
        background: '#F5F7FA',
        textDark: '#1A1A2E',
        textMuted: '#6B7280',
        success: '#22C55E',
        border: '#E5E7EB',
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
