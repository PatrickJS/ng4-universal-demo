const path = require('path');
const webpack = require('webpack');
const { root } = require('./helpers');

/**
 * This is a common webpack config which is the base for all builds
 */
module.exports = {
  devtool: 'source-map',
  resolve: {
    extensions: ['.ts', '.js']
  },
  output: {
    path: root('dist')
  },
  module: {
    rules: [
      { test: /\.ts$/, loader: '@ngtools/webpack' },
      { test: /\.css$/, loader: 'raw-loader' },
      { test: /\.html$/, loader: 'raw-loader' }
    ]
  },
  plugins: [
    new webpack.ContextReplacementPlugin(
      /angular(\\|\/)core(\\|\/)@angular/,
      path.resolve(__dirname, '../src')
    )
  ]
};
