const asyncHandler = require('express-async-handler');
const CustomError = require('../../helpers/errors/CustomError');

// Search Helper
const searchHelper = (searchKey, query, req) => {
  if (req.query.search) {
    const searchObject = {};
    const regex = new RegExp(req.query.search, 'i');
    searchObject[searchKey] = regex;

    return query.where(searchObject);
  }
  return query;
};

// Populate Helper
const populateHelper = (query, population) => {
  return query.populate(population);
};

// Product Sort Helper
const productSortHelper = (query, req) => {
  const sortKey = req.query.sortBy;

  if (sortKey === 'most-liked') {
    return query.sort('-likeCount -createAt');
  }
  return query.sort('-createAt');
};

// Pagination Helper
const paginationHelper = asyncHandler(async (totalDocuments, query, req) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;

  if (page === 0) {
    page = 1;
  }

  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  const pagination = {};
  const total = totalDocuments;

  if (startIndex > 0) {
    pagination.previous = {
      page: page - 1,
      limit: limit,
    };
  }

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit: limit,
    };
  }

  return {
    query:
      query === undefined ? undefined : query.skip(startIndex).limit(limit),
    pagination: pagination,
    startIndex: startIndex,
    limit: limit,
  };
});

module.exports = {
  searchHelper,
  populateHelper,
  productSortHelper,
  paginationHelper,
};
