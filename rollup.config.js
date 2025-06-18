import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: 'src/plugin/code-standalone.ts',
  output: {
    file: 'dist/plugin/code-standalone.js',
    format: 'iife', // 立即执行函数表达式，避免模块系统问题
    sourcemap: true,
  },
  plugins: [
    resolve({
      preferBuiltins: false, // 避免Node.js内置模块
    }),
    commonjs(), // 处理CommonJS模块
    typescript({
      tsconfig: './rollup.tsconfig.json',
      sourceMap: true,
    }),
  ],
  external: ['figma'], // Figma API作为外部依赖
  onwarn(warning, warn) {
    // 忽略某些警告
    if (warning.code === 'THIS_IS_UNDEFINED') return;
    if (warning.code === 'CIRCULAR_DEPENDENCY') return;
    warn(warning);
  },
}; 