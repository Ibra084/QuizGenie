import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { User, Mail, Lock, UserPlus, AlertCircle, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();

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
        setError('');
        setIsLoading(true);
        
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setIsLoading(false);
            return;
        }

        try {
            const res = await register({
                username: formData.username,
                email: formData.email,
                password: formData.password
            });

            if (res.status !== 200) {
                setError(res.data.message || 'Registration failed');
            }
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Password strength indicator
    const getPasswordStrength = (password) => {
        if (password.length < 6) return { strength: 'weak', color: 'red', text: 'Too short' };
        if (password.length < 8) return { strength: 'fair', color: 'yellow', text: 'Fair' };
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) return { strength: 'good', color: 'blue', text: 'Good' };
        return { strength: 'strong', color: 'green', text: 'Strong' };
    };

    const passwordStrength = formData.password ? getPasswordStrength(formData.password) : null;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <div className="flex-grow flex justify-center p-4">
                <div className="w-full max-w-md">
                    {/* Back Button */}
                    <button 
                        onClick={() => navigate('/')}
                        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors duration-200"
                    >
                        <ArrowLeft size={20} />
                        <span className="text-sm font-medium">Back to Home</span>
                    </button>

                    {/* Main Register Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        {/* Header with gradient */}
                        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-1">
                            <div className="bg-white rounded-lg p-6">
                                <div className="text-center mb-6">
                                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <UserPlus size={32} className="text-blue-600" />
                                    </div>
                                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Create Account</h1>
                                    <p className="text-gray-600">Join our learning community and start your quiz journey</p>
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

                                {/* Register Form */}
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
                                                placeholder="Choose a username"
                                                required
                                                disabled={isLoading}
                                            />
                                        </div>
                                    </div>

                                    {/* Email Field */}
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                            Email Address
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                                {/* <Mail size={18} className="text-gray-400" /> */}
                                            </div>
                                            <input
                                                type="email"
                                                id="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                className="w-full pl-10 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                                                placeholder="Enter your email"
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
                                                placeholder="Create a password"
                                                required
                                                disabled={isLoading}
                                            />
                                        </div>
                                        {/* Password Strength Indicator */}
                                        {passwordStrength && (
                                            <div className="mt-1">
                                                <div className="flex items-center gap-2 text-xs">
                                                    <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                                                        <div 
                                                            className={`h-full transition-all duration-300 ${
                                                                passwordStrength.color === 'red' ? 'bg-red-500 w-1/4' :
                                                                passwordStrength.color === 'yellow' ? 'bg-yellow-500 w-2/4' :
                                                                passwordStrength.color === 'blue' ? 'bg-blue-500 w-3/4' :
                                                                'bg-green-500 w-full'
                                                            }`}
                                                        />
                                                    </div>
                                                    <span className={`font-medium ${
                                                        passwordStrength.color === 'red' ? 'text-red-600' :
                                                        passwordStrength.color === 'yellow' ? 'text-yellow-600' :
                                                        passwordStrength.color === 'blue' ? 'text-blue-600' :
                                                        'text-green-600'
                                                    }`}>
                                                        {passwordStrength.text}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Confirm Password Field */}
                                    <div>
                                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                            Confirm Password
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                                {/* <Lock size={18} className="text-gray-400" /> */}
                                            </div>
                                            <input
                                                type="password"
                                                id="confirmPassword"
                                                name="confirmPassword"
                                                value={formData.confirmPassword}
                                                onChange={handleChange}
                                                className="w-full pl-10 pr-10 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                                                placeholder="Confirm your password"
                                                required
                                                disabled={isLoading}
                                            />
                                            {formData.confirmPassword && formData.password && (
                                                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                                    {formData.password === formData.confirmPassword ? (
                                                        <CheckCircle2 size={18} className="text-green-500" />
                                                    ) : (
                                                        <AlertCircle size={18} className="text-red-500" />
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                                            <p className="mt-1 text-xs text-red-600">Passwords do not match</p>
                                        )}
                                    </div>

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        disabled={isLoading || formData.password !== formData.confirmPassword}
                                        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 text-sm"
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 size={18} className="animate-spin" />
                                                Creating Account...
                                            </>
                                        ) : (
                                            <>
                                                <UserPlus size={18} />
                                                Create Account
                                            </>
                                        )}
                                    </button>
                                </form>

                                {/* Login Link */}
                                <div className="mt-6 text-center">
                                    <p className="text-gray-600 text-sm mb-3">Already have an account?</p>
                                    <button
                                        onClick={() => navigate('/login')}
                                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors duration-200"
                                    >
                                        Sign in here
                                        <span className="text-base">→</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Benefits Section */}
                    <div className="mt-6 bg-blue-50 rounded-xl border border-blue-200 p-4">
                        <div className="text-center">
                            <h3 className="font-semibold text-blue-900 text-sm mb-3">🎯 What You'll Get</h3>
                            <div className="space-y-2 text-blue-800 text-xs">
                                <div className="flex items-start gap-2">
                                    <CheckCircle2 size={14} className="mt-0.5 text-blue-600 flex-shrink-0" />
                                    <span className="text-left">Access to unlimited interactive quizzes</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <CheckCircle2 size={14} className="mt-0.5 text-blue-600 flex-shrink-0" />
                                    <span className="text-left">Detailed performance analytics and progress tracking</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <CheckCircle2 size={14} className="mt-0.5 text-blue-600 flex-shrink-0" />
                                    <span className="text-left">Personalized learning recommendations</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <CheckCircle2 size={14} className="mt-0.5 text-blue-600 flex-shrink-0" />
                                    <span className="text-left">Join a community of learners worldwide</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
