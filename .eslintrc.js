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
    'no-console': 'off', // 完全关闭console警告
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
  ignorePatterns: [
    ".eslintrc.js", 
    "code.ts",
    "*.md",           // 忽略所有markdown文件
    "**/*.md",        // 忽略所有子目录中的markdown文件
    "log.md",         // 明确忽略日志文件
    "README.md",      // 明确忽略README文件
    "src/core/README.md", // 忽略核心库README
    "ui-structure-index.md", // 忽略UI结构索引
    "node_modules",   // 忽略依赖包
    "dist",           // 忽略构建输出
    "build.js",        // 忽略构建脚本
    "0ui.html"
  ], // 忽略ESLint配置文件本身、旧代码文件和所有md文档
};