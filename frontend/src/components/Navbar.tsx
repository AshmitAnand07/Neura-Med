'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Activity, 
  LayoutDashboard, 
  Pill, 
  Mic, 
  Settings, 
  Scan, 
  Maximize, 
  Link as LinkIcon 
} from 'lucide-react';
import { useNeuraStore } from '../store';

/**
 * Mobile-First NeuraMed Bottom/Top Navigation Tab Bar.
 * Clean, lightweight, floating style. 
 */
export const Navbar = () => {
  const pathname = usePathname();
  const toggleVoiceUI = useNeuraStore(state => state.toggleVoiceUI);

  const navLinks = [
    { label: 'Activity', href: '/dashboard?tab=activity', icon: Activity },
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Fullscreen', href: '/dashboard#full', icon: Maximize },
    { label: 'Connect', href: '/dashboard#link', icon: LinkIcon },
    { label: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* 
        Desktop / Tablet Top Navigation 
      */}
      <nav className="hidden md:flex sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm w-full px-8 py-3 items-center justify-between">
         <div className="flex items-center gap-2">
            <div className="bg-primary-600 p-2 rounded-xl text-white shadow-glow">
               <Activity size={24} strokeWidth={2.5}/>
            </div>
            <Link href="/" className="text-xl font-extrabold tracking-tight text-gray-900 ml-1">
               Neura<span className="text-primary-600">Med</span>
            </Link>
         </div>

         <div className="flex items-center gap-6">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link 
                  key={link.label} 
                  href={link.href} 
                  className={`flex flex-col items-center group transition-all duration-300 ${isActive ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-900'}`}
                >
                  <div className={`p-2 rounded-xl transition-all duration-300 group-hover:bg-slate-50 group-hover:shadow-sm ${isActive ? 'bg-emerald-50 text-emerald-600 shadow-inner' : ''}`}>
                    <Icon size={20} className={`transition-transform duration-300 group-hover:scale-110 ${isActive ? 'stroke-[2.5px]' : ''}`} />
                  </div>
                  <span className={`text-[10px] font-bold mt-1 transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                     {link.label}
                  </span>
                </Link>
              );
            })}
         </div>
      </nav>

      {/* 
        Mobile Floating Bottom Navigation 
      */}
      <div className="md:hidden fixed bottom-4 left-4 right-4 z-40 bg-white/90 backdrop-blur-xl border border-gray-100 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] px-6 py-3 flex justify-between items-center">
         {navLinks.map((link) => {
              // We skip rendering "Scan" in the very center to make room for the floating AI Mic trigger
              if (link.label === 'Scan') return null;

              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link 
                  key={link.label} 
                  href={link.href} 
                  className={`flex flex-col items-center transition-colors ${isActive ? 'text-primary-600' : 'text-gray-400'}`}
                >
                  <Icon size={24} className={isActive ? 'fill-primary-50' : ''} />
                </Link>
              );
         })}
         
         {/* Central Floating Action AI Voice Trigger */}
         <button 
           onClick={() => toggleVoiceUI(true)}
           className="absolute left-1/2 -top-5 transform -translate-x-1/2 bg-primary-600 hover:bg-primary-500 shadow-glow text-white p-4 rounded-full transition-transform active:scale-95 z-50 ring-4 ring-white"
         >
            <Mic size={26} fill="white" />
         </button>
      </div>
    </>
  );
}
