const { body } = require("express-validator");

exports.createProductValidators = [
  body("name")
    .trim()
    .notEmpty().withMessage("Product name is required")
    .isLength({ max: 100 }).withMessage("Name must not exceed 100 characters"),
  body("description")
    .trim()
    .notEmpty().withMessage("Description is required"),
  body("price")
    .notEmpty().withMessage("Price is required")
    .isFloat({ min: 0 }).withMessage("Price must be a non-negative number"),
  body("category")
    .notEmpty().withMessage("Category is required")
    .isMongoId().withMessage("Category must be a valid ID"),
];

exports.updateProductValidators = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 }).withMessage("Name must not exceed 100 characters"),
  body("price")
    .optional()
    .isFloat({ min: 0 }).withMessage("Price must be a non-negative number"),
  body("category")
    .optional()
    .isMongoId().withMessage("Category must be a valid ID"),
];

exports.addReviewValidators = [
  body("rating")
    .notEmpty().withMessage("Rating is required")
    .isInt({ min: 1, max: 5 }).withMessage("Rating must be an integer between 1 and 5"),
  body("comment")
    .trim()
    .notEmpty().withMessage("Comment is required"),
];
