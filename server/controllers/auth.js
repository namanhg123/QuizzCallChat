const { connect } = require("getstream");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const StreamChat = require("stream-chat").StreamChat;

require("dotenv").config();

const api_key = process.env.STREAM_API_KEY;
const api_secret = process.env.STREAM_API_SECRET;
const app_id = process.env.STREAM_APP_ID;

const signup = async (req, res) => {
  try {
    const { fullName, username, password, phoneNumber, role, avatarURL} = req.body;

    const userId = crypto.randomBytes(16).toString("hex");

    const serverClient = connect(api_key, api_secret, app_id);
    const client = StreamChat.getInstance(api_key, api_secret);

    const hashedPassword = await bcrypt.hashSync(password, 10);

    // Role mặc định là student nếu không được chỉ định
    const userRole = role || "student";

    await client.upsertUser({
      id: userId,
      name: username,
      fullName: fullName,
      hashedPassword: hashedPassword,
      phoneNumber: phoneNumber,
      role: userRole,
      avatarURL: avatarURL,
    });

    const token = serverClient.createUserToken(userId);

    res.status(200).json({
      token,
      fullName,
      username,
      userId,
      phoneNumber,
      role: userRole,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error });
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const serverClient = connect(api_key, api_secret, app_id);
    const client = StreamChat.getInstance(api_key, api_secret);

    const { users } = await client.queryUsers({ name: username });

    if (!users.length)
      return res.status(400).json({ message: "User not found" });

    const success = await bcrypt.compare(password, users[0].hashedPassword);

    const token = serverClient.createUserToken(users[0].id);

    if (success) {
      res.status(200).json({
        token,
        fullName: users[0].fullName,
        username,
        userId: users[0].id,
        phoneNumber: users[0].phoneNumber,
        avatarURL: users[0].avatarURL,
        role: users[0].role || "student",
      });
    } else {
      res.status(401).json({ message: "Incorrect password" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error });
  }
};

module.exports = { login, signup };
