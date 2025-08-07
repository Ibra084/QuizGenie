import { Search, Star, Clock, LogOut, BookOpen, Filter, ChevronDown, Loader2, AlertCircle, User, Trophy, Calendar, Edit, Trash2, Eye, BarChart3, Plus, Users, X, Play } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const MyQuizzes = () => {
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };
  const [selectedTags, setSelectedTags] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('created');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [showQuizDetails, setShowQuizDetails] = useState(false);
  const [userData, setUserData] = useState({
    user: {
      username: '',
      email: '',
      created_at: '',
      total_score: 0,
      badge: 'Member'
    },
    stats: {
      quizzesCreated: 0,
      quizzesTaken: 0,
      totalPlays: 0,
      averageScore: 0
    },
    rank: 0,
    createdQuizzes: [],
    takenQuizzes: []
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [sortBy, setSortBy] = useState('newest');
  const [isCreatingQuiz, setIsCreatingQuiz] = useState(false);
  const navigate = useNavigate();

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const categories = ['All', 'Science', 'History', 'Math', 'Literature', 'Geography', 'Art', 'Technology', 'Entertainment'];
  const difficulties = ['All', 'Easy', 'Medium', 'Hard'];
  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'plays', label: 'Most Popular' },
    { value: 'score', label: 'Highest Score' }
  ];

  const itemsPerPage = 6;

  // Fetch all user data from a single endpoint
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await axios.get('/get-user-data', { 
          headers: { 'Authorization': `Bearer ${token}` } 
        });

        // Transform the data to match our frontend expectations
        const createdQuizzes = response.data.user.createdQuizzes?.map(quiz => ({
          ...quiz,
          questionCount: quiz.questions ? quiz.questions.length : 0,
          createdAt: quiz.created_at || quiz.createdAt,
          participants: quiz.attempts ? quiz.attempts.map(attempt => ({
            username: attempt.user?.username || 'Anonymous',
            score: attempt.score,
            completedAt: attempt.completed_at,
            timeSpent: attempt.time_spent
          })) : []
        })) || [];

        const takenQuizzes = response.data.user.takenQuizzes?.map(attempt => ({
          // quiz_id represents the actual quiz identifier, used for navigation
          id: attempt.quiz_id,
          title: attempt.quiz?.title || 'Deleted Quiz',
          creator: attempt.quiz?.user?.username || 'System',
          // The API returns quiz details at the top level (title, creator, etc.)
          // so we access them directly rather than through a nested quiz object
          title: attempt.title || 'Deleted Quiz',
          creator: attempt.creator || 'System',
          score: attempt.score,
          completedAt: attempt.completed_at,
          timeSpent: attempt.time_spent,
          rating: attempt.quiz?.rating || 0,
          category: attempt.quiz?.category,
          difficulty: attempt.quiz?.difficulty,
          rating: attempt.rating || 0,
          category: attempt.category,
          difficulty: attempt.difficulty,
          questions: attempt.questions
        })) || [];
        

        setUserData({
          user: {
            ...response.data.user,
            joinDate: response.data.user.created_at
          },
          stats: response.data.user.stats || {
            quizzesCreated: createdQuizzes.length,
            quizzesTaken: takenQuizzes.length,
            totalPlays: response.data.user.stats?.totalPlays || 0,
            averageScore: response.data.user.stats?.averageScore || 0
          },
          rank: response.data.user.rank || 0,
          createdQuizzes,
          takenQuizzes
        });

      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        } else {
          setError(err.response?.data?.error || 'Failed to load user data');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [searchQuery, activeFilter, categoryFilter, difficultyFilter, navigate]);

  const handleCreateQuiz = () => {
    setIsCreatingQuiz(true);
    navigate('/create-quiz');
  };

  const handleEditQuiz = (quizId) => {
    navigate(`/edit-quiz/${quizId}`);
  };

  const handleTakeQuiz = (quizId) => {
    navigate(`/quiz/${quizId}`);
  };

  const handleDeleteQuiz = async (quizId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/quizzes/${quizId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setUserData(prev => ({
        ...prev,
        createdQuizzes: prev.createdQuizzes.filter(quiz => quiz.id !== quizId)
      }));
      setShowDeleteConfirm(null);
      setShowQuizDetails(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete quiz');
    }
  };

  const handleQuizClick = (quiz) => {
    if (activeFilter === 'created') {
      setSelectedQuiz(quiz);
      setShowQuizDetails(true);
    } else {
      navigate(`/quiz/${quiz.id}`);
    }
  };

  // Fixed filtering logic - replace the filteredQuizzes calculation in your component

const currentQuizzes = activeFilter === 'created' ? userData.createdQuizzes : userData.takenQuizzes;

const filteredQuizzes = currentQuizzes
  .filter(quiz => {
    // For created quizzes
    if (activeFilter === 'created') {
      return (
        quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (quiz.description && quiz.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    // For taken quizzes
    else {
      return (
        (quiz.title && quiz.title.toLowerCase().includes(searchQuery.toLowerCase())) || 
        (quiz.creator && quiz.creator.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
  })
  .filter(quiz => {
    if (categoryFilter !== 'all') {
      return quiz.category?.toLowerCase() === categoryFilter.toLowerCase();
    }
    return true;
  })
  .filter(quiz => {
    if (difficultyFilter !== 'all') {
      return quiz.difficulty?.toLowerCase() === difficultyFilter.toLowerCase();
    }
    return true;
  })
  .sort((a, b) => {
    const dateA = activeFilter === 'created' ? 
      new Date(a.createdAt || a.created_at) : 
      new Date(a.completedAt || a.completed_at);
    const dateB = activeFilter === 'created' ? 
      new Date(b.createdAt || b.created_at) : 
      new Date(b.completedAt || b.completed_at);
    
    switch (sortBy) {
      case 'newest': return dateB - dateA;
      case 'oldest': return dateA - dateB;
      case 'rating': return (b.rating || 0) - (a.rating || 0);
      case 'plays': return (b.plays || 0) - (a.plays || 0);
      case 'score': return (b.score || 0) - (a.score || 0);
      default: return 0;
    }
  });

  
  const totalPages = Math.ceil(filteredQuizzes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPageQuizzes = filteredQuizzes.slice(startIndex, endIndex);

  console.log(currentPageQuizzes)
  

  const resetFilters = () => {
    setSearchQuery('');
    setCategoryFilter('all');
    setDifficultyFilter('all');
    setSortBy('newest');
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-red-500" />
          <h2 className="mt-4 text-lg font-medium text-gray-900">Error loading quizzes</h2>
          <p className="mt-2 text-gray-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Hero Section with Profile */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto relative">
          
          {/* ✅ Logout Button - Top Left */}
          <div className="absolute top-4 left-4">
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>

        <div className="flex flex-col items-center mb-8">
            <div className="flex items-center space-x-4">
              
              <h1 className="text-4xl font-bold mb-2">{userData.user.username || 'Loading...'}</h1>
            </div>

            <p className="text-xl mb-2">{userData.user.email || ''}</p>
            <div className="flex items-center space-x-4 text-sm opacity-90">
              <span>Joined {userData.user.joinDate ? new Date(userData.user.joinDate).toLocaleDateString() : ''}</span>
              <span>•</span>
              <span>Rank #{userData.rank || '--'}</span>
              <span>•</span>
              <span className="px-2 py-1 bg-white bg-opacity-20 rounded-full">{userData.user.badge || 'Member'}</span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <div className="text-2xl font-bold">{userData.stats.quizzesCreated || 0}</div>
              <div className="text-sm opacity-90">Quizzes Created</div>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <div className="text-2xl font-bold">{userData.stats.quizzesTaken || 0}</div>
              <div className="text-sm opacity-90">Quizzes Taken</div>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <div className="text-2xl font-bold">{userData.stats.totalPlays?.toLocaleString() || 0}</div>
              <div className="text-sm opacity-90">Total Plays</div>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <div className="text-2xl font-bold">{userData.stats.averageScore || 0}%</div>
              <div className="text-sm opacity-90">Avg Score</div>
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {/* <Search className="h-5 w-5 text-gray-400" /> */}
            </div>
            <input
              type="text"
              placeholder="Search your quizzes..."
              className="block w-full pl-10 pr-3 py-3 border border-transparent rounded-lg bg-white bg-opacity-20 placeholder-gray-200 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent text-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Sorting Tabs */}
            <div className="flex space-x-2 overflow-x-auto pb-2 md:pb-0">
              <button
                onClick={() => setActiveFilter('created')}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${activeFilter === 'created' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
              >
                My Created Quizzes ({userData.createdQuizzes?.length || 0})
              </button>
              <button
                onClick={() => setActiveFilter('taken')}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${activeFilter === 'taken' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
              >
                Quizzes Taken ({userData.takenQuizzes?.length || 0})
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              {activeFilter === 'created' && (
                <button 
                  onClick={handleCreateQuiz}
                  disabled={isCreatingQuiz}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isCreatingQuiz ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                  <span>Create Quiz</span>
                </button>
              )}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Filter className="h-4 w-4" />
                <span>Filters</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-4 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                  >
                    {categories.map((category) => (
                      <option key={category} value={category.toLowerCase()}>{category}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                  <select
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    value={difficultyFilter}
                    onChange={(e) => setDifficultyFilter(e.target.value)}
                  >
                    {difficulties.map((difficulty) => (
                      <option key={difficulty} value={difficulty.toLowerCase()}>{difficulty}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                  <select
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Results Summary */}
        {filteredQuizzes.length > 0 && (
          <div className="mb-6 text-sm text-gray-600">
            Showing {startIndex + 1}-{Math.min(endIndex, filteredQuizzes.length)} of {filteredQuizzes.length} quizzes
          </div>
        )}

        {/* Quiz Grid */}
        {currentPageQuizzes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentPageQuizzes.map((quiz) => (
              <div 
                key={quiz.id} 
                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer border border-gray-200"
                onClick={() => handleQuizClick(quiz)}
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{quiz.title}</h3>
                  <div className="flex items-center space-x-1 ml-2">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium text-gray-700">
                      {quiz.rating?.toFixed(1) || '0.0'}
                    </span>
                  </div>
                </div>

                {quiz.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{quiz.description}</p>
                )}
                
                <div className="flex items-center space-x-4 mb-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    quiz.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                    quiz.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {quiz.difficulty || 'Unknown'}
                  </span>
                  <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">
                    {quiz.category || 'General'}
                  </span>
                </div>
                
                {activeFilter === 'created' ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1 text-gray-500">
                        <Users className="h-4 w-4" />
                        <span className="text-sm">{quiz.plays || 0} plays</span>
                      </div>
                      <div className="flex items-center space-x-1 text-gray-500">
                        <BookOpen className="h-4 w-4" />
                        <span className="text-sm">
                          {quiz.questions || 0} questions
                        </span>
                      </div>

                    </div>
                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className="text-sm text-gray-500">
                        Created {new Date(quiz.createdAt || quiz.created_at).toLocaleDateString()}
                      </span>
                      <div className="flex items-center space-x-2">
                        <button 
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleQuizClick(quiz);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button 
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditQuiz(quiz.id);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowDeleteConfirm(quiz.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="text-gray-500 text-sm">
                      by <span className="font-medium text-gray-700">{quiz.creator}</span>
                    </div><div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Trophy className="h-4 w-4 text-green-600" />
                        <span className="font-medium">{quiz.score}%</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <BookOpen className="h-4 w-4" />
                        <span className="text-sm">
                          {quiz.questions || 0} questions
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{quiz.completedAt ? new Date(quiz.completedAt).toLocaleDateString() : '--'}</span>
                      </div>
                      {/* <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{quiz.timeSpent || '--:--'}</span>
                      </div> */}
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); navigate(`/quiz/${quiz.id}`); }}
                      className="w-full mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
                    >
                      View Quiz
                    </button>
                  </div>

                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">
              {activeFilter === 'created' ? 'No created quizzes found' : 'No quiz history found'}
            </h3>
            <p className="mt-1 text-gray-500">
              {searchQuery || categoryFilter !== 'all' || difficultyFilter !== 'all' ? 
                'Try adjusting your search or filters' : 
                activeFilter === 'created' ? 
                  'Create your first quiz to get started' : 
                  'Take some quizzes to see your history here'
              }
            </p>
            {(searchQuery || categoryFilter !== 'all' || difficultyFilter !== 'all') && (
              <button 
                onClick={resetFilters}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Clear Filters
              </button>
            )}
            {activeFilter === 'created' && !searchQuery && categoryFilter === 'all' && difficultyFilter === 'all' && (
              <button 
                onClick={handleCreateQuiz}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Create Your First Quiz
              </button>
            )}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <nav className="flex items-center space-x-2">
              <button 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              
              {[...Array(totalPages)].map((_, index) => {
                const page = index + 1;
                const isVisible = page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1;
                
                if (!isVisible) {
                  if (page === 2 && currentPage > 4) {
                    return <span key={page} className="px-2 text-gray-500">...</span>;
                  }
                  if (page === totalPages - 1 && currentPage < totalPages - 3) {
                    return <span key={page} className="px-2 text-gray-500">...</span>;
                  }
                  return null;
                }
                
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-1 rounded-md transition-colors ${
                      currentPage === page
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              
              <button 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </nav>
          </div>
        )}
      </div>

      {/* Quiz Details Modal */}
      {showQuizDetails && selectedQuiz && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">{selectedQuiz.title}</h2>
                <button 
                  onClick={() => setShowQuizDetails(false)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <p className="text-gray-600 mt-2">{selectedQuiz.description}</p>
              <div className="flex items-center space-x-4 mt-4">
                <span className={`px-3 py-1 text-sm rounded-full ${
                  selectedQuiz.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                  selectedQuiz.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {selectedQuiz.difficulty}
                </span>
                <span className="px-3 py-1 text-sm rounded-full bg-gray-100 text-gray-600">
                  {selectedQuiz.category}
                </span>
                <span className="text-sm text-gray-500">
                  Created {new Date(selectedQuiz.createdAt || selectedQuiz.created_at).toLocaleDateString()}
                </span>
              </div>
              {/* <pre>{JSON.stringify(selectedQuiz, null, 2)}</pre> */}
              

            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{selectedQuiz.plays || 0}</div>
                  <div className="text-sm text-gray-600">Total Plays</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {selectedQuiz.questions || 0}
                  </div>
                  <div className="text-sm text-gray-600">Questions</div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-600">{selectedQuiz.rating?.toFixed(1) || '0.0'}</div>
                  <div className="text-sm text-gray-600">Rating</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {selectedQuiz.averageScore ? Math.round(selectedQuiz.averageScore) : '--'}%
                  </div>
                  <div className="text-sm text-gray-600">Avg Score</div>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Recent Participants</h3>
                <button 
                  onClick={() => navigate(`/quiz-analytics/${selectedQuiz.id}`)}
                  className="flex items-center space-x-2 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                >
                  <BarChart3 className="h-4 w-4" />
                  <span>View Analytics</span>
                </button>
              </div>
              
              {selectedQuiz.recent_attempts && selectedQuiz.recent_attempts.length > 0 && (
              <div className="mt-8">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Recent Plays</h4>
                <div className="space-y-3">
                  {selectedQuiz.recent_attempts.map((attempt, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-200"
                    >
                      <span className="font-medium text-gray-700 truncate">
                        {attempt.username || 'Anonymous'}
                      </span>
                      <span className={`font-semibold ${
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

              <div className="mt-6 flex items-center justify-between pt-4 border-t">
                <div className="flex items-center space-x-4">
                  <button 
                    onClick={() => handleTakeQuiz(selectedQuiz.id)}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Play className="h-4 w-4" />
                    <span>Take Quiz</span>
                  </button>
                  <button 
                    onClick={() => handleEditQuiz(selectedQuiz.id)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                    <span>Edit Quiz</span>
                  </button>
                  <button 
                    onClick={() => navigate(`/quiz-analytics/${selectedQuiz.id}`)}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <BarChart3 className="h-4 w-4" />
                    <span>Analytics</span>
                  </button>
                </div>
                <button 
                  onClick={() => setShowDeleteConfirm(selectedQuiz.id)}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete Quiz</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 text-center mb-2">Delete Quiz</h3>
            <p className="text-sm text-gray-500 text-center mb-6">
              Are you sure you want to delete this quiz? This action cannot be undone and all participant data will be lost.
            </p>
            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteQuiz(showDeleteConfirm)}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
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

export default MyQuizzes;