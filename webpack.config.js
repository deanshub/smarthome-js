const path = require('path')
// const webpack = require('webpack')
// const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const nodeExternals = require('webpack-node-externals')

const NODE_ENV =
  process.env.NODE_ENV !== 'production' ? 'development' : 'production'

module.exports = {
  entry: ['regenerator-runtime/runtime', './src/index.js'],
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'smarthome.js',
  },
  target: 'node',
  mode: NODE_ENV,
  devtool: NODE_ENV === 'development' ? 'eval-source-map' : undefined,
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
          },
        },
      },
      {
        test: /\.node$/,
        use: 'node-loader',
      },
      {
        test: /\.json$/,
        loader: 'json-loader',
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    //   new HtmlWebpackPlugin({template: './src/index.html'})
    // new webpack.DefinePlugin({
    // }),
  ],
  externals: [nodeExternals()],
}
