const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");
const Product = require("../models/Product");
const Order = require("../models/Order");
const ProductEvent = require("../models/ProductEvent");
const { generateProductSeo } = require("../services/productSeoAi");

const router = express.Router();

function parsePriceFromQuery(q) {
  const text = String(q || "");
  const under = text.match(/\b(under|below|less than|<=)\s*\$?\s*(\d+(\.\d+)?)/i);
  const above = text.match(/\b(above|over|more than|>=)\s*\$?\s*(\d+(\.\d+)?)/i);
  const exact = text.match(/\b\$?\s*(\d+(\.\d+)?)\b/);

  const result = { minPrice: null, maxPrice: null };
  if (under) result.maxPrice = Number(under[2]);
  if (above) result.minPrice = Number(above[2]);
  // If user types "products 10" we won't force a filter; only under/above triggers.
  if (!under && !above && exact) return result;
  return result;
}

function sanitizeSearchText(q) {
  return String(q || "")
    .replace(/^(?:show\s+me|find(?:\s+me)?|search\s+for)\s+/i, "")
    .replace(/\bproducts?\b/gi, " ")
    .replace(/\b(under|below|less than|<=|above|over|more than|>=)\b/gi, " ")
    .replace(/\$?\s*\d+(\.\d+)?/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Configure multer storage for product images
const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `product-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Upload product image (Admin only)
router.post("/upload", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const imageUrl = `/uploads/${req.file.filename}`;
  res.json({ imageUrl });
});

// Add Product (Admin only)
router.post("/", async (req, res) => {
  try {
    const {
      name,
      price,
      description,
      image,
      category,
      brand,
      rating,
      seoTitle,
      seoDescription,
      seoKeywords,
      metaRobots,
      slug,
      imageAlt,
      ogTitle,
      ogDescription,
      socialShareText,
      pinterestDescription,
      backlinkKeywords,
    } = req.body;
    if (!name || !price) return res.status(400).json({ message: "Name and price required" });
    const product = new Product({
      name,
      price,
      description,
      image,
      category,
      brand,
      rating,
      seoTitle,
      seoDescription,
      seoKeywords,
      metaRobots,
      slug: slug && String(slug).trim() ? String(slug).trim() : undefined,
      imageAlt,
      ogTitle,
      ogDescription,
      socialShareText,
      pinterestDescription,
      backlinkKeywords,
    });
    await product.save();
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Get all products
router.get("/", async (req, res) => {
  try {
    const { q, category, brand, minPrice, maxPrice, minRating } = req.query;
    const filter = {};

    const parsed = parsePriceFromQuery(q);
    const effectiveMinPrice = minPrice ?? (parsed.minPrice ?? "");
    const effectiveMaxPrice = maxPrice ?? (parsed.maxPrice ?? "");
    const cleanedQ = sanitizeSearchText(q);

    if (q) {
      const rx = cleanedQ || q;
      filter.$or = [
        { name: { $regex: rx, $options: "i" } },
        { description: { $regex: rx, $options: "i" } },
        { category: { $regex: rx, $options: "i" } },
        { seoKeywords: { $elemMatch: { $regex: rx, $options: "i" } } },
      ];
    }
    if (category) filter.category = category;
    if (brand) filter.brand = brand;
    if (minRating) filter.rating = { ...(filter.rating || {}), $gte: Number(minRating) };
    if (effectiveMinPrice || effectiveMaxPrice) {
      filter.price = {};
      if (effectiveMinPrice) filter.price.$gte = Number(effectiveMinPrice);
      if (effectiveMaxPrice) filter.price.$lte = Number(effectiveMaxPrice);
    }

    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Autocomplete suggestions
router.get("/suggestions", async (req, res) => {
  try {
    const { q } = req.query;
    const cleanedQ = sanitizeSearchText(q);
    if (!cleanedQ || cleanedQ.length < 2) return res.json([]);

    const products = await Product.find(
      { name: { $regex: cleanedQ, $options: "i" } },
      { name: 1 }
    )
      .sort({ createdAt: -1 })
      .limit(6);

    res.json(products.map((p) => ({ id: p._id, name: p.name })));
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Frequently bought (purchase history)
router.get("/frequently-bought", async (req, res) => {
  try {
    const top = await Order.aggregate([
      { $unwind: "$products" },
      { $group: { _id: "$products.productId", qty: { $sum: "$products.quantity" } } },
      { $sort: { qty: -1 } },
      { $limit: 8 },
    ]);
    const ids = top.map((t) => t._id).filter(Boolean);
    const products = ids.length ? await Product.find({ _id: { $in: ids } }) : [];
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Generate SEO with AI (from request body — new/unsaved products)
router.post("/generate-seo", async (req, res) => {
  try {
    const { name, price, description, category, brand, rating } = req.body;
    if (!name) return res.status(400).json({ message: "Product name is required to generate SEO." });
    const seo = await generateProductSeo({
      name,
      price,
      description,
      category,
      brand,
      rating,
    });
    res.json(seo);
  } catch (err) {
    const status = err.statusCode || 500;
    res.status(status).json({ message: err.message || "SEO generation failed" });
  }
});

// Generate SEO with AI for a specific saved product
router.post("/:id/generate-seo", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid product id" });
    }
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const seo = await generateProductSeo({
      name: req.body.name || product.name,
      price: req.body.price ?? product.price,
      description: req.body.description ?? product.description,
      category: req.body.category || product.category,
      brand: req.body.brand || product.brand,
      rating: req.body.rating ?? product.rating,
    });
    res.json(seo);
  } catch (err) {
    const status = err.statusCode || 500;
    res.status(status).json({ message: err.message || "SEO generation failed" });
  }
});

// Track views/clicks for recommendations
router.post("/:id/event", async (req, res) => {
  try {
    const { type, userEmail, sessionId } = req.body;
    if (!["view", "click"].includes(type)) return res.status(400).json({ message: "Invalid event type" });
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ message: "Invalid product id" });

    await ProductEvent.create({
      type,
      userEmail: userEmail || null,
      sessionId: sessionId || null,
      productId: req.params.id,
    });

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Rule-based recommendation: customers also bought + trending fallback
router.get("/recommendations", async (req, res) => {
  try {
    const { productId, email, sessionId } = req.query;

    // 1) Behavior-based (views/clicks): recommend from user's recently viewed/clicked categories
    if (email || sessionId) {
      const events = await ProductEvent.find(
        email ? { userEmail: email } : { sessionId }
      )
        .sort({ createdAt: -1 })
        .limit(20);

      const eventProductIds = [...new Set(events.map((e) => String(e.productId)))].slice(0, 6);
      if (eventProductIds.length) {
        const viewedProducts = await Product.find({ _id: { $in: eventProductIds } }, { category: 1 }).limit(6);
        const categories = [...new Set(viewedProducts.map((p) => p.category).filter(Boolean))].slice(0, 3);
        if (categories.length) {
          const recs = await Product.find({ category: { $in: categories } }).sort({ rating: -1, createdAt: -1 }).limit(5);
          if (recs.length) return res.json(recs);
        }
      }
    }

    // 2) Purchase history: "customers also bought"
    if (productId && mongoose.Types.ObjectId.isValid(productId)) {
      const targetId = new mongoose.Types.ObjectId(productId);
      const related = await Order.aggregate([
        { $match: { "products.productId": targetId } },
        { $unwind: "$products" },
        { $match: { "products.productId": { $ne: targetId } } },
        { $group: { _id: "$products.productId", count: { $sum: "$products.quantity" } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ]);
      const ids = related.map((r) => r._id);
      const products = ids.length ? await Product.find({ _id: { $in: ids } }) : [];
      if (products.length) return res.json(products);
    }

    // 3) Trending: based on last 7 days clicks/views, fallback to rating
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const trendingAgg = await ProductEvent.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: "$productId", score: { $sum: 1 } } },
      { $sort: { score: -1 } },
      { $limit: 5 },
    ]);
    const trendIds = trendingAgg.map((t) => t._id);
    const trending = trendIds.length
      ? await Product.find({ _id: { $in: trendIds } })
      : await Product.find().sort({ rating: -1, createdAt: -1 }).limit(5);
    res.json(trending);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Update Product (Admin)
router.put("/:id", async (req, res) => {
  try {
    const update = { ...req.body };
    if ("slug" in update) {
      update.slug = update.slug && String(update.slug).trim() ? String(update.slug).trim() : undefined;
    }
    const product = await Product.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Delete Product (Admin)
router.delete("/:id", async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;