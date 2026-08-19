# 🇹🇼 TOCFL-Master - Nền Tảng Luyện Thi Tiếng Trung Phồn Thể Toàn Diện

![Status](https://img.shields.io/badge/Status-In_Development-yellow?style=for-the-badge&logo=git)
![React](https://img.shields.io/badge/Frontend-React_TS_Vite-blue?style=for-the-badge&logo=react)
![NodeJS](https://img.shields.io/badge/Backend-NodeJS_Express-green?style=for-the-badge&logo=nodedotjs)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-darkgreen?style=for-the-badge&logo=mongodb)
![TailwindCSS](https://img.shields.io/badge/Styling-Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwindcss)

**TOCFL-Master** là hệ thống hỗ trợ học tập và luyện thi chứng chỉ năng lực Han ngữ Phồn thể (**TOCFL - Test of Chinese as a Foreign Language**). Dự án hướng tới việc xây dựng một hệ sinh thái học tập thông minh, giúp người học dễ dàng theo dõi lộ trình, nâng cao từ vựng và tối ưu hóa điểm số qua các bài thi trắc nghiệm thực tế.

> ⚠️ **Trạng thái dự án:** Dự án đang trong quá trình **Đang phát triển (In Development)**. Các tính năng nâng cao và giao diện đang tiếp tục được hoàn thiện và cập nhật liên tục.

---

## 💡 Động lực & Mục tiêu phát triển

Tiếng Trung Phồn thể có cấu trúc chữ viết phức tạp và nguồn tài liệu luyện thi trực tuyến chuẩn chuẩn TOCFL hiện còn hạn chế. Dự án **TOCFL-Master** ra đời nhằm cung cấp:
* Một giao diện trực quan, hiện đại giúp người học không bị ngợp trước lượng từ vựng lớn.
* Hệ thống tự động theo dõi và đánh giá năng lực dựa trên dữ liệu làm bài thực tế.
* Công cụ duy trì động lực học tập hàng ngày thông qua chuỗi ngày học (Streak) và mục tiêu cá nhân.

---

## 🚀 Các Tính Năng Hiện Có & Kế Hoạch Phát Triển

### 1. 📊 Bảng Điều Khiển Học Tập (Dashboard)
* **Thống kê thời gian thực:** Cập nhật chính xác số từ vựng đã thuộc, tổng số bài quiz đã làm và tỷ lệ làm bài chính xác trung bình.
* **Hệ thống Streak & Mục tiêu ngày:** Tự động tính toán chuỗi ngày truy cập liên tục, đồng thời reset chỉ tiêu học tập (từ vựng/quiz) khi sang ngày mới.
* **Lịch sử hoạt động:** Lưu trữ chi tiết tên bài luyện tập, điểm số đạt được và mốc thời gian làm bài chính xác.

### 2. 📇 Thẻ Từ Vựng Thông Minh (Flashcard & Vocabulary)
* Cung cấp danh mục từ vựng chuẩn phân loại theo từng cấp độ (Band A1, A2, B1, B2...).
* Thẻ Flashcard hỗ trợ lật mặt để tra cứu Pinyin, phát âm và nghĩa Tiếng Việt.
* Đánh dấu và phân loại các từ đã ghi nhớ để tối ưu lượt ôn tập.

### 3. 📝 Hệ Thống Luyện Thi (Quiz Engine)
* Đề thi mô phỏng định dạng câu hỏi TOCFL thực tế.
* Chấm điểm tự động và phản hồi kết quả ngay sau khi nộp bài.
* Đồng bộ lịch sử thi trực tiếp vào cơ sở dữ liệu MongoDB.

### 4. 👤 Quản Lý Tài Khoản (User Management)
* Cơ chế đăng ký, đăng nhập bảo mật mã hóa mật khẩu với Bcrypt và xác thực JWT.
* Lưu giữ tiến trình học tập cá nhân hóa theo từng tài khoản.

---

## 🔮 Lộ Trình Phát Triển Tiếp Theo (Roadmap)

- [ ] **Tích hợp luyện nghe (Listening):** Bổ sung file âm thanh giọng chuẩn Đài Loan cho các bài luyện tập.
- [ ] **Thuật toán lặp lại ngắt quãng (Spaced Repetition):** Tối ưu thời gian ôn tập từ vựng dựa trên mức độ quên của người học.
- [ ] **Thi thử có đếm giờ (Mock Test Mode):** Tạo áp lực thời gian giống với kỳ thi thực tế tại trung tâm.
- [ ] **Bảng xếp hạng (Leaderboard):** Thúc đẩy thi đua giữa các học viên.

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

### **Frontend**
* **Core:** React 18, TypeScript, Vite
* **Styling:** Tailwind CSS, Lucide Icons
* **State & Routing:** React Router DOM v6
* **API Client:** Axios

### **Backend**
* **Runtime:** Node.js, Express.js
* **Database:** MongoDB (Mongoose ODM)
* **Security:** JSON Web Token (JWT), Bcrypt.js, CORS
* **Architecture:** Mô hình MVC (Model - View - Controller)

---

## 📁 Cấu Tr trúc Thư Mục Dự Án (Project Structure)

```text
tocfl_master/
├── backend/                  # Nguồn mã Server Node.js / Express
│   ├── controllers/          # Xử lý logic nghiệp vụ (Auth, Dashboard, Quiz)
│   ├── models/               # Schema MongoDB (User, QuizResult, Vocabulary)
│   ├── routes/               # Định nghĩa các API Endpoints
│   ├── convert.js            # Tool chuyển đổi/xử lý dữ liệu từ vựng
│   ├── server.js             # File khởi chạy Server Express
│   └── .env.example          # Mẫu khai báo biến môi trường
│
├── frontend/                 # Nguồn mã Giao diện React
│   ├── src/
│   │   ├── components/       # Component UI tái sử dụng
│   │   ├── layouts/          # Khung giao diện (MainLayout, Navigation)
│   │   ├── pages/            # Các trang chính (Dashboard, Flashcard, Quiz, Profile, Login)
│   │   ├── services/         # Xử lý gọi API Backend
│   │   └── main.tsx          # Điểm đầu vào của ứng dụng React
│   ├── vite.config.ts        # Cấu hình Vite Build Tool
│   └── package.json
│
├── .gitignore                # Danh sách file/thư mục loại trừ khỏi Git
└── README.md                 # Tài liệu hướng dẫn dự án
