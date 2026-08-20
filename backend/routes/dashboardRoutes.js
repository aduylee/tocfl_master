const express = require("express");
const router = express.Router();
const {
  getDashboardData,
  updateDailyProgress,
} = require("../controllers/dashboardController");

router.get("/", getDashboardData);
router.post("/daily-progress", updateDailyProgress);

module.exports = router;