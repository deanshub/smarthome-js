const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const nodeExternals = require('webpack-node-externals')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const manifest = require('./package.json')

const NODE_ENV =
  process.env.NODE_ENV !== 'production' ? 'development' : 'production'
const isDev = NODE_ENV === 'development'

const defaultConfig = {
  mode: NODE_ENV,
}
const babelLoader = {
  loader: 'babel-loader',
  options: {
    cacheDirectory: true,
  },
}

const definePlugin = new webpack.DefinePlugin({
  'process.env.NODE_ENV': JSON.stringify(NODE_ENV),
  VERSION: JSON.stringify(manifest.version),
})

const electronConfig = {
  ...defaultConfig,
  entry: ['regenerator-runtime/runtime', './src/index.js'],
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'smarthome.js',
  },
  target: 'node',
  devtool: isDev ? 'eval-source-map' : undefined,
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: babelLoader,
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
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: ['smarthome.js'],
    }),
    definePlugin,
  ],
  externals: [nodeExternals()],
}

const clientConfig = {
  ...defaultConfig,
  entry: './src/client/main.js',
  output: {
    path: path.resolve(__dirname, 'dist/public'),
    filename: 'client.[hash:8].js',
    chunkFilename: isDev ? '[name].js' : '[name].[chunkhash:8].js',
  },
  devtool: isDev ? 'source-map' : undefined,
  module: {
    rules: [
      {
        test: /\.svelte$/,
        exclude: /node_modules/,
        use: [
          babelLoader,
          {
            loader: 'svelte-loader',
            options: {
              // Emitting the CSS allows webpack to handle url(...) in the style part of the component.
              emitCss: true,
              legacy: true,
            },
          },
        ],
      },
      {
        test: /\.css$/,
        use: [
          isDev ? 'style-loader' : MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: ['client.*'],
    }),
    new HtmlWebpackPlugin({
      template: './src/client/index.html',
    }),
    definePlugin,
    !isDev &&
      new MiniCssExtractPlugin({
        filename: '[name].[hash:8].css',
      }),
  ].filter(Boolean),
}

module.exports = [electronConfig, clientConfig]
