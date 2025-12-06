const StreamChat = require("stream-chat").StreamChat;
require("dotenv").config();

const api_key = process.env.STREAM_API_KEY;
const api_secret = process.env.STREAM_API_SECRET;

// Middleware xác thực user từ Stream Chat token
const authRequired = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.slice(7);

    // Verify token với Stream Chat
    const client = StreamChat.getInstance(api_key, api_secret);

    // Lấy userId từ token (cần decode token hoặc từ header khác)
    // Stream Chat token chứa userId, ta cần extract nó
    const userId = req.headers["x-user-id"]; // Client cần gửi userId trong header

    if (!userId) {
      return res.status(401).json({ message: "User ID not provided" });
    }

    // Query user từ Stream Chat để verify
    const { users } = await client.queryUsers({ id: userId });

    if (!users || users.length === 0) {
      return res.status(401).json({ message: "Invalid user" });
    }

    const user = users[0];

    // Lưu thông tin user vào request
    req.user = {
      id: user.id,
      name: user.name,
      fullName: user.fullName,
      role: user.role || "student",
    };

    next();
  } catch (error) {
    console.error("[AUTH ERROR]", error);
    return res.status(401).json({ message: "Authentication failed" });
  }
};

// Middleware kiểm tra role
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: "Forbidden - insufficient permissions" });
    }
    next();
  };
};

// Middleware kiểm tra admin hoặc teacher
const requireAdminOrTeacher = (req, res, next) => {
  if (!req.user || !["admin", "teacher"].includes(req.user.role)) {
    return res
      .status(403)
      .json({ message: "Forbidden - Admin or Teacher role required" });
  }
  next();
};

module.exports = {
  authRequired,
  requireRole,
  requireAdminOrTeacher,
};
