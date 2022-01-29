const CustomError = require("../../helpers/errors/CustomError");
const asyncHandler = require("express-async-handler");
const Category = require("../../models/Category");
const Product = require("../../models/Product");

// Check category exist
const checkCategoryExist = asyncHandler(async (req, res, next) => {
  const category_slug = req.params.slug || req.params.category_id;

  const category = await Category.findOne({ slug: category_slug });

  if (!category) {
    return next(new CustomError("There is no such category with that id", 400));
  }

  req.data = category;
  next();
});

// Check category exist to product
const checkCategoryExistToProduct = asyncHandler(async (req, res, next) => {
  const { category } = req.body;

  const categorys = await Category.findById(category);

  if (!categorys) {
    return next(new CustomError("There is no such category with that id", 400));
  }

  next();
});

// Check product exist
const checkProductExist = asyncHandler(async (req, res, next) => {
  const { name } = req.body;

  const product = await Product.findOne({ name });

  if (product) {
    return next(
      new CustomError("There is a product with this product name", 400)
    );
  }
  next();
});

// Check product exist 2
const checkProductExist2 = asyncHandler(async (req, res, next) => {
  const { name } = req.body;
  const { id } = req.params;

  const product = await Product.findOne({ name });
  const product2 = await Product.findById(id);

  if (product2.name != name) {
    if (product) {
      return next(
        new CustomError("There is a product with this product name", 400)
      );
    }
  }

  next();
});

module.exports = {
  checkCategoryExist,
  checkProductExist,
  checkProductExist2,
  checkCategoryExistToProduct,
};
