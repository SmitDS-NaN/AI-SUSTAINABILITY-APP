import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import TiltCard from './TiltCard';

export default function MetricCard({ title, value, unit, trend, trendLabel, icon: Icon, color = 'emerald', subtitle }) {
  const colorStyles = {
    emerald: 'text-emerald-600 bg-emerald-50 border-emerald-200/80',
    cyan: 'text-cyan-600 bg-cyan-50 border-cyan-200/80',
    amber: 'text-amber-600 bg-amber-50 border-amber-200/80',
    violet: 'text-violet-600 bg-violet-50 border-violet-200/80'
  };

  return (
    <TiltCard className="p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">{title}</p>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-black text-slate-900 tracking-tight">{value}</span>
            {unit && <span className="text-xs font-bold text-slate-500">{unit}</span>}
          </div>
          {subtitle && <p className="text-xs font-medium text-slate-500 mt-1">{subtitle}</p>}
        </div>

        {Icon && (
          <div className={`p-3 rounded-2xl border ${colorStyles[color]} transition-transform duration-300 group-hover:scale-110 shadow-sm`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>

      {trend !== undefined && trend !== null && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <div className={`flex items-center space-x-1 font-bold px-2.5 py-0.5 rounded-full ${
            trend < 0
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : trend > 0
              ? 'bg-rose-50 text-rose-700 border border-rose-200'
              : 'bg-slate-100 text-slate-600 border border-slate-200'
          }`}>
            {trend < 0 ? <TrendingDown className="w-3.5 h-3.5" /> : trend > 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
            <span>{Math.abs(trend)}%</span>
          </div>
          <span className="text-slate-400 font-medium text-[11px]">{trendLabel || 'vs moving avg'}</span>
        </div>
      )}
    </TiltCard>
  );
}
