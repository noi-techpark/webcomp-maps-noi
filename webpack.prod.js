const path = require('path');
const Dotenv = require('dotenv-webpack')

module.exports = {
  mode: 'production',
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'noi_maps_widget.min.js'
  },
  module: {
    rules: [
      {
        test: /\.(s*)css$/,
        use: [{ loader: 'css-loader' }, { loader: 'sass-loader' }]
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
  plugins: [
    new Dotenv()
  ]
};
