/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#028a39',
          50:  '#e6f5ec',
          100: '#b3e0c3',
          200: '#80cb9a',
          300: '#4db671',
          400: '#1aa148',
          500: '#028a39',
          600: '#027030',
          700: '#015526',
          800: '#013b1b',
          900: '#002010',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
