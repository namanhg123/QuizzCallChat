const Quiz = require("../models/Quiz");
const Question = require("../models/Question");
const Result = require("../models/Result");

// ============ TEACHER & ADMIN ============

// Tạo quiz mới (Teacher/Admin)
const createQuiz = async (req, res) => {
  try {
    const { quizId, title, timeLimit, channelId, channelName } = req.body;

    if (!quizId || !title || !channelId) {
      return res
        .status(400)
        .json({ message: "quizId, title, and channelId are required" });
    }

    // Kiểm tra quizId đã tồn tại chưa
    const existing = await Quiz.findOne({ quizId });
    if (existing) {
      return res.status(400).json({ message: "Quiz ID already exists" });
    }

    const quiz = await Quiz.create({
      quizId,
      title,
      owner: req.user.id,
      ownerName: req.user.fullName || req.user.name,
      channelId,
      channelName: channelName || "Unknown Channel",
      timeLimit: timeLimit || 0,
    });

    res.status(201).json(quiz);
  } catch (error) {
    console.error("[CREATE QUIZ ERROR]", error);
    res
      .status(500)
      .json({ message: "Error creating quiz", error: error.message });
  }
};

// Lấy danh sách quiz của teacher (Teacher)
const getMyQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ owner: req.user.id })
      .sort({ updatedAt: -1 })
      .lean();

    res.json(quizzes);
  } catch (error) {
    console.error("[GET MY QUIZZES ERROR]", error);
    res
      .status(500)
      .json({ message: "Error fetching quizzes", error: error.message });
  }
};

// Lấy danh sách quiz của một channel (All roles)
const getQuizzesByChannel = async (req, res) => {
  try {
    const { channelId } = req.params;

    if (!channelId) {
      return res.status(400).json({ message: "channelId is required" });
    }

    const quizzes = await Quiz.find({ channelId })
      .sort({ updatedAt: -1 })
      .lean();

    res.json(quizzes);
  } catch (error) {
    console.error("[GET CHANNEL QUIZZES ERROR]", error);
    res
      .status(500)
      .json({
        message: "Error fetching channel quizzes",
        error: error.message,
      });
  }
};

// Lấy tất cả quiz (Admin only)
const getAllQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find().sort({ updatedAt: -1 }).lean();

    res.json(quizzes);
  } catch (error) {
    console.error("[GET ALL QUIZZES ERROR]", error);
    res
      .status(500)
      .json({ message: "Error fetching quizzes", error: error.message });
  }
};

// Cập nhật quiz (Teacher - own quiz, Admin - any quiz)
const updateQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { title, timeLimit } = req.body;

    // Find quiz
    const quiz = await Quiz.findOne({ quizId });

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    // Check permissions: teacher can only update own quiz, admin can update any
    if (req.user.role !== "admin" && quiz.owner !== req.user.id) {
      return res
        .status(403)
        .json({ message: "You can only update your own quizzes" });
    }

    // Update fields
    if (title) quiz.title = title;
    if (timeLimit !== undefined) quiz.timeLimit = timeLimit;

    await quiz.save();

    res.json(quiz);
  } catch (error) {
    console.error("[UPDATE QUIZ ERROR]", error);
    res
      .status(500)
      .json({ message: "Error updating quiz", error: error.message });
  }
};

// Xóa quiz (Teacher - own quiz, Admin - any quiz)
const deleteQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;

    const quiz = await Quiz.findOne({ quizId });

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    // Check permissions
    if (req.user.role !== "admin" && quiz.owner !== req.user.id) {
      return res
        .status(403)
        .json({ message: "You can only delete your own quizzes" });
    }

    // Xóa quiz, câu hỏi và kết quả
    await Quiz.deleteOne({ quizId });
    await Question.deleteMany({ quizId });
    await Result.deleteMany({ quizId });

    res.json({ message: "Quiz deleted successfully" });
  } catch (error) {
    console.error("[DELETE QUIZ ERROR]", error);
    res
      .status(500)
      .json({ message: "Error deleting quiz", error: error.message });
  }
};

