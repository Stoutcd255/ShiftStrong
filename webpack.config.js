const path = require('path');

module.exports = {
  entry: './src/index.jsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'renderer.bundle.js',
    publicPath: './',
    assetModuleFilename: 'assets/[name][ext]'
  },
  resolve: {
    extensions: ['.js', '.jsx']
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: { loader: 'babel-loader' }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.(png|jpg|jpeg|gif|ico|svg)$/i,
        type: 'asset/resource'
      }
    ]
  },
  target: 'electron-renderer',
  devtool: 'source-map',
  mode: 'development',
  plugins: []
};
