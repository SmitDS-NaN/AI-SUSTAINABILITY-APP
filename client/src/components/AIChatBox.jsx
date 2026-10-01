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
    <div className="glass-panel rounded-2xl flex flex-col h-[650px] overflow-hidden border border-slate-800 relative">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-gradient-to-tr from-violet-500 to-indigo-500 rounded-xl text-white shadow-glow-violet">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>EcoLedger "Ask Your Data" AI</span>
              <span className="text-[10px] bg-violet-500/20 text-violet-300 px-2 py-0.5 rounded-full border border-violet-500/30">Gemini 2.5</span>
            </h3>
            <p className="text-[11px] text-slate-400">Contextual intelligence trained on organization utility logs</p>
          </div>
        </div>

        <button
          onClick={() => setMessages([messages[0]])}
          className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 text-xs flex items-center space-x-1"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset Chat</span>
        </button>
      </div>

      {/* Messages Thread */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex items-start space-x-3 ${msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}
          >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
              msg.sender === 'user' ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-violet-600 text-white'
            }`}>
              {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
            </div>

            <div className={`max-w-[82%] rounded-2xl p-4 text-xs leading-relaxed ${
              msg.sender === 'user'
                ? 'bg-emerald-500 text-slate-950 font-medium rounded-tr-none shadow-md'
                : 'bg-slate-800/90 text-slate-100 border border-slate-700/70 rounded-tl-none space-y-2'
            }`}>
              {/* Basic markdown renderer simulation */}
              <div className="whitespace-pre-wrap font-sans">
                {msg.text}
              </div>
              <span className={`text-[10px] block text-right mt-1 ${msg.sender === 'user' ? 'text-slate-800' : 'text-slate-400'}`}>
                {msg.time}
              </span>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-violet-600 text-white flex items-center justify-center">
              <Sparkles className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-slate-800/90 text-slate-300 p-3.5 rounded-2xl text-xs flex items-center space-x-2 border border-slate-700/70">
              <Loader2 className="w-4 h-4 text-violet-400 animate-spin" />
              <span>Analyzing organization records & reasoning with Gemini...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="px-4 py-2 bg-slate-950/60 border-t border-slate-800/80 flex items-center space-x-2 overflow-x-auto no-scrollbar">
        <span className="text-[10px] uppercase font-bold text-slate-500 shrink-0">Prompts:</span>
        {samplePrompts.map((prompt, pIdx) => (
          <button
            key={pIdx}
            onClick={() => handleSend(prompt)}
            className="text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-2.5 py-1 rounded-full border border-slate-700 shrink-0 transition-colors"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="p-3 border-t border-slate-800 bg-slate-900 flex items-center space-x-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask anything about your utility footprint, anomaly causes, or ROI..."
          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
        />
        <button
          onClick={() => handleSend()}
          disabled={!input.trim() || loading}
          className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 text-white p-2.5 rounded-xl shadow-glow-violet transition-all shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
