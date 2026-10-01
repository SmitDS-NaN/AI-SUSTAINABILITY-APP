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
import TiltCard from '../components/TiltCard';
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
        <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mx-auto" />
        <p className="text-sm font-bold text-slate-600">Computing deterministic carbon metrics & z-score anomaly models...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-rose-50 border border-rose-200 p-6 rounded-2xl text-center text-rose-700 space-y-3">
        <p className="font-bold">{error || 'Failed to load data'}</p>
        <button onClick={fetchDashboard} className="btn-3d-secondary px-4 py-2 rounded-xl text-xs font-bold">
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
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <span>Sustainability Dashboard</span>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-extrabold px-3 py-1 rounded-full border border-emerald-200">
              Deterministic Math Engine Active
            </span>
          </h2>
          <p className="text-xs font-medium text-slate-500 mt-1">Real-time organizational carbon footprint, z-score spikes, and Gemini AI insights</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/chat')}
            className="btn-3d-violet font-bold text-xs px-5 py-2.5 rounded-xl flex items-center space-x-2"
          >
            <Sparkles className="w-4 h-4 text-white" />
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
        <TiltCard maxTilt={8}>
          <div className="card-3d rounded-2xl p-6 relative overflow-hidden h-full flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Sustainability Score</p>
                <div className="flex items-baseline space-x-2">
                  <span className="text-3 font-black text-slate-900 text-3xl">{sustainabilityScore.score}</span>
                  <span className="text-sm font-bold text-slate-400">/ 100</span>
                </div>
                <p className="text-xs font-medium text-slate-500 mt-1">Resource Stability Grade</p>
              </div>
              <div className="px-3.5 py-1.5 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl font-black text-lg shadow-sm">
                {sustainabilityScore.grade}
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-1000 shadow-sm"
                style={{ width: `${sustainabilityScore.score}%` }}
              ></div>
            </div>
          </div>
        </TiltCard>

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
        <TiltCard maxTilt={6}>
          <div className="card-3d p-5 rounded-2xl border-l-4 border-l-cyan-500 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-cyan-600" /> Electricity
              </span>
              <span className="font-mono text-slate-400 text-[11px]">0.82 kg/kWh</span>
            </div>
            <p className="text-xl font-black text-slate-900">{formatCO2(byCategory.electricity.co2e)}</p>
            <p className="text-xs text-slate-500 font-medium">{byCategory.electricity.totalQty.toLocaleString()} kWh • {formatINR(byCategory.electricity.cost)}</p>
          </div>
        </TiltCard>

        {/* Water */}
        <TiltCard maxTilt={6}>
          <div className="card-3d p-5 rounded-2xl border-l-4 border-l-blue-500 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <Droplets className="w-4 h-4 text-blue-600" /> Water
              </span>
              <span className="font-mono text-slate-400 text-[11px]">0.34 kg/kL</span>
            </div>
            <p className="text-xl font-black text-slate-900">{formatCO2(byCategory.water.co2e)}</p>
            <p className="text-xs text-slate-500 font-medium">{byCategory.water.totalQty.toLocaleString()} kL • {formatINR(byCategory.water.cost)}</p>
          </div>
        </TiltCard>

        {/* Fuel */}
        <TiltCard maxTilt={6}>
          <div className="card-3d p-5 rounded-2xl border-l-4 border-l-amber-500 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-600" /> Fuel
              </span>
              <span className="font-mono text-slate-400 text-[11px]">2.68 kg/L</span>
            </div>
            <p className="text-xl font-black text-slate-900">{formatCO2(byCategory.fuel.co2e)}</p>
            <p className="text-xs text-slate-500 font-medium">{byCategory.fuel.totalQty.toLocaleString()} L • {formatINR(byCategory.fuel.cost)}</p>
          </div>
        </TiltCard>

        {/* Waste */}
        <TiltCard maxTilt={6}>
          <div className="card-3d p-5 rounded-2xl border-l-4 border-l-purple-500 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <Trash2 className="w-4 h-4 text-purple-600" /> Waste
              </span>
              <span className="font-mono text-slate-400 text-[11px]">1.90 kg/kg</span>
            </div>
            <p className="text-xl font-black text-slate-900">{formatCO2(byCategory.waste.co2e)}</p>
            <p className="text-xs text-slate-500 font-medium">{byCategory.waste.totalQty.toLocaleString()} kg • {formatINR(byCategory.waste.cost)}</p>
          </div>
        </TiltCard>
      </div>
    </div>
  );
}
