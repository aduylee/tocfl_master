const express = require("express");
const router = express.Router();
const { register, login, socialLogin } = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);
router.post("/social-login", socialLogin);

module.exports = router;