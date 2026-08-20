import { useState, useEffect } from "react";
import axios from "axios";

interface DailyProgress {
  vocabCount: number;
  vocabTarget: number;
  quizCount: number;
  quizTarget: number;
}

interface UserDashboardData {
  streak: number;
  totalVocabLearned: number;
  dailyProgress: DailyProgress;
}

interface RecentActivity {
  title: string;
  time: string;
  result: string;
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<UserDashboardData>({
    streak: 0,
    totalVocabLearned: 0,
    dailyProgress: {
      vocabCount: 0,
      vocabTarget: 20,
      quizCount: 0,
      quizTarget: 2,
    },
  });

  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);

  useEffect(() => {
    async function fetchDashboardData() {
      const userId = localStorage.getItem("user_id");
      
      // Đọc streak từ localStorage làm fallback chuẩn
      const localStreak = parseInt(localStorage.getItem("user_streak") || "0", 10);

      // 1. Lấy dữ liệu từ Backend API (MongoDB)
      if (userId) {
        try {
          const res = await axios.get(
            `http://localhost:5000/api/dashboard?userId=${userId}`
          );

          if (res.data) {
            // Đảm bảo nếu res.data.streak bằng 0 hoặc undefined thì sẽ dùng localStreak
            const apiStreak = typeof res.data.streak === "number" ? res.data.streak : 0;
            const finalStreak = apiStreak > 0 ? apiStreak : localStreak;

            setDashboardData({
              streak: finalStreak,
              totalVocabLearned: res.data.totalVocabLearned || parseInt(localStorage.getItem("learned_vocab_count") || "0", 10),
              dailyProgress: {
                vocabCount: res.data.dailyProgress?.vocabCount ?? parseInt(localStorage.getItem("today_vocab_count") || "0", 10),
                vocabTarget: res.data.dailyProgress?.vocabTarget || 20,
                quizCount: res.data.dailyProgress?.quizCount ?? parseInt(localStorage.getItem("today_quiz_count") || "0", 10),
                quizTarget: res.data.dailyProgress?.quizTarget || 2,
              },
            });
          }
        } catch (error) {
          console.error("Lỗi lấy dữ liệu Dashboard từ API:", error);
          loadFallbackFromLocalStorage();
        }
      } else {
        loadFallbackFromLocalStorage();
      }

      // 2. Lấy danh sách hoạt động gần đây từ localStorage
      try {
        const savedActivities = JSON.parse(
          localStorage.getItem("recent_activities") || "[]"
        );
        setRecentActivities(savedActivities);
      } catch (e) {
        console.error("Lỗi đọc recent_activities từ localStorage:", e);
      }

      setLoading(false);
    }

    fetchDashboardData();
  }, []);

  const loadFallbackFromLocalStorage = () => {
    const localLearned = parseInt(
      localStorage.getItem("learned_vocab_count") || "0", 10
    );
    const localTodayVocab = parseInt(
      localStorage.getItem("today_vocab_count") || "0", 10
    );
    const localTodayQuiz = parseInt(
      localStorage.getItem("today_quiz_count") || "0", 10
    );
    const localStreak = parseInt(
      localStorage.getItem("user_streak") || "0", 10
    );

    setDashboardData((prev) => ({
      ...prev,
      streak: localStreak,
      totalVocabLearned: localLearned,
      dailyProgress: {
        ...prev.dailyProgress,
        vocabCount: localTodayVocab,
        quizCount: localTodayQuiz,
      },
    }));
  };

  if (loading) {
    return (
      <div className="text-center py-20 text-gray-500 font-medium">
        Đang tải dữ liệu Bảng điều khiển...
      </div>
    );
  }

  const { streak, totalVocabLearned, dailyProgress } = dashboardData;

  // Tính phần trăm tiến độ
  const vocabPercent = Math.min(
    100,
    Math.round((dailyProgress.vocabCount / dailyProgress.vocabTarget) * 100)
  );
  const quizPercent = Math.min(
    100,
    Math.round((dailyProgress.quizCount / dailyProgress.quizTarget) * 100)
  );

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Banner Chào mừng */}
      <div className="bg-gradient-to-r from-red-600 to-red-500 rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold">
            Thống Kê Tiến Độ Học Tập 🚀
          </h1>
          <p className="text-red-100 text-sm sm:text-base mt-1">
            Duy trì thói quen học tiếng Trung mỗi ngày để đạt mục tiêu của bạn!
          </p>
        </div>
        <div className="bg-white/20 backdrop-blur-md px-5 py-3 rounded-2xl flex items-center gap-3 border border-white/30">
          <span className="text-3xl">🔥</span>
          <div>
            <div className="text-2xl font-black">{streak} Ngày</div>
            <div className="text-xs text-red-100 font-medium">
              Chuỗi học liên tục
            </div>
          </div>
        </div>
      </div>

      {/* Thẻ Thống kê Tổng quan */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center text-red-600 font-bold text-xl border border-red-100">
            📚
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {totalVocabLearned}
            </div>
            <div className="text-xs text-gray-500 font-medium">
              Từ vựng đã tích lũy
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 font-bold text-xl border border-amber-100">
            🎯
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {dailyProgress.vocabCount}/{dailyProgress.vocabTarget}
            </div>
            <div className="text-xs text-gray-500 font-medium">
              Từ vựng mục tiêu hôm nay
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-xl border border-blue-100">
            ✏️
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {dailyProgress.quizCount}/{dailyProgress.quizTarget}
            </div>
            <div className="text-xs text-gray-500 font-medium">
              Bài trắc nghiệm hôm nay
            </div>
          </div>
        </div>
      </div>

      {/* Tiến độ Mục tiêu trong ngày */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
        <h2 className="text-xl font-bold text-gray-900">
          Mục Tiêu Hôm Nay
        </h2>

        {/* Mục tiêu Flashcard */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="font-semibold text-gray-700 flex items-center gap-2">
              <span>📕</span> Luyện Flashcard từ vựng
            </span>
            <span className="font-bold text-red-600">
              {dailyProgress.vocabCount} / {dailyProgress.vocabTarget} từ (
              {vocabPercent}%)
            </span>
          </div>
          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-red-600 transition-all duration-500 ease-out"
              style={{ width: `${vocabPercent}%` }}
            ></div>
          </div>
        </div>

        {/* Mục tiêu Bài tập / Trắc nghiệm */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="font-semibold text-gray-700 flex items-center gap-2">
              <span>📝</span> Luyện bài trắc nghiệm
            </span>
            <span className="font-bold text-blue-600">
              {dailyProgress.quizCount} / {dailyProgress.quizTarget} bài (
              {quizPercent}%)
            </span>
          </div>
          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-500 ease-out"
              style={{ width: `${quizPercent}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Hoạt động gần đây */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Hoạt Động Gần Đây
        </h2>

        {recentActivities.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">
            Chưa có hoạt động nào được ghi nhận hôm nay. Hãy bắt đầu học ngay!
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {recentActivities.map((activity, idx) => (
              <div
                key={idx}
                className="py-3.5 flex items-center justify-between gap-4"
              >
                <div>
                  <div className="font-semibold text-gray-800 text-sm sm:text-base">
                    {activity.title}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {activity.time}
                  </div>
                </div>
                <div className="text-xs sm:text-sm font-bold text-red-600 bg-red-50 px-3 py-1 rounded-full border border-red-100">
                  {activity.result}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}