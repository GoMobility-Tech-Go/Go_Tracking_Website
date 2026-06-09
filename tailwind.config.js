/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    './pages/**/*.{js,jsx,mdx}',
    './components/**/*.{js,jsx,mdx}',
    './app/**/*.{js,jsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        royal: {
          50:  '#f0f4ff',
          100: '#dde4f5',
          200: '#b3c2e8',
          300: '#8099d6',
          400: '#4d70c4',
          500: '#2d52b5',
          600: '#1d3fa0',
          700: '#1a3590',
          800: '#142878',
          900: '#0D1B6E',
          950: '#080f40',
        },
        gold: {
          100: '#fef9c3',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#D4AF37',
          600: '#b8962e',
          700: '#92700a',
        },
      },
      animation: {
        'pulse-slow':  'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'shimmer':     'shimmer 2s linear infinite',
      },
      keyframes: {
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      boxShadow: {
        'gold': '0 4px 20px rgba(212,175,55,0.3)',
        'royal': '0 4px 20px rgba(13,27,110,0.3)',
      },
    },
  },
  plugins: [],
};
module.exports = config;
