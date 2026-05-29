'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';
import { Brain, User, Mail, Lock, Loader2, Eye, EyeOff } from 'lucide-react';
import { authAPI } from '@/lib/api';

export default function RegisterPage() {
  const [form, setForm]         = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const router = useRouter();
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) return toast.error('Şifreler eşleşmiyor');
    if (form.password.length < 6)       return toast.error('Şifre en az 6 karakter olmalı');
    setLoading(true);
    try {
      const res = await authAPI.register({ name: form.name, email: form.email, password: form.password });
      Cookies.set('rag_token', res.data.token, { expires: 7 });
      Cookies.set('rag_user', JSON.stringify(res.data.user), { expires: 7 });
      router.push('/chat');
      router.refresh();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Kayıt yapılamadı');
    } finally {
      setLoading(false);
    }
  };

  const inp = "w-full bg-gray-800 border border-gray-700 rounded-xl py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/25 transition-all";

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">

        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-600/20">
            <Brain size={27} />
          </div>
          <h1 className="text-2xl font-bold">RAG Asistan</h1>
          <p className="text-gray-400 text-sm mt-1">Hemen başlayın</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 sm:p-8 shadow-xl">
          <h2 className="text-lg font-semibold mb-5">Hesap Oluştur</h2>
          <form onSubmit={handleSubmit} className="space-y-4">

            <div>
              <label className="block text-sm text-gray-300 font-medium mb-1.5">Ad Soyad</label>
              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                <input type="text" value={form.name} onChange={set('name')} placeholder="Adınız Soyadınız"
                  required autoComplete="name" className={`${inp} pl-9 pr-4`} />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-300 font-medium mb-1.5">Email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                <input type="email" value={form.email} onChange={set('email')} placeholder="ornek@email.com"
                  required autoComplete="email" className={`${inp} pl-9 pr-4`} />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-300 font-medium mb-1.5">Şifre</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                <input type={showPass ? 'text' : 'password'} value={form.password} onChange={set('password')}
                  placeholder="En az 6 karakter" required autoComplete="new-password" className={`${inp} pl-9 pr-10`} />
                <button type="button" onClick={() => setShowPass(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-300 font-medium mb-1.5">Şifre Tekrar</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                <input type={showPass ? 'text' : 'password'} value={form.confirm} onChange={set('confirm')}
                  placeholder="••••••••" required autoComplete="new-password" className={`${inp} pl-9 pr-4`} />
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full mt-1 bg-blue-600 hover:bg-blue-500 active:scale-[.98] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-md shadow-blue-600/20">
              {loading ? <><Loader2 size={16} className="animate-spin" />Kayıt yapılıyor...</> : 'Kayıt Ol'}
            </button>
          </form>

          <p className="text-center text-gray-500 text-sm mt-5">
            Zaten hesabınız var mı?{' '}
            <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">Giriş Yap</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
