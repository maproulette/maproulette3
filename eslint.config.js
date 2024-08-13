const eslint = require('@eslint/js');
const globals = require('globals');

const react = require('eslint-plugin-react');
const reactHooks = require('eslint-plugin-react-hooks')
const jest = require('eslint-plugin-jest')
const unusedImports = require('eslint-plugin-unused-imports')

module.exports = [
  // eslint.configs.recommended,
  {
    files: ['**/*.{js,jsx,mjs,cjs,ts,tsx}'],
    plugins: {
      react, "react-hooks": reactHooks, jest, "unused-imports": unusedImports
    },
    languageOptions: {
      parserOptions: {
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
      },
    },
    rules: {
      "no-unused-vars": "warn",
      "react/jsx-uses-react": "error",
      "react/jsx-uses-vars": "error",
      "unused-imports/no-unused-imports": "error",
      "react/display-name": 0,
      "react/jsx-key": "warn",
      "react/no-unescaped-entities": "warn",
      "react/jsx-no-duplicate-props": "warn",
      "react/jsx-no-target-blank": "off",
      "react/no-unknown-property": "warn",
      "react/prop-types": 0,
      "semi": "off",
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },
];