// Start quiz (Teacher - own quiz, Admin - any quiz)
const startQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;

    const quiz = await Quiz.findOne({ quizId });

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    // Check permissions
    if (req.user.role !== "admin" && quiz.owner !== req.user.id) {
      return res
        .status(403)
        .json({ message: "You can only start your own quizzes" });
    }

    quiz.isActive = true;
    await quiz.save();

    res.json(quiz);
  } catch (error) {
    console.error("[START QUIZ ERROR]", error);
    res
      .status(500)
      .json({ message: "Error starting quiz", error: error.message });
  }
};

// Stop quiz (Teacher - own quiz, Admin - any quiz)
const stopQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;

    const quiz = await Quiz.findOne({ quizId });

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    // Check permissions
    if (req.user.role !== "admin" && quiz.owner !== req.user.id) {
      return res
        .status(403)
        .json({ message: "You can only stop your own quizzes" });
    }

    quiz.isActive = false;
    await quiz.save();

    res.json(quiz);
  } catch (error) {
    console.error("[STOP QUIZ ERROR]", error);
    res
      .status(500)
      .json({ message: "Error stopping quiz", error: error.message });
  }
};

// Stop all quizzes (Admin/Teacher)
const stopAllQuizzes = async (req, res) => {
  try {
    const filter =
      req.user.role === "admin"
        ? { isActive: true }
        : { isActive: true, owner: req.user.id };

    const result = await Quiz.updateMany(filter, { $set: { isActive: false } });

    res.json({ message: "Quizzes stopped", modified: result.modifiedCount });
  } catch (error) {
    console.error("[STOP ALL QUIZZES ERROR]", error);
    res
      .status(500)
      .json({ message: "Error stopping quizzes", error: error.message });
  }
};

// Thêm câu hỏi vào quiz
const addQuestion = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { question, answers } = req.body;

    if (!question || !Array.isArray(answers) || answers.length !== 4) {
      return res.status(400).json({ message: "Invalid question format" });
    }

    const correctCount = answers.filter((a) => a.correct === true).length;
    if (correctCount !== 1) {
      return res
        .status(400)
        .json({ message: "Exactly one correct answer required" });
    }

    const quiz = await Quiz.findOne({ quizId });
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    // Check permissions
    if (req.user.role !== "admin" && quiz.owner !== req.user.id) {
      return res
        .status(403)
        .json({ message: "You can only add questions to your own quizzes" });
    }

    const newQuestion = await Question.create({
      quizId,
      question,
      answers,
      createdBy: req.user.id,
    });

    res.status(201).json(newQuestion);
  } catch (error) {
    console.error("[ADD QUESTION ERROR]", error);
    res
      .status(500)
      .json({ message: "Error adding question", error: error.message });
  }
};

