import React from 'react';
import { Sparkles, CheckCircle, Clock, CircleDot, IndianRupee, Leaf } from 'lucide-react';
import { formatINR, formatCO2 } from '../utils/formatters';
import TiltCard from './TiltCard';

export default function RecommendationCard({ recommendation, onStatusChange }) {
  const { id, title, description, impact_co2, savings_inr, effort_level, status } = recommendation;

  const effortColors = {
    Low: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Medium: 'bg-amber-50 text-amber-700 border-amber-200',
    High: 'bg-violet-50 text-violet-700 border-violet-200'
  };

  const statusLabels = {
    pending: 'To Do',
    in_progress: 'In Progress',
    completed: 'Completed'
  };

  return (
    <TiltCard className="p-6 flex flex-col justify-between space-y-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border ${effortColors[effort_level] || effortColors.Low}`}>
            {effort_level || 'Medium'} Effort
          </span>
          
          {/* Status Badge Selector */}
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200/80">
            {['pending', 'in_progress', 'completed'].map((st) => (
              <button
                key={st}
                onClick={() => onStatusChange(id, st)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  status === st
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200 font-extrabold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {statusLabels[st]}
              </button>
            ))}
          </div>
        </div>

        <h4 className="text-base font-black text-slate-900 leading-snug flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-violet-600 shrink-0 mt-1" />
          <span>{title}</span>
        </h4>

        <p className="text-xs font-medium text-slate-600 leading-relaxed">
          {description}
        </p>
      </div>

      {/* Financial & Environmental ROI Tags */}
      <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-3 text-xs">
        <div className="bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-200/60 flex items-center space-x-2">
          <Leaf className="w-4 h-4 text-emerald-600 shrink-0" />
          <div>
            <p className="text-[10px] text-emerald-800 font-bold uppercase">CO₂ Savings</p>
            <p className="font-black text-emerald-700 text-sm">{formatCO2(impact_co2)}</p>
          </div>
        </div>

        <div className="bg-cyan-50/70 p-2.5 rounded-xl border border-cyan-200/60 flex items-center space-x-2">
          <IndianRupee className="w-4 h-4 text-cyan-600 shrink-0" />
          <div>
            <p className="text-[10px] text-cyan-800 font-bold uppercase">Financial ROI</p>
            <p className="font-black text-cyan-700 text-sm">{formatINR(savings_inr)}/yr</p>
          </div>
        </div>
      </div>
    </TiltCard>
  );
}
