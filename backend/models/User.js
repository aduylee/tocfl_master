const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    // Các trường dữ liệu Streak & Tiến độ
    streak: { type: Number, default: 0 },
    totalVocabLearned: { type: Number, default: 0 },
    lastStudyDate: { type: Date, default: null },

    dailyProgress: {
      vocabCount: { type: Number, default: 0 },
      vocabTarget: { type: Number, default: 20 },
      quizCount: { type: Number, default: 0 },
      quizTarget: { type: Number, default: 2 },
      lastUpdatedDate: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);