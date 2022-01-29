const asyncHandler = require('express-async-handler');
const {
  searchHelper,
  populateHelper,
  productSortHelper,
  paginationHelper,
} = require('./queryMiddlewareHelpers');
const Category = require('../../models/Category');

// Product Query Middleware
const productQueryMiddleware = function (model, options) {
  return asyncHandler(async function (req, res, next) {
    let query;

    if (req.params.slug) {
      const category = await Category.findOne({ slug: req.params.slug });

      query = model.find({ category: category._id });
    } else {
      query = model.find();
    }

    query = searchHelper('name', query, req);

    if (options && options.population) {
      query = populateHelper(query, options.population);
    }

    query = productSortHelper(query, req);

    const total = await model.countDocuments();
    const paginationResult = await paginationHelper(total, query, req);

    query = paginationResult.query;
    const pagination = paginationResult.pagination;

    const queryResults = await query;

    res.queryResults = {
      success: true,
      count: queryResults.length,
      pagination: pagination,
      data: queryResults,
    };
    next();
  });
};

module.exports = productQueryMiddleware;
