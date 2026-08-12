import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";
import { register as registerService } from "../../services/authService";
import {
  auth,
  googleProvider,
  facebookProvider,
  signInWithPopup,
} from "../../services/firebase";

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setErrors({
      ...errors,
      [e.target.name]: "",
    });
    setServerError("");
  };

  const validate = () => {
    let valid = true;
    const newErrors = {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    };

    if (!formData.username.trim()) {
      newErrors.username = "Vui lòng nhập tên người dùng";
      valid = false;
    }

    if (!formData.email.trim()) {
      newErrors.email = "Vui lòng nhập Email";
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
      valid = false;
    }

    if (!formData.password) {
      newErrors.password = "Vui lòng nhập mật khẩu";
      valid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
      valid = false;
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu";
      valid = false;
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      const res = await registerService({
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });

      alert(res.data?.message || "Đăng ký thành công!");
      navigate("/login");
    } catch (err: any) {
      setServerError(
        err.response?.data?.message || "Đăng ký thất bại"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      console.log(result.user);
      alert("Đăng nhập Google thành công");
      navigate("/");
    } catch (err: any) {
      setServerError(err.message);
    }
  };

  const handleFacebook = async () => {
    try {
      const result = await signInWithPopup(auth, facebookProvider);
      console.log(result.user);
      alert("Đăng nhập Facebook thành công");
      navigate("/");
    } catch (err: any) {
      setServerError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between selection:bg-red-500 selection:text-white">
      {/* Navbar đồng bộ với trang chủ */}
      <header className="bg-white shadow-sm py-4 px-8 flex justify-between items-center">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
          <span className="bg-red-600 text-white font-bold px-2.5 py-1 rounded-md text-sm">TW</span>
          <span className="text-xl font-extrabold tracking-tight text-gray-900">TOCFL-Master</span>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
          <Link to="/" className="hover:text-red-600 transition">Trang chủ</Link>
          <Link to="/vocabulary" className="hover:text-red-600 transition">Từ vựng</Link>
          <Link to="/grammar" className="hover:text-red-600 transition">Ngữ pháp</Link>
          <Link to="/quiz" className="hover:text-red-600 transition">Luyện thi</Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link to="/register" className="text-sm font-medium text-gray-700 hover:text-red-600 px-3 py-2">Đăng ký</Link>
          <Link to="/login" className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition shadow-sm">Đăng nhập</Link>
        </div>
      </header>

      {/* Main Content Form */}
      <main className="flex-grow flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Đăng ký tài khoản
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Chinh phục TOCFL dễ dàng cùng TOCFL-Master
            </p>
          </div>

          {serverError && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Tên người dùng
              </label>
              <input
                type="text"
                name="username"
                placeholder="Nhập tên người dùng"
                value={formData.username}
                onChange={handleChange}
                className={`w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition ${
                  errors.username
                    ? "border-red-500 bg-red-50/20"
                    : "border-gray-300 focus:border-red-600 focus:ring-1 focus:ring-red-600"
                }`}
              />
              {errors.username && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.username}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Email
              </label>
              <input
                type="email"
                name="email"
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
                className={`w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition ${
                  errors.email
                    ? "border-red-500 bg-red-50/20"
                    : "border-gray-300 focus:border-red-600 focus:ring-1 focus:ring-red-600"
                }`}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Mật khẩu
              </label>
              <input
                type="password"
                name="password"
                placeholder="********"
                value={formData.password}
                onChange={handleChange}
                className={`w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition ${
                  errors.password
                    ? "border-red-500 bg-red-50/20"
                    : "border-gray-300 focus:border-red-600 focus:ring-1 focus:ring-red-600"
                }`}
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Xác nhận mật khẩu
              </label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Nhập lại mật khẩu"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition ${
                  errors.confirmPassword
                    ? "border-red-500 bg-red-50/20"
                    : "border-gray-300 focus:border-red-600 focus:ring-1 focus:ring-red-600"
                }`}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-red-600 py-3 text-white font-semibold text-sm transition hover:bg-red-700 shadow-md shadow-red-600/20 disabled:bg-gray-300 mt-2"
            >
              {loading ? "Đang đăng ký..." : "Đăng ký"}
            </button>
          </form>

          <div className="my-5 flex items-center">
            <div className="flex-1 border-b border-gray-200"></div>
            <span className="mx-3 text-xs text-gray-400 uppercase tracking-wider">Hoặc tiếp tục với</span>
            <div className="flex-1 border-b border-gray-200"></div>
          </div>

          {/* Social Buttons */}
          <div className="space-y-2.5">
            <button
              type="button"
              onClick={handleGoogle}
              className="flex w-full items-center justify-center rounded-xl border border-gray-300 bg-white py-2.5 text-sm transition hover:bg-gray-50 shadow-sm"
            >
              <FcGoogle size={20} />
              <span className="ml-2 font-medium text-gray-700">Đăng ký với Google</span>
            </button>

            <button
              type="button"
              onClick={handleFacebook}
              className="flex w-full items-center justify-center rounded-xl border border-gray-300 bg-white py-2.5 text-sm transition hover:bg-blue-50/40 shadow-sm"
            >
              <FaFacebook size={20} className="text-blue-600" />
              <span className="ml-2 font-medium text-gray-700">Đăng ký với Facebook</span>
            </button>
          </div>

          <div className="mt-6 text-center text-sm">
            <span className="text-gray-500">Đã có tài khoản?</span>
            <Link
              to="/login"
              className="ml-1.5 font-semibold text-red-600 hover:underline"
            >
              Đăng nhập ngay
            </Link>
          </div>
        </div>
      </main>

      <footer className="text-center text-sm text-gray-400 py-6">
        © {new Date().getFullYear()} TOCFL-Master. Nền tảng học tiếng Trung Phồn thể toàn diện.
      </footer>
    </div>
  );
}