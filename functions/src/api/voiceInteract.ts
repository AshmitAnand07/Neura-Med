import { speechToText } from '../services/sarvamSTT';
import { parseVoiceIntent } from '../services/intentParser';
import { executeVoiceAction, ActionResponse } from '../services/actionHandler';
import { textToSpeech } from '../services/sarvamTTS';

export interface VoiceInteractionResponse {
  status: 'success' | 'clarification_needed' | 'error';
  transcript: string;
  intent: string;
  actionResult?: ActionResponse;
  // Base64 encoded audio playable directly in the browser via `data:audio/wav;base64,...`
  audioResponseBase64?: string;
  message?: string;
}

/**
 * High-Speed Synchronous Voice Pipeline Orchestrator
 * 
 * 1. Takes raw regional audio 
 * 2. Parses to English/Hindi intent 
 * 3. Safely executes internal functions 
 * 4. Synthesizes indigenous spoken response back to the client
 */
export async function processVoiceInteraction(
  audioBuffer: Buffer, 
  userId: string,
  preferredLanguage: 'hi-IN' | 'en-IN' | 'bn-IN' | 'ta-IN' = 'en-IN'
): Promise<VoiceInteractionResponse> {
  
  try {
    // Pipeline Stage 1: Sarvam Speech to Text
    let transcript = "";
    try {
      transcript = await speechToText(audioBuffer, preferredLanguage);
    } catch (sttError) {
      console.warn("[Voice Endpoint] STT Degradation.", sttError);
      return {
        status: 'error',
        transcript: "",
        intent: 'UNKNOWN',
        message: 'I am having trouble hearing you clearly. Please check your microphone or speak steadily.'
      };
    }

    if (!transcript || transcript.length < 2) {
      return {
        status: 'clarification_needed',
        transcript,
        intent: 'UNKNOWN',
        message: "I didn't quite catch that. Could you please repeat?"
      };
    }

    // Pipeline Stage 2: OpenAI NLP Router
    const parsedIntentInfo = await parseVoiceIntent(transcript);
    
    // Pipeline Stage 3: Feature Execution Map
    const executionResult = await executeVoiceAction(userId, parsedIntentInfo);

    // Pipeline Stage 4: Sarvam Text to Speech Feedback
    let ttsBase64 = undefined;
    try {
      if (executionResult.systemResponseText) {
         const ttsBuffer = await textToSpeech(executionResult.systemResponseText, preferredLanguage);
         ttsBase64 = ttsBuffer.toString('base64');
      }
    } catch (ttsError) {
      console.warn("[Voice Endpoint] TTS Generation skipped or failed.", ttsError);
      // Soft-fail: We still return the transcript and action so the UI works without audio
    }

    // Return the perfectly encapsulated boundary object to the web frontend
    return {
      status: 'success',
      transcript,
      intent: parsedIntentInfo.intent,
      actionResult: executionResult,
      audioResponseBase64: ttsBase64,
      message: executionResult.systemResponseText
    };

  } catch (error: any) {
    console.error("[Voice Endpoint] Fatal Internal Execution Bounds.", error);
    throw new Error(`Critical failure processing voice interaction: ${error.message}`);
  }
}
