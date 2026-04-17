const express = require("express");
const router = express.Router();
const {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/category.controller");
const { protect, authorize } = require("../middleware/auth");
const validate = require("../middleware/validate");
const {
  createCategoryValidators,
  updateCategoryValidators,
} = require("../middleware/validators/category.validators");

router.get("/", getCategories);
router.get("/:id", getCategory);
router.post("/", protect, authorize("admin"), createCategoryValidators, validate, createCategory);
router.put("/:id", protect, authorize("admin"), updateCategoryValidators, validate, updateCategory);
router.delete("/:id", protect, authorize("admin"), deleteCategory);

module.exports = router;
