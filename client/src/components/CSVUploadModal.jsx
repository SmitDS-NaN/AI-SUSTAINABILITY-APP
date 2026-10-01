import React, { useState } from 'react';
import { UploadCloud, FileText, Download, CheckCircle2, AlertCircle, X, Loader2 } from 'lucide-react';
import { usageAPI } from '../api';
import { generateSampleCSV } from '../utils/formatters';

export default function CSVUploadModal({ isOpen, onClose, onSuccess }) {
  const [csvRawText, setCsvRawText] = useState('');
  const [parsedRows, setParsedRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      setCsvRawText(text);
      parseCSVPreview(text);
    };
    reader.readAsText(file);
  };

  const parseCSVPreview = (text) => {
    try {
      const lines = text.trim().split('\n');
      if (lines.length <= 1) {
        setError('CSV file appears empty or lacks headers.');
        return;
      }
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const rows = [];
      for (let i = 1; i < lines.length && i <= 10; i++) {
        if (!lines[i].trim()) continue;
        const cols = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
        const obj = {};
        headers.forEach((h, idx) => { obj[h] = cols[idx]; });
        rows.push(obj);
      }
      setParsedRows(rows);
      setError(null);
    } catch (err) {
      setError('Failed to parse CSV format.');
    }
  };

  const handleDownloadSample = () => {
    const sample = generateSampleCSV();
    const blob = new Blob([sample], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ecoledger_utility_sample.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleSubmit = async () => {
    if (!csvRawText) return;
    setLoading(true);
    setError(null);
    try {
      await usageAPI.uploadCSV({ csvContent: csvRawText });
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to process CSV bulk ingestion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 relative shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 p-1.5 rounded-lg hover:bg-slate-100">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 border-b border-slate-100 pb-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-200 shadow-sm">
            <UploadCloud className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900">Bulk Utility CSV Data Ingestion</h3>
            <p className="text-xs font-semibold text-slate-500">Upload 12 months of utility logs for automated deterministic carbon calculation</p>
          </div>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl flex items-center space-x-2 text-rose-700 text-xs font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Drag & Drop Box */}
        <div className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-8 text-center bg-slate-50/70 transition-all cursor-pointer relative group">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />
          <FileText className="w-12 h-12 text-slate-400 group-hover:text-emerald-600 mx-auto transition-colors" />
          <p className="text-sm font-bold text-slate-800 mt-2">
            Click or Drag & Drop your CSV file here
          </p>
          <p className="text-xs font-medium text-slate-500 mt-1">Supports columns: category, quantity, unit, usage_date, cost_inr, notes</p>
        </div>

        {/* Download Sample Button */}
        <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
          <span className="text-slate-600 font-semibold">Need a sample template structure?</span>
          <button
            onClick={handleDownloadSample}
            className="flex items-center space-x-1.5 text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg hover:bg-emerald-100"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Sample CSV</span>
          </button>
        </div>

        {/* Preview Table */}
        {parsedRows.length > 0 && (
          <div>
            <h5 className="text-xs font-extrabold text-slate-500 mb-2 uppercase tracking-wider">Data Preview ({parsedRows.length} sample rows)</h5>
            <div className="overflow-x-auto max-h-40 border border-slate-200 rounded-xl bg-white">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-100 text-slate-700 font-mono font-bold">
                  <tr>
                    <th className="p-2">Category</th>
                    <th className="p-2">Quantity</th>
                    <th className="p-2">Date</th>
                    <th className="p-2">Cost (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedRows.map((r, idx) => (
                    <tr key={idx} className="border-t border-slate-100">
                      <td className="p-2 capitalize font-bold text-slate-900">{r.category || 'electricity'}</td>
                      <td className="p-2">{r.quantity} {r.unit}</td>
                      <td className="p-2 font-mono">{r.usage_date || r.date}</td>
                      <td className="p-2">₹{r.cost_inr || r.cost || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800">
            Cancel
          </button>
          <button
            disabled={!csvRawText || loading}
            onClick={handleSubmit}
            className="btn-3d-primary font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg flex items-center space-x-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            <span>Process & Calculate Footprint</span>
          </button>
        </div>
      </div>
    </div>
  );
}
