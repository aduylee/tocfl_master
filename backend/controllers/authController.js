// backend/controllers/authController.js

// Xử lý đăng ký tài khoản
const register = async (req, res) => {
  try {
    // Thêm logic xử lý đăng ký ở đây (ví dụ: lưu vào database)
    res.status(200).json({ message: "Đăng ký thành công!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Xử lý đăng nhập tài khoản
const login = async (req, res) => {
  try {
    // Thêm logic xử lý đăng nhập ở đây (ví dụ: kiểm tra mật khẩu, tạo token)
    res.status(200).json({ message: "Đăng nhập thành công!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  register,
  login,
};