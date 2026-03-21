export interface PatientAlertData {
  patientName?: string;
  medicineName: string;
  dosage: string;
  timeLabel: string; // e.g., "morning", "9 AM"
  instructions?: string; // e.g., "after food"
  isMissed?: boolean;
}

/**
 * Transforms rigid database schemas into fluid, conversational human strings.
 * Built to be piped directly into the Sarvam TTS Engine.
 */
export function generateVoiceAlertMessage(data: PatientAlertData, languageCode: 'en-IN' | 'hi-IN' | 'bn-IN' = 'en-IN'): string {
  
  const { patientName, medicineName, dosage, timeLabel, instructions, isMissed } = data;
  const namePrefix = patientName ? `Hello ${patientName}, ` : '';
  const instructSuffix = instructions ? ` Please remember to take it ${instructions}.` : '';

  // 1. English Standard (Optimized for Sarvam English-Indian accents)
  if (languageCode === 'en-IN') {
    if (isMissed) {
      return `${namePrefix}you have missed your ${timeLabel} dose of ${medicineName}. Please take ${dosage} immediately if it is safe to do so.${instructSuffix}`;
    } else {
      return `${namePrefix}it is time to take your ${timeLabel} medicine: ${medicineName}, ${dosage}.${instructSuffix}`;
    }
  }

  // 2. Hindi Contextual Translations
  if (languageCode === 'hi-IN') {
     const hiName = patientName ? `Namaste ${patientName}, ` : '';
     const hiInstruct = instructions === 'after food' ? ' Khane ke baad lijiyega.' 
                     : instructions === 'before food' ? ' Khali pet lijiyega.' : '';
                     
     if (isMissed) {
        return `${hiName}aapne apni ${timeLabel} ki ${medicineName} ki dawai miss kar di hai. Kripya apna ${dosage} turant lein.${hiInstruct}`;
     } else {
        return `${hiName}apni ${timeLabel} ki dawai laine ka samay ho gaya hai. Dawai hai ${medicineName}, ${dosage}.${hiInstruct}`;
     }
  }

  // Fallback to English generic
  return isMissed 
    ? `Warning: Missed dose of ${medicineName}.` 
    : `Reminder: Time to take ${medicineName}.`;
}
