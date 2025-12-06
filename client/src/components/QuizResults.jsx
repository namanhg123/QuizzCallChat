import React, { useState, useEffect } from "react";
import axios from "axios";
import "./QuizDashboard.css";

const API_URL = "http://localhost:5000";

const QuizResults = ({ quiz, onBack, getAuthHeaders }) => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/quiz/${quiz.quizId}/leaderboard`,
        { headers: getAuthHeaders() }
      );
      setResults(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Error fetching results");
    } finally {
      setLoading(false);
    }
  };

  const handleClearLeaderboard = async () => {
    if (!window.confirm("Clear all results for this quiz?")) return;

    try {
      await axios.delete(`${API_URL}/quiz/${quiz.quizId}/leaderboard`, {
        headers: getAuthHeaders(),
      });
      alert("Leaderboard cleared!");
      fetchResults();
    } catch (err) {
      setError(err.response?.data?.message || "Error clearing leaderboard");
    }
  };

  return (
    <div className="quiz-results">
      <div className="results-header">
        <button onClick={onBack} className="btn-back">
          ← Back
        </button>
        <h2>Results: {quiz.title}</h2>
        <button onClick={handleClearLeaderboard} className="btn-delete">
          Clear Leaderboard
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Loading results...</div>
      ) : results.length === 0 ? (
        <p>No results yet.</p>
      ) : (
        <table className="results-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Student</th>
              <th>Score</th>
              <th>Percentage</th>
              <th>Attempt</th>
              <th>Time Used</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r, index) => (
              <tr key={r.id}>
                <td>{index + 1}</td>
                <td>{r.userName}</td>
                <td>
                  {r.score} / {r.total}
                </td>
                <td>{((r.score / r.total) * 100).toFixed(2)}%</td>
                <td>#{r.attempt}</td>
                <td>{r.timeUsed ? `${r.timeUsed}s` : "N/A"}</td>
                <td>{new Date(r.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default QuizResults;
