/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./assets/js/**/*.js",
    "./src/**/*.{html,js}"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#F8F6F0',
        accent: '#8B9DC3',
        surface1: '#E8E5E0',
        sage: '#A8B5A3',
        warm: '#D4C4B0',
        stone: '#9B9B9B',
      },
      fontFamily: {
        'dm-sans': ['DM Sans', 'sans-serif'],
        'lora': ['Lora', 'serif'],
      }
    }
  },
  plugins: [],
}