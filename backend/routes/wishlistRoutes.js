const express = require("express");
const Wishlist = require("../models/Wishlist");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const items = await Wishlist.find({ userEmail: email }).populate("productId").sort({ createdAt: -1 });
    res.json(items.filter((i) => i.productId));
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { email, productId } = req.body;
    if (!email || !productId) return res.status(400).json({ message: "Email and productId are required" });

    const item = await Wishlist.findOneAndUpdate(
      { userEmail: email, productId },
      { userEmail: email, productId },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).populate("productId");

    res.json(item);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.delete("/:productId", async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ message: "Email is required" });

    await Wishlist.findOneAndDelete({ userEmail: email, productId: req.params.productId });
    res.json({ message: "Removed from wishlist" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
