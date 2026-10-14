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
        accent: {
          50: 'var(--color-accent-50, #eef2ff)',
          100: 'var(--color-accent-100, #e0e7ff)',
          200: 'var(--color-accent-200, #c7d2fe)',
          300: 'var(--color-accent-300, #a5b4fc)',
          400: 'var(--color-accent-400, #818cf8)',
          500: 'var(--color-accent-500, #6366f1)',
          600: 'var(--color-accent-600, #4f46e5)',
          700: 'var(--color-accent-700, #4338ca)',
          800: 'var(--color-accent-800, #3730a3)',
          900: 'var(--color-accent-900, #312e81)',
          glow: 'var(--color-accent-glow, rgba(99, 102, 241, 0.35))',
        },
        sandu: {
          hair: '#231b1b',
          skin: '#ffe5d9',
          skinShadow: '#fcd5ce',
          eye: '#4f46e5',
          blush: '#ffb5a7',
          ribbon: '#ec4899',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans Sinhala', 'Noto Sans Tamil', 'system-ui', 'sans-serif'],
        rounded: ['Quicksand', 'Noto Sans Sinhala', 'Noto Sans Tamil', 'sans-serif'],
        serif: ['Merriweather', 'Noto Sans Sinhala', 'Noto Sans Tamil', 'serif'],
        mono: ['Fira Code', 'monospace'],
        sinhala: ['Noto Sans Sinhala', 'sans-serif'],
        tamil: ['Noto Sans Tamil', 'sans-serif'],
      },
      animation: {
        'float-gentle': 'floatGentle 4s ease-in-out infinite',
        'pulse-subtle': 'pulseSubtle 2.5s ease-in-out infinite',
        'sway': 'sway 3s ease-in-out infinite alternate',
        'blink': 'blink 4s infinite',
        'sparkle': 'sparkle 1.5s ease-in-out infinite',
      },
      keyframes: {
        floatGentle: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.85', transform: 'scale(1.02)' },
        },
        sway: {
          '0%': { transform: 'rotate(-1.5deg)' },
          '100%': { transform: 'rotate(1.5deg)' },
        },
        sparkle: {
          '0%, 100%': { opacity: '0', transform: 'scale(0.5)' },
          '50%': { opacity: '1', transform: 'scale(1.2)' },
        }
      }
    },
  },
  plugins: [],
}
