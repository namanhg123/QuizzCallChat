const express = require("express");
const {
  authenticateToken,
  requireAdmin,
} = require("../middleware/authMiddleware.js");
const {
  getAllUsers,
  updateUserRole,
  deleteUser,
  getCurrentUser,
  updateProfile,
  changePassword,
  verifyUserData,
  getUserById,
  updateUserByAdmin,
  resetUserPassword,
} = require("../controllers/user.js");

const router = express.Router();

// Endpoint lấy thông tin user hiện tại (cần authentication)
router.get("/me", authenticateToken, getCurrentUser);

// Endpoint lấy danh sách tất cả users (chỉ admin)
router.get("/users", authenticateToken, requireAdmin, getAllUsers);

// Endpoint cập nhật role của user (chỉ admin)
router.put(
  "/users/:userId/role",
  authenticateToken,
  requireAdmin,
  updateUserRole
);

// Endpoint xóa user (chỉ admin)
router.delete("/users/:userId", authenticateToken, requireAdmin, deleteUser);

// Endpoint cập nhật thông tin cá nhân
router.put("/profile", authenticateToken, updateProfile);

// Endpoint thay đổi mật khẩu
router.put("/change-password", authenticateToken, changePassword);

// Endpoint verify user data (for testing)
router.get("/verify", authenticateToken, verifyUserData);

// Endpoint lấy thông tin chi tiết của user khác (chỉ admin và teacher)
router.get("/users/:userId", authenticateToken, getUserById);

// Endpoint cập nhật thông tin user khác (chỉ admin)
router.put(
  "/users/:userId",
  authenticateToken,
  requireAdmin,
  updateUserByAdmin
);

// Endpoint đặt lại mật khẩu cho user khác (chỉ admin)
router.put(
  "/users/:userId/reset-password",
  authenticateToken,
  requireAdmin,
  resetUserPassword
);

module.exports = router;
