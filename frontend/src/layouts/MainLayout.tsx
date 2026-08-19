import { useState, useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import ChatAI from "../pages/ChatAI/ChatAI"; // Đường dẫn đúng tới file ChatAI.tsx

export default function MainLayout() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Kiểm tra token đăng nhập
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
    }

    // --- LOGIC TỰ ĐỘNG RESET THEO NGÀY ---
    const todayStr = new Date().toDateString(); // Lấy ngày hiện tại
    const lastActiveDate = localStorage.getItem("last_active_date");

    // Nếu ngày hiện tại khác với ngày lưu gần nhất -> Đã sang ngày mới
    if (lastActiveDate !== todayStr) {
      localStorage.setItem("today_vocab_count", "0"); // Reset từ vựng hôm nay về 0
      localStorage.setItem("today_quiz_count", "0");   // Reset số bài thi hôm nay về 0
      localStorage.setItem("last_active_date", todayStr); // Cập nhật lại mốc ngày mới
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    navigate("/");
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex flex-col font-sans">
      {/* Header / Navbar */}
      <header className="bg-white/85 backdrop-blur-md sticky top-0 z-50 shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <NavLink to="/" className="flex items-center space-x-2 text-xl font-extrabold text-red-600 hover:opacity-90 transition">
            <span>🇹🇼 TOCFL-Master</span>
          </NavLink>

          <nav className="hidden md:flex space-x-8 font-medium text-gray-600">
            <NavLink 
              to="/" 
              end
              className={({ isActive }) => `transition ${isActive ? "text-red-600 font-bold" : "hover:text-red-600"}`}
            >
              Trang chủ
            </NavLink>
            <NavLink 
              to="/vocabulary" 
              className={({ isActive }) => `transition ${isActive ? "text-red-600 font-bold" : "hover:text-red-600"}`}
            >
              Từ vựng
            </NavLink>
            <NavLink 
              to="/quiz" 
              className={({ isActive }) => `transition ${isActive ? "text-red-600 font-bold" : "hover:text-red-600"}`}
            >
              Luyện thi
            </NavLink>
            <NavLink 
              to="/dashboard" 
              className={({ isActive }) => `transition ${isActive ? "text-red-600 font-bold" : "hover:text-red-600"}`}
            >
              Tổng quan
            </NavLink>
          </nav>

          <div className="flex items-center space-x-3">
            {isLoggedIn ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm font-semibold text-gray-700">Xin chào!</span>
                <button 
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-medium text-white bg-gray-600 rounded-lg shadow-sm hover:bg-gray-700 transition cursor-pointer"
                >
                  Đăng xuất
                </button>
              </div>
            ) : (
              <>
                <NavLink 
                  to="/register" 
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-red-600 transition"
                >
                  Đăng ký
                </NavLink>
                <NavLink 
                  to="/login" 
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg shadow-sm hover:bg-red-700 transition"
                >
                  Đăng nhập
                </NavLink>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-6 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} TOCFL-Master. Nền tảng học tiếng Trung Phồn thể toàn diện.
      </footer>

      {/* Đặt Component AI Chat ở đây */}
      <ChatAI />
    </div>
  );
}