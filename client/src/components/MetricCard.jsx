import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function MetricCard({ title, value, unit, trend, trendLabel, icon: Icon, color = 'emerald', subtitle }) {
  const colorStyles = {
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30 shadow-glow-emerald',
    cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30 shadow-glow-cyan',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/30 shadow-glow-amber',
    violet: 'text-violet-400 bg-violet-500/10 border-violet-500/30 shadow-glow-violet'
  };

  const isPositiveTrend = trend < 0; // In carbon emissions, reduction is positive (green)!

  return (
    <div className="glass-panel glass-panel-hover rounded-2xl p-6 relative overflow-hidden group">
      {/* Background Subtle Radial Glow */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/15 transition-all"></div>

      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">{title}</p>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">{value}</span>
            {unit && <span className="text-sm font-medium text-slate-400">{unit}</span>}
          </div>
          {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
        </div>

        {Icon && (
          <div className={`p-3 rounded-xl border ${colorStyles[color]} transition-transform duration-300 group-hover:scale-110`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>

      {trend !== undefined && trend !== null && (
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
          <div className={`flex items-center space-x-1 font-semibold px-2 py-0.5 rounded-full ${
            trend < 0 
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
              : trend > 0 
              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
              : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
          }`}>
            {trend < 0 ? <TrendingDown className="w-3.5 h-3.5" /> : trend > 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
            <span>{Math.abs(trend)}%</span>
          </div>
          <span className="text-slate-500 font-medium">{trendLabel || 'vs 3-mo moving avg'}</span>
        </div>
      )}
    </div>
  );
}
