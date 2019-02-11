var path = require("path");
var nodeExternals = require("webpack-node-externals");


var serverConfig = {
  name: "server",
  devtool: "source-map",
  entry: __dirname + "/server.ts",
  target: "node",
  externals: [nodeExternals()],
  resolve: {
    extensions: ['.js', '.jsx', ".tsx", ".ts"]
  },
  output: {
    path: __dirname + "/build",
    filename: "serverBundle.js",
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/, //regex
        loader: "ts-loader",
        exclude: /node_modules/
      },
      {
        test: /\.(gif|jpe?g|png|ico)$/,
        loader: "url-loader?limit=10000"
      },
      {
        test: /\.(otf|eot|svg|ttf|woff|woff2).*$/,
        loader: "url-loader?limit=10000"
      }
    ]
  },
};

module.exports = serverConfig;
