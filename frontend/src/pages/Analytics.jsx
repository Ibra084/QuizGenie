import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function QuizAnalytics() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`/api/quiz-analytics/${quizId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setData(res.data);
        setError("");
      } catch (err) {
        setError(err.response?.data?.error || "Failed to load analytics");
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, [quizId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">Loading...</div>
    );
  }
  if (error || !data?.success) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500">
        {error || "Error loading analytics"}
      </div>
    );
  }

  const { quiz, totalAttempts, averageScore, recent_attempts, leaderboard } = data;

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      {/* Quiz Info */}
      <button
        onClick={() => navigate(-1)}
        className="text-blue-500 mb-6"
      >← Back</button>
      <div className="mb-8 bg-white p-6 rounded shadow">
        <h2 className="text-2xl font-bold">{quiz.title}</h2>
        <p className="text-gray-600">{quiz.description}</p>
        <div className="flex gap-4 mt-2 text-sm text-gray-500">
          <span>Difficulty: {quiz.difficulty}</span>
          <span>Category: {quiz.category}</span>
          <span>Questions: {quiz.questionCount}</span>
        </div>
        <div className="flex gap-8 mt-4">
          <div>
            <div className="font-semibold text-xl">{totalAttempts}</div>
            <div className="text-gray-500 text-sm">Total Attempts</div>
          </div>
          <div>
            <div className="font-semibold text-xl">{averageScore}%</div>
            <div className="text-gray-500 text-sm">Average Score</div>
          </div>
        </div>
      </div>

      {/* Recent Plays */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-3">Recent Plays</h3>
        {recent_attempts.length === 0 && <div className="text-gray-400">No attempts yet.</div>}
        <div className="space-y-2">
          {recent_attempts.map((attempt, i) => (
            <div key={i} className="flex justify-between bg-gray-50 border rounded p-3 items-center">
              <span className="font-medium">{attempt.username}</span>
              <span className={
                "font-semibold " +
                (attempt.score >= 80
                  ? "text-green-600"
                  : attempt.score >= 50
                  ? "text-yellow-600"
                  : "text-red-600")
              }>
                {attempt.score}%
              </span>
              <span className="text-sm text-gray-500">
                {attempt.timeSpent || "--"}
              </span>
              <span className="text-xs text-gray-400">
                {attempt.completedAt ? new Date(attempt.completedAt).toLocaleString() : "--"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Performers */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Top Performers</h3>
        {leaderboard.length === 0 && <div className="text-gray-400">No attempts yet.</div>}
        <ol className="list-decimal ml-5 space-y-1">
          {leaderboard.map((user, i) => (
            <li key={i} className="flex justify-between items-center">
              <span>{user.username}</span>
              <span className="font-semibold text-blue-600">{user.score}%</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
