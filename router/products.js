const express = require('express');
const productsRouter = express.Router();
const {
  getAllProduct,
  addToProduct,
  likeProduct,
  undoLikeProduct,
  editProduct,
  deleteProduct,
  getSingleProduct,
  productAddImage,
  editProductImage,
} = require('../controllers/products');
const productQueryMiddleware = require('../middlewares/query/productQueryMiddleware');
const Product = require('../models/Product');
const {
  getAccessToRoute,
  getProductOwnerAccess,
} = require('../middlewares/auth/auth');
const {
  checkCategoryExistToProduct,
  checkProductExist,
  checkProductExist2,
} = require('../middlewares/database/databaseErrorHelpers');
const singleProductQueryMiddleware = require('../middlewares/query/singleProductQueryMiddleware');
const { productImage } = require('../middlewares/libraries/productImage');

productsRouter.post(
  '/product_add',
  [checkCategoryExistToProduct, checkProductExist, getAccessToRoute],
  addToProduct
);

productsRouter.post(
  '/productAddImage/:id',
  getAccessToRoute,
  productImage.array('imageUrl', 5),
  productAddImage
);

productsRouter.get(
  '/',
  productQueryMiddleware(Product, {
    // population: [
    //   {
    //     path: "category",
    //     select: "name",
    //   },
    //   {
    //     path: "user",
    //     select: "name",
    //   },
    // ],
  }),
  getAllProduct
);
productsRouter.get('/like/:id', getAccessToRoute, likeProduct);
productsRouter.get('/undolike/:id', getAccessToRoute, undoLikeProduct);
productsRouter.put(
  '/edit/:id',
  [getAccessToRoute, checkProductExist2, getProductOwnerAccess],
  editProduct
);
productsRouter.put(
  '/editImage/:id',
  [getAccessToRoute, productImage.array('imageUrl', 5)],
  editProductImage
);
productsRouter.delete(
  '/delete_product/:id',
  [getAccessToRoute, getProductOwnerAccess],
  deleteProduct
);
productsRouter.get(
  '/:slug',
  singleProductQueryMiddleware(Product),
  getSingleProduct
);

module.exports = productsRouter;
