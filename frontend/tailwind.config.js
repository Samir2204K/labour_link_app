/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#111111",
        accent: {
          DEFAULT: "#6e42e5",
          hover: "#5a32c4",
          light: "#f0ebff",
        },
        bgLight: "#f4f7f6",
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '15px',
      },
      boxShadow: {
        'card': '0 4px 20px rgba(0,0,0,0.08)',
      }
    },
  },
  plugins: [],
}