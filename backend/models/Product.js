const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: String,
  image: String,
  category: { type: String, default: "General" },
  brand: { type: String, default: "Gulkaar" },
  rating: { type: Number, default: 4.5, min: 0, max: 5 },
  seoTitle: String,
  seoDescription: String,
  seoKeywords: [String],
  metaRobots: { type: String, default: "index,follow" },
  slug: { type: String, unique: true, sparse: true },
  imageAlt: String,
  ogTitle: String,
  ogDescription: String,
  socialShareText: String,
  pinterestDescription: String,
  backlinkKeywords: [String],
});

module.exports = mongoose.model("Product", productSchema);