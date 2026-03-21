'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { VoiceRecorder } from '@/components/VoiceRecorder';
import { Card } from '@/components/ui/Card';
import { Mic, Globe, Info } from 'lucide-react';

export default function VoicePage() {
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-100 rounded-2xl">
                <Mic className="w-8 h-8 text-indigo-600" />
            </div>
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Voice Assistant</h1>
                <p className="text-slate-500">Natural language control for your medication schedule</p>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2">
                <VoiceRecorder />
            </div>

            <div className="space-y-6">
                <Card title="Voice Commands" description="Try saying these:">
                    <div className="space-y-3 mt-4">
                        {[
                            "Remind me about Amoxicillin",
                            "Check interactions for Aspirin",
                            "When is my next dose?",
                            "Register new prescription"
                        ].map((cmd, i) => (
                            <div key={cmd} className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-600 flex items-center gap-2 group hover:bg-emerald-50 hover:text-emerald-700 transition-colors">
                                <Globe className="w-3.5 h-3.5 text-slate-300 group-hover:text-emerald-500" />
                                "{cmd}"
                            </div>
                        ))}
                    </div>
                </Card>

                <Card className="bg-emerald-900 text-white border-none">
                    <div className="flex gap-4">
                        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
                            <Info className="text-emerald-400 w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm font-bold">Multi-lingual Support</p>
                            <p className="text-[10px] text-emerald-200/70 mt-1 leading-relaxed">
                                Our platform natively supports Hindi, Tamil, Bengali, and English voice interactions.
                            </p>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
