const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const { sendJwtToClient } = require("../helpers/auth/tokenHelpers");
const {
  validateUserInput,
  comparePassword,
} = require("../helpers/input/inputHelpers");
const CustomError = require("../helpers/errors/CustomError");
const Product = require("../models/Product");
const sendEmail = require("../helpers/libraries/sendEmail");
const mongoose = require("mongoose");

// Register
const register = asyncHandler(async (req, res, next) => {
  const { email, password, name } = req.body;

  const user = await User.create({
    email,
    password,
    name,
    profile_image: req.savedProfileImage,
  });

  sendJwtToClient(user, res);
});

// Upload Image
const uploadImage = asyncHandler(async (req, res, next) => {
  const { id } = req.user;

  const user = await User.findByIdAndUpdate(
    id,
    {
      profile_image: req.savedProfileImage,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  const user2 = await User.findById(id)
    .select("+password")
    .populate({
      path: "products",
      select: "name content price imageUrl slug",
    })
    .populate({
      path: "cart.product",
      select: "name content price imageUrl slug",
    });

  return res.status(200).json({
    success: true,
    message: "Image Upload Successful",
    data: user2,
  });
});

// Cart
const userCart = asyncHandler(async (req, res, next) => {
  const { id } = req.user;

  const user = await User.findById(id);

  if (user.cart[0]) {
    var newPrice = 0;

    for (const product2 of user.cart) {
      const product = await Product.findById(product2.product);
      if (!product) {
        await user.cart.splice(user.products.indexOf(product2.product), 1);
        user.cartCount = await (user.cartCount - product2.quantity);
      } else {
        newPrice += product.price * product2.quantity;
      }
    }

    user.cartTotalPrice = newPrice;

    await user.save();
  }

  const user2 = await User.findById(id)
    .populate({
      path: "products",
      select: "name content price imageUrl slug",
    })
    .populate({
      path: "cart.product",
      select: "name content price imageUrl slug",
    });

  return res.status(200).json({
    success: true,
    data: user2.cart,
    user: user2,
  });
});

// Login
const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!validateUserInput(email, password)) {
    return next(new CustomError("Please check your Inputs", 400));
  }

  const user = await User.findOne({ email })
    .select("+password")
    .populate({
      path: "products",
      select: "name content price imageUrl slug",
    })
    .populate({
      path: "cart.product",
      select: "name content price imageUrl slug",
    });

  if (!comparePassword(password, user.password)) {
    return next(new CustomError("Please check your credentials", 400));
  }

  sendJwtToClient(user, res);
});

// Logout
const logout = asyncHandler(async (req, res, next) => {
  const { NODE_ENV } = process.env;

  return res
    .status(200)
    .cookie({
      httpOnly: true,
      expires: new Date(Date.now()),
      secure: NODE_ENV === "development" ? false : true,
    })
    .json({
      success: true,
      message: "Logout Successful",
    });
});

// Add To Cart
const addToCart = asyncHandler(async (req, res, next) => {
  const { product_id } = req.params;
  const { id } = req.user;

  const user = await User.findById(id);

  const product = await Product.findById(product_id);

  // if (!user) {
  //   return next(new CustomError("The contact id is invalid", 400));
  // }
  // if (!product) {
  //   return next(new CustomError("Product is not found", 400));
  // }

  if (user.cart[0]) {
    var addProduct;
    await user.cart.forEach((cartItem) => {
      if (cartItem.product == product_id) {
        addProduct = cartItem;
        cartItem.quantity += 1;
      }
    });

    if (!addProduct) {
      user.cart.push({ product: product_id, quantity: 1 });
    }
  } else {
    await user.cart.push({ product: product_id, quantity: 1 });
  }

  var totalQuantity = 0;
  await user.cart.forEach((e) => {
    if (e) {
      totalQuantity += e.quantity;
    }
  });

  user.cartCount = totalQuantity;
  user.cartTotalPrice += product.price;

  await user.save();

  const user2 = await User.findById(id)
    .populate({
      path: "products",
      select: "name content price imageUrl slug",
    })
    .populate({
      path: "cart.product",
      select: "name content price imageUrl slug",
    });

  return res.status(200).json({
    success: true,
    data: user2,
  });
});

