const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME } = require("../config/admin");

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields are required" });

    if (email === ADMIN_EMAIL) {
      return res.status(400).json({ message: "This email is reserved for admin." });
    }

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const role = "buyer";

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role,
    });
    await user.save();

    res.json({
      message: "Registration successful",
      name: user.name,
      role: user.role,
      requiresVerification: false,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "All fields are required" });

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      return res.json({ name: ADMIN_NAME, email: ADMIN_EMAIL, role: "admin" });
    }

    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ message: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(401).json({ message: "Wrong password" });

    res.json({ name: user.name, email: user.email, role: user.role });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.get("/users", async (req, res) => {
  try {
    const users = await User.find({}, { password: 0 }).sort({ _id: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;

