import { Search, Plus, Users, BookOpen, Menu, X } from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <nav className="navigation-bar fixed top-0 w-full z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo Section */}
            <a 
              href="/discover" 
              className="flex items-center space-x-3 text-xl font-bold text-gray-900 hover:text-gray-700 transition-colors duration-200"
            >
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <span>QuizGenie</span>
            </a>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a 
                href="/discover" 
                className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium"
              >
                <Search className="w-4 h-4" />
                <span>Discover Quizzes</span>
              </a>
              
              <a 
                href="/network" 
                className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium"
              >
                <Users className="w-4 h-4" />
                <span>Quiz Network</span>
              </a>
              
              <a 
                href="/my-quizzes" 
                className="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium"
              >
                My Quizzes
              </a>
            </div>

            {/* Create Quiz Button & Mobile Menu */}
            <div className="flex items-center space-x-4">
              <a href="/create-quiz">
                <button 
                  onClick={() => console.log('Navigate to create quiz')}
                  className="flex items-center space-x-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Create Quiz</span>
                </button>
              </a>

              {/* Mobile menu button */}
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-gray-700 hover:text-blue-600 transition-colors duration-200"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200">
              <div className="space-y-4">
                <a 
                  href="/discover" 
                  className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Search className="w-4 h-4" />
                  <span>Discover Quizzes</span>
                </a>
                
                <a 
                  href="/network" 
                  className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Users className="w-4 h-4" />
                  <span>Quiz Network</span>
                </a>
                
                <a 
                  href="/my-quizzes" 
                  className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>My Quizzes</span>
                </a>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Quick Access Hub Section */}
      <div className="hub-view bg-gray-50 border-b border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between overflow-x-auto">
            <div className="flex items-center space-x-6 text-sm whitespace-nowrap">
              <span className="text-gray-500">Popular topics:</span>
              <a href="/discover?search=science" className="text-blue-600 hover:text-blue-700 hover:underline transition-colors">Science</a>
              <a href="/discover?search=history" className="text-blue-600 hover:text-blue-700 hover:underline transition-colors">History</a>
              <a href="/discover?search=math" className="text-blue-600 hover:text-blue-700 hover:underline transition-colors">Math</a>
              <a href="/discover?search=literature" className="text-blue-600 hover:text-blue-700 hover:underline transition-colors">Literature</a>
            </div>
            <div className="hidden md:flex items-center space-x-4 text-sm text-gray-600">
              {/* <span>🔥 125 active quizzes today</span> */}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;