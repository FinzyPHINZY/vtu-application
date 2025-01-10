/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      xsm: "420px",
      sm: "640px",
      md: "768px",
      xmd: "850px",
      lg: "1024px",
      xlg: "1100px",
      xl: "1280px",
      "2xl": "1536px",
      // => @media (min-width: 640px) { ... }
    },
    extend: {
      
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        kavoon: ['Kavoon', 'cursive'],
        'mochiy-pop-one': ['Mochiy Pop One', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

