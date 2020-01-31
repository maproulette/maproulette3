const tailwindcss = require('tailwindcss')

module.exports = () => ({
  plugins: [
    require('postcss-import'),
    require('postcss-simple-vars'),
    tailwindcss('./src/tailwind.config.js'),
    require('postcss-nested'),
    require('autoprefixer'),
  ],
})
