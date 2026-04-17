const express = require("express");
const router = express.Router();
const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} = require("../controllers/wishlist.controller");
const { protect } = require("../middleware/auth");
const validate = require("../middleware/validate");
const { addToWishlistValidators } = require("../middleware/validators/wishlist.validators");

router.use(protect);
router.get("/", getWishlist);
router.post("/add", addToWishlistValidators, validate, addToWishlist);
router.delete("/:productId", removeFromWishlist);

module.exports = router;
