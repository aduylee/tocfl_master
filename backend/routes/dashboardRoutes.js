const express = require("express");
const router = express.Router();
const { getDashboardStats } = require("../controllers/dashboardController");
const QuizResult = require("../models/QuizResult");
const User = require("../models/User"); // 👈 Import thêm User model

// GET: Lấy thông số Dashboard
router.get("/stats/:userId", getDashboardStats);

// POST: Lưu kết quả thi từ Quiz.tsx
router.post("/quiz-result", async (req, res) => {
  try {
    const { userId, title, score } = req.body;
    if (!userId) return res.status(400).json({ success: false, message: "Thiếu userId" });

    const newResult = new QuizResult({
      userId,
      title: title || "Bài thi tổng hợp TOCFL",
      score,
    });
    await newResult.save();
    res.json({ success: true, message: "Đã lưu kết quả thi thành công!" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST: Tăng số từ vựng đã thuộc 👈 THÊM ROUTE MỚI NÀY
router.post("/vocab-learned", async (req, res) => {
  try {
    const { userId, count } = req.body;
    if (!userId) return res.status(400).json({ success: false, message: "Thiếu userId" });

    // Cập nhật tăng số từ vựng (+count) trong database
    await User.findByIdAndUpdate(userId, {
      $inc: { learnedVocabCount: count || 1 },
    });

    res.json({ success: true, message: "Đã cập nhật số từ vựng thành công!" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;