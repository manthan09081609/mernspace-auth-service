/* eslint-env node */
module.exports = {
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended-type-checked",
    "prettier",
  ],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: true,
  },
  root: true,
  rules: {
    "no-console": "error",
    "dot-notation": "error",
    "@typescript-eslint/no-misused-promises": "off",
    "@typescript-eslint/require-await": "off",
  },
};
