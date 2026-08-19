const User = require("../models/User"); // Đảm bảo bạn đã có model User
const bcrypt = require("bcryptjs");

// Xử lý đăng ký tài khoản
const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // 1. Kiểm tra email đã tồn tại chưa
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email này đã được sử dụng!" });
    }

    // 2. Mã hóa mật khẩu
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Tạo user mới
    const newUser = new User({
      username: username || email.split("@")[0],
      email,
      password: hashedPassword,
    });

    await newUser.save();

    res.status(201).json({
      message: "Đăng ký tài khoản thành công!",
      user: {
        _id: newUser._id,
        username: newUser.username,
        email: newUser.email,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Xử lý đăng nhập bằng Email/Mật khẩu
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Tìm user theo email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Email hoặc mật khẩu không chính xác!" });
    }

    // 2. Kiểm tra mật khẩu
    if (user.password) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Email hoặc mật khẩu không chính xác!" });
      }
    }

    // 3. Trả về thông tin đăng nhập thành công cùng ID người dùng
    res.status(200).json({
      message: "Đăng nhập thành công!",
      token: "mock_jwt_token_" + user._id, // Hoặc JWT token thật của bạn
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Xử lý đăng nhập bằng Mạng xã hội (Google / Facebook)
const socialLogin = async (req, res) => {
  try {
    const { username, email } = req.body;

    let user = await User.findOne({ email });

    // Nếu chưa có tài khoản thì tự động tạo mới
    if (!user) {
      user = new User({
        username: username || email.split("@")[0],
        email,
      });
      await user.save();
    }

    res.status(200).json({
      message: "Đăng nhập mạng xã hội thành công!",
      token: "mock_social_jwt_token_" + user._id,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  register,
  login,
  socialLogin,
};