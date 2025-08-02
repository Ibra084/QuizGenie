import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { User, Lock, LogIn, AlertCircle, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';

const Login = () => {
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const navbar = document.querySelector('.navigation-bar');
        const hubview = document.querySelector('.hub-view');
        if (navbar) navbar.style.display = 'none';
        if (hubview) hubview.style.display = 'none';

        return () => {
            if (navbar) navbar.style.display = '';
            if (hubview) hubview.style.display = '';
        };
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login({
      username: e.target.username.value,
      password: e.target.password.value
    });
    
    if (!result.success) {
      setError(result.error); // Will show specific error
    }
  };
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <div className="flex-grow flex  justify-center p-4">
                <div className="w-full max-w-md">
                    {/* Back Button */}
                    <button 
                        onClick={() => navigate('/')}
                        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors duration-200"
                    >
                        <ArrowLeft size={20} />
                        <span className="text-sm font-medium">Back to Home</span>
                    </button>

                    {/* Main Login Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        {/* Header with gradient */}
                        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-1">
                            <div className="bg-white rounded-lg p-6">
                                <div className="text-center mb-6">
                                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <LogIn size={32} className="text-blue-600" />
                                    </div>
                                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h1>
                                    <p className="text-gray-600">Sign in to access your quizzes and continue learning</p>
                                </div>

                                {/* Error Message */}
                                {error && (
                                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <AlertCircle size={18} className="text-red-600 flex-shrink-0" />
                                            <p className="text-red-700 text-sm">{error}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Login Form */}
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    
                                    {/* Username Field */}
                                    <div>
                                        <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                                            Username
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                                {/* <User size={18} className="text-gray-400" /> */}
                                            </div>
                                            <input
                                                type="text"
                                                id="username"
                                                name="username"
                                                value={formData.username}
                                                onChange={handleChange}
                                                className="w-full pl-10 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                                                placeholder="Enter your username"
                                                required
                                                disabled={isLoading}
                                            />
                                        </div>
                                    </div>

                                    {/* Password Field */}
                                    <div>
                                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                            Password
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                                {/* <Lock size={18} className="text-gray-400" /> */}
                                            </div>
                                            <input
                                                type="password"
                                                id="password"
                                                name="password"
                                                value={formData.password}
                                                onChange={handleChange}
                                                className="w-full pl-10 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                                                placeholder="Enter your password"
                                                required
                                                disabled={isLoading}
                                            />
                                        </div>
                                    </div>

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 text-sm"
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 size={18} className="animate-spin" />
                                                Signing In...
                                            </>
                                        ) : (
                                            <>
                                                <LogIn size={18} />
                                                Sign In
                                            </>
                                        )}
                                    </button>
                                </form>

                                {/* Register Link */}
                                <div className="mt-6 text-center">
                                    <p className="text-gray-600 text-sm mb-3">Don't have an account yet?</p>
                                    <button
                                        onClick={() => navigate('/register')}
                                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors duration-200"
                                    >
                                        Create your account
                                        <span className="text-base">→</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Features Section */}
                    <div className="mt-6 bg-blue-50 rounded-xl border border-blue-200 p-4">
                        <div className="text-center">
                            <h3 className="font-semibold text-blue-900 text-sm mb-3">Why Choose Our Platform?</h3>
                            <div className="space-y-2 text-blue-800 text-xs">
                                <div className="flex items-start gap-2">
                                    <CheckCircle2 size={14} className="mt-0.5 text-blue-600 flex-shrink-0" />
                                    <span className="text-left">Interactive quizzes with instant feedback</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <CheckCircle2 size={14} className="mt-0.5 text-blue-600 flex-shrink-0" />
                                    <span className="text-left">Track your progress and performance</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <CheckCircle2 size={14} className="mt-0.5 text-blue-600 flex-shrink-0" />
                                    <span className="text-left">Access quizzes anytime, anywhere</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;