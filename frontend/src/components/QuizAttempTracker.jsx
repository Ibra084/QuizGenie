import { useState, useEffect } from 'react';
import { Clock, Check, X, BarChart2, List } from 'lucide-react';
import axios from 'axios';

const QuizAttemptTracker = ({ quizId, userId }) => {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('stats');

  useEffect(() => {
    const fetchAttempts = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await axios.get(`/api/attempts/${quizId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setAttempts(response.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load attempts');
      } finally {
        setLoading(false);
      }
    };

    if (quizId && userId) {
      fetchAttempts();
    }
  }, [quizId, userId]);

  if (loading) return <div className="text-center py-4">Loading attempt history...</div>;
  if (error) return <div className="text-red-500 text-center py-4">{error}</div>;

  const bestAttempt = attempts.length > 0 
    ? attempts.reduce((best, current) => current.score > best.score ? current : best)
    : null;

  const averageScore = attempts.length > 0
    ? attempts.reduce((sum, attempt) => sum + attempt.score, 0) / attempts.length
    : 0;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <div className="flex border-b mb-4">
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'stats' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('stats')}
        >
          <BarChart2 className="inline mr-2 h-4 w-4" />
          Statistics
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'history' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('history')}
        >
          <List className="inline mr-2 h-4 w-4" />
          Attempt History
        </button>
      </div>

      {activeTab === 'stats' && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Your Performance</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600">
                {attempts.length}
              </div>
              <div className="text-sm text-gray-600">Total Attempts</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600">
                {bestAttempt ? `${bestAttempt.score.toFixed(1)}%` : 'N/A'}
              </div>
              <div className="text-sm text-gray-600">Best Score</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-600">
                {attempts.length > 0 ? `${averageScore.toFixed(1)}%` : 'N/A'}
              </div>
              <div className="text-sm text-gray-600">Average Score</div>
            </div>
          </div>

          {bestAttempt && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium mb-2">Best Attempt Details</h4>
              <div className="flex items-center justify-between">
                <span>Score: <strong>{bestAttempt.score.toFixed(1)}%</strong></span>
                <span>Correct: <strong>{bestAttempt.correct_answers}/{bestAttempt.total_questions}</strong></span>
                <span>
                  <Clock className="inline mr-1 h-4 w-4" />
                  {bestAttempt.time_spent || '--:--'}
                </span>
                <span>
                  {new Date(bestAttempt.completed_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Attempt History</h3>
          {attempts.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              No attempts recorded yet
            </div>
          ) : (
            <div className="space-y-3">
              {attempts.map((attempt) => (
                <div key={attempt.id} className="border-b pb-3 last:border-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        attempt.score >= 80 ? 'bg-green-100 text-green-600' :
                        attempt.score >= 50 ? 'bg-yellow-100 text-yellow-600' :
                        'bg-red-100 text-red-600'
                      }`}>
                        {attempt.score.toFixed(0)}
                      </div>
                      <div>
                        <div className="font-medium">
                          {attempt.correct_answers}/{attempt.total_questions} correct
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(attempt.completed_at).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm">
                      <Clock className="inline mr-1 h-4 w-4" />
                      {attempt.time_spent || '--:--'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default QuizAttemptTracker;