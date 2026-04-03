const Product = require("../models/Product");
const Order = require("../models/Order");

exports.getProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    let query = {};
    if (req.query.category) query.category = req.query.category;
    if (req.query.status && req.query.status !== "all")
      query.status = req.query.status;
    else if (!req.query.status) query.status = "active";
    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: "i" } },
        { description: { $regex: req.query.search, $options: "i" } },
      ];
    }
    if (req.query.minPrice || req.query.maxPrice) {
      query.price = {};
      if (req.query.minPrice) query.price.$gte = parseFloat(req.query.minPrice);
      if (req.query.maxPrice) query.price.$lte = parseFloat(req.query.maxPrice);
    }

    let sortQuery = {};
    switch (req.query.sort) {
      case "price_asc":
        sortQuery = { price: 1 };
        break;
      case "price_desc":
        sortQuery = { price: -1 };
        break;
      case "newest":
        sortQuery = { createdAt: -1 };
        break;
      case "rating":
        sortQuery = { rating: -1 };
        break;
      default:
        sortQuery = { createdAt: -1 };
    }

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate("category", "name")
      .sort(sortQuery)
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      products,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("category", "name")
      .populate("reviews.user", "name avatar");
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });

    let alreadyPurchased = false;
    let purchasedOrderId = null;
    if (req.user) {
      const userOrders = await Order.find({ user: req.user._id }, "orderItems _id");
      outer: for (const order of userOrders) {
        for (const item of order.orderItems) {
          if (item.product.toString() === product._id.toString()) {
            alreadyPurchased = true;
            purchasedOrderId = order._id;
            break outer;
          }
        }
      }
    }

    res.json({ success: true, product, alreadyPurchased, purchasedOrderId });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const productData = { ...req.body };
    if (req.file) productData.image = `/uploads/${req.file.filename}`;
    // Ensure downloadLink is set if provided
    if (req.body.downloadLink) productData.downloadLink = req.body.downloadLink;
    const product = await Product.create(productData);
    res.status(201).json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const productData = { ...req.body };
    if (req.file) productData.image = `/uploads/${req.file.filename}`;
    if (req.body.downloadLink !== undefined)
      productData.downloadLink = req.body.downloadLink;
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      productData,
      { new: true, runValidators: true },
    );
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    res.json({ success: true, message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.addReview = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString(),
    );
    if (alreadyReviewed)
      return res
        .status(400)
        .json({ success: false, message: "Product already reviewed" });
    const review = {
      user: req.user._id,
      name: req.user.name,
      rating: Number(req.body.rating),
      comment: req.body.comment,
    };
    product.reviews.push(review);
    product.numReviews = product.reviews.length;
    product.rating =
      product.reviews.reduce((acc, r) => r.rating + acc, 0) /
      product.reviews.length;
    await product.save();
    res.status(201).json({ success: true, message: "Review added" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getFeaturedProducts = async (req, res) => {
  try {
    const products = await Product.find({ featured: true, status: "active" })
      .populate("category", "name")
      .limit(8);
    res.json({ success: true, products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
