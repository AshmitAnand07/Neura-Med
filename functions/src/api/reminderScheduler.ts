import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { generateVoiceAlertMessage } from '../services/messageGenerator';
import { dispatchVoiceAlert } from '../services/voiceAlertService';

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

/**
 * Automates the Voice Reminder loop dynamically every 5 minutes.
 * 
 * 1. Queries NoSQL for pending med schedules where 'status' is 'pending'.
 * 2. Compares timestamp vs current time.
 * 3. Triggers Sarvam Voice Alerts via FCM strictly for overdue or right-on-time medications.
 */
export const smartReminderAutomator = functions.pubsub.schedule('every 5 minutes').onRun(async (context) => {
  console.log("[CRON] Initiating Smart Voice Reminder Sweep...");
  
  const now = admin.firestore.Timestamp.now();
  // Standard adherence interval mapping: sweep the past hour for 'missed' and current 5min for 'now'
  const oneHourAgo = new admin.firestore.Timestamp(now.seconds - 3600, 0);

  try {
    const pendingLogs = await db.collection('adherenceLogs')
      .where('status', '==', 'pending')
      .where('scheduledTime', '>=', oneHourAgo)
      .where('scheduledTime', '<=', now)
      .get();

    if (pendingLogs.empty) {
      console.log("[CRON] 0 active pending triggers found.");
      return null;
    }

    console.log(`[CRON] Detected ${pendingLogs.size} pending doses. Firing Sarvam Triggers.`);
    const alertsToDispatch = [];

    for (const log of pendingLogs.docs) {
      const data = log.data();
      const userId = data.userId;
      const scheduledTime = data.scheduledTime.toDate();
      const delayMinutes = Math.floor((new Date().getTime() - scheduledTime.getTime()) / 60000);
      
      const isMissed = delayMinutes > 15; // If it's been explicitly more than 15 mins
      
      const messageText = generateVoiceAlertMessage({
        medicineName: data.medicineName,
        dosage: data.dosage || "prescribed amount",
        timeLabel: data.timeLabel || "scheduled",
        isMissed
      }, data.preferredLanguage || 'en-IN'); // Natively fetch language preferences

      const alertReq = {
        userId,
        messageText,
        language: data.preferredLanguage || 'en-IN'
      };

      // Push asynchronously to the TTS logic
      alertsToDispatch.push(dispatchVoiceAlert(alertReq));
    }

    // Execute concurrently globally
    await Promise.all(alertsToDispatch);
    console.log(`[CRON] Successfully dispatched ${alertsToDispatch.length} Voice Actions!`);
    
    return null;

  } catch (error) {
    console.error("[CRON] Fatal Sweep Collision:", error);
    return null;
  }
});
