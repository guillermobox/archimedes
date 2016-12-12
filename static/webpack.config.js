const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const WebpackShellPlugin = require('webpack-shell-plugin');

module.exports = {
  context: __dirname,
  devtool: "source-map",
  entry: [
    "./src/js/Archimedes.js",
  ],
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel-loader',
        query: {
          presets: ['react', 'es2015'],
        }
      },
    ]
  },
  output: {
    path: __dirname + "/dist/js",
    filename: "Archimedes.min.js"
  },
  plugins: [
    new WebpackShellPlugin({onBuildStart:['lessc src/css/archimedes.less src/css/archimedes.css']}),
    new CopyWebpackPlugin([
      {from: "src/index.html", to: __dirname + "/dist/index.html"},
      {from: "src/archimedes_head.ico", to: __dirname + "/dist/archimeeds_head.ico"},
      {from: "src/fonts/", to: __dirname + "/dist/fonts/"},
      {from: "src/images/", to: __dirname + "/dist/images/"},
      {from: "src/css/", to: __dirname + "/dist/css/"},
    ]),
  ]
}
