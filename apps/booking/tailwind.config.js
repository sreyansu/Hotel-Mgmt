/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0f172a', // Slate 900
          foreground: '#f8fafc', // Slate 50
        },
        accent: {
          DEFAULT: '#d97706', // Amber 600 (Gold/Luxury feel)
          foreground: '#ffffff',
        }
      }
    },
  },
  plugins: [],
}
