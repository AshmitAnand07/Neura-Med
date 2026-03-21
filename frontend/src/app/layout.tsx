import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '../components/Navbar';
import { ReactNode } from 'react';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export const metadata = {
  title: 'NeuraMed | Your AI Health Companion',
  description: 'Manage prescriptions, detect interactions, and engage instantly with the NeuraMed Voice Assistant.',
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" className={inter.className}>
      <body className="bg-slate-50 min-h-screen antialiased text-slate-800 flex flex-col relative text-base pb-24 md:pb-0">
          
          <Navbar />
          
          {/* Main Application Rendering Viewport */}
          <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10">
             {children}
          </main>

      </body>
    </html>
  );
}
