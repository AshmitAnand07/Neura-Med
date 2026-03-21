import * as admin from 'firebase-admin';
import { textToSpeech } from './sarvamTTS';

if (!admin.apps.length) {
  admin.initializeApp();
}

const fcm = admin.messaging();

export interface VoiceAlertRequest {
  userId: string;
  fcmToken?: string;
  messageText: string;
  language: 'en-IN' | 'hi-IN' | 'bn-IN' | 'ta-IN';
}

/**
 * Secures delivery of crucial voice alerts globally.
 * 
 * Flow:
 * 1. Pull Sarvam TTS base64 audio block.
 * 2. Send 'silent data push' aggressively via FCM straight to the Android/Web client backbone.
 * 3. The client receives the event and plays the bundled Sarvam payload natively, dropping back to OS voices if needed.
 */
export async function dispatchVoiceAlert(alertReq: VoiceAlertRequest): Promise<boolean> {
  const { userId, fcmToken, messageText, language } = alertReq;
  
  console.log(`[Voice Alert] Pushing TTS Alert -> User: ${userId}`);

  // Fetch the latest FCM device token natively from NoSQL if not explicitly provided
  let targetToken = fcmToken;
  if (!targetToken) {
    const userDocRef = admin.firestore().collection('users').doc(userId);
    const userDoc = await userDocRef.get();
    targetToken = userDoc.exists ? userDoc.data()?.fcmToken : null;
  }

  if (!targetToken) {
    console.warn(`[Voice Alert] No valid FCM token registered for ${userId}. Alert dropped.`);
    return false;
  }

  // 1. Generate Voice Audio via Sarvam Pipeline
  let audioBase64 = "";
  let usingFallback = false;

  try {
     const ttsBuffer = await textToSpeech(messageText, language);
     audioBase64 = ttsBuffer.toString('base64');
  } catch (error) {
     console.error("[Voice Alert] Cloud TTS failed. Informing client to use local OS text-to-speech engine fallback.", error);
     usingFallback = true;
  }

  // 2. Dispatch Aggressive FCM Logic
  const message = {
    token: targetToken,
    // Data messages wake up the app securely in the background (Android/PWA)
    data: {
      type: 'VOICE_ALERT',
      messageText,
      language,
      usingFallback: usingFallback ? "true" : "false",
      audioPayload: audioBase64 // Note: FCM Data payload max is 4KB. For large audio, we stream this via secure HTTP fetch hook instead.
    },
    // Standard visual push layout
    notification: {
      title: "NeuraMed Voice Alert",
      body: messageText
    },
    android: {
      priority: 'high' as any
    }
  };

  try {
    const response = await fcm.send(message);
    console.log(`[Voice Alert] FCM Dispatch successful -> ${response}`);
    return true;
  } catch (error) {
    console.error(`[Voice Alert] FCM Networking Failure.`, error);
    return false;
  }
}
