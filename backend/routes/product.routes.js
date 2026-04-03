const express = require("express");
const router = express.Router();
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  addReview,
  getFeaturedProducts,
} = require("../controllers/product.controller");
const { protect, authorize, optionalProtect } = require("../middleware/auth");
const upload = require("../middleware/upload");

router.get("/featured", getFeaturedProducts);
router.get("/", getProducts);
router.get("/:id", optionalProtect, getProduct);
router.post(
  "/",
  protect,
  authorize("admin"),
  upload.single("image"),
  createProduct,
);
router.put(
  "/:id",
  protect,
  authorize("admin"),
  upload.single("image"),
  updateProduct,
);
router.delete("/:id", protect, authorize("admin"), deleteProduct);
router.post("/:id/reviews", protect, addReview);

module.exports = router;
