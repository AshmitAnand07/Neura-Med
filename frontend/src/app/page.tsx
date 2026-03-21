'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Mic, 
  UploadCloud, 
  ShieldCheck, 
  Activity, 
  ArrowRight, 
  LayoutDashboard,
  Sparkles,
  Zap,
  Globe
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Navigation Header */}
      <header className="fixed top-0 w-full z-50 glass border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-emerald-600 rounded-lg">
                <ShieldCheck className="text-white w-6 h-6" />
             </div>
             <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent">
               NeuraMed
             </span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
             <Link href="#features" className="text-sm font-semibold text-slate-600 hover:text-emerald-700 transition-colors">Features</Link>
             <Link href="#mission" className="text-sm font-semibold text-slate-600 hover:text-emerald-700 transition-colors">Mission</Link>
             <Link href="/login" className="text-sm font-semibold text-slate-600 hover:text-emerald-700 transition-colors">Sign In</Link>
             <Link href="/register">
                <Button size="sm">Get Started</Button>
             </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8 animate-page-entry">
                <Badge variant="success" className="px-4 py-1 gap-2 text-sm">
                    <Sparkles className="w-3.5 h-3.5" /> Next-Gen Health AI
                </Badge>
                <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-[1.1]">
                    The Intelligent <br/>
                    <span className="text-emerald-600">Shield</span> for Your <br/>
                    Health.
                </h1>
                <p className="text-xl text-slate-500 max-w-lg leading-relaxed font-medium">
                    Digitize your prescriptions in seconds, prevent drug interactions with clinical-grade AI, and manage your health using voice.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                    <Link href="/register">
                        <Button size="lg" className="px-10 py-5 text-lg shadow-xl shadow-emerald-200">
                            Create Free Account
                        </Button>
                    </Link>
                    <Link href="/login">
                        <Button variant="outline" size="lg" className="px-10 py-5 text-lg">
                            Login to Portal
                        </Button>
                    </Link>
                </div>
                <div className="flex items-center gap-6 pt-4 text-slate-400">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
                        <Zap size={14} className="text-amber-500" /> Real-time
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
                        <Globe size={14} className="text-blue-500" /> Multi-lingual
                    </div>
                </div>
            </div>

            <div className="relative group lg:block hidden">
                <div className="absolute -inset-4 bg-emerald-100/50 rounded-[3rem] blur-3xl group-hover:bg-emerald-200/50 transition-all duration-700" />
                <div className="relative bg-white border border-slate-100 rounded-[3rem] p-10 shadow-2xl overflow-hidden animate-page-entry" style={{ animationDelay: '200ms' }}>
                    <div className="space-y-6">
                        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 animate-in slide-in-from-right duration-700 delay-300">
                            <div className="flex items-center gap-4 mb-3">
                                <div className="p-3 bg-emerald-100 rounded-2xl text-emerald-600">
                                    <Mic size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900">Voice Assistant</h4>
                                    <p className="text-xs text-slate-400 font-medium italic">"When is my next dose of Amoxicillin?"</p>
                                </div>
                            </div>
                            <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 w-1/3 animate-pulse" />
                            </div>
                        </div>

                        <div className="bg-slate-900 p-8 rounded-3xl animate-in slide-in-from-right duration-700 delay-500">
                            <div className="flex items-center justify-between mb-6">
                                <div className="p-2 bg-emerald-500/20 rounded-lg">
                                    <LayoutDashboard className="text-emerald-400 w-6 h-6" />
                                </div>
                                <Badge variant="success" className="bg-emerald-500/10 text-emerald-400 border-none">Active Schedule</Badge>
                            </div>
                            <div className="space-y-3">
                                <div className="h-3 w-1/2 bg-white/10 rounded-full" />
                                <div className="h-3 w-3/4 bg-white/5 rounded-full" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* Feature Section */}
      <section id="features" className="py-24 px-6 bg-slate-50">
          <div className="max-w-7xl mx-auto space-y-16">
            <div className="text-center space-y-4">
                <h2 className="text-4xl font-bold text-slate-900">Unified Health Infrastructure</h2>
                <p className="text-slate-500 max-w-2xl mx-auto font-medium">All the tools you need to manage your medical journey safely and efficiently.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <FeatureCard 
                    icon={<UploadCloud />}
                    title="Smart OCR Scanner"
                    description="Digitize handwriting and printed prescriptions with 99% accuracy using advanced neural networks."
                    color="emerald"
                />
                <FeatureCard 
                    icon={<Activity />}
                    title="Interaction Guard"
                    description="Our safety matrix scans multiple drugs simultaneously to flag potentially dangerous side effects."
                    color="blue"
                />
                <FeatureCard 
                    icon={<Mic />}
                    title="Voice Interface"
                    description="Hands-free health management. Ask questions and get reminders in English and regional languages."
                    color="indigo"
                />
            </div>
          </div>
      </section>

      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-50 rounded-full -translate-y-1/2 translate-x-1/2 mix-blend-multiply -z-10 blur-3xl opacity-50" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-50 rounded-full translate-y-1/3 -translate-x-1/4 mix-blend-multiply -z-10 blur-3xl opacity-50" />
    </div>
  );
}

function FeatureCard({ icon, title, description, color }: any) {
    const colors: any = {
        emerald: "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100",
        blue: "bg-blue-50 text-blue-600 group-hover:bg-blue-100",
        indigo: "bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100"
    };

    return (
        <div className="p-10 bg-white rounded-[2.5rem] border border-slate-100 hover:border-emerald-200 transition-all duration-300 group hover:shadow-2xl hover:shadow-emerald-100/30">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 transition-colors ${colors[color]}`}>
                {React.cloneElement(icon, { size: 32 })}
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">{title}</h3>
            <p className="text-slate-500 font-medium leading-relaxed">{description}</p>
            <div className="mt-8 pt-8 border-t border-slate-50 flex items-center gap-2 text-emerald-600 font-bold group-hover:translate-x-2 transition-transform cursor-pointer">
                Learn More <ArrowRight size={18} />
            </div>
        </div>
    );
}

function Badge({ children, variant, className }: any) {
    const styles: any = {
        success: "bg-emerald-50 text-emerald-700 border-emerald-100",
    };
    return (
        <span className={`inline-flex items-center rounded-full border font-bold ${styles[variant]} ${className}`}>
            {children}
        </span>
    );
}
