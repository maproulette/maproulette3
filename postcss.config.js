module.exports = {
  plugins: {
    'postcss-import': {},
    'postcss-simple-vars': {},
    'tailwindcss/nesting': {},
    'tailwindcss': { config: './src/tailwind.config.js'},
    'autoprefixer': {},
  }
}
