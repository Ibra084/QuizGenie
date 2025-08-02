// QuizPage.js
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import QuizView from '../components/QuizView';
import ResultsView from '../components/ResultsView';
import { BookOpen, Loader2, AlertCircle, Clock, User, CheckCircle2, ArrowLeft } from 'lucide-react';

const QuizPage = () => {
  const [submitting, setSubmitting] = useState(false);
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState(null);
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/quiz/${quizId}`);
        setQuiz(response.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load quiz');
        // Redirect to home if quiz not found after 3 seconds
        setTimeout(() => navigate('/'), 3000);
      } finally {
        setLoading(false);
      }
    };
    
    fetchQuiz();
  }, [quizId, navigate]);

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  // In your submitQuiz function:
  const submitQuiz = async () => {
    try {
      setSubmitting(true); // Use submitting instead of loading
      const response = await axios.post('http://localhost:5000/submit-quiz', {
        quiz_id: quizId,
        answers
      });
      
      setResults(response.data);
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

// In your ResultsView rendering:
{submitted && results && (
  <ResultsView evaluation={results} />
)}

if (loading) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-white rounded-lg shadow-sm p-16">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Loading Your Quiz</h2>
            <p className="text-gray-600 text-lg">Please wait while we prepare your questions...</p>
            <div className="mt-8 w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

if (submitting) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-white rounded-lg shadow-sm p-16">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Marking Your Answers</h2>
            <p className="text-gray-600 text-lg">We're evaluating your responses...</p>
            <div className="mt-8 w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="bg-white rounded-lg shadow-sm p-16">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
                <AlertCircle className="w-10 h-10 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Unable to Load Quiz</h2>
              <p className="text-gray-600 text-lg mb-8 max-w-md">{error}</p>
              <div className="flex gap-4">
                <button 
                  onClick={() => window.location.reload()}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105"
                >
                  Try Again
                </button>
                <button 
                  onClick={() => navigate('/')}
                  className="px-8 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition-colors duration-200"
                >
                  Go Home
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button 
          onClick={() => navigate('/discover')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors duration-200"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back to Home</span>
        </button>

        {/* Header Section */}
        {quiz && (
          <div className="mb-8 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-1">
              <div className="bg-white rounded-lg p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-7 h-7 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        {quiz.title || 'Interactive Quiz'}
                      </h1>
                      <p className="text-gray-600 mb-4 text-lg">
                        {quiz.description || 'Test your knowledge with this interactive quiz'}
                      </p>
                      
                      <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm">
                        <div className="flex items-center gap-2 text-gray-500">
                          <User className="w-4 h-4" />
                          <span className="font-medium">Quiz ID:</span>
                          <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">{quizId}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-500">
                          <BookOpen className="w-4 h-4" />
                          <span className="font-medium">{quiz.content.length} Questions</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-500">
                          <Clock className="w-4 h-4" />
                          <span className="font-medium">{quiz.type === 'mcq' ? 'Multiple Choice' : 'Short Answer'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {!submitted && quiz.content && (
                    <div className="flex flex-col items-center lg:items-end">
                      <div className="text-center lg:text-right mb-3">
                        <span className="text-sm text-gray-500 block">Progress</span>
                        <span className="text-2xl font-bold text-gray-900">
                          {Object.keys(answers).length} / {quiz.content.length}
                        </span>
                      </div>
                      <div className="w-32 h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500 ease-out"
                          style={{ 
                            width: `${(Object.keys(answers).length / quiz.content.length) * 100}%` 
                          }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 mt-1">
                        {Math.round((Object.keys(answers).length / quiz.content.length) * 100)}% Complete
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {!submitted ? (
            <div className="p-8">
              {quiz && (
                <QuizView 
                  quizContent={quiz.content} 
                  quizType={quiz.type}
                  answers={answers}
                  onAnswerChange={handleAnswerChange}
                  onSubmit={submitQuiz}
                />
              )}
            </div>
          ) : (
            <div className="p-8">
              <ResultsView 
                evaluation={results}
                quizId={quizId}
              />
            </div>
          )}
        </div>

        {/* Quiz Tips */}
        {quiz && !submitted && (
          <div className="mt-8 bg-blue-50 rounded-xl border border-blue-200 p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 text-lg">💡</span>
              </div>
              <div>
                <h3 className="font-semibold text-blue-900 mb-3 text-lg">Quiz Tips</h3>
                <ul className="text-blue-800 space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 text-blue-600 flex-shrink-0" />
                    <span>Take your time to read each question carefully</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 text-blue-600 flex-shrink-0" />
                    <span>You can change your answers before submitting</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 text-blue-600 flex-shrink-0" />
                    <span>Make sure to answer all questions for the best results</span>
                  </li>
                  {quiz.type === 'mcq' && (
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 mt-0.5 text-blue-600 flex-shrink-0" />
                      <span>Choose the most accurate answer from the options</span>
                    </li>
                  )}
                  {quiz.type === 'short_answer' && (
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 mt-0.5 text-blue-600 flex-shrink-0" />
                      <span>Provide clear and concise answers</span>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizPage;