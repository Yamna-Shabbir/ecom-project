const mongoose = require("mongoose");

const wishlistSchema = new mongoose.Schema(
  {
    userEmail: { type: String, required: true, index: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  },
  { timestamps: true }
);

wishlistSchema.index({ userEmail: 1, productId: 1 }, { unique: true });

module.exports = mongoose.model("Wishlist", wishlistSchema);
