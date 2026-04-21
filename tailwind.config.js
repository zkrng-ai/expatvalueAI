/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        hcNavy: '#002244',
        hcBlue: '#0A3B7A',
        hcGray: {
          50: '#F5F6F8',
          100: '#E6E9ED',
          200: '#C8CCD4',
          800: '#333D4D',
          900: '#1A212B',
        }
      },
      fontFamily: {
        sans: ['"Pretendard"', '"Apple SD Gothic Neo"', '"Noto Sans KR"', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
