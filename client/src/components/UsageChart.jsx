import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar
} from 'recharts';
import { formatCO2, formatINR } from '../utils/formatters';

export default function UsageChart({ timelineData = [] }) {
  const [activeMetric, setActiveMetric] = useState('totalCo2e');
  const [chartType, setChartType] = useState('area');

  const metrics = [
    { key: 'totalCo2e', label: 'Total Footprint (kg CO₂e)', color: '#10B981' },
    { key: 'electricity', label: 'Electricity (kWh CO₂)', color: '#06B6D4' },
    { key: 'water', label: 'Water (kL CO₂)', color: '#3B82F6' },
    { key: 'fuel', label: 'Fuel (L CO₂)', color: '#F59E0B' },
    { key: 'waste', label: 'Waste (kg CO₂)', color: '#8B5CF6' },
    { key: 'totalCost', label: 'Cost (₹)', color: '#EC4899' }
  ];

  const currentMetric = metrics.find(m => m.key === activeMetric) || metrics[0];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="glass-panel p-4 rounded-xl border border-slate-700 shadow-2xl text-xs space-y-1.5 min-w-[180px]">
          <p className="font-bold text-slate-200 border-b border-slate-700/60 pb-1">{label}</p>
          <div className="flex justify-between items-center text-emerald-400">
            <span>Total CO₂:</span>
            <span className="font-mono font-bold">{formatCO2(data.totalCo2e)}</span>
          </div>
          <div className="flex justify-between items-center text-cyan-400">
            <span>Electricity:</span>
            <span className="font-mono">{data.electricity} kg</span>
          </div>
          <div className="flex justify-between items-center text-blue-400">
            <span>Water:</span>
            <span className="font-mono">{data.water} kg</span>
          </div>
          <div className="flex justify-between items-center text-amber-400">
            <span>Fuel:</span>
            <span className="font-mono">{data.fuel} kg</span>
          </div>
          <div className="flex justify-between items-center text-purple-400">
            <span>Waste:</span>
            <span className="font-mono">{data.waste} kg</span>
          </div>
          <div className="flex justify-between items-center text-pink-400 pt-1 border-t border-slate-800">
            <span>Total Cost:</span>
            <span className="font-mono font-bold">{formatINR(data.totalCost)}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-panel rounded-2xl p-6 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            Resource & Carbon Emission Trends
          </h3>
          <p className="text-xs text-slate-400">Historical 12-month aggregated consumption timeline</p>
        </div>

        {/* Metric Selector Pills */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800">
          {metrics.map(m => (
            <button
              key={m.key}
              onClick={() => setActiveMetric(m.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeMetric === m.key
                  ? 'bg-emerald-500 text-slate-950 shadow-sm font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              {m.label.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'area' ? (
            <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={currentMetric.color} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={currentMetric.color} stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
              <XAxis dataKey="month" stroke="#64748B" tick={{ fontSize: 11 }} tickLine={false} />
              <YAxis stroke="#64748B" tick={{ fontSize: 11 }} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey={activeMetric}
                stroke={currentMetric.color}
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#chartGradient)"
              />
            </AreaChart>
          ) : (
            <BarChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
              <XAxis dataKey="month" stroke="#64748B" tick={{ fontSize: 11 }} tickLine={false} />
              <YAxis stroke="#64748B" tick={{ fontSize: 11 }} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey={activeMetric} fill={currentMetric.color} radius={[6, 6, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
