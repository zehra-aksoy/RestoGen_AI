"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { 
    href: "/dashboard", 
    label: "Panel", 
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ) 
  },
  { 
    href: "/envanter", 
    label: "Envanter", 
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ) 
  },
  { 
    href: "/siparis", 
    label: "Sipariş Listesi", 
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ) 
  },
  { 
    href: "/tarif", 
    label: "Sıfır-Atık Tarif", 
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ) 
  },
  { 
    href: "/tabak", 
    label: "Tabak Artığı", 
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
      </svg>
    ) 
  },
  { 
    href: "/ayarlar", 
    label: "Ayarlar", 
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ) 
  },
];

import { useState, useEffect } from "react";
import { loadRestogenSettings, type RestogenSettings } from "@/lib/restogen-settings";

export function Sidebar() {
  const pathname = usePathname();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [settings, setSettings] = useState<RestogenSettings | null>(null);

  useEffect(() => {
    setSettings(loadRestogenSettings());
  }, []);

  const chefName = settings?.name || "Şef";
  const initials = chefName.charAt(0).toUpperCase();

  return (
    <aside className="w-64 bg-sidebar flex-shrink-0 flex flex-col h-full shadow-2xl z-40 fixed lg:relative border-r border-sidebar/20">
      <div className="p-6 flex items-center justify-center border-b border-cream/10">
        <Link href="/dashboard" className="text-2xl font-serif font-bold text-cream tracking-wider flex items-center gap-1">
          RestoGen
          <span className="bg-[#133029] text-cream text-[1.1rem] px-2 py-0.5 rounded-lg shadow-inner ml-1 border border-black/20">AI</span>
        </Link>
      </div>

      <nav className="flex flex-col flex-1 p-4 gap-2 mt-4">
        {links.map(({ href, label, icon }) => {
          const active = pathname.startsWith(href) && (href !== '/dashboard' || pathname === '/dashboard');
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                active
                  ? "bg-sage/20 text-cream shadow-inset-sm border border-sage/30"
                  : "text-cream/70 hover:bg-cream/5 hover:text-cream"
              }`}
            >
              <div className={`${active ? "text-sage-light" : "text-cream/50"}`}>
                {icon}
              </div>
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="p-6 border-t border-cream/10 relative">
        {showProfileMenu && (
          <div className="absolute bottom-full left-6 w-52 mb-4 bg-white rounded-xl shadow-xl border border-black/5 overflow-hidden text-sm z-50 animate-in slide-in-from-bottom-2">
            <div className="px-4 py-3 border-b border-black/5 bg-gray-50/50">
              <p className="font-semibold text-ink line-clip-1" title={chefName}>{chefName}</p>
              <p className="text-xs text-ink-muted">Hesap Yönetimi</p>
            </div>
            <div className="flex flex-col py-1 text-ink-muted">
              <button className="text-left px-4 py-2 flex items-center gap-2 hover:bg-sage/10 hover:text-sage transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                Hesap Bilgileri
              </button>
              <button className="text-left px-4 py-2 flex items-center gap-2 hover:bg-sage/10 hover:text-sage transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                Profil Düzenle
              </button>
              <button className="text-left px-4 py-2 flex items-center gap-2 hover:bg-sage/10 hover:text-sage transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                Güvenlik
              </button>
            </div>
            <div className="border-t border-black/5 py-1 text-red-600">
              <button className="text-left px-4 py-2 w-full flex items-center gap-2 hover:bg-red-50 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                Çıkış Yap
              </button>
            </div>
          </div>
        )}

        <div 
          className="flex items-center gap-3 group cursor-pointer"
          onClick={() => setShowProfileMenu(!showProfileMenu)}
        >
          <div className="w-10 h-10 rounded-full bg-cream/10 flex items-center justify-center text-cream font-bold group-hover:bg-sage/40 transition-colors">
            {initials}
          </div>
          <div className="flex flex-col flex-1 overflow-hidden">
            <span className="text-sm font-medium text-cream truncate">{chefName}</span>
            <span className="text-xs text-cream/50">Tercihler</span>
          </div>
          <svg className={`w-4 h-4 flex-shrink-0 text-cream/30 transition-transform duration-300 ${showProfileMenu ? 'rotate-180 text-cream' : 'group-hover:text-cream/80'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </div>
      </div>
    </aside>
  );
}
