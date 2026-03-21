import { onSchedule } from 'firebase-functions/v2/scheduler';
import * as admin from 'firebase-admin';
import * as logger from 'firebase-functions/logger';

/**
 * Scheduled Cloud Function that runs daily at midnight.
 * It checks the inventory for medicines expiring within 30 days
 * and generates alerts for users so they can use or donate them.
 */
export const checkMedicineExpiries = onSchedule('every day 00:00', async (event) => {
  try {
    const db = admin.firestore();
    const now = new Date();
    
    // Define the threshold: Look for medicines expiring in the next 30 days
    const expiryThresholdDate = new Date();
    expiryThresholdDate.setDate(now.getDate() + 30);

    logger.info(`[Scheduled Job] Running daily expiry check. Threshold date: ${expiryThresholdDate.toISOString()}`);

    // Query medicines where the expiry date is approaching
    // Standardizing on 'expiryDate' as a Firestore Timestamp
    const medicinesSnapshot = await db.collection('medicines')
      .where('expiryDate', '<=', admin.firestore.Timestamp.fromDate(expiryThresholdDate))
      .get();

    if (medicinesSnapshot.empty) {
      logger.info('[Scheduled Job] No medicines found expiring within the 30-day threshold.');
      return;
    }

    let alertsCreated = 0;
    const batch = db.batch();

    // Iterate over the expiring medicines
    for (const doc of medicinesSnapshot.docs) {
      const medicine = doc.data();
      const userId = medicine.userId;
      const medicineName = medicine.name || 'Unknown Medicine';
      
      if (!userId) {
        logger.warn(`[Scheduled Job] Medicine ${doc.id} has no userId attached. Skipping.`);
        continue;
      }

      // To prevent spamming the user, check if an UNREAD expiry alert already exists for this specific medicine
      const existingAlertQuery = await db.collection('alerts')
        .where('userId', '==', userId)
        .where('medicineId', '==', doc.id)
        .where('type', '==', 'EXPIRY_WARNING')
        .where('isRead', '==', false)
        .limit(1)
        .get();

      if (existingAlertQuery.empty) {
        // Calculate precise days remaining for the alert message
        const expiryDate = medicine.expiryDate.toDate();
        const daysRemaining = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 3600 * 24));

        let alertMessage = '';
        let priority = 'low';

        if (daysRemaining < 0) {
          alertMessage = `Your medicine "${medicineName}" has expired. Please dispose of it safely according to local guidelines.`;
          priority = 'high';
        } else if (daysRemaining === 0) {
          alertMessage = `Your medicine "${medicineName}" expires today.`;
          priority = 'high';
        } else if (daysRemaining <= 7) {
          alertMessage = `Your medicine "${medicineName}" is expiring soon (${daysRemaining} days). Consider donating it immediately if unused.`;
          priority = 'medium';
        } else {
          alertMessage = `Your medicine "${medicineName}" is expiring in ${daysRemaining} days. Remember to track its usage.`;
        }

        // Create a new alert document
        const alertRef = db.collection('alerts').doc();
        
        batch.set(alertRef, {
          userId: userId,
          medicineId: doc.id,
          medicineName: medicineName,
          type: 'EXPIRY_WARNING',
          priority: priority,
          message: alertMessage,
          isRead: false,
          daysRemaining: daysRemaining,
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        alertsCreated++;
      }
    }

    // Commit the batch of new alerts
    if (alertsCreated > 0) {
      await batch.commit();
      logger.info(`[Scheduled Job] Successfully completed. Generated ${alertsCreated} new expiry alerts.`);
    } else {
      logger.info('[Scheduled Job] Scan complete. No new expiry alerts needed to be generated.');
    }

  } catch (error) {
    logger.error('[Scheduled Job Error] Failed to complete daily expiry check:', error);
  }
});
