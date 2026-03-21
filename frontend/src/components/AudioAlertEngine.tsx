import React, { useEffect, useRef, useState } from 'react';

interface AudioAlertProps {
  fcmMessagePayload?: {
    type: string;
    messageText: string;
    language: string;
    audioPayload?: string; // base64 payload from FCM explicitly mapping Sarvam bits
    usingFallback: string; // 'true' | 'false'
  };
}

/**
 * Headless frontend component managing aggressive text-to-speech fallback logic and Web Audio APIs.
 * Best mounted globally in `_app.tsx` or `layout.tsx`.
 */
export const AudioAlertEngine: React.FC<AudioAlertProps> = ({ fcmMessagePayload }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);
  const contextUnlockedRef = useRef(false);

  // Advanced Browser Autoplay Defeat: Wait for user to explicitly click ANYWHERE on the document once.
  useEffect(() => {
    const unlockAudio = () => {
      setUserInteracted(true);
      contextUnlockedRef.current = true;
      document.removeEventListener('click', unlockAudio);
      document.removeEventListener('touchstart', unlockAudio);
      console.log("[AudioEngine] Native Browser HTML5 Autoplay explicitly unlocked.");
    };

    document.addEventListener('click', unlockAudio);
    document.addEventListener('touchstart', unlockAudio);

    return () => {
      document.removeEventListener('click', unlockAudio);
      document.removeEventListener('touchstart', unlockAudio);
    };
  }, []);

  useEffect(() => {
    if (!fcmMessagePayload || fcmMessagePayload.type !== 'VOICE_ALERT') return;

    if (!contextUnlockedRef.current) {
      console.warn("[AudioEngine] Received Voice Alert but DOM Autoplay is locked! Silently failing via visual push only.");
      // Optional: Dispatch a localized visible toast error asking them to tap
      return;
    }

    playVoiceAlert(fcmMessagePayload);
  }, [fcmMessagePayload]);


  const playVoiceAlert = (payload: any) => {
    if (isPlaying) {
      console.warn("[AudioEngine] Suppressing overlapping Voice Alerts safely.");
      return;
    }

    setIsPlaying(true);

    // 1. Check for valid Base64 Sarvam Payload
    if (payload.audioPayload && payload.usingFallback === 'false') {
      try {
        const audioData = `data:audio/wav;base64,${payload.audioPayload}`;
        const audio = new Audio(audioData);
        
        audio.onended = () => setIsPlaying(false);
        audio.onerror = () => {
          console.error("[AudioEngine] Base64 Buffer execution crashed. Dropping to Native WebSpeech.");
          executeFallbackSpeech(payload.messageText, payload.language);
        };

        console.log("[AudioEngine] Playing high-fidelity Sarvam buffer...");
        audio.play().catch((e) => {
           console.error("[AudioEngine] Autoplay constraint blocked Sarvam Blob.", e);
           setIsPlaying(false);
        });
        
        return;
      } catch (err) {
        console.error("Audio buffer hydration failed:", err);
      }
    }

    // 2. Fallback execution explicitly via HTML5 SpeechSynthesis
    executeFallbackSpeech(payload.messageText, payload.language);
  };

  const executeFallbackSpeech = (text: string, lang: string) => {
    console.log(`[AudioEngine] Falling back to Web Speech Synthesis -> "${text}"`);

    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      // Map standard Sarvam tags to closest HTML5 equivalents dynamically
      utterance.lang = lang === 'hi-IN' ? 'hi-IN' : 'en-IN';
      utterance.rate = 1.0;

      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = (e) => {
         console.error("[AudioEngine] Native TTS Failure:", e);
         setIsPlaying(false);
      };

      window.speechSynthesis.speak(utterance);
    } else {
      console.error("[AudioEngine] No TTS engines supported natively in this browser.");
      setIsPlaying(false);
    }
  };

  // UI optionally renders an indicator to visually flag background Voice action
  return isPlaying ? (
    <div className="fixed bottom-4 right-4 z-50 bg-indigo-600 shadow-xl rounded-full p-3 flex items-center justify-center animate-pulse border-2 border-indigo-200">
      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5 10v4a2 2 0 002 2h4l5 5V3l-5 5H7a2 2 0 00-2 2z" />
      </svg>
    </div>
  ) : null;
};

export default AudioAlertEngine;
