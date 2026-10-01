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
      case 'electricity': return <Zap className="w-4 h-4 text-cyan-400" />;
      case 'water': return <Droplets className="w-4 h-4 text-blue-400" />;
      case 'fuel': return <Flame className="w-4 h-4 text-amber-400" />;
      case 'waste': return <Trash className="w-4 h-4 text-purple-400" />;
      default: return <Database className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Utility & Resource Logs</span>
            <span className="text-xs bg-cyan-500/20 text-cyan-300 font-bold px-2 py-0.5 rounded border border-cyan-500/30">
              {logs.length} Entries
            </span>
          </h2>
          <p className="text-xs text-slate-400">Log electricity, water, fuel, and waste to perform emission calculations</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsCsvModalOpen(true)}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs px-4 py-2.5 rounded-xl flex items-center space-x-2 transition-all"
          >
            <UploadCloud className="w-4 h-4 text-emerald-400" />
            <span>Upload CSV</span>
          </button>

          <button
            onClick={() => setIsManualModalOpen(true)}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl shadow-glow-emerald flex items-center space-x-2 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Manual Entry</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800 max-w-md">
        {['all', 'electricity', 'water', 'fuel', 'waste'].map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
              categoryFilter === cat
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Data Table */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800">
        {loading ? (
          <div className="py-16 text-center space-y-2">
            <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mx-auto" />
            <p className="text-xs text-slate-400">Loading utility logs...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <Database className="w-12 h-12 text-slate-600 mx-auto" />
            <p className="text-sm font-bold text-white">No utility logs found</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">Upload a CSV file or add manual entries to start tracking your carbon footprint.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider font-mono border-b border-slate-800">
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
              <tbody className="divide-y divide-slate-800/80">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-bold text-white flex items-center space-x-2 capitalize">
                      {getCategoryIcon(log.category)}
                      <span>{log.category}</span>
                    </td>
                    <td className="p-4 font-mono font-semibold text-slate-200">
                      {log.quantity} {log.unit}
                    </td>
                    <td className="p-4 font-mono font-bold text-emerald-400">
                      {formatCO2(log.calculated_co2e)}
                    </td>
                    <td className="p-4 font-mono text-cyan-400">
                      {log.cost_inr ? formatINR(log.cost_inr) : '—'}
                    </td>
                    <td className="p-4 font-mono text-slate-400">
                      {log.usage_date}
                    </td>
                    <td className="p-4 text-slate-400 max-w-xs truncate">
                      {log.notes || '—'}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDelete(log.id)}
                        className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 relative shadow-2xl space-y-4">
            <button onClick={() => setIsManualModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg">
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-emerald-400" />
              <span>Log Resource Consumption</span>
            </h3>

            {formError && (
              <div className="bg-rose-500/10 border border-rose-500/30 p-2.5 rounded-xl text-rose-400 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleManualSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Resource Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="electricity">Electricity (kWh)</option>
                  <option value="water">Water (kL)</option>
                  <option value="fuel">Fuel (Diesel/Gas in L)</option>
                  <option value="waste">Waste (kg)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Quantity Consumed</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="e.g. 14500"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Usage Date</label>
                <input
                  type="date"
                  required
                  value={usageDate}
                  onChange={(e) => setUsageDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Cost in INR (Optional)</label>
                <input
                  type="number"
                  value={costInr}
                  onChange={(e) => setCostInr(e.target.value)}
                  placeholder="e.g. 125000"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Notes / Operational Context</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Factory B expansion shift"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg transition-all"
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
