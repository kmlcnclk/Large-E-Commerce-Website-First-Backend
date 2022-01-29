const express = require("express");
const categoriesRouter = express.Router();
const {
  getAllCategory,
  addCategory,
  getSingleCategory,
} = require("../controllers/categories");
const products = require("./products");
const {
  checkCategoryExist,
} = require("../middlewares/database/databaseErrorHelpers");
const productQueryMiddleware = require("../middlewares/query/productQueryMiddleware");
const Product = require("../models/Product");

categoriesRouter.get("/", getAllCategory);
categoriesRouter.post("/category_add", addCategory);
categoriesRouter.get(
  "/:slug",
  checkCategoryExist,
  productQueryMiddleware(Product, {
    population: [
      {
        path: "category",
        select: "name",
      },
      {
        path: "user",
        select: "name",
      },
    ],
  }),
  getSingleCategory
);

module.exports = categoriesRouter;
