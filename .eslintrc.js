module.exports = {
  env: {
    commonjs: true,
    es6: true,
    node: true,
    jquery: true,
    browser: true,
  },
  extends: 'eslint:recommended',
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
    Promise: false,
    describe: true,
    it: true,
    Highcharts: true,
    moment: true,
  },
  parser: 'babel-eslint',
  parserOptions: {
    ecmaVersion: 2019,
  },
  rules: {
    eqeqeq: [2, 'allow-null'],

    // ###########################################################
    // ### Semantics / Performance impacting
    // ###########################################################
    // babel inserts `'use strict';` for us
    strict: 0,

    'no-redeclare': [2, { builtinGlobals: false }],

    // If a class method does not use this, it can safely be made a static function.
    // http://eslint.org/docs/rules/class-methods-use-this
    'class-methods-use-this': ['off'],

    // ###########################################################
    // ### Style
    // ###########################################################
    indent: ['off', 2],
    'linebreak-style': ['error', 'unix'],
    quotes: ['error', 'single', { avoidEscape: true, allowTemplateLiterals: true }],
    semi: ['error', 'always'],
    'no-console': ['error', { allow: ['warn', 'error'] }],
  },
};
