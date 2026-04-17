const express = require("express");
const router = express.Router();

const {
  register,
  login,
  logout,
  getProfile,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  uploadAvatar,
} = require("../controllers/auth.controller");

const { protect } = require("../middleware/auth");
const upload = require("../middleware/upload");
const validate = require("../middleware/validate");
const {
  registerValidators,
  loginValidators,
  forgotPasswordValidators,
  resetPasswordValidators,
  changePasswordValidators,
  updateProfileValidators,
} = require("../middleware/validators/auth.validators");

router.post("/register", registerValidators, validate, register);
router.post("/login", loginValidators, validate, login);
router.post("/logout", protect, logout);
router.post("/forgot-password", forgotPasswordValidators, validate, forgotPassword);
router.put("/reset-password/:token", resetPasswordValidators, validate, resetPassword);
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfileValidators, validate, updateProfile);
router.put("/change-password", protect, changePasswordValidators, validate, changePassword);
router.post("/profile/avatar", protect, upload.single("avatar"), uploadAvatar);

module.exports = router;
