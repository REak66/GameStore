const { body } = require("express-validator");

exports.registerValidators = [
  body("name")
    .trim()
    .notEmpty().withMessage("Name is required")
    .isLength({ min: 2, max: 50 }).withMessage("Name must be 2–50 characters"),
  body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Must be a valid email address"),
  body("password")
    .isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
];

exports.loginValidators = [
  body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Must be a valid email address"),
  body("password")
    .notEmpty().withMessage("Password is required"),
];

exports.forgotPasswordValidators = [
  body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Must be a valid email address"),
];

exports.resetPasswordValidators = [
  body("password")
    .isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
];

exports.changePasswordValidators = [
  body("currentPassword")
    .notEmpty().withMessage("Current password is required"),
  body("newPassword")
    .isLength({ min: 6 }).withMessage("New password must be at least 6 characters"),
];

exports.updateProfileValidators = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage("Name must be 2–50 characters"),
  body("phone")
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^[+\d\s\-().]{7,20}$/).withMessage("Invalid phone number format"),
];
