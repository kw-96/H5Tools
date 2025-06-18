module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
  ],
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  globals: {
    figma: true,
    __html__: true
  },
  env: {
    browser: true
  },
  rules: {
    // 规则配置...
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-debugger': 'warn',
    // 更多规则...
  },
  overrides: [
    {
      // 对JavaScript文件特殊处理，包括本文件
      files: ['*.js'],
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
        '@typescript-eslint/explicit-function-return-type': 'off',
      },
      // 关键部分：禁用对JS配置文件的parserOptions.project检查
      parserOptions: {
        project: null, // 为JS文件不使用tsconfig
      },
    },
  ],
  ignorePatterns: [".eslintrc.js", "code.ts"], // 忽略ESLint配置文件本身和旧代码文件
};