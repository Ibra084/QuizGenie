import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Clock, Star, TrendingUp, Calendar, Trophy, Target, Activity, Download, Filter, RefreshCw, Loader2, AlertCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Cell, Area, AreaChart, Pie } from 'recharts';
import axios from 'axios';

const QuizAnalytics = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('7d');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const res = await axios.get(`/api/quiz/${quizId}/details`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        const quizData = res.data.quiz;
        const recentAttempts = quizData.recent_attempts?.map((a, idx) => ({
          username: a.username || 'Anonymous',
          score: a.score || 0,
          timeSpent: a.time_spent || '0:00',
          completedAt: a.completed_at,
          rank: idx + 1
        })) || [];

        // Helper functions
        const parseTime = (t) => {
          if (!t) return 0;
          const parts = t.split(':').map(Number);
          if (parts.length === 3) {
            const [h, m, s] = parts; return h * 3600 + m * 60 + s;
          }
          const [m, s] = parts; return m * 60 + s;
        };
        const formatTime = (secs) => {
          const m = Math.floor(secs / 60); const s = Math.floor(secs % 60);
          return `${m}:${s.toString().padStart(2,'0')}`;
        };

        const scores = recentAttempts.map(a => a.score).sort((a,b)=>a-b);
        const medianScore = scores.length ?
          (scores.length % 2 ? scores[Math.floor(scores.length/2)] :
            (scores[scores.length/2-1] + scores[scores.length/2]) / 2) : 0;
        const passRate = recentAttempts.length ?
          (recentAttempts.filter(a => a.score >= 70).length / recentAttempts.length) * 100 : 0;
        const totalSeconds = recentAttempts.reduce((sum,a)=>sum + parseTime(a.timeSpent),0);
        const averageTime = recentAttempts.length ? totalSeconds / recentAttempts.length : 0;

        const attemptsOverTime = {};
        recentAttempts.forEach(a => {
          const date = new Date(a.completedAt).toISOString().split('T')[0];
          attemptsOverTime[date] = (attemptsOverTime[date] || 0) + 1;
        });
        const attempts = Object.entries(attemptsOverTime).map(([date,count]) => ({date,count}));

        const ranges = [
          { range:'0-20', min:0, max:20 },
          { range:'21-40', min:21, max:40 },
          { range:'41-60', min:41, max:60 },
          { range:'61-80', min:61, max:80 },
          { range:'81-100', min:81, max:100 }
        ];
        const scoreDistribution = ranges.map(r => {
          const count = recentAttempts.filter(a => a.score >= r.min && a.score <= r.max).length;
          return { range: r.range, count, percentage: recentAttempts.length ? (count/recentAttempts.length)*100 : 0 };
        });

        const byTimeOfDay = [
          { hour:'00-06', attempts:0 },
          { hour:'06-12', attempts:0 },
          { hour:'12-18', attempts:0 },
          { hour:'18-24', attempts:0 }
        ];
        const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
        const byDayOfWeek = days.map(day => ({ day, attempts:0 }));
        recentAttempts.forEach(a => {
          const dt = new Date(a.completedAt);
          const hour = dt.getHours();
          if (hour < 6) byTimeOfDay[0].attempts++;
          else if (hour < 12) byTimeOfDay[1].attempts++;
          else if (hour < 18) byTimeOfDay[2].attempts++;
          else byTimeOfDay[3].attempts++;
          byDayOfWeek[dt.getDay()].attempts++;
        });

        const analyticsResponse = {
          totalAttempts: quizData.statistics.total_attempts,
          averageScore: quizData.statistics.average_score,
          completionRate: 100,
          averageTime: formatTime(averageTime),
          totalTime: formatTime(totalSeconds),
          medianScore,
          passRate,
          attempts,
          scoreDistribution,
          recentAttempts,
          demographics: { byTimeOfDay, byDayOfWeek }
        };

        setQuiz(quizData);
        setAnalytics(analyticsResponse);
      } catch (err) {
        setError('Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [quizId, timeRange]);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => setRefreshing(false), 1000);
  };

  const downloadReport = () => {
    // Implement CSV/PDF download
    console.log('Downloading report...');
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
          <h2 className="mt-4 text-lg font-medium text-gray-900">Error loading analytics</h2>
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

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigate('/my-quizzes')}
              className="flex items-center space-x-2 text-white hover:text-blue-200 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to My Quizzes</span>
            </button>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center space-x-2 px-3 py-1.5 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="text-sm">Refresh</span>
              </button>
              <button
                onClick={downloadReport}
                className="flex items-center space-x-2 px-3 py-1.5 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
              >
                <Download className="h-4 w-4" />
                <span className="text-sm">Export</span>
              </button>
            </div>
          </div>

          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">{quiz?.title}</h1>
            <p className="text-lg opacity-90 mb-4">{quiz?.description}</p>
            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>Created {new Date(quiz?.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 text-yellow-300 fill-current" />
                <span>{quiz?.rating?.toFixed(1)} rating</span>
              </div>
              <div className="flex items-center space-x-1">
                <Target className="h-4 w-4" />
                <span>{quiz?.questions?.length} questions</span>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs ${
                quiz?.difficulty === 'Easy' ? 'bg-green-100 bg-opacity-20 text-green-200' :
                quiz?.difficulty === 'Medium' ? 'bg-yellow-100 bg-opacity-20 text-yellow-200' :
                'bg-red-100 bg-opacity-20 text-red-200'
              }`}>
                {quiz?.difficulty}
              </span>
            </div>
          </div>

          {/* Time Range Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4" />
            <span className="text-sm">Time Range:</span>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-white bg-opacity-20 border border-white border-opacity-30 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-white"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="all">All time</option>
            </select>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Attempts</p>
                <p className="text-3xl font-bold text-blue-600">{analytics?.totalAttempts}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600">+12% from last week</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Score</p>
                <p className="text-3xl font-bold text-green-600">{analytics?.averageScore}%</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Trophy className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-gray-600">Median: {analytics?.medianScore}%</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                <p className="text-3xl font-bold text-purple-600">{analytics?.completionRate}%</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Activity className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-gray-600">Pass Rate: {analytics?.passRate}%</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Time</p>
                <p className="text-3xl font-bold text-orange-600">{analytics?.averageTime}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-gray-600">Total: {analytics?.totalTime}</span>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Attempts Over Time */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quiz Attempts Over Time</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analytics?.attempts}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="count" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.1} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Score Distribution */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Score Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics?.scoreDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Demographics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Activity by Time of Day */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity by Time of Day</h3>
            <ResponsiveContainer width="100%" height={250}>
              <RechartsPieChart>
                <Pie
                  data={analytics?.demographics.byTimeOfDay}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="attempts"
                  nameKey="hour"
                  label={({ hour, attempts }) => `${hour}: ${attempts}`}
                >
                  {analytics?.demographics.byTimeOfDay.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>

          {/* Activity by Day of Week */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity by Day of Week</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={analytics?.demographics.byDayOfWeek}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="attempts" fill="#8B5CF6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Attempts */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Attempts</h3>
            <span className="text-sm text-gray-500">Last 20 attempts</span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time Spent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Completed At
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analytics?.recentAttempts?.map((attempt, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          attempt.rank === 1 ? 'bg-yellow-100 text-yellow-800' :
                          attempt.rank <= 3 ? 'bg-gray-100 text-gray-800' :
                          'bg-blue-50 text-blue-600'
                        }`}>
                          {attempt.rank}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-blue-600 font-medium text-sm">
                            {attempt.username[0].toUpperCase()}
                          </span>
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          {attempt.username}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-bold ${
                        attempt.score >= 90 ? 'text-green-600' :
                        attempt.score >= 70 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {attempt.score}%
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {attempt.timeSpent}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(attempt.completedAt).toLocaleDateString()} at{' '}
                      {new Date(attempt.completedAt).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizAnalytics;