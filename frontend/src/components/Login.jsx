import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 items-center justify-center p-4 sm:p-8 relative z-10 w-full min-h-[calc(100vh-80px)]">
      
      <div className="w-full max-w-md">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 mb-6 shadow-[0_0_30px_rgba(99,102,241,0.2)]">
             <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-indigo-400" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
               <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
               <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
             </svg>
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-slate-400 font-medium">
            Access your intelligent OCR dashboard
          </p>
        </div>

        {/* Main Card */}
        <div className="glass rounded-2xl p-8 shadow-2xl relative">
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent rounded-2xl pointer-events-none" />
          
          <form className="space-y-6 relative z-10" onSubmit={handleLogin}>
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm p-3 rounded-lg text-center font-medium animate-pulse">
                {error}
              </div>
            )}
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Email Address</label>
                <div className="relative group">
                  <input
                    name="email"
                    type="email"
                    required
                    className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all font-medium"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-10 pointer-events-none transition-opacity duration-300" />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Password</label>
                <div className="relative group">
                  <input
                    name="password"
                    type="password"
                    required
                    className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all font-medium"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-10 pointer-events-none transition-opacity duration-300" />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl text-sm font-bold uppercase tracking-widest text-white overflow-hidden shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] active:scale-95 disabled:opacity-70 disabled:pointer-events-none"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600"></span>
              <span className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin relative z-10" />
              ) : (
                <span className="relative z-10 flex items-center gap-2">
                  Sign In 
                  <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
                </span>
              )}
            </button>
          </form>
          
        </div>

        <div className="mt-8 text-center text-sm">
           <span className="text-slate-400">Don't have an account? </span>
           <Link to="/signup" className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors uppercase tracking-wider text-xs">
            Create One
          </Link>
        </div>
      </div>
    </div>
  );
}
