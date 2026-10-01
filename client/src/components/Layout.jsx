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
  UploadCloud
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
    <div className="min-h-screen bg-light-mesh text-slate-900 flex flex-col md:flex-row relative selection:bg-emerald-500 selection:text-white">
      {/* Background Subtle Ambient Light Spots */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="fixed bottom-0 right-1/4 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="fixed top-1/3 right-10 w-[400px] h-[400px] bg-violet-500/4 rounded-full blur-[140px] pointer-events-none"></div>

      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-white/90 border-r border-slate-200/80 p-5 flex flex-col justify-between shrink-0 backdrop-blur-xl z-20 shadow-sm">
        <div className="space-y-6">
          {/* Brand Logo */}
          <div className="flex items-center space-x-3 px-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white font-black shadow-md">
              <Leaf className="w-6 h-6 fill-white" />
            </div>
            <div>
              <h1 className="font-black text-lg tracking-tight text-slate-900 flex items-center gap-1">
                <span>EcoLedger</span>
                <span className="text-[9px] bg-emerald-50 text-emerald-700 font-extrabold px-1.5 py-0.5 rounded border border-emerald-200">PRO</span>
              </h1>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Sustainability Copilot</p>
            </div>
          </div>

          {/* Org Switcher Badge */}
          <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-2xl flex items-center justify-between shadow-xs">
            <div className="flex items-center space-x-2.5 overflow-hidden">
              <Building2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <div className="truncate">
                <p className="text-xs font-black text-slate-900 truncate">{organization?.name || 'Apex Manufacturing'}</p>
                <p className="text-[10px] text-slate-500 font-medium truncate">{organization?.industry || 'Industrial'}</p>
              </div>
            </div>
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          </div>

          {/* Nav Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20 font-black'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[9px] font-mono uppercase font-bold px-1.5 py-0.5 rounded-md ${
                      isActive ? 'bg-white/20 text-white' : 'bg-violet-50 text-violet-700 border border-violet-200'
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
        <div className="space-y-3 pt-4 border-t border-slate-200/80">
          <button
            onClick={() => setIsCsvModalOpen(true)}
            className="w-full btn-3d-secondary py-2.5 text-xs font-bold flex items-center justify-center space-x-2"
          >
            <UploadCloud className="w-4 h-4 text-emerald-600" />
            <span>Upload Utility CSV</span>
          </button>

          <div className="flex items-center justify-between px-2 text-xs">
            <div className="flex items-center space-x-2 truncate">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-extrabold flex items-center justify-center border border-emerald-200 text-xs shrink-0">
                {user?.full_name?.charAt(0) || 'A'}
              </div>
              <div className="truncate">
                <p className="font-bold text-slate-900 truncate">{user?.full_name || 'Alex Rivera'}</p>
                <p className="text-[10px] font-medium text-slate-500 truncate">{user?.role || 'Lead'}</p>
              </div>
            </div>
            <button
              onClick={logout}
              title="Logout"
              className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 z-10 overflow-y-auto">
        {/* Top App Bar */}
        <header className="h-16 border-b border-slate-200/80 bg-white/70 backdrop-blur-md px-6 flex items-center justify-between shrink-0 shadow-2xs">
          <div className="flex items-center space-x-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            <p className="text-xs font-semibold text-slate-600">
              Workspace Isolation Active • <span className="text-slate-900 font-extrabold">{organization?.name}</span>
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="btn-3d-secondary px-3.5 py-2 text-xs font-bold flex items-center space-x-1.5"
            >
              <FileText className="w-3.5 h-3.5 text-violet-600" />
              <span>Monthly PDF Report</span>
            </button>

            <button
              onClick={() => navigate('/usage')}
              className="btn-3d-primary px-3.5 py-2 text-xs font-bold flex items-center space-x-1.5"
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
