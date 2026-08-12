import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Home from "./pages/Home/Home";
import Vocabulary from "./pages/Vocabulary/Vocabulary";
import Flashcard from "./pages/Flashcard/Flashcard";
import MatchGame from "./pages/MatchGame/MatchGame";
import Quiz from "./pages/Quiz/Quiz";
import Listening from "./pages/Listening/Listening";
import Reading from "./pages/Reading/Reading";
import Dashboard from "./pages/Dashboard/Dashboard"; // 1. Import trang Tổng quan
import Register from "./pages/Register/Register"; 
import Login from "./pages/Login/Login";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Trang đăng ký và đăng nhập đứng độc lập */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        {/* Các trang nằm trong layout chính */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="vocabulary" element={<Vocabulary />} />
          <Route path="flashcard" element={<Flashcard />} />
          <Route path="matchgame" element={<MatchGame />} />
          <Route path="quiz" element={<Quiz />} />
          <Route path="listening" element={<Listening />} />
          <Route path="reading" element={<Reading />} />
          <Route path="dashboard" element={<Dashboard />} /> {/* 2. Thêm route Tổng quan */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}