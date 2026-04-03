const express = require("express");
const router = express.Router();
const {
  getCart,
  addToCart,
  removeFromCart,
  clearCart,
} = require("../controllers/cart.controller");
const { protect } = require("../middleware/auth");

router.use(protect);
router.get("/", getCart);
router.post("/add", addToCart);
router.delete("/item/:itemId", removeFromCart);
router.delete("/clear", clearCart);

module.exports = router;
