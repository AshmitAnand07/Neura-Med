/**
 * Sarvam AI - Text to Speech (TTS) Integration
 * 
 * Generates natural, regional voice audio files natively from backend strings.
 */
export async function textToSpeech(text: string, languageCode: 'hi-IN' | 'en-IN' | 'bn-IN' | 'ta-IN' = 'en-IN'): Promise<Buffer> {
  const SARVAM_API_KEY = process.env.SARVAM_API_KEY;

  if (!SARVAM_API_KEY) {
    throw new Error('SARVAM_API_KEY environment variable is absolutely missing. Cannot authenticate with Sarvam AI.');
  }

  try {
    console.log(`[Sarvam TTS] Generating audio response natively encoded for string -> "${text.substring(0, 30)}..."`);
    
    const payload = {
      inputs: [text],
      target_language_code: languageCode,
      speaker: "meera", // Assuming 'meera' is a standard high-fidelity voice character
      pitch: 0,
      pace: 1.0,
      loudness: 1.0,
      speech_sample_rate: 16000
    };

    // Replace with actual Sarvam TTS Endpoint
    const response = await fetch('https://api.sarvam.ai/text-to-speech', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-subscription-key': SARVAM_API_KEY
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Sarvam TTS Error: ${response.status} -> ${errText}`);
    }

    const data = await response.json();
    
    // Sarvam natively returns base64 encoded audio strings representing a WAV/MP3 file
    const base64Audio = data.audios[0];
    const audioBuffer = Buffer.from(base64Audio, 'base64');
    
    console.log(`[Sarvam TTS] Audio boundary generated successfully. Length: ${audioBuffer.byteLength} bytes.`);
    
    return audioBuffer;

  } catch (error: any) {
    console.error('[Sarvam TTS] Text-To-Speech Synthesis Failure:', error.message);
    throw new Error(`Audio synthesis failed: ${error.message}`);
  }
}
