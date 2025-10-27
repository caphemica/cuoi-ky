/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    // Chỉ định các đường dẫn đến các file có chứa Tailwind class
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html", // Nếu bạn có các class trong file index.html
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
