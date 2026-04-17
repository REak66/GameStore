const { validationResult } = require("express-validator");

/**
 * Express middleware that collects express-validator errors and returns
 * a structured 400 response if any exist.  Place this after your validator
 * chain and before the controller handler.
 *
 * @example
 *   router.post('/', [...validators], validate, controller);
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg,
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

module.exports = validate;
