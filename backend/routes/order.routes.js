const express = require("express");
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrder,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
  payOrder,
  deleteOrder,
  downloadOrderItem,
  getDownloadToken,
  streamByToken,
} = require("../controllers/order.controller");
const { protect, authorize } = require("../middleware/auth");
const validate = require("../middleware/validate");
const {
  createOrderValidators,
  updateOrderStatusValidators,
} = require("../middleware/validators/order.validators");

// Token-based stream — no Bearer header required; the signed JWT provides auth
router.get("/file", streamByToken);

router.use(protect);
router.get("/", authorize("admin"), getAllOrders);
router.post("/", createOrderValidators, validate, createOrder);
router.get("/my-orders", getMyOrders);
router.get("/:id", getOrder);
router.put("/:id/cancel", cancelOrder);
router.put("/:id/pay", payOrder);
router.get("/:id/download/:productId/token", getDownloadToken);
router.get("/:id/download/:productId", downloadOrderItem);
router.put("/:id/status", authorize("admin"), updateOrderStatusValidators, validate, updateOrderStatus);
router.delete("/:id", authorize("admin"), deleteOrder);

module.exports = router;
