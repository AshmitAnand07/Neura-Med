import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import * as logger from 'firebase-functions/logger';

/**
 * --- AI System Requirements ---
 * Dedicated Adherence Log structure to ensure clean ML training/prediction data.
 * Isolated entirely from the UX/Alerts collection.
 */
export interface AdherenceLog {
  userId: string;
  medicineId: string;
  status: 'taken' | 'missed';
  timestamp: number; // AI team requested raw number for easier chronological sorting
}

/**
 * API Endpoint: logAdherence
 * Safe route for the frontend to log taking or missing a dose.
 */
export const logAdherence = onCall(async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Login required.');

  const { medicineId, status, timestamp } = request.data;
  const userId = request.auth.uid;

  if (!medicineId || !['taken', 'missed'].includes(status)) {
    throw new HttpsError('invalid-argument', 'Valid medicineId and status ("taken" | "missed") required.');
  }

  try {
    const db = admin.firestore();
    const logRef = db.collection('adherenceLogs').doc();
    
    const logData: AdherenceLog = {
      userId,
      medicineId,
      status,
      timestamp: timestamp || Date.now(),
    };

    await logRef.set(logData);
    return { success: true, message: 'Adherence tracked successfully.' };
  } catch (error) {
    logger.error('Failed to save adherence log:', error);
    throw new HttpsError('internal', 'Database error.');
  }
});

/**
 * API Endpoint: getAdherenceHistory
 * Helper query requested for the AI System. Returns clean, chronological data.
 */
export const getAdherenceHistory = onCall(async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Login required.');

  // Allows fetching for self, or if an AI microservice is authenticated to query for a specific user
  const targetUserId = request.data.userId || request.auth.uid;

  try {
    const db = admin.firestore();
    
    // Strict isolation to adherenceLogs collection. Latest first order.
    const snapshot = await db.collection('adherenceLogs')
      .where('userId', '==', targetUserId)
      .orderBy('timestamp', 'desc')
      .get();

    const history: AdherenceLog[] = [];
    snapshot.forEach(doc => {
      history.push(doc.data() as AdherenceLog);
    });

    return {
      success: true,
      count: history.length,
      history
    };
  } catch (error) {
    logger.error(`Error querying adherence history for ${targetUserId}:`, error);
    throw new HttpsError('internal', 'Unable to fetch adherence logs. Ensure Firestore index exists for userId + timestamp.');
  }
});

/**
 * API Endpoint: seedSampleAdherenceForAI
 * Utility to fulfill the AI team requirement: Ensure minimum 3 entries per user exist for testing.
 */
export const seedSampleAdherenceForAI = onCall(async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Login required.');

  const userId = request.auth.uid;
  const sampleMedicineId = request.data.medicineId || 'ai_test_med_xyz';
  
  try {
    const db = admin.firestore();
    const batch = db.batch();
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;

    // Minimum 3 chronological entries: [Today, Yesterday, Day Before]
    const samples: AdherenceLog[] = [
      { userId, medicineId: sampleMedicineId, status: 'taken', timestamp: now },
      { userId, medicineId: sampleMedicineId, status: 'missed', timestamp: now - oneDay },
      { userId, medicineId: sampleMedicineId, status: 'taken', timestamp: now - (2 * oneDay) },
    ];

    samples.forEach(sample => {
      const docRef = db.collection('adherenceLogs').doc();
      batch.set(docRef, sample);
    });

    await batch.commit();

    return {
      success: true,
      message: 'Created 3 chronological sample adherence logs for AI pipeline testing.',
      samples
    };
  } catch (error) {
    logger.error('Failed to mock AI adherence data', error);
    throw new HttpsError('internal', 'Seeding failed.');
  }
});
