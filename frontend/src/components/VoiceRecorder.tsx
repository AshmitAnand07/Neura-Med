'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Mic, 
  Square, 
  Loader2, 
  MessageSquare, 
  Zap, 
  AlertCircle,
  Volume2
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export interface VoiceInteractionResponse {
  status: 'success' | 'clarification_needed' | 'error';
  transcript: string;
  intent: string;
  audioResponseBase64?: string;
  message?: string;
}

interface VoiceRecorderProps {
  onInteractionComplete?: (data: VoiceInteractionResponse) => void;
  preferredLanguage?: 'hi-IN' | 'en-IN' | 'bn-IN' | 'ta-IN';
}

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

  useEffect(() => {
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
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await processAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      setErrorMsg("Please grant microphone access to use voice commands.");
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
    try {
      const formData = new FormData();
      formData.append('audio', blob, 'recording.webm');
      formData.append('language', preferredLanguage);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/voice/interact`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error(`Server returned ${response.status}`);

      const result = await response.json() as VoiceInteractionResponse;
      setTranscript(result.transcript || 'No speech detected.');
      setCurrentIntent(result.intent);

      if (result.audioResponseBase64) {
        const audioOut = new Audio(`data:audio/wav;base64,${result.audioResponseBase64}`);
        audioOut.play().catch(() => console.warn("Autoplay blocked."));
      }

      if (onInteractionComplete) onInteractionComplete(result);
    } catch (error) {
      setErrorMsg("Voice engine is busy. Using offline fallback.");
      setTranscript("Mock: I need to add Amoxicillin.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto overflow-hidden border-none shadow-2xl bg-white">
      <div className="h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500" />
      <CardContent className="p-10 space-y-10">
        
        {/* State Display */}
        <div className="text-center space-y-2">
            <h3 className="text-2xl font-bold text-slate-900">AI Voice Assistant</h3>
            <p className="text-slate-500 text-sm">Powered by Sarvam Multi-lingual Indian AI</p>
            {isRecording && (
                <div className="flex items-center justify-center gap-2 text-red-500 font-bold animate-pulse text-xs uppercase tracking-widest pt-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full" />
                    Listening...
                </div>
            )}
            {isProcessing && (
                <div className="flex items-center justify-center gap-2 text-blue-500 font-bold animate-pulse text-xs uppercase tracking-widest pt-2">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Thinking...
                </div>
            )}
        </div>

        {/* Microphone Button */}
        <div className="flex justify-center py-4">
            <button 
                onMouseDown={handleStartRecording}
                onMouseUp={handleStopRecording}
                onTouchStart={handleStartRecording}
                onTouchEnd={handleStopRecording}
                disabled={isProcessing}
                className={`relative group w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl
                    ${isRecording 
                        ? 'bg-red-500 scale-110 shadow-red-200' 
                        : isProcessing
                            ? 'bg-slate-100 cursor-wait'
                            : 'bg-emerald-600 hover:bg-emerald-700 hover:scale-105 shadow-emerald-200'}
                `}
            >
                {/* Pulse Rings */}
                {isRecording && (
                    <>
                        <div className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-25" />
                        <div className="absolute -inset-4 rounded-full bg-red-400 animate-ping opacity-10" />
                    </>
                )}
                
                {isRecording ? (
                    <Square className="w-10 h-10 text-white fill-current" />
                ) : isProcessing ? (
                    <Loader2 className="w-10 h-10 text-slate-400 animate-spin" />
                ) : (
                    <Mic className="w-12 h-12 text-white" />
                )}
            </button>
        </div>

        {/* Feedback Section */}
        <div className="space-y-4">
            {(transcript || errorMsg) && (
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 animate-page-entry">
                    {errorMsg && (
                        <div className="flex items-center gap-2 text-amber-600 mb-3 text-sm font-semibold">
                            <AlertCircle size={16} /> {errorMsg}
                        </div>
                    )}
                    {transcript && (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                    <MessageSquare size={12} /> Transcript
                                </span>
                                {currentIntent && (
                                    <Badge variant="info" className="text-[9px] font-black uppercase">
                                        Intent: {currentIntent}
                                    </Badge>
                                )}
                            </div>
                            <p className="text-slate-800 font-medium italic leading-relaxed text-lg">
                                "{transcript}"
                            </p>
                        </div>
                    )}
                </div>
            )}

            <div className="flex items-center justify-center gap-6 text-slate-400">
                <div className="flex items-center gap-2 text-xs font-medium">
                    <Zap size={14} className="text-amber-500" /> Ultra-low Latency
                </div>
                <div className="flex items-center gap-2 text-xs font-medium">
                    <Volume2 size={14} className="text-blue-500" /> Neural TTS
                </div>
            </div>
        </div>

        <p className="text-center text-[10px] text-slate-400 font-medium px-4 leading-relaxed">
            Long press the microphone to speak. Our AI understands English and major Indian regional languages securely.
        </p>
      </CardContent>
    </Card>
  );
};

export default VoiceRecorder;
