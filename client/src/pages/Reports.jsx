import React, { useState } from 'react';
import { FileText, Printer, Sparkles, Loader2 } from 'lucide-react';
import { aiAPI } from '../api';

export default function Reports() {
  const [reportMarkdown, setReportMarkdown] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerateReport = async () => {
    setLoading(true);
    try {
      const res = await aiAPI.generateReport();
      setReportMarkdown(res.data.reportMarkdown);
    } catch (err) {
      console.error('Failed to generate report:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Automated Monthly Executive Reports</span>
          </h2>
          <p className="text-xs text-slate-400">Generate, review, and export formal sustainability reports for executive leadership</p>
        </div>

        <div className="flex items-center space-x-3">
          {reportMarkdown && (
            <button
              onClick={handlePrint}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl shadow-glow-emerald flex items-center space-x-2 transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Export PDF</span>
            </button>
          )}

          <button
            onClick={handleGenerateReport}
            disabled={loading}
            className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-glow-violet flex items-center space-x-2 transition-all"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>Compile AI Report Narrative</span>
          </button>
        </div>
      </div>

      {!reportMarkdown && !loading ? (
        <div className="glass-panel p-16 text-center rounded-2xl space-y-4">
          <FileText className="w-16 h-16 text-violet-400 mx-auto opacity-80" />
          <h3 className="text-lg font-bold text-white">Generate Executive Sustainability Report</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Combines deterministic environmental calculations, z-score statistical anomaly evaluations, and strategic AI action plans into a single exportable document.
          </p>
          <button
            onClick={handleGenerateReport}
            className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-glow-violet transition-all"
          >
            Compile Report Now
          </button>
        </div>
      ) : loading ? (
        <div className="py-24 text-center space-y-3">
          <Loader2 className="w-10 h-10 text-violet-400 animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-300">Synthesizing organization environmental metrics with Gemini AI...</p>
        </div>
      ) : (
        <div className="glass-panel p-8 rounded-2xl border border-slate-800 space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-lg font-bold text-white">Monthly Executive Report</h3>
              <p className="text-xs text-slate-400 font-mono">Generated on {new Date().toLocaleDateString()}</p>
            </div>
            <button
              onClick={handlePrint}
              className="bg-emerald-500 text-slate-950 font-bold text-xs px-4 py-2 rounded-xl flex items-center space-x-2 shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Download PDF</span>
            </button>
          </div>

          <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 font-mono text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
            {reportMarkdown}
          </div>
        </div>
      )}
    </div>
  );
}
