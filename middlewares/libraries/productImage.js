const multer = require("multer");
const path = require("path");
const CustomError = require("../../helpers/errors/CustomError");
const { nanoid } = require("nanoid");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const rootDir = path.dirname(require.main.filename);
    cb(null, path.join(rootDir, "/public/products"));
  },
  filename: function (req, file, cb) {
    const extension = file.mimetype.split("/")[1];
    let randomId = nanoid(30);
    req.savedProductImage = "image_" + randomId + "." + extension;
    cb(null, req.savedProductImage);
  },
});
const fileFilter = (req, file, cb) => {
  let allowedMimeTypes = ["image/jpg", "image/png", "image/gif", "image/jpeg"];

  if (!allowedMimeTypes.includes(file.mimetype)) {
    return cb(new CustomError("Please provide a valid image file", 400), false);
  }

  return cb(null, true);
};
const productImage = multer({ storage, fileFilter });

module.exports = { productImage };
