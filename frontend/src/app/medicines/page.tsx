'use client';

import React, { useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useNeuraStore } from '@/store';
import { 
  Pill, 
  Search, 
  Plus, 
  Filter,
  MoreVertical,
  Calendar,
  Clock,
  ExternalLink
} from 'lucide-react';

export default function MedicinesPage() {
  const { medicines, fetchMedicines } = useNeuraStore();

  useEffect(() => {
    fetchMedicines('1'); // Mock patient ID
  }, [fetchMedicines]);

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-100 rounded-2xl">
                    <Pill className="w-8 h-8 text-emerald-600" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">My Medications</h1>
                    <p className="text-slate-500">Manage your active prescriptions and adherence schedule</p>
                </div>
            </div>
            <Button className="gap-2">
                <Plus className="w-5 h-5" /> Add Medication
            </Button>
        </div>

        {/* Filter Bar */}
        <Card className="p-4 flex flex-col md:flex-row items-center gap-4">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input 
                    type="text" 
                    placeholder="Search medicines, dosages..."
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500 transition-all"
                />
            </div>
            <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-2 text-slate-500">
                    <Filter className="w-4 h-4" /> Filter
                </Button>
                <Button variant="outline" size="sm" className="gap-2 text-slate-500">
                    <Calendar className="w-4 h-4" /> Frequency
                </Button>
            </div>
        </Card>

        {/* Medicines Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {medicines.length > 0 ? (
                medicines.map((med, idx) => (
                    <Card key={med.id || `${med.name}-${idx}`} className="group relative overflow-hidden transition-all duration-300 hover:border-emerald-200">
                        <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <CardHeader className="p-0 mb-4 flex items-start justify-between">
                            <div className="p-2 bg-emerald-50 rounded-lg">
                                <Pill className="w-6 h-6 text-emerald-600" />
                            </div>
                            <Button variant="ghost" className="p-1 h-8 w-8 text-slate-400">
                                <MoreVertical className="w-5 h-5" />
                            </Button>
                        </CardHeader>
                        <CardContent className="p-0 space-y-4">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">{med.name}</h3>
                                <p className="text-sm font-medium text-slate-500">{med.dosage}</p>
                            </div>
                            
                            <div className="flex items-center gap-4 py-3 px-4 bg-slate-50 rounded-xl">
                                <div className="space-y-1">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Frequency</span>
                                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                                        <Clock className="w-3.5 h-3.5 text-emerald-500" />
                                        {med.frequency}
                                    </div>
                                </div>
                                <div className="w-px h-8 bg-slate-200" />
                                <div className="space-y-1">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Duration</span>
                                    <div className="text-xs font-semibold text-slate-700">
                                        {med.duration}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-2">
                                <Badge variant="success">Active</Badge>
                                <Button variant="ghost" className="text-xs text-slate-400 hover:text-emerald-600 p-0 h-auto gap-1">
                                    Details <ExternalLink className="w-3 h-3" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))
            ) : (
                <div className="col-span-full py-20 bg-white border border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                        <Pill className="w-10 h-10 text-slate-200" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">No Medications Found</h3>
                    <p className="text-slate-400 mt-2 max-w-xs">Scan a prescription or manually add your medications to track your adherence.</p>
                    <Button className="mt-8 gap-2">
                        <Plus className="w-5 h-5" /> Add First Medicine
                    </Button>
                </div>
            )}
        </div>
      </div>
    </DashboardLayout>
  );
}
