'use client';

import Link from 'next/link';
import { Mic, UploadCloud, BellRing, Activity, ArrowRight } from 'lucide-react';
import AnimatedPage from '../components/AnimatedPage';
import { useNeuraStore } from '../store';

export default function HomePage() {
  const toggleVoiceUI = useNeuraStore(state => state.toggleVoiceUI);

  return (
    <AnimatedPage className="space-y-12 pb-12">
      {/* Hero Header */}
      <section className="text-center md:text-left md:flex items-center justify-between gap-12 mt-8">
         <div className="flex-1">
           <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 text-primary-700 font-semibold mb-6 shadow-sm border border-primary-100 text-sm">
             <Activity size={16} /> <span>v2.0 Smart Health Platform</span>
           </div>
           
           <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900 leading-tight">
              Your AI-Powered <br className="hidden md:block"/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-green-400">
                 Health Companion
              </span>
           </h1>
           
           <p className="mt-4 text-lg md:text-xl text-gray-500 max-w-2xl mx-auto md:mx-0">
             Instantly scan medical prescriptions, detect unsafe drug interactions, and converse natively with your health assistant using just your voice.
           </p>

           <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start">
             <button
               onClick={() => toggleVoiceUI(true)} 
               className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-primary-600 hover:bg-primary-700 text-white font-bold text-lg shadow-glow transition-transform active:scale-95"
             >
               <Mic size={22} /> Start Voice Assistant
             </button>
             
             <Link 
               href="/scanner"
               className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-white hover:bg-gray-50 text-gray-800 font-bold text-lg shadow-soft border border-gray-200 transition-transform active:scale-95"
             >
               <UploadCloud size={22} className="text-primary-600"/> Upload Prescription
             </Link>
           </div>
         </div>

         {/* Visual Graphic Representation */}
         <div className="hidden md:block flex-1 rounded-3xl bg-gradient-to-br from-primary-100 to-green-50 aspect-square relative shadow-lg overflow-hidden border border-white">
            <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4">
               <div className="bg-white p-6 rounded-2xl shadow-soft w-64 flex items-center gap-4 animate-[bounce_3s_ease-in-out_infinite]">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                    <Mic className="text-primary-600" size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 text-sm">"Hey NeuraMed"</h4>
                    <p className="text-xs text-gray-500">I'm listening...</p>
                  </div>
               </div>

               <div className="bg-white p-6 rounded-2xl shadow-soft w-64 flex items-center gap-4 ml-24 opacity-90 delay-150 animate-[bounce_4s_ease-in-out_infinite]">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <BellRing className="text-blue-600" size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 text-sm">Smart Reminder</h4>
                    <p className="text-xs text-gray-500">Time for Aspirin 500mg</p>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* Grid Features */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
          
          <Link href="/dashboard" className="group bg-white p-8 rounded-3xl shadow-soft border border-gray-100 hover:border-primary-200 hover:shadow-lg transition-all cursor-pointer">
             <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center mb-6 group-hover:bg-orange-100 transition-colors">
                <LayoutDashboard className="text-orange-500" size={28} />
             </div>
             <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
               Medicine Dashboard <ArrowRight size={18} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary-600" />
             </h3>
             <p className="text-gray-500">Track your daily intakes visually and monitor your adherence streaks seamlessly.</p>
          </Link>

          <Link href="/interactions" className="group bg-white p-8 rounded-3xl shadow-soft border border-gray-100 hover:border-red-200 hover:shadow-lg transition-all cursor-pointer">
             <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mb-6 group-hover:bg-red-100 transition-colors">
                <Activity className="text-red-500" size={28} />
             </div>
             <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
               Interaction Checker <ArrowRight size={18} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-red-600" />
             </h3>
             <p className="text-gray-500">Cross-reference multiple drugs against our AI engine to prevent unsafe reactions.</p>
          </Link>

          <Link href="/settings" className="group bg-white p-8 rounded-3xl shadow-soft border border-gray-100 hover:border-indigo-200 hover:shadow-lg transition-all cursor-pointer">
             <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center mb-6 group-hover:bg-indigo-100 transition-colors">
                <BellRing className="text-indigo-500" size={28} />
             </div>
             <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
               Smart Alerts <ArrowRight size={18} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-indigo-600" />
             </h3>
             <p className="text-gray-500">Configure repeating indigenous voice reminders utilizing the Sarvam speech synthesis pipeline.</p>
          </Link>

      </section>
    </AnimatedPage>
  );
}
