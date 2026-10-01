/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#070A0F',
          800: '#0E1420',
          700: '#151D2E',
          600: '#1E293B',
          500: '#334155'
        },
        brand: {
          emerald: '#10B981',
          teal: '#14B8A6',
          cyan: '#06B6D4',
          amber: '#F59E0B',
          violet: '#8B5CF6',
          rose: '#F43F5E'
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      },
      boxShadow: {
        'glow-emerald': '0 0 25px -5px rgba(16, 185, 129, 0.4)',
        'glow-cyan': '0 0 25px -5px rgba(6, 182, 212, 0.4)',
        'glow-violet': '0 0 25px -5px rgba(139, 92, 246, 0.4)',
        'glow-amber': '0 0 25px -5px rgba(245, 158, 11, 0.4)',
        'neubrutal': '4px 4px 0px 0px rgba(16, 185, 129, 1)'
      }
    },
  },
  plugins: [],
}
