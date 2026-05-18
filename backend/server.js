require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const { ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME } = require("./config/admin");

const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const orderWebhook = require("./routes/orderWebhook");
const wishlistRoutes = require("./routes/wishlistRoutes");
const chatbotRoutes = require("./routes/chatbotRoutes");
const supportRoutes = require("./routes/supportRoutes");

const app = express();

const clientOrigins = (process.env.CLIENT_URL || "http://localhost:3000")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || clientOrigins.includes(origin)) return callback(null, true);
      return callback(null, false);
    },
    credentials: true,
  })
);
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    env: process.env.NODE_ENV || "development",
    mongo: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

// Stripe webhook must use raw body and be defined BEFORE express.json()
app.post("/api/orders/webhook", express.raw({ type: "application/json" }), orderWebhook);

app.use(express.json());

// Serve uploaded images statically
const uploadsPath = path.join(__dirname, "uploads");
app.use("/uploads", express.static(uploadsPath));

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/support", supportRoutes);

// Optional: serve React build from same host (set SERVE_CLIENT=true on Render single-service deploy)
if (process.env.SERVE_CLIENT === "true") {
  const clientBuild = path.join(__dirname, "..", "frontend", "build");
  app.use(express.static(clientBuild));
  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(clientBuild, "index.html"));
  });
}

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/gulkaar";
console.log("Connecting to MongoDB...");

mongoose
  .connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 })
  .then(async () => {
    console.log("MongoDB connected");
    try {
      const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
      await User.findOneAndUpdate(
        { email: ADMIN_EMAIL },
        { name: ADMIN_NAME, email: ADMIN_EMAIL, password: hashedPassword, role: "admin" },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    } catch (err) {
      console.error("Failed to ensure admin user:", err.message);
    }

    const PORT = Number(process.env.PORT) || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });