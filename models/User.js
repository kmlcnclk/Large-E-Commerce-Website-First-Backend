const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const slugify = require("slugify");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const UserSchema = new Schema({
  name: {
    type: String,
    required: [true, "Please enter a name"],
    unique: true,
  },
  email: {
    type: String,
    unique: true,
    required: [true, "Please enter a email address"],
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please fill a valid email address",
    ],
  },
  password: {
    type: String,
    required: [true, "Please enter a email address"],
    minlength: [6, "Password must be a minimum of 6 characters"],
    select: false,
  },
  products: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "Product",
    },
  ],
  productCount: {
    type: Number,
    default: 0,
  },
  role: {
    type: String,
    default: "user",
    enum: ["user", "admin"],
  },
  createAt: {
    type: Date,
    default: Date.now,
  },
  slug: {
    type: String,
  },
  profile_image: {
    type: String,
    default: "default.jpg",
  },
  resetPasswordToken: {
    type: String,
  },
  resetPasswordExpire: {
    type: Date,
  },
  cart: [
    {
      product: { type: mongoose.Schema.ObjectId, ref: "Product" },
      quantity: { type: Number },
    },
  ],
  cartCount: {
    type: Number,
    default: 0,
  },
  cartTotalPrice: {
    type: Number,
    default: 0,
  },
});

// Get Reset Password Token From User
UserSchema.methods.getResetPasswordTokenFromUser = function () {
  const randomHexString = crypto.randomBytes(15).toString("hex");
  const { RESET_PASSWORD_EXPIRE } = process.env;

  const resetPasswordToken = crypto
    .createHash("SHA256")
    .update(randomHexString)
    .digest("hex");

  this.resetPasswordToken = resetPasswordToken;
  this.resetPasswordExpire = Date.now() + parseInt(RESET_PASSWORD_EXPIRE);

  return resetPasswordToken;
};

// Generate Json Web Token From User
UserSchema.methods.generateJwtFromUser = function () {
  const { JSON_SECRET_KEY, JWT_EXPIRE } = process.env;

  const payload = {
    id: this._id,
    name: this.name,
  };

  const token = jwt.sign(payload, JSON_SECRET_KEY, {
    expiresIn: JWT_EXPIRE,
  });
  return token;
};

// Password Hashing
UserSchema.pre("save", function (next) {
  if (!this.isModified("password")) {
    next();
  }
  bcrypt.genSalt(10, (err, salt) => {
    if (err) next(err);
    bcrypt.hash(this.password, salt, (err, hash) => {
      if (err) next(err);
      this.password = hash;
      next();
    });
  });
});

// Name Slug .For example kamilcan-celik
UserSchema.pre("save", function (next) {
  if (!this.isModified("name")) {
    next();
  }
  this.slug = this.makeSlug();
  next();
});
// Name Slug .For example kamilcan-celik
UserSchema.methods.makeSlug = function () {
  return slugify(this.name, {
    replacement: "-",
    remove: /[*+~.()'"!:@]/g,
    lower: true,
  });
};

module.exports = mongoose.model("User", UserSchema);
