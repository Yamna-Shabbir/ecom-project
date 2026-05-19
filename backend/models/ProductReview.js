const mongoose = require("mongoose");

const productReviewSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  userEmail: { type: String, required: true, lowercase: true, trim: true },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
});

productReviewSchema.index({ productId: 1, userEmail: 1 }, { unique: true });

module.exports = mongoose.model("ProductReview", productReviewSchema);
