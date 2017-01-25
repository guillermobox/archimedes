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
    path: __dirname + "/dist/",
    filename: "js/Archimedes.min.js"
  },
  plugins: [
    new WebpackShellPlugin({onBuildStart:['lessc src/css/archimedes.less dist/css/archimedes.css']}),
    new CopyWebpackPlugin([
      {from: "src/index.html", to: "index.html"},
      {from: "src/archimedes_head.ico", to: "archimedes_head.ico"},
      {from: "src/fonts/", to: "fonts/"},
      {from: "src/images/", to: "images/"},
      {from: "src/css/", to: "css/"},
    ]),
  ]
}
