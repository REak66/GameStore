const Wishlist = require("../models/Wishlist");

exports.getWishlist = async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id }).populate(
      "products",
      "name image price rating",
    ).lean();
    if (!wishlist) {
      return res.json({ success: true, wishlist: { products: [] } });
    }
    res.json({ success: true, wishlist });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.addToWishlist = async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist)
      wishlist = new Wishlist({ user: req.user._id, products: [] });
    if (!wishlist.products.includes(req.body.productId)) {
      wishlist.products.push(req.body.productId);
      await wishlist.save();
    }
    await wishlist.populate("products", "name image price rating");
    res.json({ success: true, wishlist });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.removeFromWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist)
      return res
        .status(404)
        .json({ success: false, message: "Wishlist not found" });
    wishlist.products = wishlist.products.filter(
      (p) => p.toString() !== req.params.productId,
    );
    await wishlist.save();
    res.json({ success: true, message: "Removed from wishlist" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
