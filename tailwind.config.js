module.exports = {
  content: [
    './pages/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    fontFamily: {
      sans: ["Satoshi", "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "Noto Sans", "Liberation Sans", "sans-serif"]
    },
    extend: {
      colors: {
        primary: '#21808D',
        brand: {
          DEFAULT: '#ffd700', /* gold/yellow */
          600: '#ffcf33'
        },
        pagebg: '#000000'
      }
    }
  },
  plugins: []
};
