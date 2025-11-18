const StreamChat = require("stream-chat").StreamChat;
require("dotenv").config();

const api_key = process.env.STREAM_API_KEY;
const api_secret = process.env.STREAM_API_SECRET;

// Lấy danh sách tất cả users
const getAllUsers = async (req, res) => {
  try {
    const client = StreamChat.getInstance(api_key, api_secret);

    console.log("[GET ALL USERS] Fetching users...");

    // Query tất cả users, sắp xếp theo thời gian tạo
    const { users } = await client.queryUsers(
      {}, // Lấy tất cả users
      { created_at: -1 }, // Sắp xếp theo thời gian tạo giảm dần
      { limit: 100 } // Giới hạn 100 users
    );

    console.log(`[GET ALL USERS] Found ${users.length} users`);

    // Lọc thông tin cần thiết
    const userList = users.map((user) => ({
      id: user.id,
      username: user.name,
      fullName: user.fullName,
      role: user.role || "student",
      phoneNumber: user.phoneNumber,
      avatarURL: user.avatarURL,
      online: user.online,
      created_at: user.created_at,
      updated_at: user.updated_at,
    }));

    console.log(
      "[GET ALL USERS] User list with roles:",
      userList.map((u) => ({ id: u.id, role: u.role }))
    );

    res.status(200).json({ users: userList });
  } catch (error) {
    console.error("[GET ALL USERS ERROR]", error);
    res
      .status(500)
      .json({ message: "Error fetching users", error: error.message });
  }
};

// Cập nhật role của user
const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    console.log(
      `[UPDATE ROLE] Attempting to update user ${userId} to role: ${role}`
    );

    // Kiểm tra role hợp lệ
    const validRoles = ["admin", "teacher", "student"];
    if (!validRoles.includes(role)) {
      return res
        .status(400)
        .json({ message: "Invalid role. Must be admin, teacher, or student" });
    }

    const client = StreamChat.getInstance(api_key, api_secret);

    // Kiểm tra user tồn tại
    const { users } = await client.queryUsers({ id: userId });
    if (!users.length) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log(`[UPDATE ROLE] Current user data:`, users[0]);

    // Không cho phép tự thay đổi role của chính mình
    if (userId === req.userId) {
      return res.status(403).json({ message: "Cannot change your own role" });
    }

    // Cập nhật role trong Stream Chat sử dụng upsertUser
    const updateResult = await client.upsertUser({
      id: userId,
      role: role,
    });

    console.log(`[UPDATE ROLE] Update result:`, updateResult);

    // Verify update bằng cách query lại user
    const { users: updatedUsers } = await client.queryUsers({ id: userId });
    console.log(`[UPDATE ROLE] Updated user data:`, updatedUsers[0]);

    res.status(200).json({
      message: "User role updated successfully",
      userId: userId,
      newRole: role,
      updatedUser: {
        id: updatedUsers[0].id,
        role: updatedUsers[0].role,
        name: updatedUsers[0].name, // username cho định danh
        fullName: updatedUsers[0].fullName, // fullName cho hiển thị
      },
    });
  } catch (error) {
    console.error("[UPDATE ROLE ERROR]", error);
    res
      .status(500)
      .json({ message: "Error updating user role", error: error.message });
  }
};

// Xóa user (chỉ admin)
const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const client = StreamChat.getInstance(api_key, api_secret);

    // Kiểm tra user tồn tại
    const { users } = await client.queryUsers({ id: userId });
    if (!users.length) {
      return res.status(404).json({ message: "User not found" });
    }

    // Không cho phép tự xóa chính mình
    if (userId === req.userId) {
      return res
        .status(403)
        .json({ message: "Cannot delete your own account" });
    }

    // Xóa user khỏi Stream Chat
    await client.deleteUser(userId, {
      mark_messages_deleted: true, // Đánh dấu tin nhắn đã xóa
      hard_delete: false, // Soft delete
    });

    res.status(200).json({
      message: "User deleted successfully",
      userId: userId,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Error deleting user", error: error.message });
  }
};

