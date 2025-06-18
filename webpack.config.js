const path = require('path');

module.exports = {
  mode: 'production',
  entry: './src/plugin/code-standalone.ts',
  
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: 'ts-loader',
          options: {
            configFile: path.resolve(__dirname, 'webpack.tsconfig.json'),
            compilerOptions: {
              rootDir: path.resolve(__dirname, 'src'),
              outDir: path.resolve(__dirname, 'dist/plugin'),
            }
          }
        },
        exclude: /node_modules/,
      },
    ],
  },
  
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    alias: {
      '@core': path.resolve(__dirname, 'src/core'),
      '@plugin': path.resolve(__dirname, 'src/plugin'),
    },
  },
  
  output: {
    filename: 'code-standalone.js',
    path: path.resolve(__dirname, 'dist/plugin'),
    // 关键：不使用模块系统，直接输出可执行代码
    clean: false,
  },
  
  // Figma插件环境配置
  target: 'web',
  
  // 优化配置
  optimization: {
    minimize: false, // 保持代码可读性，便于调试
  },
  
  // 开发工具
  devtool: 'source-map',
  
  // 避免 Node.js 特定的 polyfills
  node: false,
}; 