const { body } = require("express-validator");

const PAYMENT_METHODS = ["credit_card", "paypal", "bank_transfer", "crypto"];
const ORDER_STATUSES = ["pending", "paid", "processing", "delivered", "cancelled"];

exports.createOrderValidators = [
  body("paymentMethod")
    .notEmpty().withMessage("Payment method is required")
    .isIn(PAYMENT_METHODS)
    .withMessage(`Payment method must be one of: ${PAYMENT_METHODS.join(", ")}`),
];

exports.updateOrderStatusValidators = [
  body("status")
    .notEmpty().withMessage("Status is required")
    .isIn(ORDER_STATUSES)
    .withMessage(`Status must be one of: ${ORDER_STATUSES.join(", ")}`),
];
