import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import GenerateQuiz from './pages/CreateQuiz';
import QuizPage from './pages/QuizPage';
import Navbar from './components/Navbar';
import DiscoverQuizzes from './pages/Discover';
import Login from './pages/Login';
import Register from './pages/Register';
import PrivateRoute from './components/PrivateRoute';
import { AuthProvider } from './context/AuthContext';
import LandingPage from './pages/Landing';
import QuizNetwork from './pages/QuizNetwork';
import MyQuizzes from './pages/MyQuizzes';
import EditQuiz from './pages/EditQuiz';
import QuizAnalytics from './pages/Analytics';
import NotFoundPage from './pages/NotFound';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="app">
          <Navbar />
          <Routes>
            <Route path="/*" element={<NotFoundPage />} />
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            
            
            {/* Protected routes */}
            <Route element={<PrivateRoute />}>
              <Route path="/create-quiz" element={<GenerateQuiz />} />
              <Route path="/network" element={<QuizNetwork />} />
              <Route path="/discover" element={<DiscoverQuizzes />} />
              <Route path="/quiz/:quizId" element={<QuizPage />} />
              <Route path="/my-quizzes" element={<MyQuizzes />} />
              <Route path="/edit-quiz/:quizId" element={<EditQuiz />} />
              <Route path="/quiz-analytics/:quizId" element={<QuizAnalytics />} />
            </Route>
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;