// Lấy thông tin user hiện tại
const getCurrentUser = async (req, res) => {
  try {
    const client = StreamChat.getInstance(api_key, api_secret);

    const { users } = await client.queryUsers({ id: req.userId });

    if (!users.length) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = users[0];

    res.status(200).json({
      id: user.id,
      username: user.name,
      fullName: user.fullName,
      role: user.role || "student",
      phoneNumber: user.phoneNumber,
      avatarURL: user.avatarURL,
      online: user.online,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Error fetching user info", error: error.message });
  }
};

// Cập nhật thông tin cá nhân
const updateProfile = async (req, res) => {
  try {
    console.log("[UPDATE PROFILE] Called with:", {
      userId: req.userId,
      body: req.body,
    });

    // CHỈ cho phép cập nhật username, fullName, phoneNumber và avatarURL - bỏ qua tất cả các trường khác
    const allowedFields = ["username", "fullName", "phoneNumber", "avatarURL"];
    const sanitizedBody = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        sanitizedBody[field] = req.body[field];
      }
    });

    console.log("[UPDATE PROFILE] Sanitized body:", sanitizedBody);
    console.log("[UPDATE PROFILE] Original body keys:", Object.keys(req.body));

    const { username, fullName, phoneNumber, avatarURL } = sanitizedBody;

    // Validate input - chỉ validate nếu có thay đổi
    if (fullName !== undefined && !fullName.trim()) {
      console.log("[UPDATE PROFILE] Invalid fullName");
      return res.status(400).json({ message: "fullName cannot be empty" });
    }

    if (phoneNumber !== undefined && !phoneNumber.trim()) {
      console.log("[UPDATE PROFILE] Invalid phoneNumber");
      return res.status(400).json({ message: "phoneNumber cannot be empty" });
    }

    if (username !== undefined && !username.trim()) {
      console.log("[UPDATE PROFILE] Invalid username");
      return res.status(400).json({ message: "username cannot be empty" });
    }

    // Kiểm tra nếu có ai đó cố gắng gửi các trường không được phép
    const forbiddenFields = Object.keys(req.body).filter(
      (key) => !allowedFields.includes(key)
    );
    if (forbiddenFields.length > 0) {
      console.log(
        "[UPDATE PROFILE] Forbidden fields detected:",
        forbiddenFields
      );
      return res.status(400).json({
        message: `Invalid fields: ${forbiddenFields.join(
          ", "
        )}. Only username, fullName, phoneNumber and avatarURL are allowed.`,
      });
    }

    // Validate phone number format nếu có thay đổi
    if (phoneNumber !== undefined) {
      const phoneRegex = /^[0-9]{10,11}$/;
      if (!phoneRegex.test(phoneNumber)) {
        return res.status(400).json({ message: "Invalid phone number format" });
      }
    }

    // Validate avatarURL format if provided
    if (avatarURL !== undefined && avatarURL && avatarURL.trim()) {
      try {
        new URL(avatarURL);
      } catch (error) {
        return res.status(400).json({ message: "Invalid avatar URL format" });
      }
    }

    const client = StreamChat.getInstance(api_key, api_secret);

    // Kiểm tra user tồn tại và lấy thông tin hiện tại
    const { users } = await client.queryUsers({ id: req.userId });
    if (!users.length) {
      return res.status(404).json({ message: "User not found" });
    }

    const currentUser = users[0];

    console.log("[UPDATE PROFILE] Current user data:", {
      id: currentUser.id,
      name: currentUser.name,
      fullName: currentUser.fullName,
      role: currentUser.role,
      phoneNumber: currentUser.phoneNumber,
      hashedPassword: currentUser.hashedPassword,
    });

    // Đảm bảo rằng mật khẩu không bao giờ bị mất khi cập nhật profile
    // if (!currentUser.hashedPassword) {
    //   console.error("[UPDATE PROFILE] CRITICAL: User has no hashed password!");
    //   return res.status(500).json({
    //     message:
    //       "Critical error: User account integrity compromised. Please contact administrator.",
    //   });
    // }

    // Cập nhật thông tin user trong Stream Chat - CHỈ cập nhật các trường có thay đổi
    const updatedUserData = {
      id: req.userId, // Sử dụng id làm định danh chính
    };
    updatedUserData.hashedPassword = currentUser.hashedPassword; // Giữ nguyên hashedPassword
    updatedUserData.role = currentUser.role; // Giữ nguyên role

    // Chỉ cập nhật các trường có thay đổi
    if (username !== undefined) {
      updatedUserData.name = username; // Stream Chat sử dụng 'name' cho username
    }
    if (fullName !== undefined) {
      updatedUserData.fullName = fullName;
    }
    if (phoneNumber !== undefined) {
      updatedUserData.phoneNumber = phoneNumber;
    }
    if (avatarURL !== undefined) {
      updatedUserData.avatarURL = avatarURL;
    }

    console.log("[UPDATE PROFILE] Updated user data:", {
      ...updatedUserData,
      // hashedPassword: updatedUserData.hashedPassword
      //   ? "[PRESERVED]"
      //   : "[MISSING]",
    });

    // Double check: Đảm bảo mật khẩu vẫn tồn tại trước khi cập nhật
    // if (!updatedUserData.hashedPassword) {
    //   console.error(
    //     "[UPDATE PROFILE] CRITICAL ERROR: hashedPassword is missing from update data"
    //   );
    //   return res.status(500).json({
    //     message:
    //       "Critical error: Cannot update profile without preserving password",
    //   });
    // }

    await client.upsertUser(updatedUserData);

    console.log(`[UPDATE PROFILE] Updated profile for user ${req.userId}`);

    // Tạo response data với các trường đã cập nhật
    const responseData = {};
    if (username !== undefined) responseData.username = username;
    if (fullName !== undefined) responseData.fullName = fullName;
    if (phoneNumber !== undefined) responseData.phoneNumber = phoneNumber;
    if (avatarURL !== undefined) responseData.avatarURL = avatarURL;

    res.status(200).json({
      message: "Profile updated successfully",
      data: responseData,
    });
  } catch (error) {
    console.error("[UPDATE PROFILE ERROR]", error);
    res.status(500).json({
      message: "Error updating profile",
      error: error.message,
    });
  }
};

