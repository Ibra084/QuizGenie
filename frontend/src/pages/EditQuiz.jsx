import React, { useState, useEffect } from "react";
import { 
  BookOpen, 
  Loader2, 
  AlertCircle, 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Save, 
  CheckCircle2, 
  Edit3,
  Settings,
  Eye,
  EyeOff,
  Tag,
  Users,
  Clock
} from "lucide-react";
import { BACKEND_ROUTE } from "../context/api";

export default function EditQuiz() {
  const quizId = window.location.pathname.split("/").pop(); // or use react-router!
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function fetchQuiz() {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${BACKEND_ROUTE}/api/quizzes/${quizId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          // Parse quiz_content if needed:
          let quizData = data.quiz;
          if (typeof quizData.quiz_content === "string") {
            try { quizData.quiz_content = JSON.parse(quizData.quiz_content); }
            catch { quizData.quiz_content = []; }
          }
          setQuiz(quizData);
        } else {
          setError(data.error || "Quiz not found");
        }
      } catch {
        setError("Could not load quiz.");
      }
      setLoading(false);
    }
    fetchQuiz();
  }, [quizId]);
  

  function handleQuizChange(field, value) {
    setQuiz(prev => ({ ...prev, [field]: value }));
  }

  function handleQuestionChange(index, field, value) {
    setQuiz(prev => ({
      ...prev,
      quiz_content: prev.quiz_content.map((q, i) =>
        i === index ? { ...q, [field]: value } : q
      ),
    }));
  }

  function handleOptionChange(qIdx, optIdx, value) {
    setQuiz(prev => ({
      ...prev,
      quiz_content: prev.quiz_content.map((q, i) =>
        i === qIdx
          ? {
              ...q,
              options: q.options.map((opt, oi) =>
                oi === optIdx ? value : opt
              ),
            }
          : q
      ),
    }));
  }

  function addOption(qIdx) {
    setQuiz(prev => ({
      ...prev,
      quiz_content: prev.quiz_content.map((q, i) =>
        i === qIdx ? { ...q, options: [...q.options, ""] } : q
      ),
    }));
  }

  function removeOption(qIdx, optIdx) {
    setQuiz(prev => ({
      ...prev,
      quiz_content: prev.quiz_content.map((q, i) =>
        i === qIdx
          ? { ...q, options: q.options.filter((_, oi) => oi !== optIdx) }
          : q
      ),
    }));
  }

  function addQuestion() {
    setQuiz(prev => ({
      ...prev,
      quiz_content: [
        ...prev.quiz_content,
        {
          question: "",
          options: ["", "", "", ""],
          correctAnswer: 0,
          explanation: "",
          type: "multiple_choice",
        },
      ],
    }));
  }

  function removeQuestion(qIdx) {
    setQuiz(prev => ({
      ...prev,
      quiz_content: prev.quiz_content.filter((_, i) => i !== qIdx),
    }));
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BACKEND_ROUTE}/api/quizzes/${quizId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(quiz),
      });

      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(data.error || "Could not save quiz.");
      }
    } catch {
      setError("Could not save quiz.");
    }
    setSaving(false);
  }


  const navigate = (path) => {
    console.log(`Navigating to: ${path}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="bg-white rounded-lg shadow-sm p-16">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Loading Quiz Editor</h2>
              <p className="text-gray-600 text-lg">Please wait while we prepare your quiz for editing...</p>
              <div className="mt-8 w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!quiz) {
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
                  onClick={() => navigate(-1)}
                  className="px-8 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition-colors duration-200"
                >
                  Go Back
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
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors duration-200"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back to Quiz</span>
        </button>

        {/* Header Section */}
        <div className="mb-8 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-1">
            <div className="bg-white rounded-lg p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Edit3 className="w-7 h-7 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                      Edit Quiz
                    </h1>
                    <p className="text-gray-600 mb-4 text-lg">
                      Modify your quiz content, settings, and questions
                    </p>
                    
                    <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm">
                      <div className="flex items-center gap-2 text-gray-500">
                        <BookOpen className="w-4 h-4" />
                        <span className="font-medium">{quiz.quiz_content?.length || 0} Questions</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span className="font-medium">Multiple Choice</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-500">
                        {quiz.is_public ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        <span className="font-medium">{quiz.is_public ? 'Public' : 'Private'}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-center lg:items-end">
                  <div className="text-center lg:text-right mb-3">
                    <span className="text-sm text-gray-500 block">Completion Status</span>
                    <span className="text-2xl font-bold text-gray-900">
                      {quiz.quiz_content?.filter(q => q.question.trim()).length || 0} / {quiz.quiz_content?.length || 0}
                    </span>
                  </div>
                  <div className="w-32 h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-500 ease-out"
                      style={{ 
                        width: quiz.quiz_content?.length 
                          ? `${(quiz.quiz_content.filter(q => q.question.trim()).length / quiz.quiz_content.length) * 100}%` 
                          : '0%'
                      }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 mt-1">Questions Complete</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-red-800 font-medium">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
              <p className="text-green-800 font-medium">Quiz saved successfully!</p>
            </div>
          </div>
        )}

        {/* Quiz Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8 overflow-hidden">
          <div className="border-b border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Settings className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Quiz Settings</h2>
                <p className="text-gray-600">Configure your quiz details and visibility</p>
              </div>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quiz Title
              </label>
              <input
                type="text"
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                value={quiz.title || ""}
                onChange={e => handleQuizChange("title", e.target.value)}
                placeholder="Enter your quiz title..."
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                rows={3}
                value={quiz.description || ""}
                onChange={e => handleQuizChange("description", e.target.value)}
                placeholder="Describe what this quiz is about..."
              />
            </div>

            {/* Settings Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Difficulty */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty Level
                </label>
                <select
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  value={quiz.difficulty || ""}
                  onChange={e => handleQuizChange("difficulty", e.target.value)}
                >
                  <option value="">Select difficulty</option>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Tag className="w-4 h-4 inline mr-1" />
                  Tags
                </label>
                <input
                  type="text"
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  value={quiz.tags?.join(", ") || ""}
                  onChange={e =>
                    handleQuizChange(
                      "tags",
                      e.target.value.split(",").map(t => t.trim()).filter(Boolean)
                    )
                  }
                  placeholder="math, science, history"
                />
              </div>

              {/* Visibility */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Visibility
                </label>
                <label className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors duration-200">
                  <input
                    type="checkbox"
                    checked={quiz.is_public || false}
                    onChange={e => handleQuizChange("is_public", e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-2 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <Users className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Make Public</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Questions Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Quiz Questions ({quiz.quiz_content?.length || 0})
                  </h2>
                  <p className="text-gray-600">Add and edit your quiz questions</p>
                </div>
              </div>
              <button
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
                onClick={addQuestion}
              >
                <Plus className="w-4 h-4" />
                Add Question
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {quiz.quiz_content?.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Questions Yet</h3>
                <p className="text-gray-600 mb-6">Start building your quiz by adding your first question.</p>
                <button
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200"
                  onClick={addQuestion}
                >
                  <Plus className="w-5 h-5" />
                  Add Your First Question
                </button>
              </div>
            ) : (
              quiz.quiz_content.map((q, idx) => (
                <div
                  key={idx}
                  className="bg-gray-50 border-2 border-gray-200 rounded-xl p-6 transition-all duration-200 hover:shadow-md"
                >
                  {/* Question Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-blue-600">{idx + 1}</span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Question {idx + 1}</h3>
                    </div>
                    <button
                      className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors duration-200"
                      onClick={() => removeQuestion(idx)}
                      disabled={quiz.quiz_content.length <= 1}
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="text-sm font-medium">Remove</span>
                    </button>
                  </div>

                  {/* Question Text */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Question Text
                    </label>
                    <textarea
                      className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                      rows={2}
                      value={q.question || ""}
                      onChange={e =>
                        handleQuestionChange(idx, "question", e.target.value)
                      }
                      placeholder="Enter your question..."
                    />
                  </div>

                  {/* Options */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Answer Options
                    </label>
                    <div className="space-y-3">
                      {q.options?.map((opt, oi) => {
                        const optionLetter = String.fromCharCode(65 + oi);
                        const isCorrect = q.correctAnswer === oi;
                        
                        return (
                          <div className="flex items-center gap-3" key={oi}>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                checked={isCorrect}
                                onChange={() => handleQuestionChange(idx, "correctAnswer", oi)}
                                className="w-4 h-4 text-green-600 border-2 border-gray-300 focus:ring-green-500"
                                name={`correct-${idx}`}
                              />
                              <span className="text-sm font-medium text-gray-600">Correct</span>
                            </label>
                            <div className={`flex-1 flex items-center gap-2 p-3 border-2 rounded-lg transition-all duration-200 ${
                              isCorrect ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-white'
                            }`}>
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                isCorrect ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
                              }`}>
                                {optionLetter}
                              </div>
                              <input
                                type="text"
                                className="flex-1 bg-transparent border-none outline-none"
                                value={opt || ""}
                                onChange={e => handleOptionChange(idx, oi, e.target.value)}
                                placeholder={`Option ${optionLetter}`}
                              />
                              {q.options.length > 2 && (
                                <button
                                  className="text-red-400 hover:text-red-600 p-1 rounded transition-colors duration-200"
                                  onClick={() => removeOption(idx, oi)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      <button
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors duration-200"
                        onClick={() => addOption(idx)}
                      >
                        <Plus className="w-4 h-4" />
                        <span className="text-sm font-medium">Add Option</span>
                      </button>
                    </div>
                  </div>

                  {/* Explanation */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Explanation (Optional)
                    </label>
                    <textarea
                      className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                      rows={2}
                      value={q.explanation || ""}
                      onChange={e =>
                        handleQuestionChange(idx, "explanation", e.target.value)
                      }
                      placeholder="Provide an explanation for the correct answer..."
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-8">
          <button
            className="flex items-center gap-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-8 py-4 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 disabled:transform-none"
            disabled={saving}
            onClick={handleSave}
          >
            {saving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            {saving ? "Saving..." : "Save Changes"}
          </button>
          <button
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-8 py-4 rounded-lg font-semibold transition-colors duration-200"
            onClick={() => navigate(-1)}
          >
            Cancel
          </button>
        </div>

        {/* Tips Section */}
        <div className="mt-8 bg-blue-50 rounded-xl border border-blue-200 p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-blue-600 text-lg">💡</span>
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 mb-3 text-lg">Editing Tips</h3>
              <ul className="text-blue-800 space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 text-blue-600 flex-shrink-0" />
                  <span>Write clear, concise questions that test specific knowledge</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 text-blue-600 flex-shrink-0" />
                  <span>Make sure each question has one clearly correct answer</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 text-blue-600 flex-shrink-0" />
                  <span>Add explanations to help learners understand the correct answers</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 text-blue-600 flex-shrink-0" />
                  <span>Use tags to help others discover your quiz</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}