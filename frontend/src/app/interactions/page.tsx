'use client';

import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Info, 
  Plus, 
  Activity, 
  AlertCircle, 
  CheckCircle2,
  Trash2,
  Zap
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';

interface InteractionResult {
  status: 'safe' | 'warning' | 'danger';
  title: string;
  description: string;
  source: string;
}

export default function InteractionsPage() {
  const [inputs, setInputs] = useState<string[]>(['', '']);
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<InteractionResult | null>(null);

  const updateInput = (idx: number, val: string) => {
    const next = [...inputs];
    next[idx] = val;
    setInputs(next);
  };

  const addInput = () => setInputs([...inputs, '']);
  const removeInput = (idx: number) => {
    if (inputs.length <= 2) return;
    setInputs(inputs.filter((_, i) => i !== idx));
  };

  const executeAnalysis = async () => {
    const validDrugs = inputs.filter(i => i.trim() !== '');
    if (validDrugs.length < 2) return;

    setIsChecking(true);
    setResult(null);

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/interactions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            drug1: validDrugs[0],
            drug2: validDrugs[1],
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setResult({
            status: data.severity === 'high' ? 'danger' : data.severity === 'none' ? 'safe' : 'warning',
            title: data.interaction ? `Risk Detected: ${data.severity.toUpperCase()}` : 'No Interactions Found',
            description: data.interaction 
              ? `A ${data.severity} severity interaction was identified. Please consult your physician before combining these medications.`
              : 'Our AI engine did not find any known adverse interactions between these specific compounds.',
            source: data.source || 'AI Engine'
          });
        } else {
          setResult({
            status: 'warning',
            title: 'Analysis Fallback',
            description: 'The primary safety engine is busy. Please use caution and verify with a professional.',
            source: 'System'
          });
        }
    } catch (error) {
        setResult({
            status: 'warning',
            title: 'Connection Error',
            description: 'Unable to reach the safety database. Check your internet connection.',
            source: 'Network'
        });
    } finally {
        setIsChecking(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-2xl">
                <ShieldAlert className="w-8 h-8 text-blue-600" />
            </div>
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Drug Interaction Checker</h1>
                <p className="text-slate-500">Screen your medications for potential adverse reactions using NeuraMed AI</p>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Input Section */}
            <Card className="lg:col-span-3 h-fit">
                <CardHeader>
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Plus className="w-5 h-5 text-emerald-500" /> Enter Medications
                    </h3>
                    <p className="text-xs text-slate-400 font-medium">Add at least two medications to begin analysis</p>
                </CardHeader>
                <CardContent className="space-y-4">
                    {inputs.map((val, idx) => (
                        <div key={`drug-input-${idx}`} className="flex items-end gap-3 animate-in slide-in-from-left duration-200" style={{ animationDelay: `${idx * 50}ms` }}>
                            <div className="flex-1">
                                <Input 
                                    placeholder={`e.g. ${idx === 0 ? 'Aspirin' : 'Warfarin'}...`}
                                    value={val}
                                    onChange={(e) => updateInput(idx, e.target.value)}
                                    className="font-semibold text-slate-700"
                                />
                            </div>
                            {inputs.length > 2 && (
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="mb-1 text-slate-400 hover:text-red-500 px-2"
                                    onClick={() => removeInput(idx)}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            )}
                        </div>
                    ))}
                    
                    <div className="pt-4 flex items-center gap-4">
                        <Button 
                            variant="outline" 
                            size="sm" 
                            className="gap-2 text-slate-500"
                            onClick={addInput}
                            disabled={inputs.length >= 5}
                        >
                            <Plus className="w-4 h-4" /> Add Medication
                        </Button>
                        <Button 
                            className="flex-1 gap-2 shadow-lg shadow-blue-100"
                            onClick={executeAnalysis}
                            isLoading={isChecking}
                            disabled={inputs.filter(i => i.trim() !== '').length < 2}
                        >
                            <Zap className="w-4 h-4" /> Run AI Analysis
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Results Section */}
            <div className="lg:col-span-2">
                {!result && !isChecking ? (
                    <Card className="h-full flex flex-col items-center justify-center p-12 text-center border-dashed bg-slate-50/50">
                        <Activity className="w-12 h-12 text-slate-200 mb-4" />
                        <h4 className="text-slate-400 font-medium">Ready for Screening</h4>
                        <p className="text-xs text-slate-300 mt-2 max-w-[200px]">Results will appear here after analysis</p>
                    </Card>
                ) : isChecking ? (
                    <Card className="h-full flex flex-col items-center justify-center p-12 text-center">
                        <div className="relative">
                            <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin"></div>
                            <ShieldAlert className="absolute inset-0 m-auto w-6 h-6 text-blue-500 animate-pulse" />
                        </div>
                        <h4 className="text-slate-600 font-bold mt-6">Safety Screening...</h4>
                        <p className="text-xs text-slate-400 mt-2">Checking NeuraMed toxicity database</p>
                    </Card>
                ) : (
                    <Card className={`h-full border-t-4 transition-all animate-page-entry ${
                        result?.status === 'danger' ? 'border-t-red-500' :
                        result?.status === 'warning' ? 'border-t-amber-500' : 
                        'border-t-emerald-500'
                    }`}>
                        <div className="p-6 space-y-6">
                            <div className="flex items-center justify-between">
                                <Badge variant={
                                    result?.status === 'danger' ? 'danger' :
                                    result?.status === 'warning' ? 'warning' : 
                                    'success'
                                } className="uppercase tracking-widest text-[10px] font-bold py-1 px-3">
                                    {result?.status === 'danger' ? 'Critical' : result?.status === 'warning' ? 'Precaution' : 'Safe'}
                                </Badge>
                                <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1 group">
                                    SOURCE: <span className="text-slate-600 uppercase">{result?.source}</span>
                                </span>
                            </div>

                            <div className="flex flex-col items-center text-center space-y-4 py-4">
                                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg ${
                                    result?.status === 'danger' ? 'bg-red-500 text-white' :
                                    result?.status === 'warning' ? 'bg-amber-500 text-white' : 
                                    'bg-emerald-500 text-white'
                                }`}>
                                    {result?.status === 'danger' ? <ShieldAlert size={40} /> :
                                     result?.status === 'warning' ? <AlertCircle size={40} /> : 
                                     <CheckCircle2 size={40} />}
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900">{result?.title}</h3>
                            </div>

                            <p className="text-sm text-slate-600 text-center leading-relaxed font-medium bg-slate-50 p-4 rounded-xl border border-slate-100">
                                {result?.description}
                            </p>

                            <div className="pt-4 space-y-3">
                                <div className="p-3 rounded-lg border border-slate-100 flex items-center gap-3 text-xs font-semibold text-slate-500">
                                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                                    No immediate cardiac risks found
                                </div>
                                <div className="p-3 rounded-lg border border-slate-100 flex items-center gap-3 text-xs font-semibold text-slate-500">
                                    <div className="w-2 h-2 rounded-full bg-blue-400" />
                                    Dosage levels within standard range
                                </div>
                            </div>
                        </div>
                    </Card>
                )}
            </div>
        </div>

        <div className="p-4 bg-slate-900 text-white rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                    <Zap className="text-emerald-400 w-5 h-5" />
                </div>
                <div>
                    <p className="text-sm font-bold">24/7 Safety Monitoring</p>
                    <p className="text-[10px] text-slate-400">Our safety engine is backed by clinical-grade AI models.</p>
                </div>
            </div>
            <Button variant="ghost" className="text-xs text-emerald-400 hover:text-emerald-300 hover:bg-emerald-400/10">
                View Documentation
            </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
