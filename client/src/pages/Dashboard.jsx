import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Flame,
  Zap,
  Droplets,
  Trash2,
  TrendingDown,
  Award,
  Sparkles,
  ArrowUpRight,
  ShieldAlert,
  Loader2,
  IndianRupee,
  Activity
} from 'lucide-react';
import { dashboardAPI } from '../api';
import MetricCard from '../components/MetricCard';
import UsageChart from '../components/UsageChart';
import AnomalyBanner from '../components/AnomalyBanner';
import { formatINR, formatCO2 } from '../utils/formatters';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await dashboardAPI.getSummary();
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="py-24 text-center space-y-4">
        <Loader2 className="w-10 h-10 text-emerald-400 animate-spin mx-auto" />
        <p className="text-sm font-semibold text-slate-300">Computing deterministic carbon metrics & z-score anomaly models...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-rose-500/10 border border-rose-500/30 p-6 rounded-2xl text-center text-rose-400 space-y-3">
        <p className="font-bold">{error || 'Failed to load data'}</p>
        <button onClick={fetchDashboard} className="bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-semibold">
          Retry
        </button>
      </div>
    );
  }

  const { summary, sustainabilityScore, byCategory, monthlyTimeline, anomalies, recommendationsCount } = data;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Sustainability Dashboard</span>
            <span className="text-xs bg-emerald-500/20 text-emerald-300 font-bold px-2.5 py-1 rounded-full border border-emerald-500/30">
              Deterministic Math Engine Active
            </span>
          </h2>
          <p className="text-xs text-slate-400">Real-time organizational carbon footprint, z-score spikes, and Gemini AI insights</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/chat')}
            className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-glow-violet flex items-center space-x-2 transition-all transform hover:scale-105"
          >
            <Sparkles className="w-4 h-4 fill-white" />
            <span>Ask Your Data AI</span>
          </button>
        </div>
      </div>

      {/* Statistical Anomaly Alert Banner (if spikes detected) */}
      <AnomalyBanner anomalies={anomalies} onRefresh={fetchDashboard} />

      {/* Core KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Carbon Footprint"
          value={summary.totalCo2eTons}
          unit="Metric Tons CO₂e"
          subtitle={`${summary.totalCo2eKg.toLocaleString()} kg CO₂e`}
          trend={-4.2}
          trendLabel="vs previous cycle"
          icon={Activity}
          color="emerald"
        />

        <MetricCard
          title="Total Utility Spend"
          value={formatINR(summary.totalCostInr)}
          subtitle={`${summary.logCount} logged utility bills`}
          trend={+2.1}
          trendLabel="spend variance"
          icon={IndianRupee}
          color="cyan"
        />

        {/* Sustainability Score Card */}
        <div className="glass-panel glass-panel-hover rounded-2xl p-6 relative overflow-hidden group">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Sustainability Score</p>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-extrabold text-white">{sustainabilityScore.score}</span>
                <span className="text-sm font-bold text-slate-400">/ 100</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Resource Stability Grade</p>
            </div>
            <div className="px-3 py-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-xl font-black text-lg shadow-glow-emerald">
              {sustainabilityScore.grade}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800/80 w-full bg-slate-900/60 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-1000"
              style={{ width: `${sustainabilityScore.score}%` }}
            ></div>
          </div>
        </div>

        <MetricCard
          title="Active AI Initiatives"
          value={recommendationsCount.total}
          subtitle={`${recommendationsCount.in_progress} in progress • ${recommendationsCount.completed} completed`}
          icon={Sparkles}
          color="violet"
        />
      </div>

      {/* Main Visualizations: Recharts Area Chart */}
      <UsageChart timelineData={monthlyTimeline} />

      {/* Category Emission Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Electricity */}
        <div className="glass-panel p-5 rounded-2xl border-l-4 border-l-cyan-500 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-300 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-cyan-400" /> Electricity
            </span>
            <span className="font-mono text-slate-400">0.82 kg/kWh</span>
          </div>
          <p className="text-xl font-extrabold text-white">{formatCO2(byCategory.electricity.co2e)}</p>
          <p className="text-xs text-slate-400">{byCategory.electricity.totalQty.toLocaleString()} kWh • {formatINR(byCategory.electricity.cost)}</p>
        </div>

        {/* Water */}
        <div className="glass-panel p-5 rounded-2xl border-l-4 border-l-blue-500 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-300 flex items-center gap-1.5">
              <Droplets className="w-4 h-4 text-blue-400" /> Water
            </span>
            <span className="font-mono text-slate-400">0.34 kg/kL</span>
          </div>
          <p className="text-xl font-extrabold text-white">{formatCO2(byCategory.water.co2e)}</p>
          <p className="text-xs text-slate-400">{byCategory.water.totalQty.toLocaleString()} kL • {formatINR(byCategory.water.cost)}</p>
        </div>

        {/* Fuel */}
        <div className="glass-panel p-5 rounded-2xl border-l-4 border-l-amber-500 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-300 flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-amber-400" /> Fuel
            </span>
            <span className="font-mono text-slate-400">2.68 kg/L</span>
          </div>
          <p className="text-xl font-extrabold text-white">{formatCO2(byCategory.fuel.co2e)}</p>
          <p className="text-xs text-slate-400">{byCategory.fuel.totalQty.toLocaleString()} L • {formatINR(byCategory.fuel.cost)}</p>
        </div>

        {/* Waste */}
        <div className="glass-panel p-5 rounded-2xl border-l-4 border-l-purple-500 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-300 flex items-center gap-1.5">
              <Trash2 className="w-4 h-4 text-purple-400" /> Waste
            </span>
            <span className="font-mono text-slate-400">1.90 kg/kg</span>
          </div>
          <p className="text-xl font-extrabold text-white">{formatCO2(byCategory.waste.co2e)}</p>
          <p className="text-xs text-slate-400">{byCategory.waste.totalQty.toLocaleString()} kg • {formatINR(byCategory.waste.cost)}</p>
        </div>
      </div>
    </div>
  );
}
