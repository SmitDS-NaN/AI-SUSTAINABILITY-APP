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
import TiltCard from './TiltCard';

export default function UsageChart({ timelineData = [] }) {
  const [activeMetric, setActiveMetric] = useState('totalCo2e');

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
        <div className="bg-white/95 backdrop-blur-md p-4 rounded-xl border border-slate-200 shadow-xl text-xs space-y-1.5 min-w-[200px]">
          <p className="font-extrabold text-slate-800 border-b border-slate-100 pb-1.5">{label}</p>
          <div className="flex justify-between items-center text-emerald-700 font-semibold">
            <span>Total CO₂:</span>
            <span className="font-mono font-extrabold">{formatCO2(data.totalCo2e)}</span>
          </div>
          <div className="flex justify-between items-center text-cyan-600">
            <span>Electricity:</span>
            <span className="font-mono">{data.electricity} kg</span>
          </div>
          <div className="flex justify-between items-center text-blue-600">
            <span>Water:</span>
            <span className="font-mono">{data.water} kg</span>
          </div>
          <div className="flex justify-between items-center text-amber-600">
            <span>Fuel:</span>
            <span className="font-mono">{data.fuel} kg</span>
          </div>
          <div className="flex justify-between items-center text-purple-600">
            <span>Waste:</span>
            <span className="font-mono">{data.waste} kg</span>
          </div>
          <div className="flex justify-between items-center text-pink-600 pt-1 border-t border-slate-100">
            <span>Total Cost:</span>
            <span className="font-mono font-extrabold">{formatINR(data.totalCost)}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <TiltCard maxTilt={3} className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            Resource & Carbon Emission Trends
          </h3>
          <p className="text-xs font-medium text-slate-500">Historical aggregated consumption timeline</p>
        </div>

        {/* Metric Selector Pills */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100/80 p-1.5 rounded-xl border border-slate-200">
          {metrics.map(m => (
            <button
              key={m.key}
              onClick={() => setActiveMetric(m.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeMetric === m.key
                  ? 'bg-emerald-500 text-white shadow-sm font-extrabold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white'
              }`}
            >
              {m.label.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="chartGradientLight" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={currentMetric.color} stopOpacity={0.35} />
                <stop offset="95%" stopColor={currentMetric.color} stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
            <XAxis dataKey="month" stroke="#64748B" tick={{ fontSize: 11, fontWeight: 600 }} tickLine={false} />
            <YAxis stroke="#64748B" tick={{ fontSize: 11, fontWeight: 600 }} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey={activeMetric}
              stroke={currentMetric.color}
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#chartGradientLight)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </TiltCard>
  );
}
