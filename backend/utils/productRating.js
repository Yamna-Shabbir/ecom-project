const mongoose = require("mongoose");
const Product = require("../models/Product");
const ProductReview = require("../models/ProductReview");

async function recalculateProductRating(productId) {
  const pid = new mongoose.Types.ObjectId(productId);
  const stats = await ProductReview.aggregate([
    { $match: { productId: pid } },
    {
      $group: {
        _id: "$productId",
        avg: { $avg: "$rating" },
        count: { $sum: 1 },
      },
    },
  ]);

  const avg = stats[0]?.avg;
  const count = stats[0]?.count || 0;
  const rating = count > 0 ? Math.round(avg * 10) / 10 : 0;

  await Product.findByIdAndUpdate(productId, { rating, reviewCount: count });
  return { rating, reviewCount: count };
}

async function upsertProductReview({ productId, userEmail, orderId, rating, comment }) {
  const review = await ProductReview.findOneAndUpdate(
    { productId, userEmail },
    {
      productId,
      userEmail: userEmail.toLowerCase().trim(),
      orderId,
      rating,
      comment: comment || "",
      createdAt: new Date(),
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  await recalculateProductRating(productId);
  return review;
}

module.exports = { recalculateProductRating, upsertProductReview };