// Thay đổi mật khẩu
const changePassword = async (req, res) => {
  try {
    console.log("[CHANGE PASSWORD] Called with userId:", req.userId);

    // CHỈ cho phép currentPassword và newPassword - bỏ qua tất cả các trường khác
    const allowedFields = ["currentPassword", "newPassword"];
    const sanitizedBody = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        sanitizedBody[field] = req.body[field];
      }
    });

    console.log(
      "[CHANGE PASSWORD] Sanitized body keys:",
      Object.keys(sanitizedBody)
    );
    console.log("[CHANGE PASSWORD] Original body keys:", Object.keys(req.body));

    const { currentPassword, newPassword } = sanitizedBody;

    // Validate input
    if (!currentPassword || !newPassword) {
      console.log("[CHANGE PASSWORD] Missing required fields");
      return res.status(400).json({
        message: "currentPassword and newPassword are required",
      });
    }

    // Kiểm tra nếu có ai đó cố gắng gửi các trường không được phép
    const forbiddenFields = Object.keys(req.body).filter(
      (key) => !allowedFields.includes(key)
    );
    if (forbiddenFields.length > 0) {
      console.log(
        "[CHANGE PASSWORD] Forbidden fields detected:",
        forbiddenFields
      );
      return res.status(400).json({
        message: `Invalid fields: ${forbiddenFields.join(
          ", "
        )}. Only currentPassword and newPassword are allowed.`,
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "New password must be at least 6 characters long",
      });
    }

    const bcrypt = require("bcrypt");
    const client = StreamChat.getInstance(api_key, api_secret);

    // Kiểm tra user tồn tại và lấy thông tin hiện tại
    const { users } = await client.queryUsers({ id: req.userId });
    if (!users.length) {
      return res.status(404).json({ message: "User not found" });
    }

    const currentUser = users[0];
    console.log("[CHANGE PASSWORD] Current user data:", {
      id: currentUser.id,
      name: currentUser.name,
      fullName: currentUser.fullName,
      role: currentUser.role,
    });

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      currentUser.hashedPassword
    );

    if (!isCurrentPasswordValid) {
      console.log("[CHANGE PASSWORD] Invalid current password");
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update password in Stream Chat - CHỈ cập nhật mật khẩu, giữ nguyên tất cả thông tin khác
    const updatedUserData = {
      id: req.userId,
      name: currentUser.name, // Giữ nguyên username
      fullName: currentUser.fullName, // Giữ nguyên fullName
      phoneNumber: currentUser.phoneNumber, // Giữ nguyên phoneNumber
      role: currentUser.role, // Giữ nguyên role
      hashedPassword: hashedNewPassword, // CHỈ cập nhật password
      // Giữ nguyên các trường khác nếu có
      ...(currentUser.avatarURL && { avatarURL: currentUser.avatarURL }),
      ...(currentUser.created_at && { created_at: currentUser.created_at }),
    };

    console.log("[CHANGE PASSWORD] Updated user data (password hashed):", {
      ...updatedUserData,
      hashedPassword: "[HIDDEN]",
    });

    await client.upsertUser(updatedUserData);

    console.log(`[CHANGE PASSWORD] Changed password for user ${req.userId}`);

    res.status(200).json({
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("[CHANGE PASSWORD ERROR]", error);
    res.status(500).json({
      message: "Error changing password",
      error: error.message,
    });
  }
};

// Lấy thông tin chi tiết của user khác (chỉ admin và teacher)
const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    const client = StreamChat.getInstance(api_key, api_secret);

    console.log(
      `[GET USER BY ID] Admin ${req.userId} requesting info for user ${userId}`
    );

    // Kiểm tra quyền admin hoặc teacher
    const { users: requestingUsers } = await client.queryUsers({
      id: req.userId,
    });
    if (!requestingUsers.length) {
      return res.status(404).json({ message: "Requesting user not found" });
    }

    const requestingUser = requestingUsers[0];
    if (!["admin", "teacher"].includes(requestingUser.role)) {
      return res
        .status(403)
        .json({ message: "Access denied. Admin or teacher role required." });
    }

    // Lấy thông tin user được yêu cầu
    const { users } = await client.queryUsers({ id: userId });
    if (!users.length) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = users[0];

    res.status(200).json({
      id: user.id,
      username: user.name,
      fullName: user.fullName,
      role: user.role || "student",
      phoneNumber: user.phoneNumber,
      avatarURL: user.avatarURL,
      online: user.online,
      hasPassword: !!user.hashedPassword,
      created_at: user.created_at,
      updated_at: user.updated_at,
    });
  } catch (error) {
    console.error("[GET USER BY ID ERROR]", error);
    res.status(500).json({
      message: "Error fetching user details",
      error: error.message,
    });
  }
};

