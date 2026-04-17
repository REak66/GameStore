const jwt = require("jsonwebtoken");
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const User = require("../models/User");
const { sendPaymentSuccessAlert } = require("../services/telegram.service");
const { streamDriveFile } = require("../services/drive.service");

/**
 * Strip the internal downloadLink field from order items before sending to clients.
 * The raw Drive file ID must never be exposed via the API.
 */
const sanitizeOrder = (order) => {
  const obj = order.toObject ? order.toObject() : { ...order };
  if (Array.isArray(obj.orderItems)) {
    obj.orderItems = obj.orderItems.map(({ downloadLink, ...rest }) => rest);
  }
  return obj;
};

const TAX_RATE = 0.1;

exports.createOrder = async (req, res) => {
  try {
    const { paymentMethod } = req.body;
    const cart = await Cart.findOne({ user: req.user._id }).populate(
      "items.product",
    );
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    // Prevent duplicate purchase: check if user already bought any product in cart
    const userOrders = await Order.find({ user: req.user._id });
    const purchasedProductIds = new Set();
    userOrders.forEach(order => {
      order.orderItems.forEach(item => purchasedProductIds.add(item.product.toString()));
    });
    for (const item of cart.items) {
      if (purchasedProductIds.has(item.product._id.toString())) {
        return res.status(400).json({
          success: false,
          message: `You have already purchased: ${item.product.name}`,
        });
      }
    }

    const orderItems = cart.items.map((item) => ({
      product: item.product._id,
      name: item.product.name,
      image: item.product.image,
      price: item.price,
      downloadLink: item.product.downloadLink || "",
    }));

    const itemsPrice = cart.totalPrice;
    const taxPrice = parseFloat((TAX_RATE * itemsPrice).toFixed(2));
    const totalPrice = itemsPrice + taxPrice;

    const order = await Order.create({
      user: req.user._id,
      orderItems,
      paymentMethod,
      itemsPrice,
      taxPrice,
      totalPrice,
    });

    // Increment downloadCount after order is created
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.product._id, {
        $inc: { downloadCount: 1 },
      });
    }

    await Cart.findOneAndDelete({ user: req.user._id });

    res.status(201).json({ success: true, order: sanitizeOrder(order) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate("orderItems.product", "name image");
    res.json({ success: true, orders: orders.map(sanitizeOrder) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getOrder = async (req, res) => {
  try {
    // Explicitly exclude downloadLink from the populated Product fields
    const order = await Order.findById(req.params.id)
      .populate("user", "name email")
      .populate("orderItems.product", "name image");
    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    if (
      order.user._id.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }
    res.json({ success: true, order: sanitizeOrder(order) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    if (order.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }
    if (["delivered"].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel order in current status",
      });
    }
    order.status = "cancelled";
    await order.save();

    // No stock to restore

    res.json({ success: true, order: sanitizeOrder(order) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    let query = {};
    if (req.query.status) query.status = req.query.status;

    // Date range filter
    if (req.query.dateFrom || req.query.dateTo) {
      query.createdAt = {};
      if (req.query.dateFrom)
        query.createdAt.$gte = new Date(req.query.dateFrom);
      if (req.query.dateTo) {
        const dateTo = new Date(req.query.dateTo);
        dateTo.setHours(23, 59, 59, 999);
        query.createdAt.$lte = dateTo;
      }
    }

    // Search by customer name
    if (req.query.search) {
      const users = await User.find(
        { name: { $regex: req.query.search, $options: "i" } },
        "_id",
      );
      query.user = { $in: users.map((u) => u._id) };
    }

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    res.json({
      success: true,
      orders: orders.map(sanitizeOrder),
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    res.json({ success: true, message: "Order deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/orders/:id/download/:productId
 * Streams the purchased game file from Google Drive.
 * Requires: authenticated user who owns the order AND order is paid.
 * The product's downloadLink field must contain a Google Drive File ID.
 */
exports.downloadOrderItem = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order)
      return res.status(404).json({ success: false, message: "Order not found" });

    // Ownership check
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    // Must be a paid order
    if (!order.isPaid && order.status !== "paid") {
      return res.status(403).json({ success: false, message: "Order not paid" });
    }

    // Find the specific order item
    const item = order.orderItems.find(
      (i) => i.product.toString() === req.params.productId,
    );
    if (!item) {
      return res.status(404).json({ success: false, message: "Product not in this order" });
    }

    // The downloadLink field stores the Google Drive File ID
    const fileId = item.downloadLink;
    if (!fileId) {
      return res.status(404).json({ success: false, message: "No download available for this item" });
    }

    // Stream the file through our server (keeps the file ID hidden from the client)
    await streamDriveFile(fileId, res);
  } catch (err) {
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true },
    );
    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    res.json({ success: true, order: sanitizeOrder(order) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.payOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    if (order.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }
    if (order.status !== "pending") {
      return res
        .status(400)
        .json({ success: false, message: "Order is not in pending state" });
    }
    order.status = "paid";
    order.isPaid = true;
    order.paidAt = new Date();
    await order.save();

    const user = await User.findById(req.user._id, "name email");
    sendPaymentSuccessAlert(order, user).catch((err) =>
      console.error("Telegram notification failed:", err.message),
    );

    res.json({ success: true, order: sanitizeOrder(order) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/orders/:id/download/:productId/token
 * Issues a short-lived signed JWT the client can use to stream the file
 * WITHOUT needing to re-send the Bearer auth token (useful for <a href> links).
 * The token encodes the Drive file ID so it never travels to the client in plain form.
 */
exports.getDownloadToken = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order)
      return res.status(404).json({ success: false, message: "Order not found" });

    if (order.user.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: "Not authorized" });

    if (!order.isPaid && order.status !== "paid")
      return res.status(403).json({ success: false, message: "Order not paid" });

    const item = order.orderItems.find(
      (i) => i.product.toString() === req.params.productId,
    );
    if (!item)
      return res.status(404).json({ success: false, message: "Product not in this order" });
    if (!item.downloadLink)
      return res.status(404).json({ success: false, message: "No download available for this item" });

    const expiresIn = parseInt(process.env.DOWNLOAD_TOKEN_EXPIRY_SECONDS) || 900; // 15 min
    const token = jwt.sign(
      {
        type: "download",
        orderId: req.params.id,
        productId: req.params.productId,
        userId: req.user._id.toString(),
        fileId: item.downloadLink,
      },
      process.env.JWT_SECRET,
      { expiresIn },
    );

    res.json({
      success: true,
      token,
      expiresIn,
      expiresAt: new Date(Date.now() + expiresIn * 1000),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/orders/file?token=...
 * Validates a short-lived download token (issued by getDownloadToken) and
 * streams the file from Google Drive.  No Bearer token required — the JWT
 * in the query string provides authentication.  This lets the client open a
 * normal browser download link instead of a fetch/XHR blob request.
 */
exports.streamByToken = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token)
      return res.status(400).json({ success: false, message: "Download token required" });

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({ success: false, message: "Invalid or expired download token" });
    }

    if (payload.type !== "download" || !payload.fileId || !payload.orderId)
      return res.status(400).json({ success: false, message: "Invalid token payload" });

    await streamDriveFile(payload.fileId, res);
  } catch (err) {
    if (!res.headersSent)
      res.status(500).json({ success: false, message: err.message });
  }
};
