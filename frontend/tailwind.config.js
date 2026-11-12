/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ocean: {
          primary: '#082F49',     // Deep Slate Navy
          secondary: '#0E7490',   // Deep Teal
          accent: '#22D3EE',      // Electric Cyan
          support: '#CFFAFE',     // Soft Cyan/Ice Tint
          background: '#F0FDFA',  // Mint Ice
          dark: '#031926',
          muted: '#64748B',
          card: '#FFFFFF'
        }
      },
      boxShadow: {
        'ocean-glow': '0 0 20px -2px rgba(34, 211, 238, 0.4)',
        'ocean-subtle': '0 4px 20px -2px rgba(8, 47, 73, 0.08)',
        'ocean-hover': '0 10px 25px -3px rgba(14, 116, 144, 0.15)'
      }
    },
  },
  plugins: [],
}
