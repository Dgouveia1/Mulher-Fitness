// tailwind.config.js

/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./App.tsx",
      "./index.tsx",
      "./components/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          'brand-primary': '#E5398D',
          'brand-secondary': '#EC407A',
          'background': '#111827', // Gray 900
          'card': '#1F2937',       // Gray 800
          'surface': '#374151',    // Gray 700
          'text-primary': '#F9FAFB',   // Gray 50
          'text-secondary': '#9CA3AF',// Gray 400
          'success': '#10B981',      // Emerald 500
        },
      }
    },
    plugins: [],
  }