import React, { useState, useEffect } from "react";
import axios from "axios";
import "./QuizDashboard.css";

const API_URL = "http://localhost:5000";

const QuizTaker = ({ quiz, onBack, getAuthHeaders }) => {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    fetchQuestions();
  }, []);

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSubmit(true); // Auto submit
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const fetchQuestions = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/quiz/${quiz.quizId}/questions`,
        { headers: getAuthHeaders() }
      );
      setQuestions(response.data.questions);
      setAnswers(new Array(response.data.questions.length).fill(-1));
      if (response.data.timeLimit > 0) {
        setTimeLeft(response.data.timeLimit);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Error fetching questions");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (autoSubmit = false) => {
    if (!autoSubmit && answers.some((a) => a === -1)) {
      if (!window.confirm("You haven't answered all questions. Submit anyway?"))
        return;
    }

    const timeUsed =
      quiz.timeLimit > 0 ? quiz.timeLimit - (timeLeft || 0) : null;

    try {
      const response = await axios.post(
        `${API_URL}/quiz/${quiz.quizId}/submit`,
        { answers, timeUsed },
        { headers: getAuthHeaders() }
      );
      setResult(response.data);
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || "Error submitting quiz");
    }
  };

  if (loading) return <div className="loading">Loading quiz...</div>;
  if (error) return <div className="error-message">{error}</div>;

  if (submitted && result) {
    return (
      <div className="quiz-result">
        <h2>Quiz Completed!</h2>
        <div className="result-summary">
          <p className="score">
            Score: {result.score} / {result.total}
          </p>
          <p>Attempt: #{result.attempt}</p>
          <p>Percentage: {((result.score / result.total) * 100).toFixed(2)}%</p>
        </div>
        <div className="result-details">
          <h3>Review Answers:</h3>
          {result.detail.map((d, index) => (
            <div
              key={index}
              className={`answer-review ${d.ok ? "correct" : "wrong"}`}
            >
              <p>
                Question {index + 1}: {d.ok ? "✓ Correct" : "✗ Wrong"}
              </p>
              <p>Your answer: {String.fromCharCode(65 + d.your)}</p>
              {!d.ok && (
                <p className="correct-answer">
                  Correct answer: {String.fromCharCode(65 + d.correct)}
                </p>
              )}
            </div>
          ))}
        </div>
        <button onClick={onBack} className="btn-primary">
          Back to Quizzes
        </button>
      </div>
    );
  }

  return (
    <div className="quiz-taker">
      <div className="quiz-header">
        <button onClick={onBack} className="btn-back">
          ← Back
        </button>
        <h2>{quiz.title}</h2>
        {timeLeft !== null && (
          <div className="timer">
            Time Left: {Math.floor(timeLeft / 60)}:
            {(timeLeft % 60).toString().padStart(2, "0")}
          </div>
        )}
      </div>

      <div className="questions-container">
        {questions.map((q, qIndex) => (
          <div key={qIndex} className="question-card">
            <h3>
              Question {qIndex + 1}: {q.question}
            </h3>
            <div className="answers-options">
              {q.answers.map((a, aIndex) => (
                <div key={aIndex} className="answer-option">
                  <input
                    type="radio"
                    name={`question-${qIndex}`}
                    checked={answers[qIndex] === aIndex}
                    onChange={() => {
                      const newAnswers = [...answers];
                      newAnswers[qIndex] = aIndex;
                      setAnswers(newAnswers);
                    }}
                  />
                  <label>
                    {String.fromCharCode(65 + aIndex)}. {a.text}
                  </label>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="submit-container">
        <button onClick={() => handleSubmit(false)} className="btn-primary">
          Submit Quiz
        </button>
      </div>
    </div>
  );
};

export default QuizTaker;
