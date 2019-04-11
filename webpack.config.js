var path = require("path")

module.exports = {
  mode: process.env.NODE_ENV || "development",
  entry: {
    buildTheme: path.join(__dirname, "src", "buildTheme.js"),
    applyTheme: path.join(__dirname, "src", "applyTheme.js")
  },
  output: {
    path: path.join(__dirname, "src", "build"),
    filename: "[name].js"
  }
}
