import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2, Eye, EyeOff, AlertCircle, Check, X, Move, Copy, Settings, Loader2, RefreshCw } from 'lucide-react';
import axios from 'axios';

const EditQuiz = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  
  const [quiz, setQuiz] = useState({
    title: '',
    description: '',
    category: 'general',
    difficulty: 'medium',
    timeLimit: 0,
    isPublic: true,
    allowRetakes: true,
    showCorrectAnswers: true,
    randomizeQuestions: false,
    questions: []
  });

  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [showPreview, setShowPreview] = useState(false);

  const categories = [
    { value: 'general', label: 'General Knowledge' },
    { value: 'science', label: 'Science' },
    { value: 'history', label: 'History' },
    { value: 'math', label: 'Mathematics' },
    { value: 'literature', label: 'Literature' },
    { value: 'geography', label: 'Geography' },
    { value: 'art', label: 'Art & Culture' },
    { value: 'technology', label: 'Technology' },
    { value: 'entertainment', label: 'Entertainment' }
  ];

  const difficulties = [
    { value: 'easy', label: 'Easy' },
    { value: 'medium', label: 'Medium' },
    { value: 'hard', label: 'Hard' }
  ];

  const questionTypes = [
    { value: 'multiple_choice', label: 'Multiple Choice' },
    { value: 'true_false', label: 'True/False' },
    { value: 'short_answer', label: 'Short Answer' }
  ];

  // Load quiz data
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        // Simulate API call - replace with actual API
        const sampleQuiz = {
          id: quizId,
          title: "JavaScript Fundamentals Quiz",
          description: "Test your knowledge of JavaScript basics including variables, functions, and DOM manipulation.",
          category: "technology",
          difficulty: "medium",
          timeLimit: 15,
          isPublic: true,
          allowRetakes: true,
          showCorrectAnswers: true,
          randomizeQuestions: false,
          questions: [
            {
              id: 1,
              type: 'multiple_choice',
              question: 'What is the correct way to declare a variable in JavaScript?',
              options: ['var myVar;', 'variable myVar;', 'v myVar;', 'declare myVar;'],
              correctAnswer: 0,
              explanation: 'The "var" keyword is used to declare variables in JavaScript.',
              points: 10
            },
            {
              id: 2,
              type: 'true_false',
              question: 'JavaScript is case-sensitive.',
              correctAnswer: true,
              explanation: 'JavaScript is indeed case-sensitive. "Variable" and "variable" would be treated as different identifiers.',
              points: 5
            },
            {
              id: 3,
              type: 'short_answer',
              question: 'What method is used to add an element to the end of an array?',
              correctAnswer: 'push',
              explanation: 'The push() method adds one or more elements to the end of an array.',
              points: 10
            }
          ]
        };

        setQuiz(sampleQuiz);
      } catch (err) {
        setError('Failed to load quiz data');
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [quizId]);

  const handleQuizChange = (field, value) => {
    setQuiz(prev => ({ ...prev, [field]: value }));
  };

  const handleQuestionChange = (questionIndex, field, value) => {
    setQuiz(prev => ({
      ...prev,
      questions: prev.questions.map((q, index) => 
        index === questionIndex ? { ...q, [field]: value } : q
      )
    }));
  };

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    setQuiz(prev => ({
      ...prev,
      questions: prev.questions.map((q, index) => 
        index === questionIndex ? {
          ...q,
          options: q.options.map((opt, oIndex) => 
            oIndex === optionIndex ? value : opt
          )
        } : q
      )
    }));
  };

  const addQuestion = () => {
    const newQuestion = {
      id: Date.now(),
      type: 'multiple_choice',
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: '',
      points: 10
    };

    setQuiz(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));
    setActiveQuestionIndex(quiz.questions.length);
  };

  const duplicateQuestion = (questionIndex) => {
    const questionToDuplicate = quiz.questions[questionIndex];
    const duplicatedQuestion = {
      ...questionToDuplicate,
      id: Date.now(),
      question: `${questionToDuplicate.question} (Copy)`
    };

    setQuiz(prev => ({
      ...prev,
      questions: [
        ...prev.questions.slice(0, questionIndex + 1),
        duplicatedQuestion,
        ...prev.questions.slice(questionIndex + 1)
      ]
    }));
  };

  const deleteQuestion = (questionIndex) => {
    if (quiz.questions.length <= 1) {
      setError('Quiz must have at least one question');
      return;
    }

    setQuiz(prev => ({
      ...prev,
      questions: prev.questions.filter((_, index) => index !== questionIndex)
    }));

    if (activeQuestionIndex >= quiz.questions.length - 1) {
      setActiveQuestionIndex(Math.max(0, activeQuestionIndex - 1));
    }
  };

  const moveQuestion = (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= quiz.questions.length) return;

    const questions = [...quiz.questions];
    const [movedQuestion] = questions.splice(fromIndex, 1);
    questions.splice(toIndex, 0, movedQuestion);

    setQuiz(prev => ({ ...prev, questions }));
    setActiveQuestionIndex(toIndex);
  };

  const addOption = (questionIndex) => {
    setQuiz(prev => ({
      ...prev,
      questions: prev.questions.map((q, index) => 
        index === questionIndex ? {
          ...q,
          options: [...q.options, '']
        } : q
      )
    }));
  };

  const removeOption = (questionIndex, optionIndex) => {
    const question = quiz.questions[questionIndex];
    if (question.options.length <= 2) return;

    setQuiz(prev => ({
      ...prev,
      questions: prev.questions.map((q, index) => 
        index === questionIndex ? {
          ...q,
          options: q.options.filter((_, oIndex) => oIndex !== optionIndex),
          correctAnswer: q.correctAnswer > optionIndex ? q.correctAnswer - 1 : 
                        q.correctAnswer === optionIndex ? 0 : q.correctAnswer
        } : q
      )
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');

      // Validation
      if (!quiz.title.trim()) {
        setError('Quiz title is required');
        return;
      }

      if (quiz.questions.length === 0) {
        setError('Quiz must have at least one question');
        return;
      }

      for (let i = 0; i < quiz.questions.length; i++) {
        const q = quiz.questions[i];
        if (!q.question.trim()) {
          setError(`Question ${i + 1} is required`);
          return;
        }

        if (q.type === 'multiple_choice') {
          if (q.options.some(opt => !opt.trim())) {
            setError(`All options for question ${i + 1} are required`);
            return;
          }
        }
      }

      const token = localStorage.getItem('token');
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccessMessage('Quiz updated successfully!');
      setTimeout(() => {
        navigate('/my-quizzes');
      }, 1500);

    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update quiz');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
      </div>
    );
  }

  const currentQuestion = quiz.questions[activeQuestionIndex];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate('/my-quizzes')}
              className="flex items-center space-x-2 text-white hover:text-blue-200 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to My Quizzes</span>
            </button>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center space-x-2 px-3 py-1.5 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
              >
                {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                <span className="text-sm">{showPreview ? 'Hide Preview' : 'Preview'}</span>
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                <span>{saving ? 'Saving...' : 'Save Quiz'}</span>
              </button>
            </div>
          </div>
          <h1 className="text-3xl font-bold">Edit Quiz</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-2">
            <Check className="h-5 w-5 text-green-600" />
            <span className="text-green-800">{successMessage}</span>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <span className="text-red-800">{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quiz Settings */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Quiz Settings</span>
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quiz Title *
                  </label>
                  <input
                    type="text"
                    value={quiz.title}
                    onChange={(e) => handleQuizChange('title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter quiz title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={quiz.description}
                    onChange={(e) => handleQuizChange('description', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter quiz description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={quiz.category}
                    onChange={(e) => handleQuizChange('category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Difficulty
                  </label>
                  <select
                    value={quiz.difficulty}
                    onChange={(e) => handleQuizChange('difficulty', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {difficulties.map(diff => (
                      <option key={diff.value} value={diff.value}>{diff.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time Limit (minutes, 0 = no limit)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={quiz.timeLimit}
                    onChange={(e) => handleQuizChange('timeLimit', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isPublic"
                      checked={quiz.isPublic}
                      onChange={(e) => handleQuizChange('isPublic', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isPublic" className="ml-2 text-sm text-gray-700">
                      Make quiz public
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="allowRetakes"
                      checked={quiz.allowRetakes}
                      onChange={(e) => handleQuizChange('allowRetakes', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="allowRetakes" className="ml-2 text-sm text-gray-700">
                      Allow retakes
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="showCorrectAnswers"
                      checked={quiz.showCorrectAnswers}
                      onChange={(e) => handleQuizChange('showCorrectAnswers', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="showCorrectAnswers" className="ml-2 text-sm text-gray-700">
                      Show correct answers after completion
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="randomizeQuestions"
                      checked={quiz.randomizeQuestions}
                      onChange={(e) => handleQuizChange('randomizeQuestions', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="randomizeQuestions" className="ml-2 text-sm text-gray-700">
                      Randomize question order
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Question List */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Questions ({quiz.questions.length})</h3>
                <button
                  onClick={addQuestion}
                  className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add</span>
                </button>
              </div>
              
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {quiz.questions.map((question, index) => (
                  <div
                    key={question.id}
                    onClick={() => setActiveQuestionIndex(index)}
                    className={`p-3 rounded-lg cursor-pointer border-2 transition-colors ${
                      index === activeQuestionIndex
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-xs font-medium text-gray-500">
                            Q{index + 1}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            question.type === 'multiple_choice' ? 'bg-blue-100 text-blue-800' :
                            question.type === 'true_false' ? 'bg-green-100 text-green-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {questionTypes.find(t => t.value === question.type)?.label}
                          </span>
                        </div>
                        <p className="text-sm text-gray-900 truncate">
                          {question.question || 'Untitled question'}
                        </p>
                      </div>
                      <div className="flex items-center space-x-1 ml-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            moveQuestion(index, index - 1);
                          }}
                          disabled={index === 0}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                        >
                          <Move className="h-3 w-3 rotate-180" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            moveQuestion(index, index + 1);
                          }}
                          disabled={index === quiz.questions.length - 1}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                        >
                          <Move className="h-3 w-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            duplicateQuestion(index);
                          }}
                          className="p-1 text-gray-400 hover:text-blue-600"
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteQuestion(index);
                          }}
                          className="p-1 text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Question Editor */}
          <div className="lg:col-span-2">
            {currentQuestion ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Question {activeQuestionIndex + 1}
                    </h2>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">Points:</span>
                      <input
                        type="number"
                        min="1"
                        value={currentQuestion.points}
                        onChange={(e) => handleQuestionChange(activeQuestionIndex, 'points', parseInt(e.target.value) || 1)}
                        className="w-16 px-2 py-1 border border-gray-300 rounded text-center text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Question Type
                      </label>
                      <select
                        value={currentQuestion.type}
                        onChange={(e) => handleQuestionChange(activeQuestionIndex, 'type', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {questionTypes.map(type => (
                          <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Question *
                      </label>
                      <textarea
                        value={currentQuestion.question}
                        onChange={(e) => handleQuestionChange(activeQuestionIndex, 'question', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your question here..."
                      />
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  {/* Multiple Choice Options */}
                  {currentQuestion.type === 'multiple_choice' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-700">
                          Answer Options
                        </label>
                        <button
                          onClick={() => addOption(activeQuestionIndex)}
                          className="flex items-center space-x-1 px-2 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        >
                          <Plus className="h-3 w-3" />
                          <span>Add Option</span>
                        </button>
                      </div>
                      
                      {currentQuestion.options?.map((option, optionIndex) => (
                        <div key={optionIndex} className="flex items-center space-x-3">
                          <input
                            type="radio"
                            name={`correct-${activeQuestionIndex}`}
                            checked={currentQuestion.correctAnswer === optionIndex}
                            onChange={() => handleQuestionChange(activeQuestionIndex, 'correctAnswer', optionIndex)}
                            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                          />
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => handleOptionChange(activeQuestionIndex, optionIndex, e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder={`Option ${optionIndex + 1}`}
                          />
                          {currentQuestion.options.length > 2 && (
                            <button
                              onClick={() => removeOption(activeQuestionIndex, optionIndex)}
                              className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      ))}
                      <p className="text-xs text-gray-500">
                        Select the radio button next to the correct answer
                      </p>
                    </div>
                  )}

                  {/* True/False Options */}
                  {currentQuestion.type === 'true_false' && (
                    <div className="space-y-4">
                      <label className="text-sm font-medium text-gray-700">
                        Correct Answer
                      </label>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-3">
                          <input
                            type="radio"
                            name={`tf-correct-${activeQuestionIndex}`}
                            checked={currentQuestion.correctAnswer === true}
                            onChange={() => handleQuestionChange(activeQuestionIndex, 'correctAnswer', true)}
                            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                          />
                          <span className="text-sm text-gray-700">True</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <input
                            type="radio"
                            name={`tf-correct-${activeQuestionIndex}`}
                            checked={currentQuestion.correctAnswer === false}
                            onChange={() => handleQuestionChange(activeQuestionIndex, 'correctAnswer', false)}
                            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                          />
                          <span className="text-sm text-gray-700">False</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Short Answer */}
                  {currentQuestion.type === 'short_answer' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Correct Answer
                        </label>
                        <input
                          type="text"
                          value={currentQuestion.correctAnswer || ''}
                          onChange={(e) => handleQuestionChange(activeQuestionIndex, 'correctAnswer', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter the correct answer"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Answer matching is case-insensitive
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Explanation */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Explanation (Optional)
                      </label>
                      <textarea
                        value={currentQuestion.explanation || ''}
                        onChange={(e) => handleQuestionChange(activeQuestionIndex, 'explanation', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Provide an explanation for the correct answer..."
                      />
                    </div>
                  </div>
                </div>

                {/* Question Preview */}
                {showPreview && (
                  <div className="border-t border-gray-200 bg-gray-50 p-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Preview</h3>
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-gray-500">
                          Question {activeQuestionIndex + 1} of {quiz.questions.length}
                        </span>
                        <span className="text-sm text-gray-500">
                          {currentQuestion.points} {currentQuestion.points === 1 ? 'point' : 'points'}
                        </span>
                      </div>
                      
                      <h4 className="text-lg font-medium text-gray-900 mb-4">
                        {currentQuestion.question || 'Question text will appear here...'}
                      </h4>

                      {currentQuestion.type === 'multiple_choice' && (
                        <div className="space-y-2">
                          {currentQuestion.options?.map((option, index) => (
                            <div key={index} className="flex items-center space-x-3">
                              <input
                                type="radio"
                                name="preview-options"
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                disabled
                              />
                              <span className="text-gray-700">
                                {option || `Option ${index + 1}`}
                              </span>
                              {currentQuestion.correctAnswer === index && (
                                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                  Correct
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {currentQuestion.type === 'true_false' && (
                        <div className="space-y-2">
                          <div className="flex items-center space-x-3">
                            <input type="radio" className="h-4 w-4 text-blue-600" disabled />
                            <span className="text-gray-700">True</span>
                            {currentQuestion.correctAnswer === true && (
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                Correct
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-3">
                            <input type="radio" className="h-4 w-4 text-blue-600" disabled />
                            <span className="text-gray-700">False</span>
                            {currentQuestion.correctAnswer === false && (
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                Correct
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {currentQuestion.type === 'short_answer' && (
                        <div>
                          <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            placeholder="Type your answer here..."
                            disabled
                          />
                          {currentQuestion.correctAnswer && (
                            <p className="text-xs text-gray-500 mt-1">
                              Correct answer: {currentQuestion.correctAnswer}
                            </p>
                          )}
                        </div>
                      )}

                      {currentQuestion.explanation && (
                        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm text-blue-800">
                            <strong>Explanation:</strong> {currentQuestion.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <div className="text-gray-400 mb-4">
                  <Plus className="h-12 w-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Questions Yet</h3>
                <p className="text-gray-500 mb-4">
                  Start building your quiz by adding your first question.
                </p>
                <button
                  onClick={addQuestion}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add First Question
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="mt-8 flex items-center justify-between p-6 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm text-gray-600">
            {quiz.questions.length} question{quiz.questions.length !== 1 ? 's' : ''} • 
            Total points: {quiz.questions.reduce((sum, q) => sum + (q.points || 0), 0)}
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/my-quizzes')}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || quiz.questions.length === 0}
              className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              <span>{saving ? 'Saving...' : 'Save Quiz'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditQuiz;