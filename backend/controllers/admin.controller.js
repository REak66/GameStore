const User = require("../models/User");
const AuthLog = require("../models/AuthLog");
const Product = require("../models/Product");
const Order = require("../models/Order");
const Category = require("../models/Category");

const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

// Get authentication logs (admin only)
exports.getAuthLogs = async (req, res) => {
  try {
    const {
      userId,
      email,
      action,
      success,
      from,
      to,
      search,
      page = 1,
      limit = 10,
    } = req.query;
    const filter = {};

    if (userId) filter.user = userId;
    if (email) filter.email = email;
    if (action) filter.action = action;
    if (success === "true") filter.success = true;
    if (success === "false") filter.success = false;

    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to);
    }

    if (search) {
      const matchingUsers = await User.find({
        name: { $regex: search, $options: "i" },
      }).select("_id");
      const userIds = matchingUsers.map((u) => u._id);

      filter.$or = [
        { email: { $regex: search, $options: "i" } },
        { user: { $in: userIds } },
      ];
    }

    const skipIndex = (Number(page) - 1) * Number(limit);
    const total = await AuthLog.countDocuments(filter);

    const logs = await AuthLog.find(filter)
      .sort({ createdAt: -1 })
      .skip(skipIndex)
      .limit(Number(limit))
      .populate("user", "name email role");

    res.json({
      success: true,
      logs,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Avatar upload
exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file)
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });
    const user = await User.findById(req.params.id);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    user.avatar = `/uploads/${req.file.filename}`;
    await user.save();
    res.json({ success: true, avatar: user.avatar });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: "customer" });
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalSalesResult = await Order.aggregate([
      { $match: { status: { $ne: "cancelled" } } },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } },
    ]);
    const totalSales = totalSalesResult[0]?.total || 0;

    const recentOrders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .limit(10);

    const monthlySales = await Order.aggregate([
      {
        $match: {
          status: { $ne: "cancelled" },
          createdAt: { $gte: new Date(Date.now() - ONE_YEAR_MS) },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          sales: { $sum: "$totalPrice" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalSales,
        recentOrders,
        monthlySales,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { name, email, role, isActive, phone, address, avatar } = req.body;
    const allowedUpdates = { name, email, role, isActive, phone, address, avatar };
    Object.keys(allowedUpdates).forEach(
      (k) => allowedUpdates[k] === undefined && delete allowedUpdates[k],
    );
    const user = await User.findByIdAndUpdate(req.params.id, allowedUpdates, {
      new: true,
      runValidators: true,
    });
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    // Prevent self-deletion
    if (req.user && req.user.id === req.params.id) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account."
      });
    }
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    res.json({ success: true, message: "User deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
