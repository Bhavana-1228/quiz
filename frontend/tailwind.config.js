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
        brand: {
          navy: '#10182B',
          'navy-light': '#18243E',
          'navy-surface': '#141E34',
          'navy-border': '#223354',
          violet: '#7657F6',
          'violet-hover': '#6543F4',
          'violet-light': '#9076F8',
          'violet-soft': '#F0EDFF',
          cyan: '#39C6D8',
          'cyan-hover': '#2AB9CC',
          'cyan-light': '#62D4E3',
          'cyan-soft': '#E7F9FB',
          bg: '#F4F6FB',
          text: '#1B2540',
          'text-muted': '#64748B',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'Courier New', 'monospace'],
      },
      boxShadow: {
        'brand': '0 4px 20px -2px rgba(118, 87, 246, 0.15)',
        'card': '0 2px 10px rgba(16, 24, 43, 0.05)',
        'cyan-glow': '0 0 20px rgba(57, 198, 216, 0.35)',
        'violet-glow': '0 0 25px rgba(118, 87, 246, 0.35)',
      }
    },
  },
  plugins: [],
}

