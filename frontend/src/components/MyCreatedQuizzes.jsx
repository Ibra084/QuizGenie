import { useState, useEffect } from 'react';
import { Edit, Trash2, BarChart2, Eye, Tag, Lock, Unlock, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const MyCreatedQuizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/quizzes/created', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setQuizzes(response.data.quizzes);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load quizzes');
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  const handleEditQuiz = (quizId) => {
    navigate(`/edit-quiz/${quizId}`);
  };

  const handleViewAnalytics = (quizId) => {
    navigate(`/quiz-analytics/${quizId}`);
  };

  const handleToggleVisibility = async (quizId, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/quizzes/${quizId}`, {
        is_public: !currentStatus
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setQuizzes(quizzes.map(quiz => 
        quiz.id === quizId 
          ? { ...quiz, is_public: !currentStatus } 
          : quiz
      ));
    } catch (err) {
      setError('Failed to update quiz visibility');
    }
  };

  const handleDeleteQuiz = async (quizId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/quizzes/${quizId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setQuizzes(quizzes.filter(quiz => quiz.id !== quizId));
      setDeleteConfirm(null);
    } catch (err) {
      setError('Failed to delete quiz');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin h-12 w-12 text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">My Created Quizzes</h2>
        <button 
          onClick={() => navigate('/create-quiz')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Create New Quiz
        </button>
      </div>

      {quizzes.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 mb-4">You haven't created any quizzes yet</p>
          <button 
            onClick={() => navigate('/create-quiz')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Create Your First Quiz
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map(quiz => (
            <div key={quiz.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold line-clamp-2">{quiz.title}</h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    quiz.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                    quiz.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {quiz.difficulty}
                  </span>
                </div>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{quiz.description}</p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {quiz.tags?.map(tag => (
                    <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="text-sm text-gray-500">Questions</div>
                    <div className="font-medium">{quiz.question_count}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Plays</div>
                    <div className="font-medium">{quiz.plays}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Avg Score</div>
                    <div className="font-medium">{quiz.average_score}%</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Status</div>
                    <div className="font-medium">
                      {quiz.is_public ? (
                        <span className="text-green-600">Public</span>
                      ) : (
                        <span className="text-gray-600">Private</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between space-x-2">
                    <button
                      onClick={() => handleViewAnalytics(quiz.id)}
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                      title="Analytics"
                    >
                      <BarChart2 className="h-5 w-5" />
                    </button>
                    
                    <button
                      onClick={() => handleEditQuiz(quiz.id)}
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                      title="Edit"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    
                    <button
                      onClick={() => handleToggleVisibility(quiz.id, quiz.is_public)}
                      className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded"
                      title={quiz.is_public ? "Make Private" : "Make Public"}
                    >
                      {quiz.is_public ? (
                        <Lock className="h-5 w-5" />
                      ) : (
                        <Unlock className="h-5 w-5" />
                      )}
                    </button>
                    
                    <button
                      onClick={() => setDeleteConfirm(quiz.id)}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                      title="Delete"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
              
              {quiz.recent_attempts?.length > 0 && (
                <div className="bg-gray-50 px-6 py-3 border-t">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Attempts</h4>
                  <div className="space-y-2">
                    {quiz.recent_attempts.map((attempt, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="truncate">
                          {attempt.username || 'Anonymous'}
                        </span>
                        <span className={`font-medium ${
                          attempt.score >= 80 ? 'text-green-600' :
                          attempt.score >= 50 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {attempt.score}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 text-center mb-2">Delete Quiz</h3>
            <p className="text-sm text-gray-500 text-center mb-6">
              Are you sure you want to delete this quiz? All attempt data will be permanently removed.
            </p>
            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteQuiz(deleteConfirm)}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Delete Quiz
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyCreatedQuizzes;