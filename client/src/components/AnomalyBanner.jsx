import React, { useState } from 'react';
import { AlertTriangle, Sparkles, X, CheckCircle2, ChevronRight, Loader2 } from 'lucide-react';
import { aiAPI } from '../api';
import { formatCO2 } from '../utils/formatters';

export default function AnomalyBanner({ anomalies = [], onRefresh }) {
  const [selectedAnomaly, setSelectedAnomaly] = useState(null);
  const [aiExplanation, setAiExplanation] = useState(null);
  const [loadingAi, setLoadingAi] = useState(false);

  if (!anomalies || anomalies.length === 0) return null;

  const topAnomaly = anomalies[0];

  const handleFetchAiExplanation = async (anomaly) => {
    setSelectedAnomaly(anomaly);
    setLoadingAi(true);
    try {
      const res = await aiAPI.explainAnomaly(anomaly);
      setAiExplanation(res.data.explanation);
    } catch (err) {
      console.error('Failed to fetch AI explanation:', err);
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <>
      <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-white border border-amber-300 rounded-2xl p-5 relative overflow-hidden shadow-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <div className="p-2.5 bg-amber-500/15 text-amber-700 rounded-xl border border-amber-300 shrink-0 mt-0.5 shadow-sm">
              <AlertTriangle className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-800 px-2 py-0.5 rounded border border-amber-300">
                  Statistical Anomaly Spike
                </span>
                <span className="text-xs text-slate-500 font-mono font-semibold">{topAnomaly.usage_date}</span>
              </div>
              <h4 className="text-sm font-black text-slate-900 mt-1">
                Unusual {topAnomaly.category.toUpperCase()} Consumption Spike Detected ({topAnomaly.quantity} {topAnomaly.unit})
              </h4>
              <p className="text-xs text-slate-600 mt-0.5">
                Spike is <strong className="text-amber-700 font-extrabold">+{topAnomaly.percentSpike}% higher</strong> than baseline average. Z-Score: <span className="font-mono font-bold text-slate-800">{topAnomaly.zScore}</span> (Impact: {formatCO2(topAnomaly.calculated_co2e)}).
              </p>
            </div>
          </div>

          <button
            onClick={() => handleFetchAiExplanation(topAnomaly)}
            className="btn-3d-violet text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg flex items-center space-x-2 shrink-0"
          >
            <Sparkles className="w-4 h-4 fill-white" />
            <span>AI Root Cause Diagnosis</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* AI Explanation Modal */}
      {selectedAnomaly && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-6 relative shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => { setSelectedAnomaly(null); setAiExplanation(null); }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 p-1.5 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 border-b border-slate-100 pb-4">
              <div className="p-3 bg-violet-50 text-violet-600 rounded-2xl border border-violet-200 shadow-sm">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">Gemini AI Anomaly Explanation</h3>
                <p className="text-xs font-semibold text-slate-500">
                  {selectedAnomaly.category.toUpperCase()} • {selectedAnomaly.quantity} {selectedAnomaly.unit} on {selectedAnomaly.usage_date}
                </p>
              </div>
            </div>

            {loadingAi ? (
              <div className="py-12 text-center space-y-3">
                <Loader2 className="w-8 h-8 text-amber-500 animate-spin mx-auto" />
                <p className="text-sm font-bold text-slate-700">Analyzing environmental signals with Gemini AI...</p>
              </div>
            ) : aiExplanation ? (
              <div className="space-y-4 text-xs sm:text-sm">
                <div>
                  <h5 className="font-extrabold text-amber-700 uppercase tracking-wider text-[11px] mb-2">Likely Physical & Operational Causes</h5>
                  <ul className="space-y-1.5">
                    {aiExplanation.likely_causes.map((cause, idx) => (
                      <li key={idx} className="flex items-start space-x-2 text-slate-700 bg-amber-50/50 p-2.5 rounded-xl border border-amber-200/60">
                        <span className="text-amber-700 font-extrabold shrink-0">{idx + 1}.</span>
                        <span className="font-medium">{cause}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h5 className="font-extrabold text-emerald-700 uppercase tracking-wider text-[11px] mb-2">Immediate Corrective Actions</h5>
                  <ul className="space-y-1.5">
                    {aiExplanation.recommended_actions.map((act, idx) => (
                      <li key={idx} className="flex items-start space-x-2 text-slate-700 bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-200/60">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="font-medium">{act}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-semibold">Evaluated Severity: <strong className="text-amber-700 font-extrabold">{aiExplanation.severity || 'Medium'}</strong></span>
                  <button
                    onClick={() => { setSelectedAnomaly(null); setAiExplanation(null); }}
                    className="btn-3d-secondary px-4 py-2 rounded-xl text-xs font-bold"
                  >
                    Acknowledge Alert
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </>
  );
}
