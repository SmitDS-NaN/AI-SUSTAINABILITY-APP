import React from 'react';
import { Sparkles, ArrowRight, CheckCircle, Clock, CircleDot, IndianRupee, Leaf } from 'lucide-react';
import { formatINR, formatCO2 } from '../utils/formatters';

export default function RecommendationCard({ recommendation, onStatusChange }) {
  const { id, title, description, impact_co2, savings_inr, effort_level, status } = recommendation;

  const effortColors = {
    Low: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    Medium: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    High: 'bg-violet-500/10 text-violet-400 border-violet-500/30'
  };

  const statusIcons = {
    pending: <CircleDot className="w-3.5 h-3.5 text-amber-400" />,
    in_progress: <Clock className="w-3.5 h-3.5 text-cyan-400 animate-spin" />,
    completed: <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
  };

  const statusLabels = {
    pending: 'To Do',
    in_progress: 'In Progress',
    completed: 'Completed'
  };

  return (
    <div className="glass-panel glass-panel-hover rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between space-y-4 border border-slate-800">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border ${effortColors[effort_level] || effortColors.Low}`}>
            {effort_level || 'Medium'} Effort
          </span>
          
          {/* Status Badge Selector */}
          <div className="flex items-center space-x-1 bg-slate-900/90 p-1 rounded-lg border border-slate-800">
            {['pending', 'in_progress', 'completed'].map((st) => (
              <button
                key={st}
                onClick={() => onStatusChange(id, st)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                  status === st
                    ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {statusLabels[st]}
              </button>
            ))}
          </div>
        </div>

        <h4 className="text-base font-bold text-white leading-snug flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-violet-400 shrink-0 mt-1" />
          <span>{title}</span>
        </h4>

        <p className="text-xs text-slate-300 leading-relaxed">
          {description}
        </p>
      </div>

      {/* Financial & Environmental ROI Tags */}
      <div className="pt-4 border-t border-slate-800/80 grid grid-cols-2 gap-3 text-xs">
        <div className="bg-emerald-950/20 p-2.5 rounded-xl border border-emerald-500/20 flex items-center space-x-2">
          <Leaf className="w-4 h-4 text-emerald-400 shrink-0" />
          <div>
            <p className="text-[10px] text-slate-400 font-semibold uppercase">CO₂ Savings</p>
            <p className="font-extrabold text-emerald-400 text-sm">{formatCO2(impact_co2)}</p>
          </div>
        </div>

        <div className="bg-cyan-950/20 p-2.5 rounded-xl border border-cyan-500/20 flex items-center space-x-2">
          <IndianRupee className="w-4 h-4 text-cyan-400 shrink-0" />
          <div>
            <p className="text-[10px] text-slate-400 font-semibold uppercase">Financial ROI</p>
            <p className="font-extrabold text-cyan-400 text-sm">{formatINR(savings_inr)}/yr</p>
          </div>
        </div>
      </div>
    </div>
  );
}
