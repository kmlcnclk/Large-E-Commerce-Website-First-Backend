const asyncHandler = require("express-async-handler");
const CustomError = require("../../helpers/errors/CustomError");
const { populateHelper } = require("./queryMiddlewareHelpers");

// Product Query Middleware
const singleProductQueryMiddleware = function (model) {
  return asyncHandler(async function (req, res, next) {
    const product_slug = req.params.slug;

    const product = await model
      .findOne({
        slug: product_slug,
      })
      .populate({
        path: "category",
        select: "name",
      })
      .populate({
        path: "user",
        select: "name",
      });

    if (!product) {
      return next(new CustomError("This product is not registered", 400));
    }
    req.data = product;
    next();
  });
};

module.exports = singleProductQueryMiddleware;
