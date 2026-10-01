import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Bot, User, Loader2, RefreshCw } from 'lucide-react';
import { aiAPI } from '../api';

export default function AIChatBox() {
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: "Hello! I am **EcoLedger Copilot**, your AI sustainability intelligence assistant. I have full real-time access to your organization's utility logs, carbon metrics, and statistical anomaly history. Ask me anything about your footprint or cost reduction strategies!",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const samplePrompts = [
    "Why did our water usage spike in August?",
    "What is our electricity carbon footprint & total cost?",
    "Give me 3 fast initiatives to reduce CO2 emissions by 15%",
    "Explain our Q3 emissions increase"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg = {
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const res = await aiAPI.chat(query, messages);
      const botMsg = {
        sender: 'bot',
        text: res.data.reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      setMessages(prev => [...prev, {
        sender: 'bot',
        text: "I encountered an error querying your data metrics. Please verify backend service connectivity.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card-3d rounded-2xl flex flex-col h-[650px] overflow-hidden border border-slate-200 relative shadow-xl">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 bg-white/90 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-xl text-white shadow-md">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
              <span>EcoLedger "Ask Your Data" AI</span>
              <span className="text-[10px] bg-violet-50 text-violet-700 px-2 py-0.5 rounded-full border border-violet-200 font-bold">Gemini 2.5</span>
            </h3>
            <p className="text-[11px] font-medium text-slate-500">Contextual intelligence trained on organization utility logs</p>
          </div>
        </div>

        <button
          onClick={() => setMessages([messages[0]])}
          className="text-slate-500 hover:text-slate-900 p-1.5 rounded-lg hover:bg-slate-100 text-xs flex items-center space-x-1 font-bold"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset Chat</span>
        </button>
      </div>

      {/* Messages Thread */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex items-start space-x-3 ${msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}
          >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
              msg.sender === 'user' ? 'bg-emerald-500 text-white font-bold' : 'bg-violet-600 text-white'
            }`}>
              {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
            </div>

            <div className={`max-w-[82%] rounded-2xl p-4 text-xs leading-relaxed ${
              msg.sender === 'user'
                ? 'bg-emerald-600 text-white font-medium rounded-tr-none shadow-md'
                : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-none shadow-sm space-y-2 font-medium'
            }`}>
              <div className="whitespace-pre-wrap font-sans">
                {msg.text}
              </div>
              <span className={`text-[10px] block text-right mt-1 font-semibold ${msg.sender === 'user' ? 'text-emerald-100' : 'text-slate-400'}`}>
                {msg.time}
              </span>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-violet-600 text-white flex items-center justify-center shadow-sm">
              <Sparkles className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-white text-slate-700 p-3.5 rounded-2xl text-xs flex items-center space-x-2 border border-slate-200/80 shadow-sm font-semibold">
              <Loader2 className="w-4 h-4 text-violet-600 animate-spin" />
              <span>Analyzing organization records & reasoning with Gemini...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="px-4 py-2.5 bg-white border-t border-slate-100 flex items-center space-x-2 overflow-x-auto no-scrollbar">
        <span className="text-[10px] uppercase font-black text-slate-400 shrink-0">Prompts:</span>
        {samplePrompts.map((prompt, pIdx) => (
          <button
            key={pIdx}
            onClick={() => handleSend(prompt)}
            className="text-[11px] font-bold bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 px-3 py-1 rounded-full border border-slate-200 shrink-0 transition-colors"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="p-3 border-t border-slate-200 bg-white flex items-center space-x-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask anything about your utility footprint, anomaly causes, or ROI..."
          className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-violet-500 font-medium transition-colors"
        />
        <button
          onClick={() => handleSend()}
          disabled={!input.trim() || loading}
          className="btn-3d-violet text-white p-2.5 rounded-xl shadow-md transition-all shrink-0 disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
