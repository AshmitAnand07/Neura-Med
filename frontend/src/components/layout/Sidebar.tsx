'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  ScanLine, 
  Pill, 
  ShieldAlert, 
  Settings, 
  Mic, 
  LogOut,
  ShieldPlus
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { name: 'Prescription Scanner', icon: ScanLine, href: '/scanner' },
  { name: 'My Medicines', icon: Pill, href: '/medicines' },
  { name: 'Drug Interactions', icon: ShieldAlert, href: '/interactions' },
  { name: 'Voice Assistant', icon: Mic, href: '/voice' },
  { name: 'Alert Settings', icon: Settings, href: '/settings' },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-screen bg-white border-r border-slate-200 flex flex-col fixed left-0 top-0 z-40">
      <div className="p-6 flex items-center gap-3">
        <div className="p-2 bg-emerald-600 rounded-lg">
          <ShieldPlus className="text-white w-6 h-6" />
        </div>
        <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent">
          NeuraMed
        </span>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                ${isActive 
                  ? 'bg-emerald-50 text-emerald-700 font-semibold shadow-sm border border-emerald-100' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
            >
              <item.icon className={`w-5 h-5 transition-colors ${isActive ? 'text-emerald-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <button 
          onClick={() => {
            localStorage.removeItem('isLoggedIn');
            window.location.href = '/login';
          }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200 group"
        >
          <LogOut className="w-5 h-5 text-slate-400 group-hover:text-red-500" />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
