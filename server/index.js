const express = require("express");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");
const mongoose = require("mongoose");

const authRoutes = require("./routes/auth.js");
const userRoutes = require("./routes/user.js");
const quizRoutes = require("./routes/quiz.js");
const twilio = require("twilio");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const PORT = process.env.PORT || 5000;

require("dotenv").config();

// Connect to MongoDB
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/groupchat_quiz";
mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

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
app.use("/quiz", quizRoutes);

// WebRTC Signaling Server
const rooms = new Map(); // roomId -> Set of socketIds
const users = new Map(); // socketId -> { userId, userName, roomId }

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  // Join video call room
  socket.on("join-room", ({ roomId, userId, userName }) => {
    console.log(`User ${userName} (${userId}) joining room ${roomId}`);

    socket.join(roomId);

    // Store user info
    users.set(socket.id, { userId, userName, roomId });

    // Add to room
    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Set());
    }
    rooms.get(roomId).add(socket.id);

    // Get other users in room
    const otherUsers = Array.from(rooms.get(roomId))
      .filter((id) => id !== socket.id)
      .map((id) => ({
        socketId: id,
        ...users.get(id),
      }));

    // Send existing users to new user
    socket.emit("existing-users", otherUsers);

    // Notify others about new user
    socket.to(roomId).emit("user-joined", {
      socketId: socket.id,
      userId,
      userName,
    });
  });

  // Forward WebRTC signaling messages
  socket.on("offer", ({ offer, to }) => {
    console.log(`Sending offer from ${socket.id} to ${to}`);
    io.to(to).emit("offer", {
      offer,
      from: socket.id,
      ...users.get(socket.id),
    });
  });

  socket.on("answer", ({ answer, to }) => {
    console.log(`Sending answer from ${socket.id} to ${to}`);
    io.to(to).emit("answer", {
      answer,
      from: socket.id,
    });
  });

  socket.on("ice-candidate", ({ candidate, to }) => {
    io.to(to).emit("ice-candidate", {
      candidate,
      from: socket.id,
    });
  });

  // Toggle media state
  socket.on("toggle-media", ({ type, enabled }) => {
    const user = users.get(socket.id);
    if (user && user.roomId) {
      socket.to(user.roomId).emit("user-media-toggle", {
        socketId: socket.id,
        type,
        enabled,
      });
    }
  });

  // Leave room
  socket.on("leave-room", () => {
    handleDisconnect(socket);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
    handleDisconnect(socket);
  });

  function handleDisconnect(socket) {
    const user = users.get(socket.id);
    if (user && user.roomId) {
      const room = rooms.get(user.roomId);
      if (room) {
        room.delete(socket.id);
        if (room.size === 0) {
          rooms.delete(user.roomId);
        } else {
          socket.to(user.roomId).emit("user-left", {
            socketId: socket.id,
            userId: user.userId,
          });
        }
      }
    }
    users.delete(socket.id);
  }
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`WebRTC Signaling Server ready`);
});
