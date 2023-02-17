const tailwindcss = require('tailwindcss')

module.exports = () => ({
  plugins: [
    require('postcss-import'),
    require('postcss-simple-vars'),
    require('tailwindcss/nesting'),
    tailwindcss('./tailwind.config.js'),
    require('postcss-nested'),
    require('autoprefixer'),
  ],
})
