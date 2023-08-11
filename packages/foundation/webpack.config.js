const {resolve} = require('path')
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')

module.exports = {
  mode: 'production',
  optimization: {
    minimizer: [new TerserPlugin({})],
  },
  entry: {
    express: './src/infrastructure/server/ExpressServer/client.tsx',
    unstyledUI: './src/infrastructure/UI/UnstyledUI/index.ts',
    nativeFetcher: './src/infrastructure/fetcher/NativeFetcher.ts',
  output: {
    path: resolve(process.cwd(), 'dist'),
    filename: '[name].bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react', '@babel/preset-typescript'],
          },
        },
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    plugins: [new TsconfigPathsPlugin({})],
  },
}
