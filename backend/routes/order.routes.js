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
} = require("../controllers/order.controller");
const { protect, authorize } = require("../middleware/auth");

router.use(protect);
router.get("/", authorize("admin"), getAllOrders);
router.post("/", createOrder);
router.get("/my-orders", getMyOrders);
router.get("/:id", getOrder);
router.put("/:id/cancel", cancelOrder);
router.put("/:id/pay", payOrder);
router.put("/:id/status", authorize("admin"), updateOrderStatus);
router.delete("/:id", authorize("admin"), deleteOrder);

module.exports = router;
