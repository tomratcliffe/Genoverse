var webpack = require('webpack');

module.exports = {
  entry: {
    'min'              : __dirname + '/index.js',
    'min.jqnoconflict' : __dirname + '/noConflict.js',
  },
  output: {
    filename: 'js/genoverse.[name].js',
  },
  plugins: [
    new webpack.ProvidePlugin({
      $      : __dirname + '/js/lib/jquery.js',
      jQuery : __dirname + '/js/lib/jquery.js'
    }),
    new webpack.DefinePlugin({
      define: undefined // Stop jquery-ui.js trying to do define(["jquery"]), which doesn't work if jquery isn't in node_modules
    }),
    new webpack.optimize.UglifyJsPlugin({
      comments: false
    })
  ]
};
