import React, { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { Leaf, Lock, Mail, ArrowRight, Sparkles, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import TiltCard from '../components/TiltCard';

export default function Login() {
  const [email, setEmail] = useState('demo@ecoledger.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { user, login } = useAuth();
  const navigate = useNavigate();

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-light-mesh text-slate-900 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Soft Ambient Light Blobs */}
      <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-emerald-300/20 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/3 w-[500px] h-[500px] bg-teal-300/20 rounded-full blur-[140px] pointer-events-none"></div>

      <TiltCard className="max-w-md w-full relative z-10" maxTilt={8}>
        <div className="p-8 space-y-6">
          <div className="text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white mx-auto shadow-md shadow-emerald-500/20">
              <Leaf className="w-8 h-8 fill-white/20 text-white" />
            </div>
            <h2 className="text-2xl font-black tracking-tight text-slate-900">EcoLedger Login</h2>
            <p className="text-xs font-medium text-slate-500">AI-Powered Sustainability Copilot for Enterprise</p>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-200 p-3.5 rounded-2xl text-rose-600 text-xs text-center font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@organization.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all shadow-inner"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all shadow-inner"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-3d-primary w-full py-3.5 text-xs font-bold flex items-center justify-center space-x-2 rounded-xl mt-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
              <span>Sign In to Workspace</span>
            </button>
          </form>

          <div className="bg-emerald-50/60 border border-emerald-200/80 p-3.5 rounded-2xl text-xs space-y-1">
            <p className="font-bold text-emerald-800 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600" /> Demo Credentials Pre-filled:
            </p>
            <p className="text-emerald-900/70 font-mono text-[11px]">Email: demo@ecoledger.com | Pass: password123</p>
          </div>

          <p className="text-center text-xs text-slate-500 font-medium">
            Don't have an organization workspace?{' '}
            <Link to="/register" className="text-emerald-600 hover:text-emerald-700 font-bold hover:underline">
              Create Organization
            </Link>
          </p>
        </div>
      </TiltCard>
    </div>
  );
}
