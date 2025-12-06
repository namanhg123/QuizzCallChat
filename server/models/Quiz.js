const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema(
  {
    quizId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    title: { type: String, required: true, trim: true },
    owner: { type: String, required: true }, // Stream Chat user ID
    ownerName: { type: String }, // Tên người tạo quiz
    channelId: { type: String, required: true, index: true }, // Stream Chat channel ID
    channelName: { type: String }, // Tên channel
    isActive: { type: Boolean, default: false },
    timeLimit: { type: Number, default: 0 }, // thời gian làm bài (giây)
  },
  { timestamps: true }
);

module.exports = mongoose.model("Quiz", quizSchema);
