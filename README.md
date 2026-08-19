# 🇹🇼 TOCFL-Master - Nền Tảng Luyện Thi Tiếng Trung Phồn Thể Toàn Diện

![Status](https://img.shields.io/badge/Status-Completed-success?style=for-the-badge)
![React](https://img.shields.io/badge/Frontend-React_TS_Vite-blue?style=for-the-badge&logo=react)
![NodeJS](https://img.shields.io/badge/Backend-NodeJS_Express-green?style=for-the-badge&logo=nodedotjs)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-darkgreen?style=for-the-badge&logo=mongodb)
![TailwindCSS](https://img.shields.io/badge/Styling-Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwindcss)

**TOCFL-Master** là ứng dụng web hỗ trợ học tập và luyện thi chứng chỉ tiếng Trung Phồn thể (**TOCFL - Test of Chinese as a Foreign Language**). Hệ thống tích hợp các công cụ học từ vựng thông minh, bài tập trắc nghiệm đánh giá trình độ và bảng theo dõi tiến độ chi tiết cho học viên.

---

## 🚀 Tính Năng Chính

### 1. 📊 Tổng Quan Tiến Độ (Dashboard)
* **Thống kê thời gian thực:** Hiển thị tổng số từ vựng đã thuộc, bài thi đã hoàn thành và độ chính xác trung bình (%).
* **Theo dõi chuỗi học (Streak):** Tự động tính toán và duy trì chuỗi ngày đăng nhập học tập liên tiếp.
* **Hoạt động gần đây:** Hiển thị chi tiết thời gian làm bài, tên bài thi và kết quả điểm số (`% điểm`).
* **Mục tiêu trong ngày:** Theo dõi tiến độ hoàn thành chỉ tiêu học từ vựng và luyện tập theo từng ngày.

### 2. 📇 Học Từ Vựng (Flashcard & Vocabulary)
* Kho từ vựng Phồn thể phân loại theo các cấp độ Band A, B, C.
* Tích hợp thẻ Flashcard tương tác giúp ghi nhớ phiên âm (Pinyin) và nghĩa Tiếng Việt dễ dàng.
* Đánh dấu và theo dõi trạng thái các từ đã thuộc.

### 3. 📝 Luyện Thi & Trắc Nghiệm (Quiz Engine)
* Đề thi trắc nghiệm mô phỏng cấu trúc bài thi TOCFL thực tế.
* Tự động chấm điểm và tổng hợp kết quả ngay sau khi hoàn thành.
* Lưu trữ toàn bộ lịch sử thi vào cơ sở dữ liệu MongoDB.

### 4. 👤 Quản Lý Tài Khoản (Authentication & Profile)
* Đăng ký, đăng nhập an toàn bảo mật bằng JWT.
* Quản lý thông tin cá nhân và xem lịch sử tiến độ học tập.

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

### **Frontend**
* **Framework:** React 18 (TypeScript) + Vite
* **Styling:** Tailwind CSS + Lucide Icons
* **Routing:** React Router DOM
* **HTTP Client:** Axios

### **Backend**
* **Runtime:** Node.js + Express.js
* **Database:** MongoDB (Mongoose ODM)
* **Authentication:** JSON Web Token (JWT) + Bcrypt
* **Architecture:** MVC (Model - View - Controller)

---

## 📁 Cấu Trúc Dự Án (Project Structure)

```text
tocfl_master/
├── backend/                  # Nguồn mã Server Node.js / Express
│   ├── controllers/          # Xử lý logic business (Auth, Dashboard, Quiz)
│   ├── models/               # Định nghĩa Schema MongoDB (User, QuizResult, Vocab)
│   ├── routes/               # Cấu hình API Endpoints
│   ├── server.js             # File khởi chạy Server
│   └── .env.example          # Mẫu biến môi trường cho Backend
│
├── frontend/                 # Nguồn mã Giao diện React
│   ├── src/
│   │   ├── components/       # Các thành phần UI dùng lại
│   │   ├── layouts/          # Layout chung (Header, Navigation)
│   │   ├── pages/            # Các trang chính (Dashboard, Quiz, Flashcard, Profile, Login)
│   │   └── services/         # API Service Calls
│   ├── vite.config.ts        # Cấu hình Vite
│   └── package.json
│
├── .gitignore                # Quản lý các file bị loại trừ khỏi Git
└── README.md                 # Tài liệu hướng dẫn dự án
