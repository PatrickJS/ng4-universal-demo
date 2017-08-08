const { root } = require('./helpers');

const nodeExternals = require('webpack-node-externals');
const { AotPlugin } = require('@ngtools/webpack');

/**
 * This is a server config which should be merged on top of common config
 */
module.exports = {
  entry: root('./src/main.server.ts'),
  output: {
    filename: 'server.js'
  },
  target: 'node',
  externals: [nodeExternals({
    whitelist: /@angular/
  )],
};
