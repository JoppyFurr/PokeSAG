const path = require("path");
const webpack = require("webpack");

module.exports = {
  entry: {
    main: ['./main.js']
  },
  context: path.resolve(__dirname),
  devtool: "source-map",
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        loader: "babel-loader",
        options: { 
          presets: [["@babel/env", {"useBuiltIns": "usage", "corejs": "3.9"}], "@babel/preset-react"],
          plugins: ["@babel/plugin-proposal-class-properties"]
        }
      }
    ]
  },
  resolve: { extensions: ["*", ".js", ".jsx"] },
  output: {
    path: path.resolve(__dirname, "./dist/"),
    filename: '[name].js'
  }
};
