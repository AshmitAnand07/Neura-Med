import os
import httpx
from typing import Optional

SARVAM_API_URL_STT = "https://api.sarvam.ai/speech-to-text"
SARVAM_API_URL_TTS = "https://api.sarvam.ai/text-to-speech"

async def speech_to_text(audio_bytes: bytes, language_code: str = "en-IN") -> str:
    """
    Sarvam AI - Speech to Text (STT) Integration with Mock Fallback
    """
    api_key = os.getenv("SARVAM_API_KEY", "")
    if "dummy" in api_key or not api_key:
        print("ℹ️ [Voice Service] Dev Mode: Returning mock transcript.")
        return "I need to add Amoxicillin to my list."

    try:
        files = {'file': ('recording.webm', audio_bytes, 'audio/webm')}
        data = {'language_code': language_code, 'model': 'saaras:v1'}
        headers = {'api-subscription-key': api_key}

        async with httpx.AsyncClient() as client:
            response = await client.post(SARVAM_API_URL_STT, headers=headers, data=data, files=files)
            if response.status_code != 200:
                return "MOCK: Unable to reach voice service."
            result = response.json()
            return result.get("transcript", "")
    except Exception:
        return "MOCK: Voice processing offline."

async def text_to_speech(text: str, language_code: str = "hi-IN") -> bytes:
    """
    Sarvam AI - Text to Speech (TTS) Integration with Mock Fallback
    """
    api_key = os.getenv("SARVAM_API_KEY", "")
    if "dummy" in api_key or not api_key:
        # Return a tiny blank WAV header as mock
        return b'RIFF$\x00\x00\x00WAVEfmt \x10\x00\x00\x00\x01\x00\x01\x00D\xac\x00\x00\x88X\x01\x00\x02\x00\x10\x00data\x00\x00\x00\x00'

    try:
        payload = {"inputs": [text], "target_language_code": language_code, "speaker": "meera", "model": "bulbul:v1"}
        headers = {'api-subscription-key': api_key, 'Content-Type': 'application/json'}

        async with httpx.AsyncClient() as client:
            response = await client.post(SARVAM_API_URL_TTS, headers=headers, json=payload)
            if response.status_code != 200:
                raise Exception("Service Error")
            result = response.json()
            import base64
            return base64.b64decode(result.get("audios", [])[0])
    except Exception:
        return b'RIFF$\x00\x00\x00WAVEfmt \x10\x00\x00\x00\x01\x00\x01\x00D\xac\x00\x00\x88X\x01\x00\x02\x00\x10\x00data\x00\x00\x00\x00'
