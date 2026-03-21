'use client';

import React, { useState } from 'react';
import { Pill, Plus, Trash2, Search, Edit3 } from 'lucide-react';
import AnimatedPage from '../../components/AnimatedPage';
import { useNeuraStore } from '../../store';

export default function MedicinesPage() {
  const { medicines, addMedicine, removeMedicine } = useNeuraStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // New item draft internal matrix
  const [draft, setDraft] = useState({ name: '', dosage: '', frequency: '', timing: '' });

  const handleSave = () => {
    if (!draft.name || !draft.dosage) return;
    
    addMedicine({
       id: Math.random().toString(36).substring(7),
       name: draft.name,
       dosage: draft.dosage,
       frequency: draft.frequency || 'Once daily',
       timing: draft.timing || 'After food',
       status: 'active'
    });
    
    setIsAdding(false);
    setDraft({ name: '', dosage: '', frequency: '', timing: '' });
  };

  const filteredMeds = medicines.filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <AnimatedPage className="space-y-6">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-6 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Active Prescriptions</h1>
          <p className="text-gray-500 mt-1 font-medium">{medicines.length} total active medications monitored securely.</p>
        </div>
        
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-6 rounded-full shadow-glow flex items-center gap-2 transition-transform active:scale-95"
        >
          <Plus size={20} /> Add Medicine
        </button>
      </div>

      {/* Floating Action / Add Modal Equivalent (Inline for smoothness) */}
      {isAdding && (
         <div className="bg-white p-6 rounded-3xl shadow-soft border border-primary-100 flex flex-col gap-4 animate-in fade-in slide-in-from-top-4">
            <h3 className="text-lg font-bold text-gray-800">New Medical Entry</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Drug Name</label>
                  <input autoFocus placeholder="e.g. Paracetamol" className="w-full mt-1 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none transition-shadow" value={draft.name} onChange={e => setDraft({...draft, name: e.target.value})} />
               </div>
               <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Dosage</label>
                  <input placeholder="e.g. 500mg" className="w-full mt-1 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none transition-shadow" value={draft.dosage} onChange={e => setDraft({...draft, dosage: e.target.value})} />
               </div>
               <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Frequency</label>
                  <input placeholder="e.g. Twice daily" className="w-full mt-1 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none transition-shadow" value={draft.frequency} onChange={e => setDraft({...draft, frequency: e.target.value})} />
               </div>
               <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Timing</label>
                  <input placeholder="e.g. After meals" className="w-full mt-1 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none transition-shadow" value={draft.timing} onChange={e => setDraft({...draft, timing: e.target.value})} />
               </div>
            </div>

            <div className="flex justify-end gap-3 mt-2">
               <button onClick={() => setIsAdding(false)} className="px-5 py-2.5 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors">Cancel</button>
               <button onClick={handleSave} className="px-6 py-2.5 rounded-xl font-bold bg-primary-600 text-white shadow-soft transition-colors hover:bg-primary-700">Save Entry</button>
            </div>
         </div>
      )}

      {/* Universal Search Bar */}
      <div className="relative">
         <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
         <input 
           type="text" 
           placeholder="Search inventory..." 
           value={searchQuery}
           onChange={(e) => setSearchQuery(e.target.value)}
           className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 bg-white shadow-sm focus:ring-2 focus:ring-primary-500 focus:outline-none transition-shadow text-gray-800 font-medium"
         />
      </div>

      {/* Primary Inventory Matrix */}
      {filteredMeds.length === 0 ? (
         <div className="text-center py-16 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
            <Pill className="mx-auto text-gray-300 mb-4" size={48} />
            <h3 className="text-lg font-bold text-gray-700 tracking-tight">Your inventory is empty</h3>
            <p className="text-gray-500 mt-1 max-w-sm mx-auto">No medications are actively monitored. Add a new drug manually or scan your prescription.</p>
         </div>
      ) : (
         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredMeds.map(med => (
              <div key={med.id} className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 hover:border-primary-200 hover:shadow-md transition-all flex justify-between items-start group">
                 <div className="flex gap-4">
                    <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-600 flex-shrink-0">
                       <Pill size={24} />
                    </div>
                    <div>
                       <h3 className="text-lg font-extrabold text-gray-900">{med.name}</h3>
                       <p className="text-sm font-semibold text-gray-500">{med.dosage} • {med.frequency}</p>
                       <span className="inline-block mt-2 px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-lg uppercase tracking-wider">{med.timing}</span>
                    </div>
                 </div>
                 
                 <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-colors">
                       <Edit3 size={18} />
                    </button>
                    <button onClick={() => removeMedicine(med.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors">
                       <Trash2 size={18} />
                    </button>
                 </div>
              </div>
            ))}
         </div>
      )}

    </AnimatedPage>
  );
}
