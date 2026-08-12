import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const [stats, setStats] = useState({
    learnedVocab: 0,
    completedQuizzes: 0,
    averageAccuracy: 0,
    currentStreak: 1,
    targetBand: "Band A2",
    todayVocabCount: 0,
    todayQuizCount: 0,
  });

  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  useEffect(() => {
    // Lấy ngày hiện tại theo định dạng chuẩn (ví dụ: "Wed Aug 12 2026")
    const todayStr = new Date().toDateString();
    const lastActiveDate = localStorage.getItem("last_active_date");

    // 1. Nếu sang ngày mới -> Reset lại mục tiêu hôm nay về 0
    if (lastActiveDate !== todayStr) {
      localStorage.setItem("today_vocab_count", "0");
      localStorage.setItem("today_quiz_count", "0");
      localStorage.setItem("last_active_date", todayStr);
    }

    // 2. Logic tính toán Streak (chuỗi ngày học liên tiếp) chuẩn xác
    let streak = parseInt(localStorage.getItem("user_streak") || "1");
    const lastLoginDate = localStorage.getItem("last_login_date");

    if (lastLoginDate !== todayStr) {
      if (lastLoginDate) {
        const lastDate = new Date(lastLoginDate);
        const currentDate = new Date(todayStr);
        
        // Tính khoảng cách thời gian (tính theo số ngày) giữa ngày đăng nhập trước và hôm nay
        const diffTime = currentDate.getTime() - lastDate.getTime();
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          // Nếu là đúng ngày hôm sau -> Tăng chuỗi Streak lên 1
          streak += 1;
        } else if (diffDays > 1) {
          // Nếu bỏ lỡ từ 2 ngày trở lên -> Reset chuỗi về 1
          streak = 1;
        }
        // Nếu diffDays === 0 thì giữ nguyên (đăng nhập nhiều lần trong cùng một ngày)
      }
      // Lưu lại mốc streak mới và ngày đăng nhập mới nhất
      localStorage.setItem("user_streak", streak.toString());
      localStorage.setItem("last_login_date", todayStr);
    }

    // 3. Đọc các số liệu thực tế từ localStorage
    const savedVocab = localStorage.getItem("learned_vocab_count");
    const savedQuizzes = localStorage.getItem("completed_quizzes_count");
    const savedAccuracy = localStorage.getItem("average_accuracy");
    const savedActivities = localStorage.getItem("recent_activities");

    setStats({
      learnedVocab: savedVocab ? parseInt(savedVocab) : 0,
      completedQuizzes: savedQuizzes ? parseInt(savedQuizzes) : 0,
      averageAccuracy: savedAccuracy ? parseFloat(savedAccuracy) : 0,
      currentStreak: streak,
      targetBand: "Band A2",
      todayVocabCount: parseInt(localStorage.getItem("today_vocab_count") || "0"),
      todayQuizCount: parseInt(localStorage.getItem("today_quiz_count") || "0"),
    });

    if (savedActivities) {
      try {
        setRecentActivities(JSON.parse(savedActivities));
      } catch (e) {
        setRecentActivities([]);
      }
    }
  }, []);

  return (
    <div className="space-y-8 pb-12">
      {/* Banner Chào mừng hiển thị Streak */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 text-white shadow-lg flex flex-col md:flex-row justify-between items-center">
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold">
            Xin chào, Học viên! 👋
          </h1>
          <p className="text-blue-100 text-sm">
            Dưới đây là tiến độ học tập và thống kê chuỗi ngày chinh phục TOCFL của bạn.
          </p>
        </div>
        <div className="mt-4 md:mt-0 bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/20 flex items-center space-x-3">
          <span className="text-2xl">🔥</span>
          <div>
            <div className="text-lg font-bold">{stats.currentStreak} ngày</div>
            <div className="text-xs text-blue-100">Chuỗi học liên tiếp</div>
          </div>
        </div>
      </div>

      {/* Thẻ Thống Kê Tổng Quan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center text-xl font-bold">📖</div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{stats.learnedVocab}</div>
            <div className="text-xs text-gray-500 mt-0.5">Từ vựng đã thuộc</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center text-xl font-bold">📝</div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{stats.completedQuizzes}</div>
            <div className="text-xs text-gray-500 mt-0.5">Bài thi đã hoàn thành</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-xl font-bold">🎯</div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{stats.averageAccuracy}%</div>
            <div className="text-xs text-gray-500 mt-0.5">Độ chính xác trung bình</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-xl font-bold">🏆</div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{stats.targetBand}</div>
            <div className="text-xs text-gray-500 mt-0.5">Cấp độ mục tiêu hiện tại</div>
          </div>
        </div>
      </div>

      {/* Khu vực chi tiết */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Hoạt động gần đây */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-6">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <span>⏱️</span> Hoạt động gần đây
          </h2>

          <div className="space-y-4">
            {recentActivities.length > 0 ? (
              recentActivities.map((act, index) => (
                <div key={index} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-gray-800 text-sm">{act.title}</div>
                    <div className="text-xs text-gray-400 mt-1">{act.time}</div>
                  </div>
                  <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-semibold rounded-full">{act.result}</span>
                </div>
              ))
            ) : (
              <div className="text-gray-400 text-sm text-center py-12">
                Chưa có hoạt động nào gần đây. Hãy bắt đầu học ngay nhé!
              </div>
            )}
          </div>
        </div>

        {/* Mục tiêu hôm nay */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between space-y-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <span>🎯</span> Mục tiêu hôm nay
              </h2>
              <p className="text-xs text-gray-500 mt-1">Hoàn thành các mốc để duy trì chuỗi học.</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-medium text-gray-600">
                  <span>Học từ vựng mới</span>
                  <span className="text-blue-600 font-bold">{stats.todayVocabCount} / 20 từ</span>
                </div>
                <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min((stats.todayVocabCount / 20) * 100, 100)}%` }}></div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-medium text-gray-600">
                  <span>Luyện thi / Quiz</span>
                  <span className="text-emerald-600 font-bold">{stats.todayQuizCount} / 2 bài</span>
                </div>
                <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min((stats.todayQuizCount / 2) * 100, 100)}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          <Link 
            to="/" 
            className="w-full py-3.5 bg-slate-900 hover:bg-red-600 text-white font-bold text-sm rounded-2xl shadow-md transition duration-300 text-center block"
          >
            Tiếp tục học ngay →
          </Link>
        </div>

      </div>
    </div>
  );
}