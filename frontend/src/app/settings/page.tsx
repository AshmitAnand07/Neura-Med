'use client';

import React from 'react';
import { Voicemail, Globe2, Volume2, Save, BadgeCheck } from 'lucide-react';
import AnimatedPage from '../../components/AnimatedPage';
import { useNeuraStore, AlertSettings } from '../../store';

export default function SettingsPage() {
  const { alertSettings, updateAlertSettings } = useNeuraStore();
  const [isSaving, setIsSaving] = React.useState(false);

  const handleToggle = (field: keyof AlertSettings) => {
    updateAlertSettings({ [field]: !alertSettings[field] });
  };

  const handleUpdate = (field: keyof AlertSettings, value: any) => {
    updateAlertSettings({ [field]: value });
  };

  const simulateSave = () => {
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 800);
  };

  return (
    <AnimatedPage className="max-w-2xl mx-auto space-y-8">
      
      <div className="mt-8 mb-6">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Voice Configurations</h1>
        <p className="text-gray-500 mt-1">Bound Sarvam API constraints and execution policies natively here.</p>
      </div>

      <div className="space-y-6">
         
         <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-soft flex items-center justify-between transition-colors">
            <div className="flex gap-4">
               <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                  <Voicemail size={24} />
               </div>
               <div>
                  <h3 className="text-lg font-bold text-gray-900">Enable Neural Voice Alerts</h3>
                  <p className="text-gray-500 text-sm font-medium mt-1">Aggressively speak reminders out loud using Sarvam TTS.</p>
               </div>
            </div>
            
            <button 
              onClick={() => handleToggle('voiceAlertsEnabled')}
              className={`w-14 h-8 rounded-full relative transition-colors ${alertSettings.voiceAlertsEnabled ? 'bg-primary-600 shadow-glow' : 'bg-gray-300'}`}
            >
               <div className={`w-6 h-6 bg-white rounded-full absolute top-1 transition-transform shadow-sm ${alertSettings.voiceAlertsEnabled ? 'left-7' : 'left-1'}`} />
            </button>
         </div>

         <div className={`bg-white p-6 rounded-3xl border border-gray-100 shadow-soft space-y-6 transition-opacity ${!alertSettings.voiceAlertsEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
            
            <div className="flex justify-between items-center border-b border-gray-50 pb-6">
               <div className="flex gap-4">
                 <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                    <Globe2 size={24} />
                 </div>
                 <div>
                    <h3 className="text-lg font-bold text-gray-900">Indigenous Language Output</h3>
                    <p className="text-gray-500 text-sm font-medium mt-1">Specify which core dialect the backend engine synthesizes.</p>
                 </div>
               </div>
               
               <select 
                 value={alertSettings.language}
                 onChange={(e) => handleUpdate('language', e.target.value)}
                 className="bg-gray-50 border border-gray-200 text-gray-900 font-bold rounded-xl px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:outline-none"
               >
                 <option value="en-IN">English (India)</option>
                 <option value="hi-IN">Hindi (हिंदी)</option>
                 <option value="bn-IN">Bengali (বাংলা)</option>
                 <option value="ta-IN">Tamil (தமிழ்)</option>
               </select>
            </div>

            <div className="flex justify-between items-center pt-2">
               <div className="flex gap-4">
                 <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center">
                    <Volume2 size={24} />
                 </div>
                 <div>
                    <h3 className="text-lg font-bold text-gray-900">Master Volume Override</h3>
                    <p className="text-gray-500 text-sm font-medium mt-1">Scale explicit execution loudness aggressively.</p>
                 </div>
               </div>
               
               <div className="w-48 flex items-center gap-4">
                  <span className="text-xs font-bold text-gray-400">0%</span>
                  <input 
                    type="range" 
                    min="0" max="100" 
                    value={alertSettings.volumeLevel}
                    onChange={(e) => handleUpdate('volumeLevel', parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                  />
                  <span className="text-xs font-bold text-gray-700">{alertSettings.volumeLevel}%</span>
               </div>
            </div>

         </div>

      </div>

      <div className="mt-12 flex justify-end">
         <button 
           onClick={simulateSave}
           disabled={isSaving}
           className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-8 rounded-full shadow-lg flex items-center gap-2 transition-transform active:scale-95"
         >
           {isSaving ? <BadgeCheck className="text-primary-400" size={20} /> : <Save size={20} />} 
           {isSaving ? 'Synchronized Natively' : 'Apply Configurations'}
         </button>
      </div>

    </AnimatedPage>
  );
}
