import { Search, Star, Clock, BookOpen, Filter, ChevronDown, Loader2, AlertCircle, Users, Trophy, TrendingUp, Award } from 'lucide-react';
import { useState, useEffect } from 'react';

const QuizNetwork = () => {
  const [selectedTags, setSelectedTags] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('leaderboard');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [networkData, setNetworkData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const categories = ['All', 'Daily', 'Weekly', 'Monthly', 'All Time'];
  const timeFilters = ['All', 'Today', 'This Week', 'This Month', 'All Time'];

  // Fetch network data from backend
  useEffect(() => {
    const fetchNetworkData = async () => {
      try {
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data based on active filter
        if (activeFilter === 'leaderboard') {
          setNetworkData([
            { id: 1, username: 'QuizMaster', avatar: '🏆', score: 15420, quizzesCompleted: 234, rank: 1, badge: 'Legend', joinDate: '2023-01-15' },
            { id: 2, username: 'BrainiacBob', avatar: '🧠', score: 12890, quizzesCompleted: 189, rank: 2, badge: 'Expert', joinDate: '2023-03-22' },
            { id: 3, username: 'TriviaQueen', avatar: '👑', score: 11750, quizzesCompleted: 167, rank: 3, badge: 'Expert', joinDate: '2023-02-10' },
            { id: 4, username: 'KnowledgeSeeker', avatar: '📚', score: 10200, quizzesCompleted: 145, rank: 4, badge: 'Advanced', joinDate: '2023-04-05' },
            { id: 5, username: 'QuizNinja', avatar: '🥷', score: 9850, quizzesCompleted: 134, rank: 5, badge: 'Advanced', joinDate: '2023-05-18' },
          ]);
        } else if (activeFilter === 'activity') {
          setNetworkData([
            { id: 1, user: 'Alice Cooper', action: 'completed', quiz: 'World History Quiz', score: 95, timeAgo: '2 mins ago', avatar: '👩' },
            { id: 2, user: 'Bob Smith', action: 'created', quiz: 'JavaScript Fundamentals', timeAgo: '15 mins ago', avatar: '👨' },
            { id: 3, user: 'Carol Johnson', action: 'completed', quiz: 'Geography Challenge', score: 87, timeAgo: '23 mins ago', avatar: '👩' },
            { id: 4, user: 'David Lee', action: 'completed', quiz: 'Science Trivia', score: 92, timeAgo: '1 hour ago', avatar: '👨' },
            { id: 5, user: 'Emma Wilson', action: 'created', quiz: 'Art History Quiz', timeAgo: '2 hours ago', avatar: '👩' },
          ]);
        } else {
          setNetworkData([
            { id: 1, title: 'Ultimate Geography Challenge', creator: 'GeoMaster', plays: 1250, rating: 4.8, difficulty: 'Hard', category: 'Geography', trending: true },
            { id: 2, title: 'JavaScript Quiz Pro', creator: 'CodeWizard', plays: 980, rating: 4.7, difficulty: 'Medium', category: 'Technology', trending: true },
            { id: 3, title: 'World War II History', creator: 'HistoryBuff', plays: 875, rating: 4.9, difficulty: 'Medium', category: 'History', trending: true },
            { id: 4, title: 'Mathematics Mastery', creator: 'MathGuru', plays: 720, rating: 4.6, difficulty: 'Hard', category: 'Math', trending: true },
            { id: 5, title: 'Movie Trivia Night', creator: 'FilmFan', plays: 650, rating: 4.5, difficulty: 'Easy', category: 'Entertainment', trending: true },
          ]);
        }
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load network data');
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchNetworkData();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, activeFilter, categoryFilter, timeFilter]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 text-blue-600 animate-spin" />
          <p className="mt-2 text-gray-600">Loading network data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-8 w-8 text-red-600" />
          <p className="mt-2 text-gray-600">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const filteredData = networkData.filter(item => {
    const searchText = activeFilter === 'leaderboard' ? item.username : 
                      activeFilter === 'activity' ? `${item.user} ${item.quiz}` : 
                      `${item.title} ${item.creator}`;
    
    const matchesSearch = searchText.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">Quiz Network</h1>
          <p className="text-xl mb-8">Connect with fellow quiz enthusiasts and compete on global leaderboards</p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {/* <Search className="h-5 w-5 text-gray-400" /> */}
            </div>
            <input
              type="text"
              placeholder="Search users, quizzes, or activities..."
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
                onClick={() => setActiveFilter('leaderboard')}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${activeFilter === 'leaderboard' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
              >
                Leaderboard
              </button>
              <button
                onClick={() => setActiveFilter('activity')}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${activeFilter === 'activity' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
              >
                Recent Activity
              </button>
              <button
                onClick={() => setActiveFilter('trending')}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${activeFilter === 'trending' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
              >
                Trending Quizzes
              </button>
            </div>

            {/* Advanced Filters Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              <Filter className="h-4 w-4" />
              <span>Filters</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-4 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time Period</label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Filter By</label>
                  <select
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    value={timeFilter}
                    onChange={(e) => setTimeFilter(e.target.value)}
                  >
                    {timeFilters.map((filter) => (
                      <option key={filter} value={filter.toLowerCase()}>{filter}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Content Grid */}
        {filteredData.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredData.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                {activeFilter === 'leaderboard' && (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">{item.avatar}</div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-gray-900">#{item.rank}</span>
                            <span className="font-semibold text-gray-900">{item.username}</span>
                          </div>
                          <div className="text-sm text-gray-500">{item.quizzesCompleted} quizzes</div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        item.badge === 'Legend' ? 'bg-purple-100 text-purple-800' :
                        item.badge === 'Expert' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {item.badge}
                      </span>
                      <div className="text-right">
                        <div className="text-lg font-bold text-blue-600">{item.score.toLocaleString()}</div>
                        <div className="text-sm text-gray-500">points</div>
                      </div>
                    </div>
                  </>
                )}

                {activeFilter === 'activity' && (
                  <>
                    <div className="flex items-start space-x-3 mb-4">
                      <div className="text-xl">{item.avatar}</div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 flex-wrap">
                          <span className="font-medium text-gray-900">{item.user}</span>
                          <span className="text-gray-500">{item.action}</span>
                          <span className="font-medium text-blue-600">{item.quiz}</span>
                        </div>
                        {item.score && (
                          <div className="mt-1 text-sm text-green-600 font-medium">
                            Score: {item.score}%
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">{item.timeAgo}</div>
                  </>
                )}

                {activeFilter === 'trending' && (
                  <>
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{item.title}</h3>
                      <div className="flex items-center space-x-1 ml-2">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium text-gray-700">{item.rating}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 mb-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        item.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                        item.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {item.difficulty}
                      </span>
                      <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">
                        {item.category}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1 text-gray-500">
                        <Users className="h-4 w-4" />
                        <span className="text-sm">{item.plays} plays</span>
                      </div>
                      <div className="text-sm text-gray-500">by {item.creator}</div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No data found</h3>
            <p className="mt-1 text-gray-500">
              {searchQuery ? 'Try adjusting your search or filters' : 'No network data available'}
            </p>
          </div>
        )}

        {/* Pagination */}
        {filteredData.length > 0 && (
          <div className="mt-8 flex justify-center">
            <nav className="flex items-center space-x-4">
              <button className="px-3 py-1 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200">
                Previous
              </button>
              <button className="px-3 py-1 rounded-md bg-blue-600 text-white">
                1
              </button>
              <button className="px-3 py-1 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200">
                2
              </button>
              <button className="px-3 py-1 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200">
                3
              </button>
              <button className="px-3 py-1 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200">
                Next
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizNetwork;