const express = require("express");
const userRouter = express.Router();
const { getAllUser } = require("../controllers/user");

userRouter.get("/", getAllUser);

module.exports = userRouter;
