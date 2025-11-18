const StreamChat = require("stream-chat").StreamChat;
require("dotenv").config();

const api_key = process.env.STREAM_API_KEY;
const api_secret = process.env.STREAM_API_SECRET;

async function testRoleUpdate() {
  const client = StreamChat.getInstance(api_key, api_secret);

  console.log("=== Test Role Update ===\n");

  try {
    // Lấy danh sách users
    const { users } = await client.queryUsers(
      {},
      { created_at: -1 },
      { limit: 10 }
    );

    if (users.length === 0) {
      console.log("Không có user nào trong hệ thống.");
      return;
    }

    console.log("Danh sách users hiện có:");
    users.forEach((user, index) => {
      console.log(`${index + 1}. ID: ${user.id}`);
      console.log(`   Username: ${user.name}`);
      console.log(`   Role: ${user.role || "student (default)"}`);
      console.log("");
    });

    // Test update role cho user đầu tiên (nếu không phải là chính mình)
    if (users.length >= 2) {
      const testUser = users[1]; // User thứ 2
      const testUserId = testUser.id;
      const oldRole = testUser.role || "student";

      console.log(`\n--- Test 1: Update role từ ${oldRole} sang teacher ---`);

      // Update role
      const updateResult = await client.upsertUser({
        id: testUserId,
        role: "teacher",
      });

      console.log("✓ Update command sent");

      // Verify bằng cách query lại
      const { users: verifyUsers } = await client.queryUsers({
        id: testUserId,
      });
      const newRole = verifyUsers[0].role;

      console.log(`✓ Verified: User ${testUserId} now has role: ${newRole}`);

      if (newRole === "teacher") {
        console.log("✅ TEST PASSED: Role updated successfully!");
      } else {
        console.log("❌ TEST FAILED: Role not updated correctly");
        console.log("   Expected: teacher");
        console.log(`   Got: ${newRole}`);
      }

      // Test 2: Update ngược lại
      console.log(`\n--- Test 2: Update role từ teacher sang ${oldRole} ---`);

      await client.upsertUser({
        id: testUserId,
        role: oldRole,
      });

      const { users: verifyUsers2 } = await client.queryUsers({
        id: testUserId,
      });
      const finalRole = verifyUsers2[0].role;

      console.log(
        `✓ Verified: User ${testUserId} now has role: ${finalRole || "student"}`
      );

      if (finalRole === oldRole || (!finalRole && oldRole === "student")) {
        console.log("✅ TEST PASSED: Role reverted successfully!");
      } else {
        console.log("❌ TEST FAILED: Role not reverted correctly");
      }
    }

    console.log("\n=== Test Complete ===");
  } catch (error) {
    console.error("❌ Error during test:", error.message);
    console.error(error);
  }
}

// Chạy test
testRoleUpdate();
