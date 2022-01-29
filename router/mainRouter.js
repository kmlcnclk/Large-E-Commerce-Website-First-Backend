const express = require("express");
const categories = require("./categories");
const auth = require("./auth");
const product = require("./products");
const user = require("./user");

const mainRouter = express.Router();

mainRouter.use("/category", categories);
mainRouter.use("/auth", auth);
mainRouter.use("/product", product);
mainRouter.use("/user", user);

module.exports = mainRouter;
