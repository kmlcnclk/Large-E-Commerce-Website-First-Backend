const express = require("express");
const authRouter = express.Router();
const {
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
} = require("../controllers/auth");
const {
  getAccessToRoute,
  isTheUserRegistered,
} = require("../middlewares/auth/auth");
const { profileImage } = require("../middlewares/libraries/profileImage");
const {
  profileImageUpload,
} = require("../middlewares/libraries/profileImageUpload");

authRouter.post(
  "/register",
  [isTheUserRegistered, profileImage.single("profile_image")],
  register
);
authRouter.put(
  "/uploadimage",
  [getAccessToRoute, profileImage.single("profile_image")],
  uploadImage
);
authRouter.post("/login", login);
authRouter.get("/logout", getAccessToRoute, logout);
authRouter.get("/addToCart/:product_id", getAccessToRoute, addToCart);
authRouter.get("/removeFromCart/:product_id", getAccessToRoute, removeFromCart);
authRouter.get(
  "/fullRemoveFromCart/:product_id",
  getAccessToRoute,
  fullRemoveFromCart
);
authRouter.get("/profile", getAccessToRoute, profile);
authRouter.put(
  "/edit",
  [getAccessToRoute, profileImage.single("profile_image")],
  edit
);
authRouter.post("/forgotpassword", forgotpassword);
authRouter.put("/resetpassword", resetpassword);

authRouter.get("/cart", getAccessToRoute, userCart);

module.exports = authRouter;
