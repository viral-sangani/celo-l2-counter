/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#FCFF52',
        secondary: '#476520',
        background: '#FCF6F1',
        'background-secondary': '#E7E3D4',
      },
    },
  },
  plugins: [],
};