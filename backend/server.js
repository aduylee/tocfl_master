const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const aiRoutes = require("./routes/aiChat"); 
const dashboardRoutes = require("./routes/dashboardRoutes"); // 1. Import thêm route Dashboard

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/ai", aiRoutes); 
app.use("/api/dashboard", dashboardRoutes); // 2. Khai báo đường dẫn API cho Dashboard

app.get("/", (req, res) => {
  res.send("TOCFL Master API Running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});