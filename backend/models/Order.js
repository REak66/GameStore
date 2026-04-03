const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  name: { type: String, required: true },
  image: { type: String },
  price: { type: Number, required: true },
  downloadLink: { type: String, default: "" },
});

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    orderItems: [orderItemSchema],
    paymentMethod: {
      type: String,
      required: true,
      enum: ["credit_card", "paypal", "bank_transfer", "crypto"],
    },
    paymentResult: {
      id: String,
      status: String,
      updateTime: String,
      emailAddress: String,
    },
    itemsPrice: { type: Number, required: true },
    taxPrice: { type: Number, required: true, default: 0 },
    totalPrice: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "paid", "processing", "delivered", "cancelled"],
      default: "pending",
    },
    isPaid: { type: Boolean, default: false },
    paidAt: Date,

    trackingNumber: String,
  },
  { timestamps: true, bufferCommands: false },
);

module.exports = mongoose.model("Order", orderSchema);
