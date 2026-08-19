const QuizResult = require("../models/QuizResult");
const User = require("../models/User");

const getDashboardStats = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    // Lấy bài thi và sắp xếp bài mới nhất lên đầu
    const quizResults = await QuizResult.find({ userId }).sort({ createdAt: -1 }).limit(5);
    
    const allResults = await QuizResult.find({ userId });
    const completedQuizzes = allResults.length;
    const totalScore = allResults.reduce((sum, item) => sum + item.score, 0);
    const averageAccuracy = completedQuizzes > 0 ? Math.round(totalScore / completedQuizzes) : 0;

    res.json({
      success: true,
      stats: {
        learnedVocab: user?.learnedVocabCount || 0,
        completedQuizzes,
        averageAccuracy,
      },
      recentActivities: quizResults, // Trả về danh sách chứa full fields (title, score, createdAt)
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { getDashboardStats };