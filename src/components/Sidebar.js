'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { Brain, MessageSquare, FileText, LogOut, Menu, X } from 'lucide-react';

export default function Sidebar({ user }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const logout = () => {
    Cookies.remove('rag_token');
    Cookies.remove('rag_user');
    router.push('/login');
    router.refresh();
  };

  const navItems = [
    { href: '/chat', icon: MessageSquare, label: 'Sohbet' },
    { href: '/documents', icon: FileText, label: 'Belgeler' },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-gray-900 border-r border-gray-800 w-64">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-800">
        <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
          <Brain size={20} />
        </div>
        <div>
          <h1 className="text-base font-bold">RAG Asistan</h1>
          <p className="text-xs text-gray-500">Gemini 1.5 Flash</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href} href={href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-3 py-4 border-t border-gray-800">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center text-sm font-bold">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
        >
          <LogOut size={18} /> Çıkış Yap
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <div className="hidden lg:flex">
        <SidebarContent />
      </div>

      {/* Mobile toggle */}
      <div className="lg:hidden">
        <button
          onClick={() => setOpen(true)}
          className="fixed top-3 left-3 z-40 p-2 bg-gray-900 rounded-lg border border-gray-700"
        >
          <Menu size={20} />
        </button>

        {open && (
          <>
            <div className="fixed inset-0 bg-black/60 z-40" onClick={() => setOpen(false)} />
            <div className="fixed inset-y-0 left-0 z-50 flex">
              <SidebarContent />
              <button className="absolute top-4 right-[-40px] p-2 text-white" onClick={() => setOpen(false)}>
                <X size={20} />
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
