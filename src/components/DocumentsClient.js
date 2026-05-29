'use client';

import { useState, useEffect, useRef } from 'react';
import { CloudUpload, Trash2, FileText, Loader2, CheckCircle, AlertCircle, Clock, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { documentsAPI } from '@/lib/api';

const STATUS = {
  ready:      { Icon: CheckCircle, label: 'Hazır',        cls: 'text-emerald-400 bg-emerald-950/40 border-emerald-900/60' },
  processing: { Icon: Loader2,     label: 'İşleniyor',    cls: 'text-amber-400 bg-amber-950/40 border-amber-900/60', spin: true },
  error:      { Icon: AlertCircle, label: 'Hata',         cls: 'text-red-400 bg-red-950/40 border-red-900/60' },
};

function Badge({ status }) {
  const { Icon, label, cls, spin } = STATUS[status] ?? STATUS.error;
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full border ${cls}`}>
      <Icon size={11} className={spin ? 'animate-spin' : ''} />{label}
    </span>
  );
}

const fmt = b => !b ? '-' : b < 1048576 ? `${(b/1024).toFixed(1)} KB` : `${(b/1048576).toFixed(1)} MB`;

export default function DocumentsClient() {
  const [docs, setDocs]         = useState([]);
  const [stats, setStats]       = useState(null);
  const [loading, setLoading]   = useState(true);
  const [uploading, setUpl]     = useState(false);
  const [progress, setProg]     = useState(0);
  const [dragging, setDrag]     = useState(false);
  const fileRef = useRef(null);
  const poll    = useRef(null);

  const load = async () => {
    try {
      const [d, s] = await Promise.all([documentsAPI.list(), documentsAPI.stats()]);
      setDocs(d.data.documents);
      setStats(s.data);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); poll.current = setInterval(load, 3000); return () => clearInterval(poll.current); }, []);

  const upload = async file => {
    if (!file) return;
    if (file.type !== 'application/pdf') return toast.error('Sadece PDF dosyaları yüklenebilir');
    if (file.size > 52428800) return toast.error("Dosya 50 MB'dan büyük olamaz");
    setUpl(true); setProg(0);
    try {
      const fd = new FormData(); fd.append('pdf', file);
      await documentsAPI.upload(fd, setProg);
      toast.success('PDF yüklendi, işleniyor...');
      load();
    } catch (e) { toast.error(e.response?.data?.error || 'Yükleme başarısız'); }
    finally { setUpl(false); setProg(0); }
  };

  const del = async doc => {
    if (!confirm(`"${doc.fileName}" silinsin mi?`)) return;
    try { await documentsAPI.delete(doc.id); toast.success('Silindi'); load(); }
    catch (e) { toast.error(e.response?.data?.error || 'Silinemedi'); }
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-950 scrollbar-thin">
      <div className="max-w-xl mx-auto px-4 py-5 sm:py-7">

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-lg font-bold">Belgeler</h1>
            <p className="text-xs text-gray-400 mt-0.5">PDF yükleyin, RAG sistemine ekleyin</p>
          </div>
          <button onClick={load} title="Yenile" className="p-2 text-gray-500 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
            <RefreshCw size={16} />
          </button>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-3 gap-2 mb-5">
            {[['Toplam', stats.totalDocuments, 'text-white'],
              ['Hazır',  stats.readyDocuments, 'text-emerald-400'],
              ['Chunk',  stats.totalChunks,    'text-blue-400']
            ].map(([l, v, c]) => (
              <div key={l} className="bg-gray-900 border border-gray-800 rounded-xl p-3 text-center">
                <p className={`text-xl font-bold ${c}`}>{v}</p>
                <p className="text-xs text-gray-500 mt-0.5">{l}</p>
              </div>
            ))}
          </div>
        )}

        {/* Upload zone */}
        <div
          onDragOver={e => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={e => { e.preventDefault(); setDrag(false); upload(e.dataTransfer.files[0]); }}
          onClick={() => !uploading && fileRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-7 text-center mb-5 transition-all duration-200 cursor-pointer
            ${dragging  ? 'border-blue-500 bg-blue-950/20 scale-[1.01]' :
              uploading ? 'border-gray-700 bg-gray-900 cursor-not-allowed opacity-70' :
                          'border-gray-700 hover:border-gray-500 bg-gray-900 hover:bg-gray-800/40'}`}>
          <input ref={fileRef} type="file" accept=".pdf" className="hidden"
            onChange={e => { if (e.target.files[0]) { upload(e.target.files[0]); e.target.value = ''; } }} />
          {uploading ? (
            <div className="space-y-3">
              <Loader2 size={30} className="mx-auto text-blue-400 animate-spin" />
              <p className="text-sm font-medium text-white">Yükleniyor... %{progress}</p>
              <div className="h-1.5 bg-gray-700 rounded-full max-w-[180px] mx-auto overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
            </div>
          ) : (
            <div className="space-y-1.5">
              <CloudUpload size={32} className={`mx-auto transition-colors ${dragging ? 'text-blue-400' : 'text-gray-500'}`} />
              <p className="text-sm font-medium text-white">PDF yükle</p>
              <p className="text-xs text-gray-500">Sürükle & bırak veya tıkla · Maks 50 MB</p>
            </div>
          )}
        </div>

        {/* List */}
        {loading ? (
          <div className="flex justify-center py-10"><Loader2 size={26} className="animate-spin text-blue-400" /></div>
        ) : docs.length === 0 ? (
          <div className="text-center py-10 bg-gray-900 border border-gray-800 rounded-2xl">
            <FileText size={34} className="mx-auto text-gray-700 mb-3" />
            <p className="text-sm text-gray-400 font-medium">Henüz belge yok</p>
            <p className="text-xs text-gray-600 mt-1">İlk PDF'nizi yükleyin</p>
          </div>
        ) : (
          <div className="space-y-2">
            {docs.map(doc => (
              <div key={doc.id}
                className="flex items-center gap-3 bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-xl p-3.5 transition-colors">
                <div className="w-9 h-9 bg-red-950/40 border border-red-900/40 rounded-lg flex items-center justify-center shrink-0">
                  <FileText size={17} className="text-red-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{doc.fileName}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {fmt(doc.size)}{doc.numPages > 0 ? ` · ${doc.numPages} sayfa` : ''}
                  </p>
                </div>
                <Badge status={doc.status} />
                <button onClick={() => del(doc)}
                  className="p-1.5 text-gray-600 hover:text-red-400 hover:bg-red-950/30 rounded-lg transition-colors shrink-0">
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
