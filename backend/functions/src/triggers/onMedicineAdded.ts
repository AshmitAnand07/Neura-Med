import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import * as admin from 'firebase-admin';
import * as logger from 'firebase-functions/logger';

/**
 * AI Logic: Simple Jaccard Similarity on text tokens.
 * Used here for analyzing active ingredients / composition to detect duplicate drugs.
 */
function calculateJaccardSimilarity(str1: string, str2: string): number {
  if (!str1 || !str2) return 0;

  // Tokenize and clean strings
  const set1 = new Set(str1.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean));
  const set2 = new Set(str2.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean));
  
  if (set1.size === 0 && set2.size === 0) return 0;
  
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  
  return intersection.size / union.size;
}

/**
 * Firestore Trigger: onMedicineAdded
 * Fires when a new medicine is added to the user's inventory.
 * Responsibilities:
 * 1. Duplicate detection (Composition Similarity)
 * 2. Immediate Expiry Alerting (if adding an already expired/expiring soon drug)
 */
export const onMedicineAdded = onDocumentCreated('medicines/{medicineId}', async (event) => {
  const snapshot = event.data;
  if (!snapshot) {
    logger.error('No data found for the triggered event.');
    return;
  }

  const newMedicine = snapshot.data();
  const userId = newMedicine.userId;
  const db = admin.firestore();

  if (!userId) {
    logger.warn(`Medicine ${event.params.medicineId} created without a userId. Discarding trigger.`);
    return;
  }

  try {
    const batch = db.batch();
    let requiresAlerts = false;

    // --- 1. Duplicate Detection (Composition Similarity/AI Rules) ---
    // Fetch the user's current inventory inventory to check against the new addition
    const inventorySnapshot = await db.collection('medicines')
      .where('userId', '==', userId)
      .get();

    // Use composition if available, fallback to name
    const newMedComposition = newMedicine.composition || newMedicine.name || '';
    
    if (newMedComposition) {
      for (const doc of inventorySnapshot.docs) {
        // Skip comparing the medicine against itself
        if (doc.id === event.params.medicineId) continue;
        
        const existingMed = doc.data();
        const existingMedComposition = existingMed.composition || existingMed.name || '';
        
        if (!existingMedComposition) continue;

        const similarityScore = calculateJaccardSimilarity(newMedComposition, existingMedComposition);
        
        // Threshold: 70% or higher token overlap generally means it's the same composition/salt
        if (similarityScore >= 0.7) {
          logger.info(`Duplicate detected for User ${userId}. Similarity Score: ${Math.round(similarityScore * 100)}%`);
          
          const duplicateAlertRef = db.collection('alerts').doc();
          batch.set(duplicateAlertRef, {
            userId,
            medicineId: event.params.medicineId,
            relatedMedicineId: doc.id,
            type: 'DUPLICATE_WARNING',
            message: `Warning: "${newMedicine.name}" has a very similar composition to your existing medicine "${existingMed.name}". Please review to prevent over-medicating.`,
            isRead: false,
            priority: 'high',
            createdAt: admin.firestore.FieldValue.serverTimestamp()
          });
          
          requiresAlerts = true;
          // Generate at most 1 duplicate alert to avoid spamming the user
          break; 
        }
      }
    }

    // --- 2. Immediate Expiry Checker ---
    // User might upload a medicine that is already expired or expiring within a week
    if (newMedicine.expiryDate) {
      const now = new Date();
      const expiryDate = newMedicine.expiryDate.toDate(); // Assuming Firestore Timestamp
      
      const daysRemaining = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 3600 * 24));

      if (daysRemaining <= 7) {
        const expiryAlertRef = db.collection('alerts').doc();
        let message = '';
        let priority = 'medium';

        if (daysRemaining < 0) {
          message = `Warning: The medicine "${newMedicine.name}" you just added is already expired! Do not consume it.`;
          priority = 'high';
        } else if (daysRemaining === 0) {
          message = `Warning: The medicine "${newMedicine.name}" you just added expires today!`;
          priority = 'high';
        } else {
          message = `Notice: The medicine "${newMedicine.name}" you just added will expire in only ${daysRemaining} days.`;
        }

        batch.set(expiryAlertRef, {
          userId,
          medicineId: event.params.medicineId,
          type: 'EXPIRY_WARNING',
          message,
          priority,
          isRead: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        requiresAlerts = true;
      }
    }

    // Commit any generated alerts to Firestore
    if (requiresAlerts) {
      await batch.commit();
      logger.info(`Triggers processed successfully for newly added medicine: ${event.params.medicineId}`);
    }

  } catch (error) {
    logger.error('Error processing onMedicineAdded Firestore Trigger:', error);
  }
});
