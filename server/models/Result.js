const mongoose = require("mongoose");

const answerDetailSchema = new mongoose.Schema(
  {
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      required: true,
    },
    your: { type: Number, required: true }, // index học sinh chọn
    correct: { type: Number, required: true }, // index đúng
    ok: { type: Boolean, required: true }, // true/false
  },
  { _id: false }
);

const resultSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true }, // Stream Chat user ID
    userName: { type: String }, // Tên học sinh
    quizId: { type: String, required: true, index: true },
    quizTitle: { type: String }, // Tên quiz

    attempt: { type: Number, required: true }, // lần làm thứ mấy
    score: { type: Number, required: true },
    total: { type: Number, required: true },
    timeUsed: { type: Number }, // thời gian làm bài (giây)

    answers: [answerDetailSchema],
  },
  { timestamps: true }
);

// Index cho truy vấn leaderboard
resultSchema.index({ quizId: 1, userId: 1, attempt: -1 });

module.exports = mongoose.model("Result", resultSchema);
