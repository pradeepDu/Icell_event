/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {},
    },
    plugins: [require('daisyui')],
    daisyui: {
      themes: true, // true: all themes | false: only light + dark | array: specific themes like ["light", "dark", "cupcake"]
    },
  };
  