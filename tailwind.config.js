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
          dark: '#f8fafc',
          surface: '#ffffff',
          card: 'rgba(255,255,255,0.97)',
          border: '#e2e8f0',
          borderHover: '#38bdf8',
          purple: '#0ea5e9',
          violet: '#0284c7',
          glow: '#06b6d4',
          pink: '#f43f5e',
          cyan: '#0ea5e9',
          emerald: '#059669',
          amber: '#d97706',
          textMuted: '#64748b',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'purple-glow': '0 0 25px -5px rgba(14, 165, 233, 0.3)',
        'cyan-glow': '0 0 25px -5px rgba(6, 182, 212, 0.25)',
        'emerald-glow': '0 0 25px -5px rgba(5, 150, 105, 0.25)',
        'card-glow': '0 8px 32px 0 rgba(14, 165, 233, 0.08)',
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
