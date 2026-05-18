const express = require("express");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY || "sk_test_replace_me");
const Order = require("../models/Order");
const Product = require("../models/Product");
const ProductEvent = require("../models/ProductEvent");
const User = require("../models/User");

const router = express.Router();

function normalizeCardNumber(cardNumber) {
  return String(cardNumber || "").replace(/\s+/g, "");
}

function isValidTestCard(cardNumber) {
  const normalized = normalizeCardNumber(cardNumber);
  // Very simple test rule: accept 4242... and any 16-digit numeric card.
  if (normalized === "4242424242424242") return true;
  return /^\d{16}$/.test(normalized);
}

// Create Stripe PaymentIntent for card payments
router.post("/create-payment-intent", async (req, res) => {
  try {
    const { totalPrice } = req.body;
    if (!totalPrice) return res.status(400).json({ message: "Missing total price" });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalPrice * 100),
      currency: "usd",
      automatic_payment_methods: { enabled: true },
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error("Stripe error:", err.message);
    res.status(500).json({ message: "Payment initialization failed", error: err.message });
  }
});

// Fake sandbox card payment (no Stripe required)
router.post("/fake-charge", async (req, res) => {
  try {
    const { cardNumber, totalPrice } = req.body;
    if (!totalPrice) return res.status(400).json({ message: "Missing total price" });
    if (!isValidTestCard(cardNumber)) {
      return res.status(400).json({ message: "Card declined (sandbox). Use 4242 4242 4242 4242." });
    }

    const paymentId = `fake_${Date.now()}`;
    res.json({ paymentId, status: "succeeded" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Create new order
router.post("/", async (req, res) => {
  try {
    const {
      buyerName,
      buyerEmail,
      buyerPhone,
      buyerCity,
      buyerAddress,
      products,
      totalPrice,
      paymentMethod,
      paymentIntentId,
    } = req.body;
    if (!buyerName || !buyerEmail || !buyerPhone || !buyerCity || !buyerAddress || !products?.length || !paymentMethod)
      return res.status(400).json({ message: "Missing order details" });
    if (paymentMethod === "CARD" && !paymentIntentId) {
      return res.status(400).json({ message: "Missing payment id for card order" });
    }

    const order = new Order({
      buyerName,
      buyerEmail,
      buyerPhone,
      buyerCity,
      buyerAddress,
      products,
      totalPrice,
      paymentMethod,
      paymentIntentId: paymentIntentId || undefined,
      paymentStatus: paymentMethod === "CARD" ? "Paid" : "Pending",
    });
    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Get all orders (Admin only)
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Get orders for a specific buyer (by email)
router.get("/mine", async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const orders = await Order.find({ buyerEmail: email }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.get("/:id/tracking", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    const statuses = ["Pending", "Packed", "Dispatched", "Delivered"];
    const currentIndex = Math.max(statuses.indexOf(order.status), 0);
    const timeline = statuses.map((status, idx) => ({
      status,
      completed: idx <= currentIndex,
    }));

    res.json({
      orderId: order._id,
      currentStatus: order.status || "Pending",
      timeline,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Basic analytics for admin dashboard
router.get("/stats", async (req, res) => {
  try {
    const [totals] = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalPrice" },
          ordersCount: { $sum: 1 },
        },
      },
    ]);

    const topProducts = await Order.aggregate([
      { $unwind: "$products" },
      {
        $group: {
          _id: "$products.productId",
          name: { $first: "$products.name" },
          soldQuantity: { $sum: "$products.quantity" },
          revenue: { $sum: { $multiply: ["$products.price", "$products.quantity"] } },
        },
      },
      { $sort: { soldQuantity: -1 } },
      { $limit: 5 },
    ]);

    res.json({
      totalRevenue: totals?.totalRevenue || 0,
      ordersCount: totals?.ordersCount || 0,
      topProducts,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Full analytics dashboard (Admin)
router.get("/analytics", async (req, res) => {
  try {
    const days = Math.min(Math.max(Number(req.query.days) || 30, 7), 90);
    const since = new Date();
    since.setHours(0, 0, 0, 0);
    since.setDate(since.getDate() - (days - 1));

    const [
      totalsAgg,
      topProducts,
      revenueByDay,
      ordersByStatus,
      paymentBreakdown,
      revenueByCategory,
      topViewed,
      monthlyRevenue,
      uniqueBuyers,
      usersCount,
      productsCount,
      avgRatingAgg,
      recentOrders,
    ] = await Promise.all([
      Order.aggregate([
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$totalPrice" },
            ordersCount: { $sum: 1 },
          },
        },
      ]),
      Order.aggregate([
        { $unwind: "$products" },
        {
          $group: {
            _id: "$products.productId",
            name: { $first: "$products.name" },
            soldQuantity: { $sum: "$products.quantity" },
            revenue: { $sum: { $multiply: ["$products.price", "$products.quantity"] } },
            orderCount: { $sum: 1 },
          },
        },
        { $sort: { soldQuantity: -1 } },
        { $limit: 10 },
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: since } } },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
            revenue: { $sum: "$totalPrice" },
            orders: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Order.aggregate([
        {
          $group: {
            _id: { $ifNull: ["$status", "Pending"] },
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
      ]),
      Order.aggregate([
        {
          $group: {
            _id: "$paymentMethod",
            count: { $sum: 1 },
            revenue: { $sum: "$totalPrice" },
          },
        },
      ]),
      Order.aggregate([
        { $unwind: "$products" },
        {
          $lookup: {
            from: "products",
            localField: "products.productId",
            foreignField: "_id",
            as: "productDoc",
          },
        },
        { $unwind: { path: "$productDoc", preserveNullAndEmptyArrays: true } },
        {
          $group: {
            _id: { $ifNull: ["$productDoc.category", "Uncategorized"] },
            revenue: { $sum: { $multiply: ["$products.price", "$products.quantity"] } },
            units: { $sum: "$products.quantity" },
          },
        },
        { $sort: { revenue: -1 } },
        { $limit: 8 },
      ]),
      ProductEvent.aggregate([
        { $match: { createdAt: { $gte: since } } },
        {
          $group: {
            _id: "$productId",
            views: { $sum: { $cond: [{ $eq: ["$type", "view"] }, 1, 0] } },
            clicks: { $sum: { $cond: [{ $eq: ["$type", "click"] }, 1, 0] } },
            total: { $sum: 1 },
          },
        },
        { $sort: { total: -1 } },
        { $limit: 8 },
      ]),
      Order.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(new Date().setMonth(new Date().getMonth() - 5, 1)),
            },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m", date: "$createdAt" },
            },
            revenue: { $sum: "$totalPrice" },
            orders: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Order.distinct("buyerEmail"),
      User.countDocuments({ role: "buyer" }),
      Product.countDocuments(),
      Order.aggregate([
        { $match: { reviewRating: { $exists: true, $ne: null } } },
        { $group: { _id: null, avg: { $avg: "$reviewRating" }, count: { $sum: 1 } } },
      ]),
      Order.find()
        .sort({ createdAt: -1 })
        .limit(6)
        .select("buyerName totalPrice status paymentMethod createdAt"),
    ]);

    const totals = totalsAgg[0] || { totalRevenue: 0, ordersCount: 0 };
    const ordersCount = totals.ordersCount || 0;
    const totalRevenue = totals.totalRevenue || 0;

    const viewedIds = topViewed.map((v) => v._id).filter(Boolean);
    const viewedProducts = viewedIds.length
      ? await Product.find({ _id: { $in: viewedIds } }, { name: 1 })
      : [];
    const nameById = Object.fromEntries(viewedProducts.map((p) => [String(p._id), p.name]));

    const dayMap = Object.fromEntries(
      revenueByDay.map((d) => [d._id, { date: d._id, revenue: d.revenue, orders: d.orders }])
    );
    const revenueTimeline = [];
    for (let i = 0; i < days; i++) {
      const d = new Date(since);
      d.setDate(since.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      revenueTimeline.push(dayMap[key] || { date: key, revenue: 0, orders: 0 });
    }

    res.json({
      summary: {
        totalRevenue,
        ordersCount,
        avgOrderValue: ordersCount ? totalRevenue / ordersCount : 0,
        uniqueCustomers: uniqueBuyers.length,
        registeredBuyers: usersCount,
        productsCount,
        avgReview: avgRatingAgg[0]?.avg || 0,
        reviewCount: avgRatingAgg[0]?.count || 0,
      },
      topProducts,
      revenueTimeline,
      ordersByStatus: ordersByStatus.map((s) => ({
        status: s._id,
        count: s.count,
      })),
      paymentBreakdown: paymentBreakdown.map((p) => ({
        method: p._id || "Unknown",
        count: p.count,
        revenue: p.revenue,
      })),
      revenueByCategory: revenueByCategory.map((c) => ({
        category: c._id,
        revenue: c.revenue,
        units: c.units,
      })),
      topViewed: topViewed.map((v) => ({
        productId: v._id,
        name: nameById[String(v._id)] || "Unknown product",
        views: v.views,
        clicks: v.clicks,
        total: v.total,
      })),
      monthlyRevenue: monthlyRevenue.map((m) => ({
        month: m._id,
        revenue: m.revenue,
        orders: m.orders,
      })),
      recentOrders,
      days,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Update order status (Admin)
router.put("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ["Pending", "Packed", "Dispatched", "Delivered", "Cancelled"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Add or update a review for an order (Buyer)
router.put("/:id/review", async (req, res) => {
  try {
    const { reviewRating, reviewComment } = req.body;
    if (!reviewRating) {
      return res.status(400).json({ message: "Rating is required" });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        reviewRating,
        reviewComment: reviewComment || "",
        reviewedAt: new Date(),
      },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;