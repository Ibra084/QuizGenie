import { ArrowRight, BookOpen } from 'lucide-react';

interface Quiz {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  questionCount: number;
  rating?: number;
}

const QuizCard = ({ quiz }: { quiz: Quiz }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 hover:shadow-md transition-all duration-200 hover:border-blue-200 w-full">
      <div className="p-5">
        <div className="flex flex-col h-full">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
              {quiz.title}
            </h3>
            <p className="text-gray-600 text-sm mb-4 line-clamp-3">
              {quiz.description}
            </p>
          </div>
          
          <div className="flex items-center justify-between mt-auto">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
              quiz.difficulty === 'Easy' 
                ? 'bg-green-100 text-green-800' 
                : quiz.difficulty === 'Medium' 
                  ? 'bg-yellow-100 text-yellow-800' 
                  : 'bg-red-100 text-red-800'
            }`}>
              {quiz.difficulty}
            </span>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center text-sm text-gray-500">
                <BookOpen className="h-4 w-4 mr-1" />
                <span>{quiz.questionCount}</span>
              </div>
              
              <a 
                href={`/quiz/${quiz.id}`}
                className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors group"
              >
                Start
                <ArrowRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizCard;