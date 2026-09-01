/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: {
          950: '#0a0a0b',
          900: '#111113',
          850: '#161618',
          800: '#1c1c1f',
          700: '#26262a',
          600: '#333338',
          500: '#45454d',
          400: '#6b6b76',
          300: '#9a9aa6',
          200: '#c4c4cf',
          100: '#e4e4ea',
        },
        gold: {
          400: '#e8c87a',
          500: '#d4a84a',
          600: '#b8902f',
        },
        sage: {
          400: '#7fb88f',
          500: '#5a9c6c',
          600: '#3f7a4f',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'slide-in': 'slideIn 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
};