// Cập nhật thông tin user khác (chỉ admin)
const updateUserByAdmin = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log("[ADMIN UPDATE USER] Called with:", {
      adminId: req.userId,
      targetUserId: userId,
      body: req.body,
    });

    const client = StreamChat.getInstance(api_key, api_secret);

    // Kiểm tra quyền admin
    const { users: adminUsers } = await client.queryUsers({ id: req.userId });
    if (!adminUsers.length) {
      return res.status(404).json({ message: "Admin user not found" });
    }

    const adminUser = adminUsers[0];
    if (adminUser.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Access denied. Admin role required." });
    }

    // Kiểm tra user đích tồn tại
    const { users } = await client.queryUsers({ id: userId });
    if (!users.length) {
      return res.status(404).json({ message: "Target user not found" });
    }

    const targetUser = users[0];

    // Cho phép cập nhật các trường: fullName, phoneNumber, avatarURL, role
    const allowedFields = ["fullName", "phoneNumber", "avatarURL", "role"];
    const sanitizedBody = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        sanitizedBody[field] = req.body[field];
      }
    });

    console.log("[ADMIN UPDATE USER] Sanitized body:", sanitizedBody);

    const { fullName, phoneNumber, avatarURL, role } = sanitizedBody;

    // Validate role if provided
    if (role && !["admin", "teacher", "student"].includes(role)) {
      return res
        .status(400)
        .json({ message: "Invalid role. Must be admin, teacher, or student" });
    }

    // Validate phone number if provided
    if (phoneNumber && !/^[0-9]{10,11}$/.test(phoneNumber)) {
      return res.status(400).json({ message: "Invalid phone number format" });
    }

    // Validate avatarURL if provided
    if (avatarURL && avatarURL.trim()) {
      try {
        new URL(avatarURL);
      } catch (error) {
        return res.status(400).json({ message: "Invalid avatar URL format" });
      }
    }

    // Tạo object cập nhật - chỉ cập nhật các trường được cung cấp
    const updatedUserData = {
      id: userId,
      name: targetUser.name, // Giữ nguyên username
      fullName: fullName !== undefined ? fullName : targetUser.fullName,
      phoneNumber:
        phoneNumber !== undefined ? phoneNumber : targetUser.phoneNumber,
      role: role !== undefined ? role : targetUser.role,
      hashedPassword: targetUser.hashedPassword, // LUÔN bảo tồn mật khẩu
      avatarURL: avatarURL !== undefined ? avatarURL : targetUser.avatarURL,
      ...(targetUser.created_at && { created_at: targetUser.created_at }),
    };

    console.log("[ADMIN UPDATE USER] Updated user data:", {
      ...updatedUserData,
      hashedPassword: updatedUserData.hashedPassword
        ? "[PRESERVED]"
        : "[MISSING]",
    });

    await client.upsertUser(updatedUserData);

    console.log(
      `[ADMIN UPDATE USER] Admin ${req.userId} updated user ${userId}`
    );

    res.status(200).json({
      message: "User updated successfully by admin",
      data: {
        id: userId,
        fullName: updatedUserData.fullName,
        phoneNumber: updatedUserData.phoneNumber,
        avatarURL: updatedUserData.avatarURL,
        role: updatedUserData.role,
      },
    });
  } catch (error) {
    console.error("[ADMIN UPDATE USER ERROR]", error);
    res.status(500).json({
      message: "Error updating user",
      error: error.message,
    });
  }
};

