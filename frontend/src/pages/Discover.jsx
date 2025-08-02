import { Search, Star, Clock, BookOpen, Filter, ChevronDown, Loader2, AlertCircle } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import QuizCard from '../components/QuizCard'; // You'll need to create this component
import axios from 'axios';

const DiscoverQuizzes = () => {
  const [selectedTags, setSelectedTags] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('trending');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Add ref for search input
  const searchInputRef = useRef(null);
  const debounceTimerRef = useRef(null);

  const categories = ['All', 'Science', 'History', 'Math', 'Literature', 'Geography', 'Art', 'Technology'];
  const difficulties = ['All', 'Easy', 'Medium', 'Hard'];

  // Memoize the fetch function to prevent unnecessary re-renders
  const fetchQuizzes = useCallback(async (search, category, difficulty, sort, signal) => {
    try {
      const response = await axios.get('http://localhost:5000/api/quizzes', {
        params: {
          search: search,
          category: category === 'all' ? '' : category,
          difficulty: difficulty === 'all' ? '' : difficulty,
          sort: sort
        },
        signal: signal
      });
      return response.data;
    } catch (err) {
      if (!axios.isCancel(err)) {
        throw err;
      }
      return null;
    }
  }, []);

  // Separate useEffect for API calls with proper debouncing
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set loading only for the first load or when filters change (not during search typing)
    if (quizzes.length === 0) {
      setLoading(true);
    }

    debounceTimerRef.current = setTimeout(async () => {
      try {
        const data = await fetchQuizzes(searchQuery, categoryFilter, difficultyFilter, activeFilter, controller.signal);
        if (isMounted && data) {
          setQuizzes(data);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.error || 'Failed to load quizzes');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }, searchQuery ? 300 : 0); // Debounce only for search, immediate for filters

    return () => {
      isMounted = false;
      controller.abort();
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchQuery, activeFilter, categoryFilter, difficultyFilter, fetchQuizzes]);

  // Handle search input change without causing re-renders
  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
  }, []);

  // Handle search input key events
  const handleSearchKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // Force immediate search
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      // Trigger immediate fetch here if needed
    }
  }, []);

  if (loading && quizzes.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 text-blue-600 animate-spin" />
          <p className="mt-2 text-gray-600">Loading quizzes...</p>
        </div>
      </div>
    );
  }

  if (error && quizzes.length === 0) {
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

  // Client-side filtering as backup (in case you want to filter the already loaded results)
  const filteredQuizzes = quizzes.filter(quiz => {
    // Search filter
    const matchesSearch = quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         quiz.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Category filter
    const matchesCategory = categoryFilter === 'all' || quiz.category === categoryFilter;
    
    // Difficulty filter
    const matchesDifficulty = difficultyFilter === 'all' || quiz.difficulty === difficultyFilter;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  // Sort based on active filter
  const sortedQuizzes = [...filteredQuizzes].sort((a, b) => {
    if (activeFilter === 'trending') return b.plays - a.plays;
    if (activeFilter === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
    if (activeFilter === 'top-rated') return b.rating - a.rating;
    return 0;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">Discover Quizzes</h1>
          <p className="text-xl mb-8">Browse thousands of user-created quizzes on any topic imaginable</p>
          
          <div className="max-w-2xl mx-auto relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {/* <Search className="h-5 w-5 text-gray-400" /> */}
            </div>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search for quizzes..."
              className="block w-full pl-10 pr-3 py-3 border border-transparent rounded-lg bg-white bg-opacity-20 placeholder-gray-200 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent text-white"
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyDown={handleSearchKeyDown}
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
                onClick={() => setActiveFilter('trending')}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${activeFilter === 'trending' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
              >
                Trending
              </button>
              <button
                onClick={() => setActiveFilter('newest')}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${activeFilter === 'newest' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
              >
                Newest
              </button>
              <button
                onClick={() => setActiveFilter('top-rated')}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${activeFilter === 'top-rated' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
              >
                Top Rated
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
              </div>
            </div>
          )}
        </div>
        
        {/* Loading indicator for search */}
        {loading && quizzes.length > 0 && (
          <div className="text-center py-4">
            <Loader2 className="mx-auto h-6 w-6 text-blue-600 animate-spin" />
          </div>
        )}

        {/* Quiz Grid */}
        {sortedQuizzes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedQuizzes.map((quiz) => (
              <QuizCard key={quiz.id} quiz={quiz} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No quizzes found</h3>
            <p className="mt-1 text-gray-500">
              {searchQuery ? 'Try adjusting your search or filters' : 'There are no quizzes available yet'}
            </p>
          </div>
        )}

        {/* Pagination */}
        {sortedQuizzes.length > 0 && (
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

export default DiscoverQuizzes;