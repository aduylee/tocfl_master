const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String }, // Bỏ required để hỗ trợ đăng nhập Google/Facebook
  learnedVocabCount: { type: Number, default: 0 }, // Trường lưu số từ vựng đã thuộc
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
