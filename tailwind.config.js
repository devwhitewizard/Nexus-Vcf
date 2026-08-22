/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cmd: {
          dark: '#0a0612',
          surface: '#130c24',
          card: 'rgba(23, 14, 43, 0.75)',
          border: '#2e1c4f',
          borderHover: '#4c2d82',
          purple: '#8b5cf6',
          violet: '#a855f7',
          glow: '#c084fc',
          pink: '#f43f5e',
          cyan: '#06b6d4',
          emerald: '#10b981',
          amber: '#f59e0b',
          textMuted: '#9ca3af',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'purple-glow': '0 0 25px -5px rgba(139, 92, 246, 0.4)',
        'cyan-glow': '0 0 25px -5px rgba(6, 182, 212, 0.4)',
        'emerald-glow': '0 0 25px -5px rgba(16, 185, 129, 0.4)',
        'card-glow': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      animation: {
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '0.4', filter: 'blur(20px)' },
          '50%': { opacity: '0.8', filter: 'blur(30px)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        }
      }
    },
  },
  plugins: [],
}
