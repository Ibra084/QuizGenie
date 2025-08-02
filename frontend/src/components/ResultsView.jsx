const ResultsView = ({ evaluation }) => {
  if (!evaluation || !evaluation.evaluation) {
    return (
      <div className="text-center p-8">
        <div className="text-red-500 mb-4">Error: No evaluation data available</div>
      </div>
    );
  }

  const {
    evaluation: questions,
    score,
    correct_count,
    total_questions,
    quiz_type
  } = evaluation;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Quiz Results</h2>
        <div 
          className={`text-4xl font-bold mb-2 ${
            score >= 70 ? 'text-green-600' : 
            score >= 50 ? 'text-yellow-500' : 'text-red-500'
          }`}
        >
          {score.toFixed(1)}%
        </div>
        <p className="text-gray-600">
          You answered {correct_count} out of {total_questions} questions correctly
        </p>
      </div>
      
      <div className="space-y-4">
        {questions.map((question, index) => (
          <div 
            key={index} 
            className={`p-4 rounded-lg border ${
              question.is_correct 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {index + 1}. {question.question}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Your Answer</h4>
                <p className={question.is_correct ? 'text-green-700' : 'text-red-700'}>
                  {question.user_answer || 'No answer provided'}
                </p>
                {!question.is_correct && quiz_type === 'short_answer' && (
                  <p className="text-xs text-gray-500 mt-1">
                    (Partial matches accepted for short answers)
                  </p>
                )}
              </div>
              
              {!question.is_correct && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Correct Answer</h4>
                  <p className="text-gray-900">{question.correct_answer}</p>
                </div>
              )}
            </div>
            
            {question.explanation && (
              <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                <h4 className="text-sm font-medium text-blue-700 mb-1">Explanation</h4>
                <p className="text-blue-800">{question.explanation}</p>
              </div>
            )}
            
            <div className={`mt-3 text-sm font-medium ${
              question.is_correct ? 'text-green-600' : 'text-red-600'
            }`}>
              {question.is_correct ? '✓ Correct' : '✗ Incorrect'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResultsView;