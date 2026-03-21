/**
 * Sarvam AI - Speech to Text (STT) Integration
 * 
 * Translates multi-lingual Indian regional audio into highly accurate text.
 */
export async function speechToText(audioBuffer: Buffer, languageCode: 'hi-IN' | 'en-IN' | 'bn-IN' | 'ta-IN' = 'en-IN'): Promise<string> {
  const SARVAM_API_KEY = process.env.SARVAM_API_KEY;

  if (!SARVAM_API_KEY) {
    throw new Error('SARVAM_API_KEY environment variable is absolutely missing. Cannot authenticate with Sarvam AI.');
  }

  // Sarvam API typically requires multipart form data for uploading audio streams natively
  const formData = new FormData();
  
  // We construct a File object or Blob equivalent natively here.
  // In Node.js environment, using fetch with Blob:
  const audioBlob = new Blob([audioBuffer], { type: 'audio/webm' });
  formData.append('file', audioBlob, 'recording.webm');
  formData.append('language_code', languageCode);
  // Sarvam may require a specific model string
  formData.append('model', 'saaras:v1');

  try {
    console.log(`[Sarvam STT] Translating recorded audio stream explicitly into text format (${languageCode})...`);
    
    // Replace with explicit Sarvam STT Route 
    const response = await fetch('https://api.sarvam.ai/speech-to-text', {
      method: 'POST',
      headers: {
        'api-subscription-key': SARVAM_API_KEY
      },
      body: formData
    });

    if (!response.ok) {
       const err = await response.text();
       throw new Error(`Sarvam STT Error: ${response.status} -> ${err}`);
    }

    const data = await response.json();
    console.log(`[Sarvam STT] Successfully inferred: "${data.transcript}"`);
    
    return data.transcript || "";

  } catch (error: any) {
    console.error('[Sarvam STT] Critical Pipeline Failure:', error.message);
    throw new Error(`Speech-to-Text inference failed: ${error.message}`);
  }
}
