'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { Brain, MessageSquare, FileText, LogOut, Menu, X, ChevronDown } from 'lucide-react';

const navItems = [
  { href: '/chat',      icon: MessageSquare, label: 'Sohbet'   },
  { href: '/documents', icon: FileText,      label: 'Belgeler' },
];

export default function Shell({ user, children }) {
  const pathname  = usePathname();
  const router    = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const logout = () => {
    Cookies.remove('rag_token');
    Cookies.remove('rag_user');
    router.push('/login');
    router.refresh();
  };

  return (
    <div className="flex h-dvh bg-gray-950 overflow-hidden">

      {/* ── DESKTOP SIDEBAR ─────────────────────────────── */}
      <aside className="hidden md:flex flex-col w-60 bg-gray-900 border-r border-gray-800 shrink-0">
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-800">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
            <Brain size={17} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold truncate">RAG Asistan</p>
            <p className="text-xs text-gray-500">Gemini 1.5 Flash</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-3 space-y-1">
          {navItems.map(({ href, icon: Icon, label }) => (
            <Link key={href} href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                pathname === href
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}>
              <Icon size={17} /> {label}
            </Link>
          ))}
        </nav>

        {/* User */}
        <div className="px-3 py-3 border-t border-gray-800">
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg mb-1">
            <div className="w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
            <LogOut size={16} /> Çıkış Yap
          </button>
        </div>
      </aside>

      {/* ── MOBILE HEADER ───────────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0">
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-gray-900 border-b border-gray-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
              <Brain size={15} />
            </div>
            <span className="text-sm font-bold">RAG Asistan</span>
          </div>

          {/* Mobile user menu */}
          <div className="relative">
            <button onClick={() => setUserMenuOpen(p => !p)}
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-800 transition-colors">
              <div className="w-7 h-7 bg-blue-700 rounded-full flex items-center justify-center text-xs font-bold">
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <ChevronDown size={14} className={`text-gray-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {userMenuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                <div className="absolute right-0 top-full mt-1 w-48 bg-gray-800 border border-gray-700 rounded-xl shadow-xl z-20 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-700">
                    <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                    <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                  </div>
                  <button onClick={() => { setUserMenuOpen(false); logout(); }}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-gray-700 transition-colors">
                    <LogOut size={15} /> Çıkış Yap
                  </button>
                </div>
              </>
            )}
          </div>
        </header>

        {/* ── PAGE CONTENT ──────────────────────────────── */}
        <main className="flex-1 overflow-hidden">
          {children}
        </main>

        {/* ── MOBILE BOTTOM NAV ─────────────────────────── */}
        <nav className="md:hidden flex border-t border-gray-800 bg-gray-900 shrink-0 safe-area-bottom">
          {navItems.map(({ href, icon: Icon, label }) => {
            const active = pathname === href;
            return (
              <Link key={href} href={href}
                className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors ${
                  active ? 'text-blue-400' : 'text-gray-500 hover:text-gray-300'
                }`}>
                <Icon size={20} strokeWidth={active ? 2.5 : 2} />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
