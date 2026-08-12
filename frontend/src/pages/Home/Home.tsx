import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-red-600 via-red-500 to-rose-600 text-white p-8 md:p-14 rounded-3xl shadow-xl flex flex-col md:flex-row justify-between items-center">
        <div className="absolute -right-10 -top-10 w-72 h-72 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="space-y-5 max-w-xl relative z-10">
          <span className="inline-block bg-white/20 backdrop-blur-md text-white text-xs font-bold px-3.5 py-1.5 rounded-full uppercase tracking-wider">
            ✨ Hệ sinh thái học tiếng Trung Phồn Thể toàn diện
          </span>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
            Chinh Phục Kỳ Thi TOCFL Cùng TOCFL-Master
          </h1>
          <p className="text-red-100 text-base md:text-lg leading-relaxed">
            Nền tảng ôn thi trực tuyến tích hợp AI, flashcard, luyện nghe - đọc và kho tài liệu chuẩn xác giúp bạn bứt phá điểm số.
          </p>
          <div className="pt-2 flex flex-wrap gap-4">
            <Link 
              to="/vocabulary" 
              className="px-7 py-3.5 bg-white text-red-600 font-bold rounded-2xl shadow-md hover:bg-red-50 transition duration-200"
            >
              Học từ vựng ngay
            </Link>
            <Link 
              to="/quiz" 
              className="px-7 py-3.5 bg-red-700/40 hover:bg-red-700/60 border border-white/30 text-white font-bold rounded-2xl backdrop-blur-md transition duration-200"
            >
              Vào phòng thi thử
            </Link>
          </div>
        </div>

        <div className="mt-8 md:mt-0 text-7xl select-none filter drop-shadow-md">
          🇹🇼 🚀 💡
        </div>
      </div>

      {/* Lưới tính năng */}
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Danh Mục Ôn Tập & Tiện Ích</h2>
          <p className="text-gray-500 text-sm mt-1">Truy cập nhanh vào các công cụ chuyên sâu để tối ưu hóa hiệu quả học tập.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* 1. Từ vựng */}
          <Link 
            to="/vocabulary" 
            className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-red-100 hover:-translate-y-1 transition-all duration-300 block text-left group"
          >
            <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center text-xl font-bold mb-4 group-hover:bg-red-600 group-hover:text-white transition-colors duration-300">📖</div>
            <h3 className="text-lg font-bold text-gray-900 group-hover:text-red-600 transition-colors">Thư Viện Từ Vựng</h3>
            <p className="text-gray-500 text-xs mt-2 leading-relaxed">Tra cứu 14.000+ từ vựng qua chữ Hán, Pinyin, nghĩa tiếng Anh và lọc theo cấp độ Band.</p>
          </Link>

          {/* 2. Flashcard */}
          <Link 
            to="/flashcard" 
            className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-red-100 hover:-translate-y-1 transition-all duration-300 block text-left group"
          >
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center text-xl font-bold mb-4 group-hover:bg-amber-600 group-hover:text-white transition-colors duration-300">🃏</div>
            <h3 className="text-lg font-bold text-gray-900 group-hover:text-red-600 transition-colors">Học Flashcard</h3>
            <p className="text-gray-500 text-xs mt-2 leading-relaxed">Ghi nhớ từ vựng siêu tốc thông qua phương pháp lật thẻ thông minh và lặp lại ngắt quãng.</p>
          </Link>

          {/* 3. Trò chơi Nối từ (MatchGame) */}
          <Link 
            to="/matchgame" 
            className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-red-100 hover:-translate-y-1 transition-all duration-300 block text-left group"
          >
            <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center text-xl font-bold mb-4 group-hover:bg-orange-600 group-hover:text-white transition-colors duration-300">🧩</div>
            <h3 className="text-lg font-bold text-gray-900 group-hover:text-red-600 transition-colors">Trò Chơi Nối Từ</h3>
            <p className="text-gray-500 text-xs mt-2 leading-relaxed">Ghép cặp chữ Hán và nghĩa tiếng Việt tương ứng để phản xạ từ vựng cực nhanh qua trò chơi.</p>
          </Link>

          {/* 4. Luyện Nghe */}
          <Link 
            to="/listening" 
            className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-red-100 hover:-translate-y-1 transition-all duration-300 block text-left group"
          >
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-xl font-bold mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">🎧</div>
            <h3 className="text-lg font-bold text-gray-900 group-hover:text-red-600 transition-colors">Luyện Kỹ Năng Nghe</h3>
            <p className="text-gray-500 text-xs mt-2 leading-relaxed">Nâng cao phản xạ nghe hiểu với các bài audio mẫu chuẩn phát âm tiếng Trung Phồn Thể.</p>
          </Link>

          {/* 5. Luyện Đọc */}
          <Link 
            to="/reading" 
            className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-red-100 hover:-translate-y-1 transition-all duration-300 block text-left group"
          >
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-xl font-bold mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">📰</div>
            <h3 className="text-lg font-bold text-gray-900 group-hover:text-red-600 transition-colors">Luyện Kỹ Năng Đọc</h3>
            <p className="text-gray-500 text-xs mt-2 leading-relaxed">Đọc hiểu đoạn văn, bản tin mẫu giúp mở rộng vốn từ và cải thiện tốc độ đọc hiểu văn bản.</p>
          </Link>

          {/* 6. Phòng thi */}
          <Link 
            to="/quiz" 
            className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-red-100 hover:-translate-y-1 transition-all duration-300 block text-left group"
          >
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center text-xl font-bold mb-4 group-hover:bg-rose-600 group-hover:text-white transition-colors duration-300">🎯</div>
            <h3 className="text-lg font-bold text-gray-900 group-hover:text-red-600 transition-colors">Phòng Thi Trực Tuyến</h3>
            <p className="text-gray-500 text-xs mt-2 leading-relaxed">Làm đề thi thử bấm giờ, chấm điểm tự động và xem giải thích chi tiết đáp án.</p>
          </Link>

          {/* 7. Tổng quan (Dashboard) - Đặt ngay bên phải Phòng thi */}
          <Link 
            to="/dashboard" 
            className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-blue-100 hover:-translate-y-1 transition-all duration-300 block text-left group"
          >
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-xl font-bold mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">📊</div>
            <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">Tổng Quan Tiến Độ</h3>
            <p className="text-gray-500 text-xs mt-2 leading-relaxed">Theo dõi chuỗi ngày học, thống kê từ vựng đã nhớ và lịch sử kiểm tra của cá nhân.</p>
          </Link>

          {/* 8. Trợ lý AI */}
          <Link 
            to="/chatai" 
            className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-red-100 hover:-translate-y-1 transition-all duration-300 block text-left group"
          >
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center text-xl font-bold mb-4 group-hover:bg-purple-600 group-hover:text-white transition-colors duration-300">🤖</div>
            <h3 className="text-lg font-bold text-gray-900 group-hover:text-red-600 transition-colors">Trợ Lý AI Thông Minh</h3>
            <p className="text-gray-500 text-xs mt-2 leading-relaxed">Hỏi đáp trực tiếp cấu trúc câu, giải nghĩa từ vựng hoặc luyện hội thoại tiếng Trung cùng AI.</p>
          </Link>

        </div>
      </div>
    </div>
  );
}