import eslint from '@eslint/js';
import globals from 'globals';

import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import jest from 'eslint-plugin-jest';
import unusedImports from 'eslint-plugin-unused-imports';

export default [
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