// Remove From Cart
const removeFromCart = asyncHandler(async (req, res, next) => {
  const { product_id } = req.params;
  const { id } = req.user;

  const user = await User.findById(id);

  const product = await Product.findById(product_id);

  var cartItems = [];

  await user.cart.forEach((cartItem) => {
    cartItems.push(cartItem.product.toString());
  });
  if (!cartItems.includes(product_id)) {
    return next(
      new CustomError(
        "You can not remove from cart operation for this product",
        400
      )
    );
  }

  await user.cart.forEach((cartItem) => {
    if (cartItem.product == product_id) {
      cartItem.quantity -= 1;
    }
    if (cartItem.quantity == 0) {
      cartItem.remove();
    }
  });

  var totalQuantity = 0;
  await user.cart.forEach((e) => {
    if (e) {
      totalQuantity += e.quantity;
    }
  });

  user.cartCount = totalQuantity;

  // const index = await user.cart.indexOf(product_id);
  // await user.cart.splice(index, 1);

  user.cartTotalPrice -= product.price;

  await user.save();

  const user2 = await User.findById(id)
    .populate({
      path: "products",
      select: "name content price imageUrl slug",
    })
    .populate({
      path: "cart.product",
      select: "name content price imageUrl slug",
    });

  return res.status(200).json({
    success: true,
    data: user2,
  });
});

// Full Remove From Cart
const fullRemoveFromCart = asyncHandler(async (req, res, next) => {
  const { product_id } = req.params;
  const { id } = req.user;

  const user = await User.findById(id);

  const product = await Product.findById(product_id);

  var cartItems = [];

  await user.cart.forEach((cartItem) => {
    cartItems.push(cartItem.product.toString());
  });
  if (!cartItems.includes(product_id)) {
    return next(
      new CustomError(
        "You can not remove from cart operation for this product",
        400
      )
    );
  }

  await user.cart.forEach((cartItem) => {
    if (cartItem.product == product_id) {
      user.cartTotalPrice -= product.price * cartItem.quantity;
      cartItem.quantity = 0;
    }
    if (cartItem.quantity == 0) {
      cartItem.remove();
    }
  });

  var totalQuantity = 0;
  await user.cart.forEach((e) => {
    if (e) {
      totalQuantity += e.quantity;
    }
  });

  user.cartCount = totalQuantity;

  // const index = await user.cart.indexOf(product_id);
  // await user.cart.splice(index, 1);

  await user.save();

  const user2 = await User.findById(id)
    .populate({
      path: "products",
      select: "name content price imageUrl slug",
    })
    .populate({
      path: "cart.product",
      select: "name content price imageUrl slug",
    });

  return res.status(200).json({
    success: true,
    data: user2,
  });
});

// Profile
const profile = asyncHandler(async (req, res, next) => {
  const { id } = req.user;

  const user = await User.findById(id)
    .populate({
      path: "products",
      select: "name content price imageUrl slug",
    })
    .populate({
      path: "cart.product",
      select: "name content price imageUrl slug",
    });

  return res.status(200).json({
    success: true,
    data: user,
  });
});

// Edit
const edit = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;
  const { id } = req.user;

  const user = await User.findById(id);

  if (name) {
    user.name = name;
  }
  if (email) {
    user.email = email;
  }
  if (password) {
    user.password = password;
  }
  if (req.savedProfileImage) {
    user.profile_image = req.savedProfileImage;
  }

  await user.save();

  const user2 = await User.findById(id)
    .select("+password")
    .populate({
      path: "products",
      select: "name content price imageUrl slug",
    })
    .populate({
      path: "cart.product",
      select: "name content price imageUrl slug",
    });

  return res.status(200).json({
    success: true,
    data: user2,
  });
});

// Forgot Password
const forgotpassword = asyncHandler(async (req, res, next) => {
  const resetEmail = req.body.email;

  const user = await User.findOne({ email: resetEmail });
  if (!user) {
    return next(new CustomError("There is no user with that email", 400));
  }
  const resetPasswordToken = user.getResetPasswordTokenFromUser();
  await user.save();

  const resetPasswordUrl = `http://localhost:3000/resetPassword?resetPasswordToken=${resetPasswordToken}`;

  const emailTemplate = `
    <h3>Reset Your Password</h3>
    <p>This <a href='${resetPasswordUrl}' target='_blank'>link</a> will expire in 1 hour</p>
    <p>Please reset your password before this time expires.</p>
    `;

  try {
    await sendEmail({
      from: process.env.SMTP_USER,
      to: resetEmail,
      subject: "Reset Your Password",
      html: emailTemplate,
    });

    return res.status(200).json({
      success: true,
      message: "Token Sent To Your Email",
    });
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    return next(new CustomError("Email Cloud Not Be Sent", 500));
  }
});

// Reset Password
const resetpassword = asyncHandler(async (req, res, next) => {
  const { resetPasswordToken } = req.query;
  const { password } = req.body;

  if (!resetPasswordToken) {
    return next(new CustomError("Please provide a valid token", 400));
  }

  let user = await User.findOne({
    resetPasswordToken: resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });
  if (!user) {
    return next(new CustomError("Invalid Token or Session Expired", 400));
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  return res.status(200).json({
    success: true,
    message: "Reset Password Process Successful",
  });
});

module.exports = {
  register,
  login,
  logout,
  addToCart,
  removeFromCart,
  profile,
  edit,
  forgotpassword,
  resetpassword,
  fullRemoveFromCart,
  uploadImage,
  userCart,
};
