const express = require("express");
const router = express.Router();
const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} = require("../controllers/wishlist.controller");
const { protect } = require("../middleware/auth");

router.use(protect);
router.get("/", getWishlist);
router.post("/add", addToWishlist);
router.delete("/:productId", removeFromWishlist);

module.exports = router;
