import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, Loader2, CheckCircle2, Clock, ListTodo } from 'lucide-react';
import { aiAPI } from '../api';
import RecommendationCard from '../components/RecommendationCard';

export default function Recommendations() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const res = await aiAPI.getRecommendations();
      setRecommendations(res.data.recommendations || []);
    } catch (err) {
      console.error('Failed to fetch recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const handleGenerateNew = async () => {
    setGenerating(true);
    try {
      const res = await aiAPI.generateRecommendations();
      setRecommendations(res.data.recommendations || []);
    } catch (err) {
      console.error('Failed to generate AI recommendations:', err);
    } finally {
      setGenerating(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await aiAPI.updateRecommendationStatus(id, newStatus);
      setRecommendations(prev =>
        prev.map(r => r.id === id ? { ...r, status: newStatus } : r)
      );
    } catch (err) {
      console.error('Status update failed:', err);
    }
  };

  const filtered = recommendations.filter(r => {
    if (activeTab === 'all') return true;
    return r.status === activeTab;
  });

  const pendingCount = recommendations.filter(r => r.status === 'pending').length;
  const inProgressCount = recommendations.filter(r => r.status === 'in_progress').length;
  const completedCount = recommendations.filter(r => r.status === 'completed').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span>AI Sustainability Action Plan</span>
            <span className="text-xs bg-violet-500/20 text-violet-300 font-bold px-2.5 py-1 rounded-full border border-violet-500/30 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Gemini 2.5 Engine
            </span>
          </h2>
          <p className="text-xs text-slate-400">Prioritized initiatives with realistic financial ROI and carbon impact metrics</p>
        </div>

        <button
          onClick={handleGenerateNew}
          disabled={generating}
          className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-glow-violet flex items-center space-x-2 transition-all transform hover:scale-105 shrink-0"
        >
          {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          <span>Re-Generate AI Initiatives</span>
        </button>
      </div>

      {/* Filter Tabs & Counts */}
      <div className="flex items-center space-x-2 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800 max-w-lg">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'all' ? 'bg-violet-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          All ({recommendations.length})
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'pending' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          To Do ({pendingCount})
        </button>
        <button
          onClick={() => setActiveTab('in_progress')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'in_progress' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          In Progress ({inProgressCount})
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'completed' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Done ({completedCount})
        </button>
      </div>

      {/* Initiatives Grid */}
      {loading ? (
        <div className="py-20 text-center space-y-2">
          <Loader2 className="w-8 h-8 text-violet-400 animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Loading AI action plans...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl space-y-3">
          <Sparkles className="w-10 h-10 text-violet-400 mx-auto" />
          <p className="text-sm font-bold text-white">No initiatives in this state</p>
          <p className="text-xs text-slate-400">Click "Re-Generate AI Initiatives" to analyze your latest data.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(rec => (
            <RecommendationCard
              key={rec.id}
              recommendation={rec}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}
    </div>
  );
}
