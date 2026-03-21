'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useNeuraStore } from '@/store';
import { 
  Bell, 
  Activity, 
  TrendingUp, 
  Calendar,
  AlertCircle,
  Clock,
  ArrowRight,
  Scan,
  ShieldPlus,
  Pill
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { medicines, fetchMedicines } = useNeuraStore();
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    fetchMedicines('1'); // Mock patient ID
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, [fetchMedicines]);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{greeting}, Alex</h1>
            <p className="text-slate-500 mt-1">Here is what is happening with your health today.</p>
          </div>
          <div className="flex gap-3">
             <Button variant="outline" className="gap-2">
                <Calendar className="w-4 h-4" />
                Schedule
             </Button>
             <Link href="/scanner">
                <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700">
                    <Scan className="w-4 h-4" />
                    New Scan
                </Button>
             </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="flex items-center gap-4 border-l-4 border-l-emerald-500">
            <div className="p-3 bg-emerald-50 rounded-xl">
              <Activity className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Adherence Score</p>
              <p className="text-2xl font-bold text-slate-900">
                {medicines.length > 0 ? '92%' : '0%'}
              </p>
            </div>
          </Card>
          <Card className="flex items-center gap-4 border-l-4 border-l-blue-500">
            <div className="p-3 bg-blue-50 rounded-xl">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Active Medicines</p>
              <p className="text-2xl font-bold text-slate-900">{medicines.length}</p>
            </div>
          </Card>
          <Card className="flex items-center gap-4 border-l-4 border-l-amber-500">
            <div className="p-3 bg-amber-50 rounded-xl">
              <Bell className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Daily To-Do</p>
              <p className="text-2xl font-bold text-slate-900">
                {medicines.length > 0 ? '3/4 Completed' : '0/0 Completed'}
              </p>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Medication List */}
          <div className="lg:col-span-2 space-y-4">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-600" />
                <h2 className="text-xl font-bold text-slate-900">Upcoming Medications</h2>
              </div>
              <Button variant="ghost" className="text-emerald-600 text-sm gap-1 hover:bg-emerald-50">
                View All <ArrowRight className="w-4 h-4" />
              </Button>
            </CardHeader>
            <div className="space-y-4">
              {medicines.length > 0 ? (
                medicines.map((med, idx) => (
                  <Card key={med.id || `${med.name}-${idx}`} className="group flex items-center justify-between hover:scale-[1.01]">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-slate-50 rounded-lg group-hover:bg-emerald-50 transition-colors">
                        <Pill className="w-6 h-6 text-slate-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900">{med.name}</h4>
                        <p className="text-sm text-slate-500">{med.dosage}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="success">Scheduled</Badge>
                      <p className="text-xs text-slate-400 mt-1">Next: 2:00 PM</p>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="bg-white border border-dashed border-slate-200 rounded-xl p-12 text-center text-slate-400">
                  <Pill className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>No active medications detected. Scan a prescription to get started.</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions & Safety */}
          <div className="space-y-6">
            <Card title="Safety Monitor" description="AI Interaction Analysis">
               <div className="mt-4 p-4 bg-orange-50 border border-orange-100 rounded-xl space-y-3">
                  <div className="flex items-start gap-2 text-orange-700">
                     <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
                     <p className="text-sm font-medium">Potential interaction detected between Aspirin and Warfarin.</p>
                  </div>
                  <Link href="/interactions">
                    <Button variant="outline" className="w-full text-xs font-semibold uppercase tracking-wider bg-white/50 border-orange-200 text-orange-700 hover:bg-orange-100">
                        Investigate Now
                    </Button>
                  </Link>
               </div>
            </Card>

            <Card title="Quick Actions">
                <div className="grid grid-cols-2 gap-4 mt-4">
                   <Link href="/scanner" className="p-4 bg-slate-50 rounded-xl hover:bg-emerald-50 transition-colors text-center group">
                      <Scan className="w-6 h-6 mx-auto mb-2 text-slate-400 group-hover:text-emerald-600" />
                      <span className="text-xs font-semibold text-slate-600 group-hover:text-emerald-700">Scan OCR</span>
                   </Link>
                   <Link href="/interactions" className="p-4 bg-slate-50 rounded-xl hover:bg-blue-50 transition-colors text-center group">
                      <ShieldPlus className="w-6 h-6 mx-auto mb-2 text-slate-400 group-hover:text-blue-600" />
                      <span className="text-xs font-semibold text-slate-600 group-hover:text-blue-700">Drug Check</span>
                   </Link>
                </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
