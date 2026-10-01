import React, { useState } from 'react';
import { AlertTriangle, Sparkles, X, CheckCircle2, ChevronRight, Loader2 } from 'lucide-react';
import { aiAPI } from '../api';
import { formatCO2 } from '../utils/formatters';

export default function AnomalyBanner({ anomalies = [], onRefresh }) {
  const [selectedAnomaly, setSelectedAnomaly] = useState(null);
  const [aiExplanation, setAiExplanation] = useState(null);
  const [loadingAi, setLoadingAi] = useState(false);

  if (!anomalies || anomalies.length === 0) return null;

  const topAnomaly = anomalies[0]; // Show highest severity / recent

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
      <div className="bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-slate-900 border border-amber-500/30 rounded-2xl p-4 sm:p-5 relative overflow-hidden shadow-glow-amber">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/40 shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
                  Statistical Anomaly Spike
                </span>
                <span className="text-xs text-slate-400 font-mono">{topAnomaly.usage_date}</span>
              </div>
              <h4 className="text-sm font-bold text-white mt-1">
                Unusual {topAnomaly.category.toUpperCase()} Consumption Spike Detected ({topAnomaly.quantity} {topAnomaly.unit})
              </h4>
              <p className="text-xs text-slate-300 mt-0.5">
                Spike is <strong className="text-amber-300">+{topAnomaly.percentSpike}% higher</strong> than baseline average. Z-Score: <span className="font-mono">{topAnomaly.zScore}</span> (Impact: {formatCO2(topAnomaly.calculated_co2e)}).
              </p>
            </div>
          </div>

          <button
            onClick={() => handleFetchAiExplanation(topAnomaly)}
            className="flex items-center space-x-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg transition-all transform hover:scale-105 shrink-0"
          >
            <Sparkles className="w-4 h-4 fill-slate-950" />
            <span>AI Root Cause Diagnosis</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* AI Explanation Modal */}
      {selectedAnomaly && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-6 relative shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => { setSelectedAnomaly(null); setAiExplanation(null); }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 border-b border-slate-800 pb-4">
              <div className="p-3 bg-violet-500/10 text-violet-400 rounded-xl border border-violet-500/30">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Gemini AI Anomaly Explanation</h3>
                <p className="text-xs text-slate-400">
                  {selectedAnomaly.category.toUpperCase()} • {selectedAnomaly.quantity} {selectedAnomaly.unit} on {selectedAnomaly.usage_date}
                </p>
              </div>
            </div>

            {loadingAi ? (
              <div className="py-12 text-center space-y-3">
                <Loader2 className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
                <p className="text-sm font-semibold text-slate-300">Analyzing environmental signals with Gemini AI...</p>
              </div>
            ) : aiExplanation ? (
              <div className="space-y-4 text-xs sm:text-sm">
                <div>
                  <h5 className="font-bold text-amber-400 uppercase tracking-wider text-xs mb-2">Likely Physical & Operational Causes</h5>
                  <ul className="space-y-1.5">
                    {aiExplanation.likely_causes.map((cause, idx) => (
                      <li key={idx} className="flex items-start space-x-2 text-slate-300 bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/60">
                        <span className="text-amber-400 font-bold shrink-0">{idx + 1}.</span>
                        <span>{cause}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h5 className="font-bold text-emerald-400 uppercase tracking-wider text-xs mb-2">Immediate Corrective Actions</h5>
                  <ul className="space-y-1.5">
                    {aiExplanation.recommended_actions.map((act, idx) => (
                      <li key={idx} className="flex items-start space-x-2 text-slate-300 bg-emerald-950/30 p-2.5 rounded-lg border border-emerald-500/30">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{act}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-xs">
                  <span className="text-slate-500">Evaluated Severity: <strong className="text-amber-400">{aiExplanation.severity || 'Medium'}</strong></span>
                  <button
                    onClick={() => { setSelectedAnomaly(null); setAiExplanation(null); }}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-lg font-semibold"
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
