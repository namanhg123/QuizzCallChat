const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.js");
const userRoutes = require("./routes/user.js");
const twilio = require("twilio");

const app = express();
const PORT = process.env.PORT || 5000;

require("dotenv").config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;
const client = require("twilio")(accountSid, authToken);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded());

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.post("/send-sms", (req, res) => {
  const { message, user: sender, type, members } = req.body;

  if (type === "message.new") {
    members
      .filter((member) => member.user_id !== sender.id)
      .forEach((user) => {
        if (!user.online) {
          twilioClient.messages
            .create({
              body: `You have a new message from ${sender.fullName}: ${message.text}`,
              messagingServiceSid: messagingServiceSid,
              to: user.phoneNumber, // Ensure user object has phoneNumber property
            })
            .then(() => console.log(`Message sent!`))
            .catch((error) =>
              console.error(`Failed to send message: ${error.message}`)
            );
        }
      });
    return res.status(200).send("Message sent");
  }
  return res.status(200).send("Not a new message request");
});

app.use("/auth", authRoutes);
app.use("/api", userRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
