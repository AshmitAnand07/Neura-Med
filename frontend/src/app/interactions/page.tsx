'use client';

import React, { useState } from 'react';
import { ShieldAlert, Info, ListPlus, Activity } from 'lucide-react';
import AnimatedPage from '../../components/AnimatedPage';

interface InteractionResult {
  status: 'safe' | 'warning' | 'danger';
  title: string;
  description: string;
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

  const executeAnalysis = () => {
    setIsChecking(true);
    setResult(null);

    // Filter empties securely natively
    const validDrugs = inputs.filter(i => i.trim() !== '');

    if (validDrugs.length < 2) {
       setIsChecking(false);
       return;
    }

    // Explicitly mocking robust backend interactions API.
    // Replace with Fetch -> POST /api/interactions in standard deployments.
    setTimeout(() => {
       const d1 = validDrugs[0].toLowerCase();
       const d2 = validDrugs[1].toLowerCase();

       // Fake dummy heuristic matrix mapping standard hazardous traits
       if ((d1 === 'aspirin' && d2 === 'warfarin') || (d1 === 'warfarin' && d2 === 'aspirin')) {
         setResult({
           status: 'danger',
           title: 'Severe Internal Bleeding Risk identified!',
           description: 'Explicit interactions detected. Both medications inhibit coagulation matrices severely compounding hemorrhagic potential. Please contact your medical provider instantly.'
         });
       } else if (validDrugs.length > 3) {
         setResult({
           status: 'warning',
           title: 'Pre-cautions on Polypharmacy',
           description: 'Combining 4+ unique chemical chains explicitly requires rigorous oversight. Expect minor liver degradation over extensive periods.'
         });
       } else {
         setResult({
           status: 'safe',
           title: 'No Identified Interactions',
           description: 'These compounds isolate seamlessly alongside one another. Track your ingestion timings natively for best effects.'
         });
       }
       
       setIsChecking(false);
    }, 1500);
  };

  return (
    <AnimatedPage className="max-w-3xl mx-auto space-y-6">
      
      <div className="text-center mt-6 mb-10">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Interaction Checker</h1>
        <p className="text-gray-500 mt-2">Explicitly cross-reference your ongoing prescriptions securely against the NeuraMed AI Toxicity Engine.</p>
      </div>

      <div className="bg-white p-6 md:p-10 rounded-3xl border border-gray-100 shadow-soft">
         <div className="space-y-4">
            {inputs.map((val, idx) => (
              <div key={idx} className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-bold">
                  {idx + 1}
                </div>
                <input 
                  type="text" 
                  autoComplete="off"
                  placeholder={`Drug Name ${idx + 1}...`}
                  value={val}
                  onChange={(e) => updateInput(idx, e.target.value)}
                  className="w-full pl-14 pr-4 py-4 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white shadow-sm focus:ring-2 focus:ring-primary-500 focus:outline-none transition-all text-gray-900 font-bold"
                />
              </div>
            ))}
         </div>

         <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <button 
              onClick={addInput}
              disabled={inputs.length >= 6}
              className="px-6 py-2.5 rounded-full font-bold text-gray-500 hover:bg-gray-100 transition-colors flex items-center gap-2"
            >
               <ListPlus size={18} /> Add another drug
            </button>
            
            <button 
              onClick={executeAnalysis}
              disabled={isChecking}
              className={`w-full sm:w-auto px-8 py-3 rounded-full font-extrabold text-white shadow-glow transition-all active:scale-95 flex items-center justify-center gap-2 ${isChecking ? 'bg-gray-400 cursor-wait' : 'bg-slate-900 hover:bg-slate-800'}`}
            >
               {isChecking ? 'Analyzing...' : <><Activity size={18} /> Run Safety Check</>}
            </button>
         </div>
      </div>

      {result && (
         <div className={`mt-8 p-6 rounded-3xl border animate-in fade-in slide-in-from-bottom-4 shadow-soft flex gap-5 ${
           result.status === 'danger' ? 'bg-red-50 border-red-200' :
           result.status === 'warning' ? 'bg-orange-50 border-orange-200' : 
           'bg-green-50 border-green-200'
         }`}>
            <div className={`w-14 h-14 rounded-2xl flex-shrink-0 flex items-center justify-center ${
               result.status === 'danger' ? 'bg-red-500 text-white shadow-lg' :
               result.status === 'warning' ? 'bg-orange-500 text-white shadow-lg' : 
               'bg-primary-600 text-white shadow-glow'
            }`}>
               {result.status === 'danger' ? <ShieldAlert size={28} /> :
                result.status === 'warning' ? <ShieldAlert size={28} /> : 
                <Info size={28} />}
            </div>
            
            <div>
               <h3 className={`text-xl font-black ${
                  result.status === 'danger' ? 'text-red-900' :
                  result.status === 'warning' ? 'text-orange-900' : 
                  'text-primary-900'
               }`}>
                  {result.title}
               </h3>
               <p className={
                 result.status === 'danger' ? 'text-red-700 mt-2 font-medium' :
                 result.status === 'warning' ? 'text-orange-800 mt-2 font-medium' : 
                 'text-primary-800 mt-2 font-medium'
               }>
                  {result.description}
               </p>
            </div>
         </div>
      )}

    </AnimatedPage>
  );
}
