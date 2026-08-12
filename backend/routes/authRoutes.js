const express = require("express");
const router = express.Router();

const { register, login } = require("../controllers/authController"); // Thêm hàm login

router.post("/register", register);
router.post("/login", login); // Thêm dòng này để khớp với /api/auth/login

module.exports = router;