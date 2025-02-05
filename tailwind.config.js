module.exports = {
  darkMode: 'class', // Enable class-based dark mode
  content: ['./src/**/*.{js,jsx,ts,tsx}'], // Adjust paths to your project
  theme: {
    extend: {
      screens: {
        xs: '375px', // Small phones
        sm: '640px', // Large phones
        md: '768px', // Tablets
        lg: '1024px', // Small laptops
        xl: '1280px', // Desktop
        '2xl': '1536px', // Large screens
        custom: '992px', // Your custom breakpoint
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
