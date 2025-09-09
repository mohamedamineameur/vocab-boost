const path = require("path");

module.exports = {
  development: {
    dialect: "sqlite",
    storage: path.resolve(__dirname, "../database.sqlite")
  },
  test: {
    dialect: "sqlite",
    storage: ":memory:"
  },
  production: {
    dialect: "sqlite",
    storage: path.resolve(__dirname, "../database.sqlite")
  }
};
