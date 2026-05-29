'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Loader2, Bot, User, FileText, AlertCircle, Sparkles, Trash2, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { chatAPI } from '@/lib/api';

function MessageBubble({ msg }) {
  const isBot = msg.role === 'assistant';
  return (
    <div className={`flex gap-2 sm:gap-3 ${isBot ? '' : 'flex-row-reverse'}`}>
      <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${isBot ? 'bg-blue-600' : 'bg-gray-700'}`}>
        {isBot ? <Bot size={14} /> : <User size={14} />}
      </div>
      <div className={`max-w-[85%] sm:max-w-[78%] space-y-2 ${isBot ? '' : 'items-end flex flex-col'}`}>
        <div className={`rounded-2xl px-3.5 py-2.5 sm:px-4 sm:py-3 text-sm leading-relaxed whitespace-pre-wrap break-words ${
          isBot ? 'bg-gray-800 text-gray-100 rounded-tl-sm' : 'bg-blue-600 text-white rounded-tr-sm'
        }`}>{msg.content}</div>
        {isBot && msg.sources?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {msg.sources.map((src, i) => (
              <div key={i} className="flex items-center gap-1 text-xs bg-gray-900 border border-gray-700 rounded-full px-2.5 py-1 text-gray-400 max-w-[200px]">
                <FileText size={10} className="shrink-0" />
                <span className="truncate">{src.fileName}</span>
                <span className="text-blue-400 font-semibold shrink-0">%{src.relevanceScore}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-2 sm:gap-3">
      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0 mt-0.5"><Bot size={14} /></div>
      <div className="bg-gray-800 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
        {[0,150,300].map(d => (
          <span key={d} className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{animationDelay:`${d}ms`,animationDuration:'1s'}} />
        ))}
      </div>
    </div>
  );
}

export default function ChatClient() {
  const [messages, setMessages]     = useState([]);
  const [input, setInput]           = useState('');
  const [loading, setLoading]       = useState(false);
  const [availableDocs, setAvailDocs] = useState([]);
  const [selectedDocs, setSelDocs]  = useState(new Set());
  const [filterOpen, setFilterOpen] = useState(false);
  const [showScrollBtn, setScrollBtn] = useState(false);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    chatAPI.availableDocuments().then(r => setAvailDocs(r.data.documents)).catch(() => {});
  }, []);

  const scrollToBottom = useCallback((smooth = true) => {
    bottomRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'instant' });
  }, []);

  useEffect(() => { if (!loading) scrollToBottom(); }, [messages, loading]);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setScrollBtn(el.scrollHeight - el.scrollTop - el.clientHeight > 120);
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setInput('');
    setLoading(true);
    scrollToBottom();
    try {
      const history = messages.slice(-6).map(m => ({ role: m.role, content: m.content }));
      const res = await chatAPI.send({ message: text, conversationHistory: history, documentIds: [...selectedDocs] });
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.answer, sources: res.data.sources }]);
    } catch (err) {
      const msg = err.response?.data?.error || 'Yanit alinamadi';
      toast.error(msg);
      setMessages(prev => [...prev, { role: 'assistant', content: `Hata: ${msg}`, sources: [] }]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const toggleDoc = (id) => setSelDocs(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const hasFilter = availableDocs.length > 1;

  return (
    <div className="flex flex-col h-full bg-gray-950 relative">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 bg-gray-900 shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-blue-400 shrink-0" />
          <span className="font-semibold text-sm sm:text-base">Sohbet</span>
          {availableDocs.length > 0 && (
            <span className="text-xs bg-blue-950 text-blue-300 border border-blue-800 px-2 py-0.5 rounded-full">{availableDocs.length} belge</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {hasFilter && (
            <button onClick={() => setFilterOpen(p => !p)}
              className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border transition-colors ${filterOpen || selectedDocs.size > 0 ? 'border-blue-600 bg-blue-950 text-blue-300' : 'border-gray-700 text-gray-400 hover:text-white'}`}>
              <FileText size={12} />
              {selectedDocs.size > 0 ? `${selectedDocs.size} secili` : 'Filtrele'}
            </button>
          )}
          {messages.length > 0 && (
            <button onClick={() => setMessages([])} className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 transition-colors px-2 py-1.5">
              <Trash2 size={13} /><span className="hidden sm:inline">Temizle</span>
            </button>
          )}
        </div>
      </div>

      {hasFilter && filterOpen && (
        <div className="px-4 py-2.5 border-b border-gray-800 bg-gray-900/80 shrink-0">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-0.5">
            <button onClick={() => setSelDocs(new Set())}
              className={`text-xs px-3 py-1.5 rounded-full shrink-0 border transition-colors ${selectedDocs.size === 0 ? 'bg-gray-700 text-white border-gray-600' : 'border-gray-700 text-gray-400 hover:text-white'}`}>
              Tumü
            </button>
            {availableDocs.map(doc => (
              <button key={doc.id} onClick={() => toggleDoc(doc.id)}
                className={`text-xs px-3 py-1.5 rounded-full shrink-0 border transition-colors max-w-[160px] truncate ${selectedDocs.has(doc.id) ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-700 text-gray-400 hover:text-white'}`}>
                {doc.fileName.replace('.pdf', '')}
              </button>
            ))}
          </div>
        </div>
      )}

      <div ref={scrollRef} onScroll={handleScroll} className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 scrollbar-thin">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-blue-950 border border-blue-800 rounded-2xl flex items-center justify-center mb-4">
              <Bot size={28} className="text-blue-400" />
            </div>
            <h3 className="text-white font-semibold text-base sm:text-lg mb-2">Belgelerinizle Sohbet Edin</h3>
            <p className="text-gray-500 text-sm max-w-xs leading-relaxed">
              {availableDocs.length === 0 ? 'Once Belgeler sekmesinden PDF yukleyin.' : 'Yuklenen belgeler hakkinda sorularinizi sorun.'}
            </p>
            {availableDocs.length === 0 && (
              <div className="mt-4 flex items-center gap-2 text-xs text-amber-400 bg-amber-950/50 border border-amber-900 px-4 py-2.5 rounded-xl">
                <AlertCircle size={14} className="shrink-0" /> Belgeler sekmesinden PDF ekleyin
              </div>
            )}
            {availableDocs.length > 0 && (
              <div className="mt-6 grid grid-cols-1 gap-2 w-full max-w-xs">
                {['Bu belgelerde ne var?', 'Özet çıkar', 'Ana konular neler?'].map(q => (
                  <button key={q} onClick={() => { setInput(q); inputRef.current?.focus(); }}
                    className="text-sm text-gray-400 bg-gray-900 border border-gray-800 hover:border-gray-600 hover:text-white px-4 py-2.5 rounded-xl transition-colors text-left">
                    {q}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        {messages.map((msg, i) => <MessageBubble key={i} msg={msg} />)}
        {loading && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {showScrollBtn && (
        <button onClick={() => scrollToBottom()}
          className="absolute bottom-20 right-4 w-9 h-9 bg-gray-800 border border-gray-700 rounded-full flex items-center justify-center shadow-lg hover:bg-gray-700 transition-colors z-10">
          <ChevronDown size={18} className="text-gray-300" />
        </button>
      )}

      <div className="px-3 sm:px-4 py-3 sm:py-4 border-t border-gray-800 bg-gray-900 shrink-0">
        <div className="flex gap-2 sm:gap-3 max-w-3xl mx-auto">
          <textarea ref={inputRef} value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            placeholder="Soru sorun..."
            rows={1}
            className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-3.5 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all resize-none text-sm leading-relaxed"
            style={{minHeight:'44px',maxHeight:'120px'}} />
          <button onClick={sendMessage} disabled={!input.trim() || loading}
            className="w-11 h-11 sm:w-12 sm:h-12 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-xl flex items-center justify-center transition-colors shrink-0 self-end">
            {loading ? <Loader2 size={17} className="animate-spin" /> : <Send size={17} />}
          </button>
        </div>
        <p className="text-center text-xs text-gray-700 mt-2 hidden sm:block">Enter ile gönder · Shift+Enter yeni satır</p>
      </div>
    </div>
  );
}
