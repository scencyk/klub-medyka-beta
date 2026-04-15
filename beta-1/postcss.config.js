export default {
  plugins: {
    'postcss-import': {},  // resolve @import statements first, before Tailwind processes
    tailwindcss: {},
    autoprefixer: {},
  },
};
