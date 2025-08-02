import { useState } from 'react';
import { BookOpen, Zap, AlertCircle, Loader2, FileText, HelpCircle } from 'lucide-react';

const GenerateQuiz = ({ onQuizGenerated, isLoading, setIsLoading }) => {
  const [text, setText] = useState('');
  const [quizType, setQuizType] = useState('mcq');
  const [numQuestions, setNumQuestions] = useState(5);
  const [error, setError] = useState('');

  const generateQuiz = async () => {
    if (!text.trim()) {
      setError('Please enter some text to generate a quiz');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      // Simulating API call since axios isn't available
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock response
      const mockQuizId = 'quiz_' + Date.now();
      onQuizGenerated(mockQuizId);
    } catch (err) {
      setError('Failed to generate quiz. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const wordCount = text.trim().split(/\s+/).filter(word => word.length > 0).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Create New Quiz</h1>
          <p className="text-gray-600">
            Transform your notes into an interactive quiz. Paste your content and customize the settings.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-gray-200 h-full">
              {/* Text Input Section */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center space-x-2 mb-4">
                  <FileText className="w-5 h-5 text-gray-500" />
                  <label htmlFor="quiz-text" className="text-lg font-semibold text-gray-900">
                    Your Content
                  </label>
                  {wordCount > 0 && (
                    <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                      {wordCount} words
                    </span>
                  )}
                </div>
                
                <textarea
                  id="quiz-text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Paste your notes, study material, or any text content here. For example: 'Photosynthesis is the process by which green plants make food using sunlight, carbon dioxide, and water...'"
                  className="w-full h-80 p-4 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                  disabled={isLoading}
                />
                
                <div className="flex items-center justify-between mt-4 text-sm">
                  <span className="text-gray-500">Minimum 50 words recommended for better questions</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    wordCount < 50 
                      ? 'text-orange-700 bg-orange-100' 
                      : 'text-green-700 bg-green-100'
                  }`}>
                    {wordCount < 50 ? 'Need more content' : 'Ready to generate!'}
                  </span>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-50 border-l-4 border-red-400">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                </div>
              )}

              {/* Generate Button */}
              <div className="p-6">
                <button 
                  onClick={generateQuiz} 
                  disabled={isLoading || !text.trim() || wordCount < 10}
                  className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-[1.01] disabled:transform-none shadow-sm hover:shadow-md"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Generating Quiz...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5" />
                      <span>Generate Quiz</span>
                    </>
                  )}
                </button>
                
                {!isLoading && (
                  <p className="text-center text-sm text-gray-500 mt-3">
                    This usually takes 10-30 seconds depending on content length
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quiz Settings Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <HelpCircle className="w-5 h-5 mr-2 text-gray-500" />
                Quiz Settings
              </h3>
              
              <div className="space-y-6">
                {/* Quiz Type */}
                <div>
                  <label htmlFor="quiz-type" className="block text-sm font-medium text-gray-700 mb-2">
                    Question Type
                  </label>
                  <select 
                    id="quiz-type"
                    value={quizType} 
                    onChange={(e) => setQuizType(e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white text-gray-900"
                    disabled={isLoading}
                  >
                    <option value="mcq">Multiple Choice Questions</option>
                    <option value="short_answer">Short Answer Questions</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-2">
                    {quizType === 'mcq' ? 'Questions with 4 answer choices' : 'Open-ended questions requiring written answers'}
                  </p>
                </div>
                
                {/* Number of Questions */}
                <div>
                  <label htmlFor="num-questions" className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Questions
                  </label>
                  <input 
                    id="num-questions"
                    type="number" 
                    min="1" 
                    max="15" 
                    value={numQuestions}
                    onChange={(e) => setNumQuestions(parseInt(e.target.value) || 1)}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900"
                    disabled={isLoading}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Recommended: 5-10 questions for optimal learning
                  </p>
                </div>
              </div>
            </div>

            {/* Tips Section */}
            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
                <BookOpen className="w-4 h-4 mr-2" />
                Tips for Better Quizzes
              </h4>
              <ul className="text-sm text-blue-800 space-y-2">
                <li>• Use well-structured content with clear concepts</li>
                <li>• Include specific facts, dates, and key terms</li>
                <li>• Longer content generates more diverse questions</li>
                <li>• Review generated questions before sharing</li>
              </ul>
            </div>

            {/* Quick Stats */}
            <div className="bg-gray-100 rounded-lg p-6">
              <h4 className="font-semibold text-gray-800 mb-3">Quick Stats</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Content length:</span>
                  <span className="font-medium">{wordCount} words</span>
                </div>
                <div className="flex justify-between">
                  <span>Questions to generate:</span>
                  <span className="font-medium">{numQuestions}</span>
                </div>
                <div className="flex justify-between">
                  <span>Question type:</span>
                  <span className="font-medium">{quizType === 'mcq' ? 'Multiple Choice' : 'Short Answer'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenerateQuiz;