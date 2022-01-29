const asyncHandler = require("express-async-handler");
const User = require("../../models/User");
const Product = require("../../models/Product");

const {
  isTokenIncluded,
  getAccessTokenFromHeader,
} = require("../../helpers/auth/tokenHelpers");
const CustomError = require("../../helpers/errors/CustomError");
const jwt = require("jsonwebtoken");

// Get access to route
const getAccessToRoute = (req, res, next) => {
  const { JSON_SECRET_KEY } = process.env;

  if (!isTokenIncluded(req)) {
    return next(
      new CustomError("You are not authorized to access this route", 401)
    );
  }

  const accessToken = getAccessTokenFromHeader(req);
  jwt.verify(accessToken, JSON_SECRET_KEY, (err, decoded) => {
    if (err) {
      return next(
        new CustomError("You are not authorized to access this route", 401)
      );
    }

    req.user = {
      id: decoded.id,
      name: decoded.name,
    };
    next();
  });
};

// Is the user registered ?
const isTheUserRegistered = asyncHandler(async (req, res, next) => {
  const { email, name } = req.body;

  const user =
    (await User.findOne({ email })) || (await User.findOne({ name }));

  if (user) {
    return next(
      new CustomError("You are not authorized to access this route", 401)
    );
  }

  next();
});

// Get product owner access
const getProductOwnerAccess = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  const product = await Product.findById(id);

  if (!product) {
    return next(new CustomError("There is no such product", 400));
  }

  if (product.user != userId) {
    return next(
      new CustomError(
        "This product is not yours, you cannot change the properties of the product.",
        403
      )
    );
  }

  next();
});

module.exports = {
  getAccessToRoute,
  isTheUserRegistered,
  getProductOwnerAccess,
};
