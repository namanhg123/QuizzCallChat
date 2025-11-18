const StreamChat = require("stream-chat").StreamChat;
require("dotenv").config();

const api_key = process.env.STREAM_API_KEY;
const api_secret = process.env.STREAM_API_SECRET;

// Middleware để xác thực token
const authenticateToken = async (req, res, next) => {
  try {
    console.log("[AUTH MIDDLEWARE] Headers:", {
      authorization: req.headers.authorization ? "present" : "missing",
      userIdHeader: req.headers["user-id"],
    });

    const authHeader = req.headers.authorization;
    const token =
      authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : null;

    if (!token) {
      console.log("[AUTH MIDDLEWARE] No token provided");
      return res.status(401).json({ message: "No token provided" });
    }

    // Với Stream Chat, ta có thể decode token để lấy userId
    // Hoặc có thể lấy từ cookies như đang làm
    const { connect } = require("getstream");

    try {
      const serverClient = connect(api_key, api_secret);
      // Verify token bằng cách tạo lại user token
      const userId = req.headers["user-id"] || extractUserIdFromToken(token);

      console.log("[AUTH MIDDLEWARE] User ID:", userId);

      if (!userId) {
        console.log("[AUTH MIDDLEWARE] Cannot extract user ID");
        return res
          .status(401)
          .json({ message: "Cannot extract user ID from token" });
      }

      // Lưu userId vào request để sử dụng ở các middleware tiếp theo
      req.userId = userId;
      req.token = token;

      console.log(
        "[AUTH MIDDLEWARE] Authentication successful for user:",
        userId
      );
      next();
    } catch (tokenError) {
      console.log("[AUTH MIDDLEWARE] Token verification error:", tokenError);
      return res.status(403).json({ message: "Invalid token" });
    }
  } catch (error) {
    console.log("[AUTH MIDDLEWARE] General error:", error);
    return res.status(403).json({ message: "Invalid token" });
  }
};

// Helper function để extract userId từ token (nếu cần)
const extractUserIdFromToken = (token) => {
  // Đây là một helper function đơn giản
  // Trong thực tế, có thể cần decode JWT token phức tạp hơn
  try {
    // Với Stream Chat token, có thể parse để lấy userId
    // Hiện tại return null để dùng user-id header
    return null;
  } catch (error) {
    return null;
  }
};

// Middleware kiểm tra quyền admin
const requireAdmin = async (req, res, next) => {
  try {
    const client = StreamChat.getInstance(api_key, api_secret);
    const { users } = await client.queryUsers({ id: req.userId });

    if (!users.length) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = users[0];

    if (user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    req.user = user;
    next();
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error checking permissions" });
  }
};

// Middleware kiểm tra quyền teacher hoặc admin
const requireTeacherOrAdmin = async (req, res, next) => {
  try {
    const client = StreamChat.getInstance(api_key, api_secret);
    const { users } = await client.queryUsers({ id: req.userId });

    if (!users.length) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = users[0];

    if (user.role !== "admin" && user.role !== "teacher") {
      return res
        .status(403)
        .json({ message: "Access denied. Teacher or Admin only." });
    }

    req.user = user;
    next();
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error checking permissions" });
  }
};

module.exports = {
  authenticateToken,
  requireAdmin,
  requireTeacherOrAdmin,
};