// Lấy câu hỏi với đáp án (Teacher/Admin - for editing)
const getQuestionsWithAnswers = async (req, res) => {
  try {
    const { quizId } = req.params;

    const quiz = await Quiz.findOne({ quizId }).lean();
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    // Check permissions
    if (req.user.role !== "admin" && quiz.owner !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    const questions = await Question.find({ quizId })
      .select("question answers createdAt")
      .sort({ createdAt: 1 })
      .lean();

    res.json({ quiz, questions });
  } catch (error) {
    console.error("[GET QUESTIONS ERROR]", error);
    res
      .status(500)
      .json({ message: "Error fetching questions", error: error.message });
  }
};

// Cập nhật câu hỏi
const updateQuestion = async (req, res) => {
  try {
    const { quizId, questionId } = req.params;
    const { question, answers } = req.body;

    if (!question || !Array.isArray(answers) || answers.length !== 4) {
      return res.status(400).json({ message: "Invalid question format" });
    }

    const correctCount = answers.filter((a) => a.correct === true).length;
    if (correctCount !== 1) {
      return res
        .status(400)
        .json({ message: "Exactly one correct answer required" });
    }

    const quiz = await Quiz.findOne({ quizId });
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    // Check permissions
    if (req.user.role !== "admin" && quiz.owner !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    const updated = await Question.findOneAndUpdate(
      { _id: questionId, quizId },
      { question, answers },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Question not found" });
    }

    res.json(updated);
  } catch (error) {
    console.error("[UPDATE QUESTION ERROR]", error);
    res
      .status(500)
      .json({ message: "Error updating question", error: error.message });
  }
};

// Xóa câu hỏi
const deleteQuestion = async (req, res) => {
  try {
    const { quizId, questionId } = req.params;

    const quiz = await Quiz.findOne({ quizId });
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    // Check permissions
    if (req.user.role !== "admin" && quiz.owner !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    await Question.deleteOne({ _id: questionId, quizId });

    res.json({ message: "Question deleted successfully" });
  } catch (error) {
    console.error("[DELETE QUESTION ERROR]", error);
    res
      .status(500)
      .json({ message: "Error deleting question", error: error.message });
  }
};

// Leaderboard - Danh sách kết quả
const getLeaderboard = async (req, res) => {
  try {
    const { quizId } = req.params;

    const quiz = await Quiz.findOne({ quizId }).lean();
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    // Check permissions
    if (req.user.role !== "admin" && quiz.owner !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    const results = await Result.find({ quizId })
      .sort({ score: -1, timeUsed: 1, createdAt: 1 })
      .lean();

    res.json(
      results.map((r) => ({
        id: r._id,
        userId: r.userId,
        userName: r.userName,
        score: r.score,
        total: r.total,
        attempt: r.attempt,
        timeUsed: r.timeUsed,
        createdAt: r.createdAt,
      }))
    );
  } catch (error) {
    console.error("[GET LEADERBOARD ERROR]", error);
    res
      .status(500)
      .json({ message: "Error fetching leaderboard", error: error.message });
  }
};

// Xóa leaderboard
const clearLeaderboard = async (req, res) => {
  try {
    const { quizId } = req.params;

    const quiz = await Quiz.findOne({ quizId }).lean();
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    // Check permissions
    if (req.user.role !== "admin" && quiz.owner !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    await Result.deleteMany({ quizId });

    res.json({ message: "Leaderboard cleared successfully" });
  } catch (error) {
    console.error("[CLEAR LEADERBOARD ERROR]", error);
    res
      .status(500)
      .json({ message: "Error clearing leaderboard", error: error.message });
  }
};

// Chi tiết 1 kết quả
const getResultDetail = async (req, res) => {
  try {
    const { quizId, resultId } = req.params;

    const quiz = await Quiz.findOne({ quizId }).lean();
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    // Check permissions
    if (req.user.role !== "admin" && quiz.owner !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    const result = await Result.findOne({ _id: resultId, quizId }).lean();
    if (!result) {
      return res.status(404).json({ message: "Result not found" });
    }

    const questions = await Question.find({ quizId })
      .sort({ createdAt: 1 })
      .select("question answers")
      .lean();

    res.json({
      user: { userId: result.userId, userName: result.userName },
      quiz: { quizId, title: quiz.title },
      score: result.score,
      total: result.total,
      attempt: result.attempt,
      timeUsed: result.timeUsed,
      createdAt: result.createdAt,
      answers: result.answers,
      questions,
    });
  } catch (error) {
    console.error("[GET RESULT DETAIL ERROR]", error);
    res
      .status(500)
      .json({ message: "Error fetching result detail", error: error.message });
  }
};

// ============ PUBLIC / STUDENT ============

// Lấy danh sách quiz đang mở
const getActiveQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ isActive: true })
      .select("quizId title ownerName updatedAt timeLimit")
      .sort({ updatedAt: -1 })
      .lean();

    res.json(quizzes);
  } catch (error) {
    console.error("[GET ACTIVE QUIZZES ERROR]", error);
    res
      .status(500)
      .json({ message: "Error fetching active quizzes", error: error.message });
  }
};

// Lấy câu hỏi (không có đáp án) - cho student làm bài
const getQuestions = async (req, res) => {
  try {
    const { quizId } = req.params;

    const quiz = await Quiz.findOne({ quizId, isActive: true }).lean();
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found or not active" });
    }

    const questions = await Question.find({ quizId })
      .select("question answers")
      .sort({ createdAt: 1 })
      .lean();

    // Remove correct answer info
    const sanitizedQuestions = questions.map((q) => ({
      _id: q._id,
      question: q.question,
      answers: q.answers.map((a) => ({ text: a.text })),
    }));

    res.json({
      quizId: quiz.quizId,
      title: quiz.title,
      timeLimit: quiz.timeLimit,
      questions: sanitizedQuestions,
    });
  } catch (error) {
    console.error("[GET QUESTIONS ERROR]", error);
    res
      .status(500)
      .json({ message: "Error fetching questions", error: error.message });
  }
};

// Nộp bài (Student)
const submitQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { answers, timeUsed } = req.body;

    const quiz = await Quiz.findOne({ quizId }).lean();
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    const questions = await Question.find({ quizId })
      .sort({ createdAt: 1 })
      .lean();

    if (!questions.length) {
      return res.status(400).json({ message: "Quiz has no questions" });
    }

    if (!Array.isArray(answers) || answers.length !== questions.length) {
      return res.status(400).json({ message: "Invalid answers data" });
    }

    // Chấm điểm
    let score = 0;
    const detail = questions.map((q, i) => {
      const correctIndex = q.answers.findIndex((a) => a.correct === true);
      const your = Number(answers[i]);
      const ok = your === correctIndex;
      if (ok) score += 1;

      return {
        questionId: q._id,
        your,
        correct: correctIndex,
        ok,
      };
    });

    // Tính lần làm thứ mấy
    const lastResult = await Result.findOne({ quizId, userId: req.user.id })
      .sort({ attempt: -1 })
      .lean();

    const attempt = (lastResult?.attempt || 0) + 1;

    // Lưu kết quả
    const result = await Result.create({
      userId: req.user.id,
      userName: req.user.fullName || req.user.name,
      quizId,
      quizTitle: quiz.title,
      attempt,
      score,
      total: questions.length,
      timeUsed: timeUsed || null,
      answers: detail,
    });

    res.json({
      resultId: result._id,
      total: questions.length,
      score,
      attempt,
      detail,
    });
  } catch (error) {
    console.error("[SUBMIT QUIZ ERROR]", error);
    res
      .status(500)
      .json({ message: "Error submitting quiz", error: error.message });
  }
};

// Lấy kết quả của chính mình
const getMyResults = async (req, res) => {
  try {
    const { quizId } = req.params;

    const results = await Result.find({ quizId, userId: req.user.id })
      .sort({ attempt: -1 })
      .lean();

    res.json(results);
  } catch (error) {
    console.error("[GET MY RESULTS ERROR]", error);
    res
      .status(500)
      .json({ message: "Error fetching results", error: error.message });
  }
};

module.exports = {
  // Teacher/Admin
  createQuiz,
  getMyQuizzes,
  getAllQuizzes,
  getQuizzesByChannel,
  updateQuiz,
  deleteQuiz,
  startQuiz,
  stopQuiz,
  stopAllQuizzes,
  addQuestion,
  getQuestionsWithAnswers,
  updateQuestion,
  deleteQuestion,
  getLeaderboard,
  clearLeaderboard,
  getResultDetail,

  // Public/Student
  getActiveQuizzes,
  getQuestions,
  submitQuiz,
  getMyResults,
};
