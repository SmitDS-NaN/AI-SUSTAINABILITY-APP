import React from 'react';
import AIChatBox from '../components/AIChatBox';

export default function Chat() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <span>Ask Your Data AI Copilot</span>
        </h2>
        <p className="text-xs text-slate-400">Conversational interface with real-time organization utility data context injection</p>
      </div>

      <AIChatBox />
    </div>
  );
}
