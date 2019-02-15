const tailwindcss = require('tailwindcss')

module.exports = () => ({
  plugins: [
    require('postcss-import'),
    tailwindcss('./src/tailwind.js'),
    require('postcss-simple-vars'),
    require('postcss-nested'),
    require('autoprefixer'),
  ],
})
