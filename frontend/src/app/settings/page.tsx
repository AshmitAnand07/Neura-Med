'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Settings, Bell, Lock, User, Globe, Shield } from 'lucide-react';

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center gap-4">
            <div className="p-3 bg-slate-100 rounded-2xl">
                <Settings className="w-8 h-8 text-slate-600" />
            </div>
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Account Settings</h1>
                <p className="text-slate-500">Configure your profile, security, and notification preferences</p>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Sidebar-like Tabs */}
            <div className="space-y-2">
                <SettingsTab icon={<User />} label="Profile Info" active />
                <SettingsTab icon={<Bell />} label="Notifications" />
                <SettingsTab icon={<Lock />} label="Security" />
                <SettingsTab icon={<Globe />} label="Language" />
                <SettingsTab icon={<Shield />} label="Data & Privacy" />
            </div>

            {/* Settings Content */}
            <div className="md:col-span-2 space-y-6">
                <Card title="Profile Information" description="Update your personal and professional details.">
                    <div className="mt-6 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-400 uppercase">First Name</label>
                                <input className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-slate-50" defaultValue="Alex" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-400 uppercase">Last Name</label>
                                <input className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-slate-50" defaultValue="Johnson" />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-400 uppercase">Email Address</label>
                            <input className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-slate-50" defaultValue="alex.j@hospital.com" />
                        </div>
                    </div>
                    <div className="mt-8 pt-6 border-t border-slate-50 flex justify-end">
                        <Button>Save Changes</Button>
                    </div>
                </Card>

                <Card title="Language & Voice" description="Preferred communication settings for Sarvam AI.">
                    <div className="mt-4 space-y-4">
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <div>
                                <p className="text-sm font-bold text-slate-900">Interface Language</p>
                                <p className="text-xs text-slate-500 italic">Global UI translation</p>
                            </div>
                            <select className="bg-transparent text-sm font-bold border-none outline-none text-emerald-600">
                                <option>English (IN)</option>
                                <option>Hindi (IN)</option>
                                <option>Bengali (IN)</option>
                            </select>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function SettingsTab({ icon, label, active }: any) {
    return (
        <button className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 
            ${active 
                ? 'bg-white border border-slate-100 text-slate-900 font-bold shadow-sm' 
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}>
            {React.cloneElement(icon, { size: 18, className: active ? 'text-emerald-500' : 'text-slate-400' })}
            <span className="text-sm">{label}</span>
        </button>
    );
}
