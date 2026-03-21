import './globals.css';
import { ReactNode } from 'react';

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
    <html lang="en">
      <body className="bg-white min-h-screen antialiased text-slate-900 scroll-smooth">
          {children}
      </body>
    </html>
  );
}
