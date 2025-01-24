module.exports = {
  darkMode: 'class', // Enable class-based dark mode
  content: ['./src/**/*.{js,jsx,ts,tsx}'], // Adjust paths to your project
  theme: {
    extend: {
      screens: {
        custom: '992px', // new breakpoint at 992px
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0, transform: 'scale(0.95)' },
          '100%': { opacity: 1, transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [require('daisyui')],
};
