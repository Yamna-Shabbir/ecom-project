const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  buyerName: { type: String, required: true },
  buyerEmail: { type: String, required: true },
  buyerPhone: { type: String, required: true },
  buyerCity: { type: String, required: true },
  buyerAddress: { type: String, required: true },
  products: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      name: String,
      price: Number,
      quantity: Number,
    },
  ],
  totalPrice: Number,
  paymentMethod: {
    type: String,
    enum: ["CASH", "CARD"],
    required: true,
  },
  paymentIntentId: String,
  paymentStatus: {
    type: String,
    enum: ["Pending", "Paid"],
    default: "Pending",
  },
  status: {
    type: String,
    enum: ["Pending", "Packed", "Dispatched", "Delivered", "Cancelled"],
    default: "Pending",
  },
  reviewRating: { type: Number, min: 1, max: 5 },
  reviewComment: String,
  reviewedAt: Date,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Order", orderSchema);