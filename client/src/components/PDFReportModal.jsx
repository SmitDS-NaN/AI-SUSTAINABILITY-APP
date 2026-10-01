import React, { useState } from 'react';
import { FileText, Printer, Download, X, Sparkles, Loader2 } from 'lucide-react';
import { aiAPI } from '../api';

export default function PDFReportModal({ isOpen, onClose }) {
  const [reportText, setReportText] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await aiAPI.generateReport();
      setReportText(res.data.reportMarkdown);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
      <div className="card-3d rounded-3xl max-w-3xl w-full p-6 relative space-y-5 max-h-[90vh] flex flex-col">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 rounded-lg">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 border-b border-slate-100 pb-4 shrink-0">
          <div className="p-3 bg-violet-100 text-violet-700 rounded-2xl border border-violet-200 shadow-sm">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900">Automated Monthly Sustainability PDF Report</h3>
            <p className="text-xs text-slate-500 font-medium">AI-generated executive narrative with deterministic carbon audit metrics</p>
          </div>
        </div>

        {!reportText && !loading ? (
          <div className="py-16 text-center space-y-4">
            <Sparkles className="w-12 h-12 text-violet-600 mx-auto animate-pulse" />
            <h4 className="text-base font-black text-slate-900">Ready to compile Monthly Executive Report</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto font-medium">
              Synthesizes 12 months of utility records, z-score anomaly evaluations, and active reduction targets into a formal printable document.
            </p>
            <button
              onClick={handleGenerate}
              className="btn-3d-violet font-bold text-xs px-6 py-3 rounded-xl"
            >
              Generate AI Report Narrative
            </button>
          </div>
        ) : loading ? (
          <div className="py-20 text-center space-y-3">
            <Loader2 className="w-10 h-10 text-violet-600 animate-spin mx-auto" />
            <p className="text-sm font-bold text-slate-600">Compiling executive report metrics with Gemini AI...</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto bg-slate-50 p-6 rounded-2xl border border-slate-200 font-mono text-xs text-slate-800 leading-relaxed whitespace-pre-wrap shadow-inner">
            {reportText}
          </div>
        )}

        {reportText && (
          <div className="flex justify-between items-center pt-3 border-t border-slate-100 shrink-0">
            <button onClick={handleGenerate} className="text-xs text-slate-500 hover:text-slate-900 flex items-center space-x-1 font-bold">
              <Sparkles className="w-3.5 h-3.5 text-violet-600" />
              <span>Regenerate Narrative</span>
            </button>

            <div className="flex space-x-3">
              <button onClick={onClose} className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-900">
                Close
              </button>
              <button
                onClick={handlePrint}
                className="btn-3d-primary font-bold text-xs px-5 py-2.5 rounded-xl flex items-center space-x-2"
              >
                <Printer className="w-4 h-4" />
                <span>Export / Print PDF</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
