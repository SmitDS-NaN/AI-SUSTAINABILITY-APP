import React from 'react';
import AIChatBox from '../components/AIChatBox';

export default function Chat() {
  return (
    <div className="space-y-4 font-sans">
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
          <span>Ask Your Data AI Copilot</span>
        </h2>
        <p className="text-xs font-medium text-slate-500 mt-1">Conversational interface with real-time organization utility data context injection</p>
      </div>

      <AIChatBox />
    </div>
  );
}
