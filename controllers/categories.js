const CustomError = require("../helpers/errors/CustomError");
const asyncHandler = require("express-async-handler");
const Category = require("../models/Category");

// Get All Category
const getAllCategory = asyncHandler(async (req, res, next) => {
  const categories = await Category.find();

  return res.status(200).json({
    success: true,
    data: categories,
  });
});

// Add Category
const addCategory = asyncHandler(async (req, res, next) => {
  const { name } = req.body;

  const category = await Category.create({
    name,
  });
  res.status(200).json({
    success: true,
    data: category,
  });
});

// Get Single Category
const getSingleCategory = asyncHandler(async (req, res, next) => {
  return res.status(200).json(res.queryResults);
});

module.exports = {
  getAllCategory,
  addCategory,
  getSingleCategory,
};
