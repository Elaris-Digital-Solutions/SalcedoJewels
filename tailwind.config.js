/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        'playfair': ['Playfair Display', 'serif'],
        'inter': ['Inter', 'sans-serif'],
      },
      colors: {
        gold: {
          50: '#fefdfb',
          100: '#fef9f3',
          200: '#fef3e2',
          300: '#f5f1e8',
          400: '#e8e0d4',
          500: '#c4a574',
          600: '#b8956a',
          700: '#9d7f57',
          800: '#826a47',
          900: '#6b5639',
        },
        beige: {
          50: '#fefdfb',
          100: '#faf9f7',
          200: '#f5f3f0',
          300: '#f0ede8',
          400: '#e8e3dc',
          500: '#d6cfc4',
          600: '#b8aea0',
          700: '#9a8d7c',
          800: '#7c6f5e',
          900: '#5e544a',
        },
        cream: {
          50: '#fefefe',
          100: '#fefcfa',
          200: '#fdf9f5',
          300: '#fbf6f0',
          400: '#f8f1e8',
          500: '#f2e8d9',
          600: '#e6d4c1',
          700: '#d4bfa6',
          800: '#c2a98b',
          900: '#a08970',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-5px)' },
        }
      }
    },
  },
  plugins: [],
};