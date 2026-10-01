import React, { useState, useEffect } from 'react';
import { Target, PlusCircle, Trash2, Calendar, TrendingDown, CheckCircle, Loader2 } from 'lucide-react';
import { goalsAPI } from '../api';

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [targetCategory, setTargetCategory] = useState('electricity');
  const [reductionPercentage, setReductionPercentage] = useState(15);
  const [targetDate, setTargetDate] = useState('2026-12-31');
  const [submitting, setSubmitting] = useState(false);

  const fetchGoals = async () => {
    setLoading(true);
    try {
      const res = await goalsAPI.getGoals();
      setGoals(res.data.goals || []);
    } catch (err) {
      console.error('Failed to fetch goals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await goalsAPI.createGoal({
        target_category: targetCategory,
        reduction_percentage: Number(reductionPercentage),
        target_date: targetDate
      });
      setIsModalOpen(false);
      fetchGoals();
    } catch (err) {
      console.error('Failed to create goal:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this reduction target?')) return;
    try {
      await goalsAPI.deleteGoal(id);
      setGoals(goals.filter(g => g.id !== id));
    } catch (err) {
      console.error('Failed to delete goal:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Organizational Reduction Targets</span>
          </h2>
          <p className="text-xs text-slate-400">Set, track, and visualize key performance indicators for decarbonization</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl shadow-glow-emerald flex items-center space-x-2 transition-all shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Set Reduction Goal</span>
        </button>
      </div>

      {/* Goals Grid */}
      {loading ? (
        <div className="py-16 text-center space-y-2">
          <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Loading goals...</p>
        </div>
      ) : goals.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl space-y-3">
          <Target className="w-12 h-12 text-slate-600 mx-auto" />
          <p className="text-sm font-bold text-white">No reduction goals set</p>
          <p className="text-xs text-slate-400">Click "Set Reduction Goal" to establish carbon reduction milestones.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {goals.map((goal) => {
            // Simulated target progress
            const progress = Math.min(100, Math.round(goal.reduction_percentage * 0.75));
            return (
              <div key={goal.id} className="glass-panel rounded-2xl p-6 relative flex flex-col justify-between space-y-4 border border-slate-800">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/30 capitalize">
                      {goal.target_category} Target
                    </span>
                    <button
                      onClick={() => handleDelete(goal.id)}
                      className="text-slate-500 hover:text-rose-400 p-1 rounded-lg hover:bg-slate-800 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <h4 className="text-2xl font-extrabold text-white flex items-baseline space-x-1">
                    <span>{goal.reduction_percentage}%</span>
                    <span className="text-xs text-slate-400 font-semibold">Emission Reduction</span>
                  </h4>

                  <p className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    Target Date: {goal.target_date}
                  </p>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-400">Current Progress</span>
                    <span className="text-emerald-400">{progress}%</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-800">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-1000"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 relative shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-emerald-400" />
              <span>Set Reduction Target</span>
            </h3>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Target Category</label>
                <select
                  value={targetCategory}
                  onChange={(e) => setTargetCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500 capitalize"
                >
                  <option value="electricity">Electricity</option>
                  <option value="water">Water</option>
                  <option value="fuel">Fuel</option>
                  <option value="waste">Waste</option>
                  <option value="all">Overall Carbon Footprint</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Reduction Percentage (%)</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  required
                  value={reductionPercentage}
                  onChange={(e) => setReductionPercentage(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Target Completion Date</label>
                <input
                  type="date"
                  required
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg transition-all"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Target'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
