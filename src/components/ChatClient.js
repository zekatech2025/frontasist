'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Loader2, Bot, User, FileText, AlertCircle, Sparkles, Trash2, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { chatAPI } from '@/lib/api';

function Bubble({ msg }) {
  const isBot = msg.role === 'assistant';
  return (
    <div className={`flex gap-2 sm:gap-3 ${isBot ? '' : 'flex-row-reverse'}`}>
      <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${isBot ? 'bg-blue-600' : 'bg-gray-700'}`}>
        {isBot ? <Bot size={14} /> : <User size={14} />}
      </div>
      <div className={`max-w-[84%] sm:max-w-[75%] space-y-2 ${isBot ? '' : 'items-end flex flex-col'}`}>
        <div className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap break-words ${
          isBot ? 'bg-gray-800 text-gray-100 rounded-tl-sm' : 'bg-blue-600 text-white rounded-tr-sm'
        }`}>{msg.content}</div>
        {isBot && msg.sources?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {msg.sources.map((s, i) => (
              <span key={i} className="inline-flex items-center gap-1 text-xs bg-gray-900 border border-gray-700 rounded-full px-2.5 py-1 text-gray-400 max-w-[180px]">
                <FileText size={10} className="shrink-0" />
                <span className="truncate">{s.fileName}</span>
                <span className="text-blue-400 font-semibold shrink-0">%{s.relevanceScore}</span>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Typing() {
  return (
    <div className="flex gap-2 sm:gap-3">
      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0 mt-0.5">
        <Bot size={14} />
      </div>
      <div className="bg-gray-800 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
        {[0,150,300].map(d => (
          <span key={d} className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"
            style={{ animationDelay: `${d}ms`, animationDuration: '1s' }} />
        ))}
      </div>
    </div>
  );
}

export default function ChatClient() {
  const [messages, setMessages]     = useState([]);
  const [input, setInput]           = useState('');
  const [loading, setLoading]       = useState(false);
  const [docs, setDocs]             = useState([]);
  const [selected, setSelected]     = useState(new Set());
  const [filterOpen, setFilterOpen] = useState(false);
  const [atBottom, setAtBottom]     = useState(true);

  const bottomRef = useRef(null);
  const inputRef  = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    chatAPI.availableDocuments().then(r => setDocs(r.data.documents)).catch(() => {});
  }, []);

  useEffect(() => {
    if (atBottom) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const onScroll = () => {
    const el = scrollRef.current;
    if (el) setAtBottom(el.scrollHeight - el.scrollTop - el.clientHeight < 80);
  };

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setMessages(p => [...p, { role: 'user', content: text }]);
    setInput('');
    setLoading(true);
    setAtBottom(true);
    try {
      const history = messages.slice(-6).map(m => ({ role: m.role, content: m.content }));
      const res = await chatAPI.send({ message: text, conversationHistory: history, documentIds: [...selected] });
      setMessages(p => [...p, { role: 'assistant', content: res.data.answer, sources: res.data.sources }]);
    } catch (err) {
      const msg = err.response?.data?.error || 'Yanıt alınamadı';
      toast.error(msg);
      setMessages(p => [...p, { role: 'assistant', content: `❌ ${msg}`, sources: [] }]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const toggle = id => setSelected(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const HINTS = ['Bu belgelerde ne var?', 'Kısa özet çıkar', 'Ana konular neler?'];

  return (
    <div className="flex flex-col h-full bg-gray-950 relative">

      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-900 border-b border-gray-800 shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles size={15} className="text-blue-400" />
          <span className="font-semibold text-sm sm:text-base">Sohbet</span>
          {docs.length > 0 && (
            <span className="text-xs bg-blue-950 text-blue-300 border border-blue-800/60 px-2 py-0.5 rounded-full">
              {docs.length} belge
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {docs.length > 1 && (
            <button onClick={() => setFilterOpen(p => !p)}
              className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border transition-colors ${
                filterOpen || selected.size > 0
                  ? 'border-blue-600 bg-blue-950 text-blue-300'
                  : 'border-gray-700 text-gray-400 hover:text-white'
              }`}>
              <FileText size={12} />
              {selected.size > 0 ? `${selected.size} seçili` : 'Filtre'}
            </button>
          )}
          {messages.length > 0 && (
            <button onClick={() => setMessages([])}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 transition-colors">
              <Trash2 size={13} /><span className="hidden sm:inline">Temizle</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter bar */}
      {docs.length > 1 && filterOpen && (
        <div className="px-4 py-2 bg-gray-900/90 border-b border-gray-800 shrink-0">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            <button onClick={() => setSelected(new Set())}
              className={`text-xs px-3 py-1.5 rounded-full shrink-0 border transition-colors ${
                selected.size === 0 ? 'bg-gray-700 text-white border-gray-600' : 'border-gray-700 text-gray-400 hover:text-white'
              }`}>Tümü</button>
            {docs.map(d => (
              <button key={d.id} onClick={() => toggle(d.id)}
                className={`text-xs px-3 py-1.5 rounded-full shrink-0 border transition-colors max-w-[150px] truncate ${
                  selected.has(d.id) ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-700 text-gray-400 hover:text-white'
                }`}>{d.fileName.replace('.pdf', '')}</button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div ref={scrollRef} onScroll={onScroll}
        className="flex-1 overflow-y-auto px-3 sm:px-4 py-5 space-y-4 scrollbar-thin">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4 gap-4">
            <div className="w-14 h-14 bg-blue-950 border border-blue-800/60 rounded-2xl flex items-center justify-center">
              <Bot size={28} className="text-blue-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-base mb-1">Belgelerinizle Sohbet Edin</h3>
              <p className="text-gray-500 text-sm max-w-xs leading-relaxed">
                {docs.length === 0 ? 'Önce Belgeler sekmesinden PDF yükleyin.' : 'Yüklediğiniz belgeler hakkında soru sorun.'}
              </p>
            </div>
            {docs.length === 0 && (
              <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-950/40 border border-amber-900/60 px-4 py-2.5 rounded-xl">
                <AlertCircle size={13} className="shrink-0" />Belgeler sekmesinden PDF ekleyin
              </div>
            )}
            {docs.length > 0 && (
              <div className="w-full max-w-xs space-y-2">
                {HINTS.map(q => (
                  <button key={q} onClick={() => { setInput(q); inputRef.current?.focus(); }}
                    className="w-full text-sm text-left text-gray-400 bg-gray-900 border border-gray-800 hover:border-gray-600 hover:text-white px-4 py-2.5 rounded-xl transition-colors">
                    {q}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            {messages.map((m, i) => <Bubble key={i} msg={m} />)}
            {loading && <Typing />}
          </>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Scroll-to-bottom */}
      {!atBottom && (
        <button onClick={() => { setAtBottom(true); bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }}
          className="absolute bottom-20 right-4 w-8 h-8 bg-gray-800 border border-gray-700 rounded-full flex items-center justify-center shadow-lg hover:bg-gray-700 transition-colors z-10">
          <ChevronDown size={16} className="text-gray-300" />
        </button>
      )}

      {/* Input */}
      <div className="px-3 sm:px-4 py-3 border-t border-gray-800 bg-gray-900 shrink-0">
        <div className="flex gap-2 max-w-3xl mx-auto">
          <textarea ref={inputRef} value={input} rows={1}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="Soru sorun..."
            className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-3.5 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all resize-none leading-relaxed"
            style={{ minHeight: '42px', maxHeight: '112px' }} />
          <button onClick={send} disabled={!input.trim() || loading}
            className="w-10 h-10 sm:w-11 sm:h-11 bg-blue-600 hover:bg-blue-500 active:scale-95 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-xl flex items-center justify-center transition-all shrink-0 self-end">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </div>
        <p className="text-center text-xs text-gray-700 mt-1.5 hidden sm:block">Enter gönder · Shift+Enter yeni satır</p>
      </div>
    </div>
  );
}
