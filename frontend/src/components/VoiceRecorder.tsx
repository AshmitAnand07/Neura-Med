import React, { useState, useRef, useEffect } from 'react';

/**
 * Interface mapping the exact output schema from our orchestrated Voice Endpoint
 */
export interface VoiceInteractionResponse {
  status: 'success' | 'clarification_needed' | 'error';
  transcript: string;
  intent: string;
  actionResult?: {
    success: boolean;
    systemResponseText: string;
    clientAction?: {
      type: 'NAVIGATE' | 'OPEN_UI_MODAL' | 'STATE_UPDATE';
      payload: any;
    };
  };
  audioResponseBase64?: string;
  message?: string;
}

interface VoiceRecorderProps {
  onInteractionComplete?: (data: VoiceInteractionResponse) => void;
  preferredLanguage?: 'hi-IN' | 'en-IN' | 'bn-IN' | 'ta-IN';
}

/**
 * Enterprise-grade Frontend Voice Control Interface
 * 
 * Captures user speech natively through the MediaRecorder HTML5 bounds,
 * orchestrates the HTTP connection to our Sarvam STT/TTS pipeline,
 * and seamlessly handles the UI transcript rendering matrix.
 */
export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ 
  onInteractionComplete,
  preferredLanguage = 'en-IN' 
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [currentIntent, setCurrentIntent] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  // Continuous listening / Wake-word detection state bounds
  const [isWakeWordActive, setIsWakeWordActive] = useState(false);

  useEffect(() => {
    // Advanced Module: Clean up streams on unmount
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const handleStartRecording = async () => {
    setErrorMsg(null);
    setTranscript(null);
    setCurrentIntent(null);
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await processAudio(audioBlob);
        
        // Kill the active hardware stream lights locally
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      
    } catch (error) {
      console.error("[Microphone Error]", error);
      setErrorMsg("Failed to access microphone. Please ensure permissions are granted.");
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processAudio = async (blob: Blob) => {
    setIsProcessing(true);
    setTranscript("Translating via Sarvam AI...");
    
    try {
      // 1. Package Blob for standard HTTP upload to our orchestrated endpoint
      const formData = new FormData();
      formData.append('audio', blob, 'recording.webm');
      formData.append('language', preferredLanguage);

      const response = await fetch('/api/voice/interact', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const rawJson = await response.json();
      const result = rawJson as VoiceInteractionResponse;

      // 2. Synchronize UI Visuals gracefully
      setTranscript(result.transcript || 'Unrecognized speech');
      setCurrentIntent(result.intent);

      // 3. Optional Voice Feedback Generation 
      if (result.audioResponseBase64) {
        // Natively play the base64 synthesized response securely without disk caching
        const audioData = `data:audio/wav;base64,${result.audioResponseBase64}`;
        const audioOut = new Audio(audioData);
        audioOut.play().catch(e => console.warn("Browser autoplay restricted", e));
      }

      // 4. Delegate explicit logical bounds upward
      if (onInteractionComplete) {
         onInteractionComplete(result);
      }

    } catch (error: any) {
      console.error("[Voice API Pipeline Error]", error);
      setErrorMsg("Failed to process your request securely.");
      setTranscript("System error occurred.");
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleWakeWordMode = () => {
    setIsWakeWordActive(!isWakeWordActive);
    // Future Expansion: Bind explicit Web Speech API continuous monitoring loop
    // hunting specifically for "Hey NeuraMed" phonetics.
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 border rounded-xl shadow-lg bg-white max-w-md mx-auto">
      
      {/* Visual Activity Tracker */}
      <div className="mb-4 text-center">
        <h3 className="text-xl font-bold text-gray-800 tracking-tight">NeuraMed Voice Controller</h3>
        {isRecording && <div className="text-red-500 animate-pulse font-medium text-sm mt-1">● Recording Audio... Speak now.</div>}
        {isProcessing && <div className="text-blue-500 animate-pulse font-medium text-sm mt-1">● Consulting AI Matrix...</div>}
      </div>

      {/* Main Interaction Mechanism */}
      <button 
        className={`w-24 h-24 rounded-full flex items-center justify-center text-white font-bold transition-all shadow-md focus:outline-none ${
          isRecording 
            ? 'bg-red-500 scale-110 ring-4 ring-red-200' 
            : isProcessing
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700 hover:scale-105 ring-4 ring-indigo-100'
        }`}
        disabled={isProcessing}
        onMouseDown={handleStartRecording}
        onMouseUp={handleStopRecording}
        onTouchStart={handleStartRecording}
        onTouchEnd={handleStopRecording}
      >
        {isRecording ? "Listening" : isProcessing ? "Thinking" : "Hold to Talk"}
      </button>

      {/* Debug & Transcript Matrix */}
      {(transcript || currentIntent || errorMsg) && (
        <div className="mt-6 w-full p-4 bg-gray-50 rounded-lg border border-gray-100 text-sm">
          
          {errorMsg && (
             <div className="text-red-600 font-semibold mb-2 bg-red-50 p-2 rounded">
               Error: {errorMsg}
             </div>
          )}

          {transcript && (
            <div className="mb-2">
              <span className="text-gray-500 font-semibold uppercase text-xs">Live Transcript: </span>
              <p className="text-gray-900 mt-1 italic">"{transcript}"</p>
            </div>
          )}

          {currentIntent && currentIntent !== 'UNKNOWN' && (
            <div className="mt-2 bg-indigo-50 p-2 rounded border border-indigo-100 flex items-center gap-2">
               <span className="bg-indigo-600 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded">Action Bound</span>
               <span className="text-gray-700 font-mono text-xs">{currentIntent}</span>
            </div>
          )}
        </div>
      )}

      {/* Continuous Mode Toggle */}
      <div className="mt-6 flex items-center gap-2">
        <label className="text-xs text-gray-500 font-medium">Continuous Wake Word Mode ("Hey NeuraMed")</label>
        <button 
          onClick={toggleWakeWordMode}
          className={`w-10 h-5 rounded-full relative transition-colors ${isWakeWordActive ? 'bg-indigo-600' : 'bg-gray-300'}`}
        >
          <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-transform ${isWakeWordActive ? 'left-6' : 'left-1'}`} />
        </button>
      </div>

    </div>
  );
};

export default VoiceRecorder;
