const User = require("../models/User");
const mongoose = require("mongoose");

// Lấy dữ liệu hiển thị cho Dashboard
exports.getDashboardData = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "userId không hợp lệ" });
    }

    let user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    const todayStr = new Date().toISOString().split("T")[0];

    // Khởi tạo dailyProgress nếu chưa có trong DB
    if (!user.dailyProgress) {
      user.dailyProgress = {
        vocabCount: 0,
        vocabTarget: 20,
        quizCount: 0,
        quizTarget: 2,
        lastUpdatedDate: todayStr,
      };
      await user.save();
    }

    // Reset tiến độ nếu sang ngày mới
    if (user.dailyProgress.lastUpdatedDate !== todayStr) {
      user.dailyProgress.vocabCount = 0;
      user.dailyProgress.quizCount = 0;
      user.dailyProgress.lastUpdatedDate = todayStr;
      await user.save();
    }

    return res.status(200).json({
      streak: user.streak || 0,
      totalVocabLearned: user.totalVocabLearned || 0,
      dailyProgress: {
        vocabCount: user.dailyProgress.vocabCount || 0,
        vocabTarget: user.dailyProgress.vocabTarget || 20,
        quizCount: user.dailyProgress.quizCount || 0,
        quizTarget: user.dailyProgress.quizTarget || 2,
      },
    });
  } catch (error) {
    console.error("Lỗi getDashboardData:", error);
    return res.status(500).json({ message: error.message || "Lỗi Server" });
  }
};

// Cập nhật tiến độ học & Chuỗi (Streak)
exports.updateDailyProgress = async (req, res) => {
  try {
    const { userId, type, increment = 1 } = req.body;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "userId không hợp lệ" });
    }

    let user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];
    const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (!user.dailyProgress) {
      user.dailyProgress = {
        vocabCount: 0,
        vocabTarget: 20,
        quizCount: 0,
        quizTarget: 2,
        lastUpdatedDate: todayStr,
      };
    }

    if (user.dailyProgress.lastUpdatedDate !== todayStr) {
      user.dailyProgress.vocabCount = 0;
      user.dailyProgress.quizCount = 0;
      user.dailyProgress.lastUpdatedDate = todayStr;
    }

    // --- TÍNH TOÁN STREAK ---
    if (!user.lastStudyDate) {
      user.streak = 1;
      user.lastStudyDate = todayDate;
    } else {
      const lastDate = new Date(user.lastStudyDate);
      const lastStudyDay = new Date(
        lastDate.getFullYear(),
        lastDate.getMonth(),
        lastDate.getDate()
      );

      const diffDays = Math.round(
        (todayDate.getTime() - lastStudyDay.getTime()) / (1000 * 3600 * 24)
      );

      if (diffDays === 1) {
        user.streak = (user.streak || 0) + 1;
        user.lastStudyDate = todayDate;
      } else if (diffDays > 1) {
        user.streak = 1; // Bỏ học quá 1 ngày -> Reset về 1
        user.lastStudyDate = todayDate;
      } else if (diffDays === 0 && (!user.streak || user.streak === 0)) {
        user.streak = 1;
        user.lastStudyDate = todayDate;
      }
    }

    // Tăng số từ vựng
    if (type === "vocab") {
      user.dailyProgress.vocabCount = (user.dailyProgress.vocabCount || 0) + increment;
      user.totalVocabLearned = (user.totalVocabLearned || 0) + increment;
    } else if (type === "quiz") {
      user.dailyProgress.quizCount = (user.dailyProgress.quizCount || 0) + increment;
    }

    await user.save();

    return res.status(200).json({
      message: "Cập nhật thành công!",
      streak: user.streak,
      totalVocabLearned: user.totalVocabLearned,
      dailyProgress: user.dailyProgress,
    });
  } catch (error) {
    console.error("Lỗi updateDailyProgress:", error);
    return res.status(500).json({ message: error.message || "Lỗi Server" });
  }
};