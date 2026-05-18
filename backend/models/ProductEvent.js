const mongoose = require("mongoose");

const productEventSchema = new mongoose.Schema(
  {
    userEmail: { type: String, default: null, index: true },
    sessionId: { type: String, default: null, index: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    type: { type: String, enum: ["view", "click"], required: true, index: true },
    createdAt: { type: Date, default: Date.now, index: true },
  },
  { versionKey: false }
);

module.exports = mongoose.model("ProductEvent", productEventSchema);
