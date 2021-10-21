const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const CssnanoPlugin = require('cssnano-webpack-plugin');
const webpack = require("webpack");
const Dotenv = require('dotenv-webpack')

module.exports = {
  mode: 'development',
  entry: './src/index.js',
  watch: true,
  output: {
    path: path.resolve(__dirname, './work/src/js/webcomponent'),
    filename: 'noi_maps_widget.min.js'
  },
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.(s*)css$/,
        use:
        [
          { loader: 'css-loader', options: { sourceMap: true } },
          { loader: 'sass-loader', options: { sourceMap: true, sassOptions: { outputStyle: 'compressed' } } }
        ]
      },
      {
        test: /\.(png|jpg|gif|ttf)$/i,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 10000
            }
          }
        ]
      },
      {
        test: /\.svg$/,
        oneOf: [
            {
                exclude: path.resolve(__dirname, 'src/'),
                use: 'svg-inline-loader'
            },
            {
                include: path.resolve(__dirname, 'src/'),
                use: 'file-loader'
            },
        ],
      },
      {
        test: /\.html$/i,
        loader: 'html-loader',
      }
    ]
  },
  optimization: {
    minimizer: [
      new CssnanoPlugin({
        cssnanoOptions: {
          preset: ['default', {
            discardComments: { removeAll: true }
          }]
        }
      })
    ]
  },
  plugins: [
    new CopyPlugin({
      patterns: [{
        from: '**/*.js',
        to: path.resolve(__dirname, './work/scripts/webcomponentsjs'),
        context: 'node_modules/@webcomponents/webcomponentsjs'
      }],
    }),
    new Dotenv()
  ],
  devServer: {
    contentBase: path.join(__dirname, 'work'),
    compress: true,
    watchContentBase: true,
    writeToDisk: false,
    port: 8999
  }
};
