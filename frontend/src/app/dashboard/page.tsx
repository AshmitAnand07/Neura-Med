'use client';

import React from 'react';
import { Pill, CheckCircle2, AlertCircle, Clock3 } from 'lucide-react';
import AnimatedPage from '../../components/AnimatedPage';
import { useNeuraStore } from '../../store';

export default function DashboardPage() {
  // In a real application, these would be bound to the `medicines` store and filtered dynamically.
  // We use hardcoded placeholder representation indicating dynamic states for UI verification.
  const { medicines } = useNeuraStore();

  const mockDoses = [
    { id: '1', med: 'Aspirin', dose: '500mg', time: '08:00 AM', status: 'taken' },
    { id: '2', med: 'Atorvastatin', dose: '20mg', time: '12:00 PM', status: 'pending' },
    { id: '3', med: 'Metformin', dose: '500mg', time: '02:00 PM', status: 'missed' },
    { id: '4', med: 'Lisinopril', dose: '10mg', time: '08:00 PM', status: 'pending' },
  ];

  return (
    <AnimatedPage className="space-y-6">
      
      <div className="flex justify-between items-end mb-8 mt-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Today's Regimen</h1>
          <p className="text-gray-500 mt-1 font-medium">Monday, 24th October</p>
        </div>
        <div className="bg-primary-50 text-primary-700 px-4 py-2 rounded-xl font-bold flex items-center gap-2 border border-primary-100">
          <CheckCircle2 size={20} /> <span className="hidden sm:inline">25% Adherence</span>
        </div>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-3 gap-4 mb-10">
         <div className="bg-white p-5 rounded-3xl shadow-soft border border-gray-100 flex flex-col items-center justify-center">
            <span className="text-3xl font-black text-gray-800">1</span>
            <span className="text-xs text-gray-500 uppercase font-bold mt-1 tracking-wider">Taken</span>
         </div>
         <div className="bg-primary-600 p-5 rounded-3xl shadow-glow text-white flex flex-col items-center justify-center transform scale-[1.02]">
            <span className="text-4xl font-black">2</span>
            <span className="text-xs uppercase font-bold mt-1 tracking-wider opacity-90">Pending</span>
         </div>
         <div className="bg-white p-5 rounded-3xl shadow-soft border border-gray-100 flex flex-col items-center justify-center">
            <span className="text-3xl font-black text-red-500">1</span>
            <span className="text-xs text-red-500 uppercase font-bold mt-1 tracking-wider">Missed</span>
         </div>
      </div>

      <h2 className="text-xl font-bold text-gray-800 mb-4 px-1">Upcoming & Log</h2>

      <div className="space-y-4">
         {mockDoses.map((entry) => {
            const isTaken = entry.status === 'taken';
            const isMissed = entry.status === 'missed';
            const isPending = entry.status === 'pending';

            return (
              <div 
                key={entry.id} 
                className={`flex items-center justify-between p-5 rounded-2xl shadow-sm border transition-all ${
                  isMissed 
                    ? 'bg-red-50/50 border-red-100 hover:bg-red-50' 
                    : isTaken 
                      ? 'bg-gray-50 border-gray-100 opacity-60' 
                      : 'bg-white border-gray-200 hover:border-primary-300 hover:shadow-md'
                }`}
              >
                  <div className="flex items-center gap-4">
                     <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                       isMissed ? 'bg-red-100 text-red-600' : isTaken ? 'bg-gray-200 text-gray-500' : 'bg-primary-100 text-primary-600'
                     }`}>
                        <Pill size={24} />
                     </div>
                     
                     <div>
                       <h3 className={`font-bold text-lg ${isTaken ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                         {entry.med} <span className="font-normal text-sm text-gray-500 ml-1">{entry.dose}</span>
                       </h3>
                       <div className="flex items-center gap-1.5 mt-0.5 text-xs font-semibold text-gray-500">
                         <Clock3 size={12} /> {entry.time}
                       </div>
                     </div>
                  </div>

                  {/* Actions */}
                  <div>
                    {isPending && (
                      <button className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-6 rounded-xl shadow-sm transition-transform active:scale-95 text-sm">
                        Mark Taken
                      </button>
                    )}
                    {isMissed && (
                      <button className="flex items-center gap-1 bg-white border border-red-200 text-red-600 hover:bg-red-50 font-bold py-2 px-4 rounded-xl transition-all text-sm">
                        <AlertCircle size={16} /> Recover
                      </button>
                    )}
                    {isTaken && (
                       <CheckCircle2 className="text-primary-500 mr-2" size={28} />
                    )}
                  </div>
              </div>
            );
         })}
      </div>

    </AnimatedPage>
  );
}
