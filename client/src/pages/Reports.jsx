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
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <span>Automated Monthly Executive Reports</span>
          </h2>
          <p className="text-xs font-medium text-slate-500 mt-1">Generate, review, and export formal sustainability reports for executive leadership</p>
        </div>

        <div className="flex items-center space-x-3">
          {reportMarkdown && (
            <button
              onClick={handlePrint}
              className="btn-3d-primary font-bold text-xs px-4 py-2.5 rounded-xl flex items-center space-x-2 shrink-0"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Export PDF</span>
            </button>
          )}

          <button
            onClick={handleGenerateReport}
            disabled={loading}
            className="btn-3d-violet font-bold text-xs px-5 py-2.5 rounded-xl flex items-center space-x-2 shrink-0"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-white" />}
            <span>Compile AI Report Narrative</span>
          </button>
        </div>
      </div>

      {!reportMarkdown && !loading ? (
        <div className="card-3d p-16 text-center rounded-3xl space-y-4">
          <FileText className="w-16 h-16 text-violet-600 mx-auto opacity-90" />
          <h3 className="text-lg font-black text-slate-900">Generate Executive Sustainability Report</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto font-medium">
            Combines deterministic environmental calculations, z-score statistical anomaly evaluations, and strategic AI action plans into a single exportable document.
          </p>
          <button
            onClick={handleGenerateReport}
            className="btn-3d-violet font-bold text-xs px-6 py-3 rounded-xl mt-2"
          >
            Compile Report Now
          </button>
        </div>
      ) : loading ? (
        <div className="py-24 text-center space-y-3">
          <Loader2 className="w-10 h-10 text-violet-600 animate-spin mx-auto" />
          <p className="text-sm font-bold text-slate-600">Synthesizing organization environmental metrics with Gemini AI...</p>
        </div>
      ) : (
        <div className="card-3d p-8 rounded-3xl space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-black text-slate-900">Monthly Executive Report</h3>
              <p className="text-xs text-slate-500 font-mono font-medium">Generated on {new Date().toLocaleDateString()}</p>
            </div>
            <button
              onClick={handlePrint}
              className="btn-3d-primary font-bold text-xs px-4 py-2 rounded-xl flex items-center space-x-2"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Download PDF</span>
            </button>
          </div>

          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 font-mono text-xs text-slate-800 leading-relaxed whitespace-pre-wrap shadow-inner">
            {reportMarkdown}
          </div>
        </div>
      )}
    </div>
  );
}
