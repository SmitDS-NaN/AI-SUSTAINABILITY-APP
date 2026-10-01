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
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <span>AI Sustainability Action Plan</span>
            <span className="text-xs bg-violet-100 text-violet-800 font-extrabold px-3 py-1 rounded-full border border-violet-200 flex items-center gap-1.5 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-violet-600" /> Gemini 2.5 Engine
            </span>
          </h2>
          <p className="text-xs font-medium text-slate-500 mt-1">Prioritized initiatives with realistic financial ROI and carbon impact metrics</p>
        </div>

        <button
          onClick={handleGenerateNew}
          disabled={generating}
          className="btn-3d-violet font-bold text-xs px-5 py-2.5 rounded-xl flex items-center space-x-2 shrink-0"
        >
          {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          <span>Re-Generate AI Initiatives</span>
        </button>
      </div>

      {/* Filter Tabs & Counts */}
      <div className="flex items-center space-x-2 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200 max-w-lg shadow-inner">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
            activeTab === 'all' ? 'bg-violet-600 text-white shadow-md shadow-violet-600/20' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          All ({recommendations.length})
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
            activeTab === 'pending' ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          To Do ({pendingCount})
        </button>
        <button
          onClick={() => setActiveTab('in_progress')}
          className={`px-4 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
            activeTab === 'in_progress' ? 'bg-cyan-100 text-cyan-800 border border-cyan-300' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          In Progress ({inProgressCount})
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`px-4 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
            activeTab === 'completed' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Done ({completedCount})
        </button>
      </div>

      {/* Initiatives Grid */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <Loader2 className="w-8 h-8 text-violet-600 animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-600">Loading AI action plans...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card-3d p-12 text-center rounded-3xl space-y-3">
          <Sparkles className="w-10 h-10 text-violet-600 mx-auto" />
          <p className="text-sm font-bold text-slate-900">No initiatives in this state</p>
          <p className="text-xs text-slate-500 font-medium">Click "Re-Generate AI Initiatives" to analyze your latest data.</p>
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
