import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import terser from '@rollup/plugin-terser';

export default {
  input: 'src/plugin/code-standalone.ts',
  output: {
    dir: 'dist/plugin',
    format: 'es',
    sourcemap: true,
    preserveModules: true,
    preserveModulesRoot: 'src'
  },
  plugins: [
    typescript({
      tsconfig: './tsconfig.json'
    }),
    resolve({
      browser: true
    }),
    commonjs(),
    json(),
    terser()
  ],
  external: ['figma'],
  onwarn(warning, warn) {
    // 忽略某些警告
    if (warning.code === 'THIS_IS_UNDEFINED') return;
    if (warning.code === 'CIRCULAR_DEPENDENCY') return;
    warn(warning);
  },
}; 