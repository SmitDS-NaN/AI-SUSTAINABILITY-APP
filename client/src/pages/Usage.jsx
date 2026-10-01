import React, { useState, useEffect } from 'react';
import {
  Database,
  PlusCircle,
  UploadCloud,
  Trash2,
  Filter,
  Zap,
  Droplets,
  Flame,
  Trash,
  Calendar,
  IndianRupee,
  Loader2,
  Download,
  X
} from 'lucide-react';
import { usageAPI } from '../api';
import { formatINR, formatCO2, generateSampleCSV } from '../utils/formatters';
import CSVUploadModal from '../components/CSVUploadModal';

export default function Usage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);

  // Form State
  const [category, setCategory] = useState('electricity');
  const [quantity, setQuantity] = useState('');
  const [usageDate, setUsageDate] = useState(new Date().toISOString().split('T')[0]);
  const [costInr, setCostInr] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = categoryFilter !== 'all' ? { category: categoryFilter } : {};
      const res = await usageAPI.getLogs(params);
      setLogs(res.data.logs || []);
    } catch (err) {
      console.error('Failed to fetch logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [categoryFilter]);

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      await usageAPI.createLog({
        category,
        quantity: parseFloat(quantity),
        usage_date: usageDate,
        cost_inr: costInr ? parseFloat(costInr) : null,
        notes
      });
      setIsManualModalOpen(false);
      setQuantity('');
      setCostInr('');
      setNotes('');
      fetchLogs();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to record usage log');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this utility log entry?')) return;
    try {
      await usageAPI.deleteLog(id);
      setLogs(logs.filter(l => l.id !== id));
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const getCategoryIcon = (cat) => {
    switch (cat.toLowerCase()) {
      case 'electricity': return <Zap className="w-4 h-4 text-cyan-600" />;
      case 'water': return <Droplets className="w-4 h-4 text-blue-600" />;
      case 'fuel': return <Flame className="w-4 h-4 text-amber-600" />;
      case 'waste': return <Trash className="w-4 h-4 text-purple-600" />;
      default: return <Database className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <span>Utility & Resource Logs</span>
            <span className="text-xs bg-cyan-100 text-cyan-800 font-extrabold px-3 py-1 rounded-full border border-cyan-200">
              {logs.length} Entries
            </span>
          </h2>
          <p className="text-xs font-medium text-slate-500 mt-1">Log electricity, water, fuel, and waste to perform emission calculations</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsCsvModalOpen(true)}
            className="btn-3d-secondary text-xs px-4 py-2.5 rounded-xl flex items-center space-x-2 font-bold"
          >
            <UploadCloud className="w-4 h-4 text-emerald-600" />
            <span>Upload CSV</span>
          </button>

          <button
            onClick={() => setIsManualModalOpen(true)}
            className="btn-3d-primary text-xs px-4 py-2.5 rounded-xl flex items-center space-x-2 font-bold"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Manual Entry</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200 max-w-md shadow-inner">
        {['all', 'electricity', 'water', 'fuel', 'waste'].map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-4 py-1.5 rounded-xl text-xs font-extrabold capitalize transition-all ${
              categoryFilter === cat
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Data Table Container */}
      <div className="card-3d rounded-2xl overflow-hidden">
        {loading ? (
          <div className="py-16 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
            <p className="text-xs font-bold text-slate-600">Loading utility logs...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <Database className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-900">No utility logs found</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">Upload a CSV file or add manual entries to start tracking your carbon footprint.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50/90 text-slate-500 uppercase tracking-wider font-mono border-b border-slate-200">
                <tr>
                  <th className="p-4">Category</th>
                  <th className="p-4">Quantity</th>
                  <th className="p-4">Calculated CO₂e</th>
                  <th className="p-4">Cost (₹)</th>
                  <th className="p-4">Usage Date</th>
                  <th className="p-4">Notes</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors font-medium">
                    <td className="p-4 font-extrabold text-slate-900 flex items-center space-x-2 capitalize">
                      {getCategoryIcon(log.category)}
                      <span>{log.category}</span>
                    </td>
                    <td className="p-4 font-mono font-bold text-slate-800">
                      {log.quantity} {log.unit}
                    </td>
                    <td className="p-4 font-mono font-black text-emerald-600">
                      {formatCO2(log.calculated_co2e)}
                    </td>
                    <td className="p-4 font-mono font-bold text-cyan-600">
                      {log.cost_inr ? formatINR(log.cost_inr) : '—'}
                    </td>
                    <td className="p-4 font-mono text-slate-500">
                      {log.usage_date}
                    </td>
                    <td className="p-4 text-slate-500 max-w-xs truncate">
                      {log.notes || '—'}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDelete(log.id)}
                        className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Manual Entry Modal */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
          <div className="card-3d rounded-3xl max-w-md w-full p-6 relative space-y-4">
            <button onClick={() => setIsManualModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 rounded-lg">
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-emerald-600" />
              <span>Log Resource Consumption</span>
            </h3>

            {formError && (
              <div className="bg-rose-50 border border-rose-200 p-3 rounded-2xl text-rose-600 text-xs font-semibold">
                {formError}
              </div>
            )}

            <form onSubmit={handleManualSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">Resource Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white font-medium"
                >
                  <option value="electricity">Electricity (kWh)</option>
                  <option value="water">Water (kL)</option>
                  <option value="fuel">Fuel (Diesel/Gas in L)</option>
                  <option value="waste">Waste (kg)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">Quantity Consumed</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="e.g. 14500"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">Usage Date</label>
                <input
                  type="date"
                  required
                  value={usageDate}
                  onChange={(e) => setUsageDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">Cost in INR (Optional)</label>
                <input
                  type="number"
                  value={costInr}
                  onChange={(e) => setCostInr(e.target.value)}
                  placeholder="e.g. 125000"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">Notes / Operational Context</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Factory B expansion shift"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white font-medium"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-3d-primary px-5 py-2.5 text-xs font-bold rounded-xl"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Record Log Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSV Modal */}
      <CSVUploadModal
        isOpen={isCsvModalOpen}
        onClose={() => setIsCsvModalOpen(false)}
        onSuccess={fetchLogs}
      />
    </div>
  );
}
