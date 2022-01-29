const CustomError = require("../helpers/errors/CustomError");
const asyncHandler = require("express-async-handler");
const User = require("../models/User");

// Get all user
const getAllUser = asyncHandler(async (req, res, next) => {
  const user = await User.find();

  return res.status(200).json({
    success: true,
    data: user,
  });
});

module.exports = { getAllUser };
