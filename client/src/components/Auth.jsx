import React, { useState } from "react";
import Cookies from "universal-cookie";
import axios from "axios";

import signinImage from "../assets/signup.jpg";

const cookies = new Cookies();

const initialState = {
  fullName: "",
  username: "",
  password: "",
  confirmPassword: "",
  phoneNumber: "",
  avatarURL: "",
};

const Auth = () => {
  const [form, setForm] = useState(initialState);
  const [isSignup, setIsSignup] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { username, password, phoneNumber, avatarURL, fullName } = form;

    // Reset error message và set loading
    setError("");
    setLoading(true);

    // Kiểm tra validation cơ bản
    if (!username || !password) {
      setError("Vui lòng nhập đầy đủ thông tin");
      setLoading(false);
      return;
    }

    if (isSignup && password !== form.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      setLoading(false);
      return;
    }

    try {
      const URL = "http://localhost:5000/auth";

      const {
        data: { token, userId, fullName, phoneNumber, avatarURL, role },
      } = await axios.post(`${URL}/${isSignup ? "/signup" : "/login"}`, {
        username: form.username,
        password: form.password,
        ...(isSignup && {
          fullName: form.fullName,
          phoneNumber: form.phoneNumber,
          avatarURL: form.avatarURL,
        }),
      });

      // Lưu TẤT CẢ thông tin vào cookies
      cookies.set("token", token);
      cookies.set("username", username);
      cookies.set("fullName", fullName);
      cookies.set("userId", userId);
      cookies.set("phoneNumber", phoneNumber);
      cookies.set("avatarURL", avatarURL);
      cookies.set("role", role || "student");

      window.location.reload();
    } catch (error) {
      setLoading(false);

      // Xử lý các loại lỗi khác nhau
      if (error.response) {
        const { status, data } = error.response;

        switch (status) {
          case 400:
            setError(data.message || "Thông tin đăng nhập không hợp lệ");
            break;
          case 401:
            setError("Tài khoản hoặc mật khẩu không đúng");
            break;
          case 409:
            setError("Tài khoản đã tồn tại");
            break;
          case 500:
            setError("Server error responses!");
            break;
          default:
            setError(data.message || "Có lỗi xảy ra, vui lòng thử lại");
        }
      } else if (error.request) {
        setError(
          "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng"
        );
      } else {
        setError("Có lỗi xảy ra: " + error.message);
      }
    }
  };

  const switchMode = () => {
    setIsSignup((prevIsSignup) => !prevIsSignup);
    setError(""); // Reset error khi chuyển đổi mode
    setForm(initialState); // Reset form
  };

  return (
    <div className="auth__form-container">
      <div className="auth__form-container_fields">
        <div className="auth__form-container_fields-content">
          <p>{isSignup ? "Sign Up" : "Sign In"}</p>
          {error && (
            <div className="auth__form-container_fields-error">
              <p
                style={{
                  color: "#ff4d4f",
                  fontSize: "14px",
                  marginBottom: "10px",
                  textAlign: "center",
                }}
              >
                {error}
              </p>
            </div>
          )}
          <form onSubmit={handleSubmit}>
            {isSignup && (
              <div className="auth__form-container_fields-content_input">
                <label htmlFor="fullName">Full Name</label>
                <input
                  name="fullName"
                  type="text"
                  placeholder="Full Name"
                  onChange={handleChange}
                  required
                />
              </div>
            )}
            <div className="auth__form-container_fields-content_input">
              <label htmlFor="username">Username</label>
              <input
                name="username"
                type="text"
                placeholder="Username"
                onChange={handleChange}
                required
              />
            </div>
            {isSignup && (
              <div className="auth__form-container_fields-content_input">
                <label htmlFor="phoneNumber">Phone Number</label>
                <input
                  name="phoneNumber"
                  type="text"
                  placeholder="Phone Number"
                  onChange={handleChange}
                  required
                />
              </div>
            )}
            {isSignup && (
              <div className="auth__form-container_fields-content_input">
                <label htmlFor="avatarURL">Avatar URL</label>
                <input
                  name="avatarURL"
                  type="text"
                  placeholder="Avatar URL"
                  onChange={handleChange}
                  required
                />
              </div>
            )}
            <div className="auth__form-container_fields-content_input">
              <label htmlFor="password">Password</label>
              <input
                name="password"
                type="password"
                placeholder="Password"
                onChange={handleChange}
                required
              />
            </div>
            {isSignup && (
              <div className="auth__form-container_fields-content_input">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm Password"
                  onChange={handleChange}
                  required
                />
              </div>
            )}
            <div className="auth__form-container_fields-content_button">
              <button type="submit" disabled={loading}>
                {loading
                  ? isSignup
                    ? "Đang đăng ký..."
                    : "Đang đăng nhập..."
                  : isSignup
                  ? "Sign Up"
                  : "Sign In"}
              </button>
            </div>
          </form>
          <div className="auth__form-container_fields-account">
            <p>
              {isSignup
                ? "Already have an account? "
                : "Don't have an account? "}
              <span onClick={switchMode}>
                {isSignup ? "Sign In" : "Sign Up"}
              </span>
            </p>
          </div>
        </div>
      </div>
      {/* Image container removed as per new design */}
    </div>
  );
};

export default Auth;
