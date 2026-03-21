'use client';

import React, { useEffect } from 'react';
import AnimatedPage from '../../components/AnimatedPage';
import VoiceRecorder from '../../components/VoiceRecorder';
import { useNeuraStore } from '../../store';

export default function VoiceUI() {
  const { isVoiceUIActive, toggleVoiceUI } = useNeuraStore();

  // Esc key gracefully destroys modal wrapper
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') toggleVoiceUI(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [toggleVoiceUI]);

  if (!isVoiceUIActive) {
    // Hidden generic rendering state mapping when routed manually vs toggled globally
    return (
      <AnimatedPage className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
         <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">AI Voice Assistant</h1>
         <p className="text-gray-500 mt-4 max-w-xl mx-auto mb-8">
           NeuraMed's Voice Assistant utilizes advanced Sarvam AI linguistic pipelines to interpret complex commands seamlessly in indigenous accents.
         </p>
         <button 
           onClick={() => toggleVoiceUI(true)}
           className="px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-full shadow-glow transition-transform active:scale-95"
         >
           Activate Context Matrix
         </button>
      </AnimatedPage>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
       {/* Background Blur Overlay Element */}
       <div 
         className="absolute inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity animate-in fade-in cursor-pointer" 
         onClick={() => toggleVoiceUI(false)}
       />
       
       {/* Explicit Container */}
       <div className="relative w-full max-w-lg z-10 animate-in zoom-in-95 duration-200">
         
         <div className="absolute right-4 top-4 z-20">
           <button 
             onClick={() => toggleVoiceUI(false)}
             className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-red-100 text-gray-500 hover:text-red-500 transition-colors"
           >
             ✖
           </button>
         </div>

         {/* Extends and encapsulates the complex logic built earlier without fragmenting states */}
         <VoiceRecorder 
           onInteractionComplete={(result) => {
             console.log("[Global Voice Handler] Extracted Execution Bounds:", result);
             // E.g. If the server requested a UI Route transition organically
             if (result.actionResult?.clientAction?.type === 'NAVIGATE') {
                toggleVoiceUI(false);
                window.location.href = result.actionResult.clientAction.payload.route;
             }
           }} 
         />
       </div>
    </div>
  );
}
