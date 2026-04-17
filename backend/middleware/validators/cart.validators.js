const { body } = require("express-validator");

exports.addToCartValidators = [
  body("productId")
    .notEmpty().withMessage("Product ID is required")
    .isMongoId().withMessage("Product ID must be a valid ID"),
];