// Đặt lại mật khẩu cho user khác (chỉ admin)
const resetUserPassword = async (req, res) => {
  try {
    const { userId } = req.params;
    const { newPassword } = req.body;

    console.log("[ADMIN RESET PASSWORD] Called with:", {
      adminId: req.userId,
      targetUserId: userId,
    });

    const client = StreamChat.getInstance(api_key, api_secret);

    // Kiểm tra quyền admin
    const { users: adminUsers } = await client.queryUsers({ id: req.userId });
    if (!adminUsers.length) {
      return res.status(404).json({ message: "Admin user not found" });
    }

    const adminUser = adminUsers[0];
    if (adminUser.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Access denied. Admin role required." });
    }

    // Validate new password
    if (!newPassword || newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "New password must be at least 6 characters long" });
    }

    // Kiểm tra user đích tồn tại
    const { users } = await client.queryUsers({ id: userId });
    if (!users.length) {
      return res.status(404).json({ message: "Target user not found" });
    }

    const targetUser = users[0];
    const bcrypt = require("bcrypt");

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Cập nhật mật khẩu - giữ nguyên tất cả thông tin khác
    const updatedUserData = {
      id: userId,
      name: targetUser.name,
      fullName: targetUser.fullName,
      phoneNumber: targetUser.phoneNumber,
      role: targetUser.role,
      hashedPassword: hashedNewPassword, // Cập nhật mật khẩu mới
      avatarURL: targetUser.avatarURL,
      ...(targetUser.created_at && { created_at: targetUser.created_at }),
    };

    console.log("[ADMIN RESET PASSWORD] Updated user data (password hashed):", {
      ...updatedUserData,
      hashedPassword: "[HIDDEN]",
    });

    await client.upsertUser(updatedUserData);

    console.log(
      `[ADMIN RESET PASSWORD] Admin ${req.userId} reset password for user ${userId}`
    );

    res.status(200).json({
      message: "Password reset successfully by admin",
      userId: userId,
    });
  } catch (error) {
    console.error("[ADMIN RESET PASSWORD ERROR]", error);
    res.status(500).json({
      message: "Error resetting user password",
      error: error.message,
    });
  }
};

// Test function để verify data integrity
const verifyUserData = async (req, res) => {
  try {
    const client = StreamChat.getInstance(api_key, api_secret);
    const { users } = await client.queryUsers({ id: req.userId });

    if (!users.length) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = users[0];

    res.status(200).json({
      message: "User data verification",
      data: {
        id: user.id,
        name: user.name,
        fullName: user.fullName,
        role: user.role,
        phoneNumber: user.phoneNumber,
        avatarURL: user.avatarURL,
        hasPassword: !!user.hashedPassword,
        passwordLength: user.hashedPassword ? user.hashedPassword.length : 0,
        created_at: user.created_at,
        updated_at: user.updated_at,
      },
    });
  } catch (error) {
    console.error("[VERIFY USER ERROR]", error);
    res.status(500).json({
      message: "Error verifying user data",
      error: error.message,
    });
  }
};

module.exports = {
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
};
