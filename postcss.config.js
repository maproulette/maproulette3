export default {
  plugins: {
    'postcss-import': {},
    'postcss-simple-vars': {
      // leave references to undefined variables like $foo untransformed,
      // instead of erroring. needed because Vite transforms url() paths
      // into a base64-encoding that may contain '$' characters.
      silent: true
    },
    'tailwindcss/nesting': {},
    'tailwindcss': { config: './src/tailwind.config.js'},
    'autoprefixer': {},
  }
}
