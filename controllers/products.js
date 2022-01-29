const Product = require("../models/Product");
const asyncHandler = require("express-async-handler");
const CustomError = require("../helpers/errors/CustomError");
const Category = require("../models/Category");
const User = require("../models/User");
const fetch = require("node-fetch");

// Get all product
const getAllProduct = asyncHandler((req, res, next) => {
  return res.status(200).json(res.queryResults);
});

// Product Add Image
const productAddImage = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;
  let files = [];
  // await req.files.forEach(async (file) => {});

  for (const file of req.files) {
    let url = `http://localhost:5000/public/products/${file.filename}`;

    const response = await fetch(url);
    const data = await response.url;
    files.push(data);
  }

  const product = await Product.findByIdAndUpdate(
    id,
    {
      imageUrl: files,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  const user = await User.findById(userId)
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
    data: product,
    user: user,
  });
});

// Add to product
const addToProduct = asyncHandler(async (req, res, next) => {
  const user_id = req.user.id;
  const { name, content, price, category } = req.body;

  // if (!req.savedProductImage) {
  //   return next(new CustomError("Product picture is required", 400));
  // }

  const product = await Product.create({
    name,
    content,
    price,
    category,
    user: user_id,
  });

  return res.status(200).json({
    success: true,
    data: product,
  });
});

// Like product
const likeProduct = asyncHandler(async (req, res, next) => {
  const product_id = req.params.id;
  const { id } = req.user;

  const product = await Product.findById(product_id);

  if (product.likes.includes(id)) {
    return next(new CustomError("You already like this product", 400));
  }

  product.likes.push(id);
  product.likeCount = product.likes.length;

  await product.save();

  return res.status(200).json({
    success: true,
    data: product,
  });
});

// Undo like product
const undoLikeProduct = asyncHandler(async (req, res, next) => {
  const product_id = req.params.id;
  const { id } = req.user;

  const product = await Product.findById(product_id);

  if (!product.likes.includes(id)) {
    return next(new CustomError("You don't like this product yet", 400));
  }

  const index = await product.likes.indexOf(product_id);
  await product.likes.splice(index, 1);
  product.likeCount = product.likes.length;

  await product.save();

  return res.status(200).json({
    success: true,
    data: product,
  });
});

// Edit product
const editProduct = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { name, content, price, category } = req.body;

  const categorys = await Category.findById(category);

  if (!categorys) {
    return next(new CustomError("There is no such category with that id", 400));
  }

  const product = await Product.findById(id);
  const categoryss = await Category.findById(product.category);

  if (product.category != category) {
    if (!categoryss.products.includes(id)) {
      return next(new CustomError("this product yet", 400));
    }

    const index = await categoryss.products.indexOf(id);
    await categoryss.products.splice(index, 1);
    categoryss.productCount = categoryss.products.length;
    await categoryss.save();
  }
  // if (imageUrl) {
  //   product.imageUrl = imageUrl;
  // }

  product.name = name;
  product.content = content;
  product.price = price;

  product.category = category;

  await product.save();

  return res.status(200).json({
    success: true,
    data: product,
  });
});

// Edit product image
const editProductImage = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;
  let files = [];

  for (const file of req.files) {
    let url = `http://localhost:5000/public/products/${file.filename}`;

    const response = await fetch(url);
    const data = await response.url;
    files.push(data);
  }

  if (req.files[0]) {
    const product = await Product.findByIdAndUpdate(
      id,
      {
        imageUrl: files,
      },
      {
        new: true,
        runValidators: true,
      }
    );
  }

  const user = await User.findById(userId)
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
    user: user,
  });
});

// Delete Product
const deleteProduct = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const product = await Product.findById(id);

  if (!product) {
    return next(
      new CustomError("There is not a product with this product id", 400)
    );
  }

  const category = await Category.findById(product.category);
  category.products.splice(category.products.indexOf(id), 1);
  category.productCount = category.products.length;
  await category.save();

  const user = await User.findById(product.user);
  user.products.splice(user.products.indexOf(id), 1);
  user.productCount = user.products.length;
  await user.save();

  const user3 = await User.findById(product.user);

  if (user3.cart[0]) {
    var newPrice = 0;

    for (const product2 of user3.cart) {
      if (product2.product == id) {
        await user3.cart.splice(user3.products.indexOf(product2.product), 1);
        user3.cartCount = await (user3.cartCount - product2.quantity);
      } else {
        newPrice += product.price * product2.quantity;
      }
    }

    user3.cartTotalPrice = newPrice;

    await user3.save();
  }

  await Product.findByIdAndRemove(id);

  const user2 = await User.findById(product.user)
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
    message: "Product deleted successfully",
    user: user2,
  });
});

// Get Single Product
const getSingleProduct = asyncHandler(async (req, res, next) => {
  const product = req.data;
  return res.status(200).json({
    success: true,
    data: product,
  });
});
module.exports = {
  getAllProduct,
  addToProduct,
  likeProduct,
  undoLikeProduct,
  editProduct,
  deleteProduct,
  getSingleProduct,
  productAddImage,
  editProductImage,
};
