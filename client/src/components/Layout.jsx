import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Database,
  Sparkles,
  MessageSquare,
  Target,
  FileText,
  PlusCircle,
  LogOut,
  Building2,
  Leaf,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import CSVUploadModal from './CSVUploadModal';
import PDFReportModal from './PDFReportModal';

export default function Layout({ children }) {
  const { user, organization, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/usage', label: 'Utility Data Logs', icon: Database },
    { path: '/recommendations', label: 'AI Action Plan', icon: Sparkles, badge: 'AI' },
    { path: '/chat', label: 'Ask Your Data', icon: MessageSquare, badge: 'Chat' },
    { path: '/goals', label: 'Reduction Targets', icon: Target },
    { path: '/reports', label: 'Monthly Reports', icon: FileText }
  ];

  return (
    <div className="min-h-screen bg-[#070A0F] text-slate-100 flex flex-col md:flex-row relative">
      {/* Background Ambient Neon Glows */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-slate-900/90 border-r border-slate-800/80 p-5 flex flex-col justify-between shrink-0 backdrop-blur-xl z-20">
        <div className="space-y-6">
          {/* Brand Logo */}
          <div className="flex items-center space-x-3 px-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-black shadow-glow-emerald">
              <Leaf className="w-6 h-6 fill-slate-950" />
            </div>
            <div>
              <h1 className="font-black text-lg tracking-tight text-white flex items-center gap-1">
                <span>EcoLedger</span>
                <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-bold px-1.5 py-0.5 rounded border border-emerald-500/30">PRO</span>
              </h1>
              <p className="text-[10px] text-slate-400 font-medium">Sustainability Copilot</p>
            </div>
          </div>

          {/* Org Switcher Badge */}
          <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl flex items-center justify-between">
            <div className="flex items-center space-x-2.5 overflow-hidden">
              <Building2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <div className="truncate">
                <p className="text-xs font-bold text-slate-200 truncate">{organization?.name || 'Apex Manufacturing'}</p>
                <p className="text-[10px] text-slate-500 truncate">{organization?.industry || 'Industrial'}</p>
              </div>
            </div>
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          </div>

          {/* Nav Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-glow-emerald font-extrabold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded-md ${
                      isActive ? 'bg-slate-950/20 text-slate-950 font-bold' : 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Quick Actions & User Footer */}
        <div className="space-y-3 pt-4 border-t border-slate-800/80">
          <button
            onClick={() => setIsCsvModalOpen(true)}
            className="w-full bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 hover:border-emerald-500/60 font-bold text-xs py-2.5 rounded-xl flex items-center justify-center space-x-2 transition-all shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Upload Utility CSV</span>
          </button>

          <div className="flex items-center justify-between px-2 text-xs">
            <div className="flex items-center space-x-2 truncate">
              <div className="w-7 h-7 rounded-full bg-slate-800 text-emerald-400 font-bold flex items-center justify-center border border-slate-700 text-xs shrink-0">
                {user?.full_name?.charAt(0) || 'A'}
              </div>
              <div className="truncate">
                <p className="font-bold text-slate-200 truncate">{user?.full_name || 'Alex Rivera'}</p>
                <p className="text-[10px] text-slate-500 truncate">{user?.role || 'Lead'}</p>
              </div>
            </div>
            <button
              onClick={logout}
              title="Logout"
              className="text-slate-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 z-10 overflow-y-auto">
        {/* Top App Bar */}
        <header className="h-16 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <p className="text-xs font-semibold text-slate-400">
              Workspace Isolation Active • <span className="text-slate-200 font-bold">{organization?.name}</span>
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs px-3.5 py-2 rounded-xl border border-slate-700 flex items-center space-x-1.5 transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-violet-400" />
              <span>Monthly PDF Report</span>
            </button>

            <button
              onClick={() => navigate('/usage')}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs px-3.5 py-2 rounded-xl flex items-center space-x-1.5 shadow-glow-emerald transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Log Resource Usage</span>
            </button>
          </div>
        </header>

        {/* Page Content Body */}
        <div className="p-6 max-w-7xl w-full mx-auto space-y-6 flex-1">
          {children}
        </div>
      </main>

      {/* CSV Upload Modal */}
      <CSVUploadModal
        isOpen={isCsvModalOpen}
        onClose={() => setIsCsvModalOpen(false)}
        onSuccess={() => {
          if (location.pathname === '/dashboard' || location.pathname === '/usage') {
            window.location.reload();
          }
        }}
      />

      {/* PDF Report Modal */}
      <PDFReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />
    </div>
  );
}
