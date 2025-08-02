import { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Users, 
  Trophy, 
  Zap, 
  CheckCircle, 
  Star, 
  ArrowRight, 
  Play,
  Target,
  Brain,
  TrendingUp,
  Award,
  Clock,
  Sparkles,
  Menu,
  X
} from 'lucide-react';

const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

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

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Student",
      content: "QuizGenie transformed how I study. The interactive quizzes make learning so much more engaging!",
      rating: 5,
      avatar: "SJ"
    },
    {
      name: "Michael Chen",
      role: "Teacher",
      content: "Perfect for creating custom quizzes for my students. The analytics help me track their progress effectively.",
      rating: 5,
      avatar: "MC"
    },
    {
      name: "Emma Davis",
      role: "Professional",
      content: "Great for skill assessment and training. The variety of question types keeps things interesting.",
      rating: 5,
      avatar: "ED"
    }
  ];

  const features = [
    {
      icon: Brain,
      title: "Smart Learning",
      description: "AI-powered questions that adapt to your learning pace and style"
    },
    {
      icon: TrendingUp,
      title: "Progress Tracking",
      description: "Detailed analytics to monitor your improvement over time"
    },
    {
      icon: Users,
      title: "Collaborative",
      description: "Share quizzes with friends and compete on leaderboards"
    },
    {
      icon: Target,
      title: "Personalized",
      description: "Customized quiz recommendations based on your interests"
    },
    {
      icon: Clock,
      title: "Flexible Timing",
      description: "Take quizzes at your own pace, anytime, anywhere"
    },
    {
      icon: Award,
      title: "Achievements",
      description: "Earn badges and certificates as you complete challenges"
    }
  ];

  const stats = [
    { number: "X", label: "Active Learners" },
    { number: "X", label: "Quizzes Created" },
    { number: "X+", label: "Questions Answered" },
    { number: "X", label: "Success Rate" }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">QuizGenie</span>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">Features</a>
              <a href="#how-it-works" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">How it Works</a>
              {/* <a href="#testimonials" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">Reviews</a> */}
              <button className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium transition-colors">
                <a href="/login">
                Sign In
                </a>
              </button>
              <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all font-medium">
                <a href="/register">
                Get Started
                </a>
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200">
              <div className="space-y-4">
                <a href="#features" className="block text-gray-700 hover:text-blue-600 font-medium">Features</a>
                <a href="#how-it-works" className="block text-gray-700 hover:text-blue-600 font-medium">How it Works</a>
                <a href="#testimonials" className="block text-gray-700 hover:text-blue-600 font-medium">Reviews</a>
                <button className="block w-full text-left text-blue-600 font-medium">Sign In</button>
                <button className="block w-full px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium">
                  Get Started
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-16 bg-gray-50 relative overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-blue-100 rounded-full opacity-10"></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-gray-200 rounded-full opacity-10"></div>
        <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-blue-100 rounded-full opacity-10"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
                  <Sparkles className="w-4 h-4" />
                  <span>New: AI-Powered Quiz Generation</span>
                </div>
                <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Master Any Subject with 
                  <span className="text-blue-600"> Interactive Quizzes</span>
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Transform your learning journey with personalized quizzes, real-time feedback, and comprehensive progress tracking. Join thousands of learners who've already boosted their knowledge.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <a href="/register">
                <button className="flex items-center justify-center space-x-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-lg transition-all transform hover:scale-105 shadow-sm">
                  <Play className="w-5 h-5" />
                  <span>Start Learning Now</span>
                </button>
                </a>
                <button className="flex items-center justify-center space-x-2 px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold text-lg hover:border-blue-500 hover:text-blue-600 transition-all">
                  <BookOpen className="w-5 h-5" />
                  <span>View Demo</span>
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{stat.number}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero Image/Animation */}
            <div className="relative">
              <div className="relative bg-white rounded-xl shadow-sm border border-gray-200 p-8 transform rotate-2 hover:rotate-0 transition-transform duration-500">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Sample Quiz</h3>
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                      <p className="font-medium text-gray-900">What is the capital of France?</p>
                    </div>
                    <div className="space-y-2">
                      {['London', 'Berlin', 'Paris', 'Madrid'].map((option, i) => (
                        <div key={i} className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          i === 2 ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-blue-300'
                        }`}>
                          <div className="flex items-center space-x-3">
                            <div className={`w-4 h-4 rounded-full border-2 ${
                              i === 2 ? 'border-green-500 bg-green-500' : 'border-gray-300'
                            }`}>
                              {i === 2 && <CheckCircle className="w-4 h-4 text-white" />}
                            </div>
                            <span className="text-gray-700">{option}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between items-center pt-4">
                      <span className="text-sm text-gray-500">Question 1 of 10</span>
                      <div className="w-32 h-2 bg-gray-200 rounded-full">
                        <div className="w-3 h-2 bg-blue-500 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6 mb-16">
            <h2 className="text-4xl font-bold text-gray-900">Why Choose QuizGenie?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover the features that make learning effective, engaging, and enjoyable.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group p-8 bg-white rounded-xl hover:shadow-lg transition-all duration-300 border border-gray-200">
                <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-700 transition-colors">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6 mb-16">
            <h2 className="text-4xl font-bold text-gray-900">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get started in just a few simple steps and begin your learning journey today.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Sign Up", description: "Create your free account and set up your learning preferences", icon: Users },
              { step: "02", title: "Choose Topics", description: "Select from hundreds of subjects or create your own custom quizzes", icon: BookOpen },
              { step: "03", title: "Start Learning", description: "Take quizzes, track progress, and master new skills at your own pace", icon: Trophy }
            ].map((item, index) => (
              <div key={index} className="relative">
                <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 hover:shadow-lg transition-shadow">
                  <div className="text-center space-y-6">
                    <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto">
                      <item.icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="space-y-4">
                      <div className="text-3xl font-bold text-blue-600">{item.step}</div>
                      <h3 className="text-xl font-semibold text-gray-900">{item.title}</h3>
                      <p className="text-gray-600">{item.description}</p>
                    </div>
                  </div>
                </div>
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ArrowRight className="w-8 h-8 text-blue-400" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      {/* <section id="testimonials" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6 mb-16">
            <h2 className="text-4xl font-bold text-gray-900">What Our Users Say</h2>
            <p className="text-xl text-gray-600">Join thousands of satisfied learners worldwide</p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-blue-50 rounded-xl border border-blue-200 p-8 md:p-12">
              <div className="text-center space-y-6">
                <div className="flex justify-center space-x-1">
                  {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                    <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
                  ))}
                </div>
                <blockquote className="text-2xl text-gray-900 font-medium leading-relaxed">
                  "{testimonials[currentTestimonial].content}"
                </blockquote>
                <div className="space-y-2">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-white font-bold text-lg">{testimonials[currentTestimonial].avatar}</span>
                  </div>
                  <div className="text-lg font-semibold text-gray-900">{testimonials[currentTestimonial].name}</div>
                  <div className="text-blue-600">{testimonials[currentTestimonial].role}</div>
                </div>
              </div>
            </div>

            
            <div className="flex justify-center space-x-2 mt-8">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentTestimonial ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section> */}

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold text-white">
              Ready to Transform Your Learning?
            </h2>
            <p className="text-xl text-blue-100 leading-relaxed">
              Join over 50,000 learners who are already mastering new skills with QuizGenie. 
              Start your journey today with our free plan.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button className="px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all shadow-sm">
                Get Started Free
              </button>
              <button className="px-8 py-4 border-2 border-white text-white rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-600 transition-all">
                View Pricing
              </button>
            </div>
            <div className="text-blue-100 text-sm">
              ✓ No credit card required  ✓ Free forever plan  ✓ Cancel anytime
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold">QuizGenie</span>
              </div>
              <p className="text-gray-400">
                Empowering learners worldwide with interactive quizzes and personalized learning experiences.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <div className="space-y-2 text-gray-400">
                <a href="#" className="block hover:text-white transition-colors">Features</a>
                <a href="#" className="block hover:text-white transition-colors">Pricing</a>
                <a href="#" className="block hover:text-white transition-colors">API</a>
                <a href="#" className="block hover:text-white transition-colors">Integrations</a>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <div className="space-y-2 text-gray-400">
                <a href="#" className="block hover:text-white transition-colors">About</a>
                <a href="#" className="block hover:text-white transition-colors">Blog</a>
                <a href="#" className="block hover:text-white transition-colors">Careers</a>
                <a href="#" className="block hover:text-white transition-colors">Contact</a>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <div className="space-y-2 text-gray-400">
                <a href="#" className="block hover:text-white transition-colors">Help Center</a>
                <a href="#" className="block hover:text-white transition-colors">Community</a>
                <a href="#" className="block hover:text-white transition-colors">Privacy</a>
                <a href="#" className="block hover:text-white transition-colors">Terms</a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <p className="text-gray-400">
              © 2024 QuizGenie. All rights reserved. Made with ❤️ for learners worldwide.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;