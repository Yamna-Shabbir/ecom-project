const mongoose = require("mongoose");

const supportQuestionSchema = new mongoose.Schema(
  {
    normalizedKey: { type: String, required: true, unique: true },
    questionText: { type: String, required: true },
    answer: { type: String, default: "" },
    status: { type: String, enum: ["pending", "answered"], default: "pending" },
    askCount: { type: Number, default: 1 },
    askedByEmail: { type: String, default: "" },
    answeredAt: { type: Date },
  },
  { timestamps: true }
);

supportQuestionSchema.index({ status: 1, askCount: -1 });

module.exports = mongoose.model("SupportQuestion", supportQuestionSchema);
