// QuizView.js
import { useEffect } from 'react';
import { CheckCircle, Circle, Edit3, Send } from 'lucide-react';

const QuizView = ({ quizContent, quizType, answers, onAnswerChange, onSubmit }) => {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const answeredCount = Object.keys(answers).length;
  const totalQuestions = quizContent.length;
  const allAnswered = answeredCount === totalQuestions;

  return (
    <div className="space-y-8">
      {/* Progress Overview */}
      <div className="bg-gray-50 rounded-lg p-4 mb-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Quiz Questions</h2>
          <span className="text-sm text-gray-600">
            {answeredCount} of {totalQuestions} answered
          </span>
        </div>
      </div>

      {quizContent.map((question, index) => {
        const isAnswered = answers[index] !== undefined && answers[index] !== '';
        
        return (
          <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 transition-all duration-200 hover:shadow-md">
            {/* Question Header */}
            <div className="flex items-start gap-4 mb-6">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                isAnswered 
                  ? 'bg-green-100 text-green-600' 
                  : 'bg-gray-100 text-gray-400'
              }`}>
                {isAnswered ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <Circle className="w-5 h-5" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-gray-500">Question {index + 1}</span>
                  {isAnswered && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                      Answered
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 leading-relaxed">
                  {question.question}
                </h3>
              </div>
            </div>
            
            {/* Answer Section */}
            <div className="ml-12">
              {quizType === 'mcq' ? (
                <div className="space-y-3">
                  {question.options.map((option, optionIndex) => {
                    const optionLetter = String.fromCharCode(65 + optionIndex); // A, B, C, D
                    const isSelected = answers[index] === option;
                    
                    return (
                      <label
                        key={optionIndex}
                        className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50 text-blue-900'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`question-${index}`}
                          checked={isSelected}
                          onChange={() => onAnswerChange(index, option)}
                          className="sr-only"
                        />
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          isSelected
                            ? 'border-blue-500 bg-blue-500 text-white'
                            : 'border-gray-300'
                        }`}>
                          <span className="text-xs font-bold">{optionLetter}</span>
                        </div>
                        <span className="text-gray-800 leading-relaxed">{option}</span>
                      </label>
                    );
                  })}
                </div>
              ) : (
                <div className="relative">
                  <textarea
                    value={answers[index] || ''}
                    onChange={(e) => onAnswerChange(index, e.target.value)}
                    className="w-full p-4 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 resize-none"
                    rows={4}
                    placeholder="Type your answer here..."
                  />
                  <div className="absolute top-3 right-3">
                    <Edit3 className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              )}
              
              {/* Answer Preview
              {answers[index] && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">Your Answer:</span>
                  </div>
                  <p className="text-green-700 text-sm leading-relaxed">
                    {typeof answers[index] === 'string' && answers[index].length > 100 
                      ? `${answers[index].substring(0, 100)}...` 
                      : answers[index]
                    }
                  </p>
                </div>
              )} */}
            </div>
          </div>
        );
      })}
      
      {/* Submit Section */}
      <div className="bg-gray-50 rounded-xl p-6 text-center">
        <div className="max-w-md mx-auto">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to Submit?</h3>
          <p className="text-gray-600 mb-6">
            {allAnswered 
              ? "Great! You've answered all questions. Submit your quiz to see your results."
              : `Please answer ${totalQuestions - answeredCount} more question${totalQuestions - answeredCount !== 1 ? 's' : ''} before submitting.`
            }
          </p>
          
          <button
            onClick={onSubmit}
            disabled={!allAnswered}
            className={`inline-flex items-center gap-2 px-8 py-4 font-semibold rounded-lg transition-all duration-200 transform ${
              allAnswered
                ? 'bg-blue-600 hover:bg-blue-700 text-white hover:scale-105 shadow-md hover:shadow-lg' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Send className="w-5 h-5" />
            Submit Quiz
          </button>
          
          {!allAnswered && (
            <p className="text-xs text-gray-500 mt-3">
              Complete all questions to enable submission
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizView;