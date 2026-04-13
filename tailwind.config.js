/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        bg: {
          base:    '#0a0a0c',
          raised:  '#131316',
          overlay: '#1a1a1f',
          elev:    '#202028',
        },
        border: {
          DEFAULT: '#26262d',
          soft:    '#1d1d22',
          strong:  '#38383f',
        },
        ink: {
          primary:   '#fafafa',
          secondary: '#a1a1aa',
          muted:     '#71717a',
          subtle:    '#52525b',
        },
        flame: {
          50:  '#fff1f1',
          100: '#ffdfdf',
          200: '#ffc5c5',
          300: '#ff9d9d',
          400: '#ff6464',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
      },
      backgroundImage: {
        'gradient-flame':    'linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #991b1b 100%)',
        'gradient-flame-soft':'linear-gradient(135deg, rgba(239, 68, 68, 0.18) 0%, rgba(153, 27, 27, 0.08) 100%)',
        'gradient-hero':     'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(220, 38, 38, 0.25), transparent 60%)',
        'gradient-card':     'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0) 100%)',
      },
      boxShadow: {
        'flame':      '0 8px 32px -4px rgba(220, 38, 38, 0.4)',
        'flame-lg':   '0 16px 48px -4px rgba(220, 38, 38, 0.5)',
        'card':       '0 1px 3px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255,255,255,0.02)',
        'card-hover': '0 8px 32px -8px rgba(220, 38, 38, 0.25), 0 0 0 1px rgba(239, 68, 68, 0.15)',
      },
      animation: {
        'fade-in':    'fadeIn 0.4s ease-out',
        'slide-up':   'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        'flame-glow': 'flameGlow 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        slideUp: {
          '0%': { opacity: 0, transform: 'translateY(16px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        flameGlow: {
          '0%, 100%': { filter: 'drop-shadow(0 0 8px rgba(220,38,38,0.6)) drop-shadow(0 0 24px rgba(239,68,68,0.3))' },
          '50%':      { filter: 'drop-shadow(0 0 14px rgba(239,68,68,0.9)) drop-shadow(0 0 36px rgba(220,38,38,0.5))' },
        },
      },
    },
  },
  plugins: [],
}
