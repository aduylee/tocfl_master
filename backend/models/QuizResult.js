const mongoose = require("mongoose");

const quizResultSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true },
    score: { type: Number, required: true },
    totalQuestions: { type: Number, default: 10 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("QuizResult", quizResultSchema);