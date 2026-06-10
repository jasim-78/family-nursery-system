import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Flower2, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';

const Login = () => {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // If already logged in, redirect away
  React.useEffect(() => {
    if (isAuthenticated && user) {
      const from = location.state?.from?.pathname || (user.role === 'admin' ? '/' : '/staff-dashboard');
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, user, navigate, location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    try {
      setError('');
      setSubmitting(true);
      const result = await login(email, password);
      if (!result.success) {
        setError(result.message);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-nursery-950 via-forest-950 to-nursery-900 px-4 relative overflow-hidden">
      {/* Background Graphic Accents */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-nursery-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md animate-fade-in">
        {/* Brand Card header */}
        <div className="text-center mb-8">
          <div className="inline-flex p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl mb-4">
            <Flower2 className="w-12 h-12 text-emerald-400 stroke-[1.2]" />
          </div>
          <h1 className="text-3xl font-extrabold text-white font-heading tracking-tight">Family Nursery</h1>
          <p className="text-slate-400 text-sm mt-2 font-medium tracking-wide">MANAGEMENT & INVENTORY SYSTEM</p>
        </div>

        {/* Login Form Container */}
        <div className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-2xl">
          <h2 className="text-xl font-bold text-white mb-6">Sign In to Dashboard</h2>

          {error && (
            <div className="mb-6 p-4 bg-red-950/40 border border-red-500/20 rounded-2xl flex items-start space-x-3 text-red-300 text-sm animate-shake">
              <AlertCircle className="w-5 h-5 shrink-0 stroke-[1.8] text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email field */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-950/40 border border-white/10 rounded-2xl text-white placeholder-slate-500 text-sm focus:border-emerald-500 focus:outline-none transition-all-300"
                />
                <Mail className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
              </div>
            </div>

            {/* Password field */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-11 py-3 bg-slate-950/40 border border-white/10 rounded-2xl text-white placeholder-slate-500 text-sm focus:border-emerald-500 focus:outline-none transition-all-300"
                />
                <Lock className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5 text-slate-500 hover:text-slate-300 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white rounded-2xl font-semibold text-sm transition-all-300 cursor-pointer shadow-lg shadow-emerald-900/30 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
            >
              {submitting ? 'Authenticating...' : 'Access System'}
            </button>
          </form>


        </div>
      </div>
    </div>
  );
};

export default Login;
