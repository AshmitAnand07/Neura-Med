'use client';

import React from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from '../Navbar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <div className="pl-64 flex flex-col min-h-screen">
        <header className="sticky top-0 z-30 w-full overflow-hidden">
             {/* Navbar is already responsive and clean, using as sub-header */}
             <Navbar />
        </header>
        <main className="flex-1 p-8 animate-page-entry">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
