const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Order = require("../models/Order");

const CART_POPULATE_FIELDS = "name image price status downloadCount";

const recalculateTotalPrice = (cart) => {
  cart.totalPrice = cart.items.reduce((acc, item) => acc + item.price, 0);
};

exports.getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate(
      "items.product",
      CART_POPULATE_FIELDS,
    ).lean();

    // Return a default empty cart if none is found instead of a 404 error
    if (!cart) {
      return res.json({ success: true, cart: { items: [], totalPrice: 0 } });
    }

    res.json({ success: true, cart });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.addToCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const product = await Product.findById(productId);
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });

    // Prevent adding a product the user already purchased
    const alreadyOwned = await Order.exists({
      user: req.user._id,
      \"orderItems.product\": productId,
    });
    if (alreadyOwned) {
      return res.status(400).json({ success: false, message: "You already own this product" });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) cart = new Cart({ user: req.user._id, items: [] });

    const alreadyInCart = cart.items.some(
      (i) => i.product.toString() === productId,
    );
    if (alreadyInCart) {
      return res.status(400).json({ success: false, message: "Item already in cart" });
    }

    cart.items.push({ product: productId, price: product.price });

    recalculateTotalPrice(cart);
    await cart.save();
    await cart.populate("items.product", CART_POPULATE_FIELDS);
    res.json({ success: true, cart });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart)
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });

    cart.items = cart.items.filter(
      (i) => i._id.toString() !== req.params.itemId,
    );
    recalculateTotalPrice(cart);
    await cart.save();
    res.json({ success: true, cart });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.clearCart = async (req, res) => {
  try {
    await Cart.findOneAndDelete({ user: req.user._id });
    res.json({ success: true, message: "Cart cleared" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
