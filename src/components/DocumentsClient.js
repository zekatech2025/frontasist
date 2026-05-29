'use client';

import { useState, useEffect, useRef } from 'react';
import { Upload, Trash2, FileText, Loader2, CheckCircle, AlertCircle, Clock, RefreshCw, CloudUpload } from 'lucide-react';
import toast from 'react-hot-toast';
import { documentsAPI } from '@/lib/api';

function StatusBadge({ status }) {
  const cfg = {
    ready:      { Icon: CheckCircle, label: 'Hazir',        cls: 'text-emerald-400 bg-emerald-950/50 border-emerald-900' },
    processing: { Icon: Clock,       label: 'Isleniyor...', cls: 'text-amber-400 bg-amber-950/50 border-amber-900' },
    error:      { Icon: AlertCircle, label: 'Hata',         cls: 'text-red-400 bg-red-950/50 border-red-900' },
  };
  const { Icon, label, cls } = cfg[status] ?? cfg.error;
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full border ${cls}`}>
      {status === 'processing'
        ? <Loader2 size={11} className="animate-spin" />
        : <Icon size={11} />}
      {label}
    </span>
  );
}

function formatSize(bytes) {
  if (!bytes) return '-';
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function DocumentsClient() {
  const [documents, setDocuments] = useState([]);
  const [stats, setStats]         = useState(null);
  const [loading, setLoading]     = useState(true);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress]   = useState(0);
  const [dragging, setDragging]   = useState(false);
  const fileRef = useRef(null);
  const pollRef = useRef(null);

  const loadData = async () => {
    try {
      const [docsRes, statsRes] = await Promise.all([documentsAPI.list(), documentsAPI.stats()]);
      setDocuments(docsRes.data.documents);
      setStats(statsRes.data);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  useEffect(() => {
    loadData();
    pollRef.current = setInterval(loadData, 3000);
    return () => clearInterval(pollRef.current);
  }, []);

  const handleUpload = async (file) => {
    if (!file) return;
    if (file.type !== 'application/pdf') return toast.error('Sadece PDF dosyalari yuklenebilir');
    if (file.size > 50 * 1024 * 1024) return toast.error("Dosya 50 MB'dan buyuk olamaz");
    setUploading(true); setProgress(0);
    try {
      const fd = new FormData();
      fd.append('pdf', file);
      await documentsAPI.upload(fd, setProgress);
      toast.success('PDF yuklendi, isleniyor...');
      await loadData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Yukleme basarisiz');
    } finally { setUploading(false); setProgress(0); }
  };

  const handleDelete = async (doc) => {
    if (!confirm(`"${doc.fileName}" silinsin mi?`)) return;
    try {
      await documentsAPI.delete(doc.id);
      toast.success('Belge silindi');
      await loadData();
    } catch (err) { toast.error(err.response?.data?.error || 'Silme basarisiz'); }
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-950 scrollbar-thin">
      <div className="max-w-2xl mx-auto px-4 py-5 sm:py-7">

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-white">Belgeler</h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-0.5">PDF yukleyin ve RAG sistemine ekleyin</p>
          </div>
          <button onClick={loadData} className="p-2 text-gray-500 hover:text-white transition-colors rounded-lg hover:bg-gray-800" title="Yenile">
            <RefreshCw size={17} />
          </button>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-5">
            {[
              { label: 'Toplam', value: stats.totalDocuments, color: 'text-white' },
              { label: 'Hazir',  value: stats.readyDocuments, color: 'text-emerald-400' },
              { label: 'Chunk',  value: stats.totalChunks,    color: 'text-blue-400' },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-gray-900 rounded-xl p-3 sm:p-4 border border-gray-800 text-center">
                <div className={`text-xl sm:text-2xl font-bold ${color}`}>{value}</div>
                <div className="text-xs text-gray-500 mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Upload area */}
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => { e.preventDefault(); setDragging(false); handleUpload(e.dataTransfer.files[0]); }}
          onClick={() => !uploading && fileRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all duration-200 mb-5 ${
            dragging  ? 'border-blue-500 bg-blue-950/30 scale-[1.01]' :
            uploading ? 'border-gray-700 bg-gray-900 cursor-not-allowed opacity-80' :
                        'border-gray-700 hover:border-gray-500 bg-gray-900 hover:bg-gray-800/50'
          }`}>
          <input ref={fileRef} type="file" accept=".pdf" className="hidden"
            onChange={e => { if (e.target.files[0]) { handleUpload(e.target.files[0]); e.target.value = ''; } }} />

          {uploading ? (
            <div className="space-y-3">
              <Loader2 size={32} className="mx-auto text-blue-400 animate-spin" />
              <p className="text-white font-medium text-sm">Yukleniyor... %{progress}</p>
              <div className="w-full max-w-[200px] mx-auto bg-gray-700 rounded-full h-1.5">
                <div className="bg-blue-500 h-1.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <CloudUpload size={36} className={`mx-auto transition-colors ${dragging ? 'text-blue-400' : 'text-gray-500'}`} />
              <p className="text-white font-medium text-sm sm:text-base">PDF yukleyin</p>
              <p className="text-gray-500 text-xs sm:text-sm">Surukle birak ya da tikla · Maks. 50 MB</p>
            </div>
          )}
        </div>

        {/* List */}
        {loading ? (
          <div className="text-center py-10">
            <Loader2 size={28} className="animate-spin text-blue-400 mx-auto" />
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-10 bg-gray-900 rounded-2xl border border-gray-800">
            <FileText size={36} className="mx-auto text-gray-700 mb-3" />
            <p className="text-gray-400 font-medium text-sm">Henuz belge yok</p>
            <p className="text-gray-600 text-xs mt-1">Ilk PDF'nizi yukleyin</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {documents.map(doc => (
              <div key={doc.id}
                className="flex items-center gap-3 bg-gray-900 rounded-xl p-3.5 sm:p-4 border border-gray-800 hover:border-gray-700 transition-colors">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-red-950/50 border border-red-900/50 rounded-lg flex items-center justify-center shrink-0">
                  <FileText size={18} className="text-red-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm truncate">{doc.fileName}</p>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
                    <span>{formatSize(doc.size)}</span>
                    {doc.numPages > 0 && <><span>·</span><span>{doc.numPages} sayfa</span></>}
                  </div>
                </div>
                <StatusBadge status={doc.status} />
                <button onClick={() => handleDelete(doc)}
                  className="p-2 text-gray-600 hover:text-red-400 transition-colors rounded-lg hover:bg-red-950/30 shrink-0" title="Sil">
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
