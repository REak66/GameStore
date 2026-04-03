const express = require("express");
const router = express.Router();

const {
  getDashboardStats,
  getUsers,
  updateUser,
  deleteUser,
  uploadAvatar,
  getAuthLogs,
} = require("../controllers/admin.controller");

const { protect, authorize } = require("../middleware/auth");
const upload = require("../middleware/upload");

router.use(protect, authorize("admin"));
router.get("/dashboard", getDashboardStats);
router.get("/auth-logs", getAuthLogs);
router.get("/users", getUsers);
router.put("/users/:id", updateUser);

// Avatar upload endpoint
router.post("/users/:id/avatar", upload.single("avatar"), uploadAvatar);
router.delete("/users/:id", deleteUser);

module.exports = router;
