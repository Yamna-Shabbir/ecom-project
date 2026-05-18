const express = require("express");
const mongoose = require("mongoose");
const SupportQuestion = require("../models/SupportQuestion");

const router = express.Router();

function normalizeQuestionKey(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[^\w\s?'-]/g, "")
    .trim()
    .slice(0, 500);
}

/** Top 3 answered questions by popularity (ask count) */
router.get("/faq/top", async (req, res) => {
  try {
    const items = await SupportQuestion.find({
      status: "answered",
      answer: { $nin: [null, ""] },
    })
      .sort({ askCount: -1, updatedAt: -1 })
      .limit(3)
      .lean();
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/** Buyer submits a question; duplicates merge and increment askCount */
router.post("/questions", async (req, res) => {
  try {
    const { question, email = "" } = req.body;
    const q = String(question || "").trim();
    if (q.length < 4) {
      return res.status(400).json({ message: "Please enter a question (at least a few words)." });
    }
    const normalizedKey = normalizeQuestionKey(q);
    if (normalizedKey.length < 4) {
      return res.status(400).json({ message: "Please use letters or words in your question." });
    }

    const existing = await SupportQuestion.findOne({ normalizedKey });
    if (existing) {
      existing.askCount += 1;
      if (email && !existing.askedByEmail) existing.askedByEmail = email;
      await existing.save();
      return res.json({
        message: existing.status === "answered" ? "Thanks! This is a popular question — see the FAQ above." : "Thanks — we’ve noted your question. The team will answer soon.",
        merged: true,
        askCount: existing.askCount,
      });
    }

    try {
      const doc = await SupportQuestion.create({
        normalizedKey,
        questionText: q,
        askedByEmail: email || "",
        status: "pending",
        askCount: 1,
      });
      return res.status(201).json({
        message: "Thanks! Your question was sent to our team.",
        id: doc._id,
      });
    } catch (createErr) {
      if (createErr.code === 11000) {
        const dup = await SupportQuestion.findOne({ normalizedKey });
        if (dup) {
          dup.askCount += 1;
          if (email && !dup.askedByEmail) dup.askedByEmail = email;
          await dup.save();
          return res.json({
            message:
              dup.status === "answered"
                ? "Thanks! This is a popular question — see the FAQ above."
                : "Thanks — we’ve noted your question. The team will answer soon.",
            merged: true,
            askCount: dup.askCount,
          });
        }
      }
      throw createErr;
    }
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/** Admin: all questions (pending first, then by ask count) */
router.get("/admin/questions", async (req, res) => {
  try {
    const items = await SupportQuestion.find().lean();
    items.sort((a, b) => {
      if (a.status !== b.status) return a.status === "pending" ? -1 : 1;
      if (b.askCount !== a.askCount) return b.askCount - a.askCount;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/** Admin: publish answer */
router.patch("/admin/questions/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid id" });
    }
    const { answer } = req.body;
    const a = String(answer || "").trim();
    if (a.length < 2) {
      return res.status(400).json({ message: "Please provide an answer." });
    }
    const doc = await SupportQuestion.findByIdAndUpdate(
      id,
      {
        answer: a,
        status: "answered",
        answeredAt: new Date(),
      },
      { new: true }
    );
    if (!doc) return res.status(404).json({ message: "Question not found" });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/** Admin: optional edit answer */
router.put("/admin/questions/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid id" });
    }
    const { answer } = req.body;
    const a = String(answer || "").trim();
    if (a.length < 2) {
      return res.status(400).json({ message: "Please provide an answer." });
    }
    const doc = await SupportQuestion.findByIdAndUpdate(
      id,
      { answer: a, answeredAt: new Date() },
      { new: true }
    );
    if (!doc) return res.status(404).json({ message: "Question not found" });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
