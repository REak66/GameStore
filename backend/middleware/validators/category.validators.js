const { body } = require("express-validator");

exports.createCategoryValidators = [
  body("name")
    .trim()
    .notEmpty().withMessage("Category name is required")
    .isLength({ max: 100 }).withMessage("Name must not exceed 100 characters"),
];

exports.updateCategoryValidators = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 }).withMessage("Name must not exceed 100 characters"),
];
