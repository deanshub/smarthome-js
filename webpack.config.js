const path = require('path')
const webpack = require('webpack')
const config = require('config')
const scanner = require('lanscanner')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const nodeExternals = require('webpack-node-externals')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const WebpackPwaManifest = require('webpack-pwa-manifest')
const { GenerateSW } = require('workbox-webpack-plugin')

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

const PORT = config.REMOTE_COMMANDS_PORT || 13975

const definePlugin = new webpack.DefinePlugin({
  'process.env.NODE_ENV': JSON.stringify(NODE_ENV),
  VERSION: JSON.stringify(manifest.version),
  INTERNAL_IP: JSON.stringify(scanner.getInternalIP()),
  PORT,
  SECRET: JSON.stringify(config.SECRET),
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

const pwaManifest = {
  name: 'Friday',
  short_name: 'Friday',
  description: 'Smart home controller using js',
  background_color: '#101221',
  crossorigin: 'use-credentials',
  start_url: '/',
  display: 'fullscreen',
  icons: [
    {
      src: path.resolve('logo.jpg'),
      sizes: [96, 128, 192, 256, 384, 512],
    },
    {
      src: path.resolve('logo.jpg'),
      size: '1024x1024',
    },
  ],
}

const clientConfig = {
  ...defaultConfig,
  entry: ['./src/client/main.js', './src/client/style.css'],
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
        test: /\.(svelte|html)$/,
        include: /node_modules/,
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
      {
        test: /\.jpg$/,
        loader: 'url-loader',
        options: {
          limit: 1024,
        },
      },
      {
        test: /\.ttf$/,
        exclude: /node_modules/,
        loader: 'file-loader',
      },
    ],
  },
  resolve: {
    alias: {
      svelte: path.resolve('node_modules', 'svelte'),
    },
    extensions: ['.mjs', '.js', '.svelte'],
    mainFields: ['svelte', 'browser', 'module', 'main'],
  },
  plugins: [
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: ['client.*'],
    }),
    new HtmlWebpackPlugin({
      template: './src/client/index.html',
      title: 'friday',
      favicon: path.resolve('logo.jpg'),
    }),
    definePlugin,
    new WebpackPwaManifest(pwaManifest),
    new GenerateSW({
      clientsClaim: true, // Control any existing client when the Service Worker starts
      skipWaiting: true, // Skip the wait on update of the Service Worker
    }),
    !isDev &&
      new MiniCssExtractPlugin({
        filename: '[name].[hash:8].css',
      }),
  ].filter(Boolean),
}

module.exports = [electronConfig, clientConfig]
