import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import * as admin from 'firebase-admin';
import * as logger from 'firebase-functions/logger';

/**
 * Firestore Trigger: onDonationCreated
 * Fires when a user successfully creates a donation record targeted at an NGO.
 * 
 * Responsibilities:
 * 1. Alert the selected NGO about the incoming donation.
 * 2. Send push notifications via FCM if the NGO has registered devices.
 * 3. Update associated medicines to "Donated" status to prevent further expiry alerts.
 * 4. Set the initial donation status to Pending.
 */
export const onDonationCreated = onDocumentCreated('donations/{donationId}', async (event) => {
  const snapshot = event.data;
  
  if (!snapshot) {
    logger.error('No data found for the triggered donation event.');
    return;
  }

  const donation = snapshot.data();
  const { ngoId, donorId, medicines } = donation;
  const db = admin.firestore();

  if (!ngoId) {
    logger.error(`Donation ${event.params.donationId} created without a targeted ngoId. Discarding trigger.`);
    return;
  }

  try {
    // 1. Fetch the targeted NGO Details from Firestore
    const ngoDoc = await db.collection('ngos').doc(ngoId).get();
    
    if (!ngoDoc.exists) {
      logger.error(`NGO with ID ${ngoId} does not exist in the database.`);
      return;
    }

    const ngoData = ngoDoc.data();
    // Assuming NGOs have an assigned admin user ID that links to their dashboard/alerts
    const ngoAdminUserId = ngoData?.adminUserId; 

    const batch = db.batch();
    
    // 2. Create an in-app Alert/Notification for the NGO Admin
    if (ngoAdminUserId) {
      const alertRef = db.collection('alerts').doc();
      batch.set(alertRef, {
        userId: ngoAdminUserId,
        donationId: event.params.donationId,
        type: 'NEW_DONATION_RECEIVED',
        message: `You have received a new medicine donation request containing ${medicines?.length || 'various'} items. Please review to arrange logistics.`,
        isRead: false,
        priority: 'high',
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    // 3. Update Medicine Statuses to prevent further expiry/duplicate warnings for the donor
    if (medicines && Array.isArray(medicines)) {
      for (const medicineId of medicines) {
        const medRef = db.collection('medicines').doc(medicineId);
        batch.update(medRef, {
          status: 'Donated_Pending', 
          linkedDonationId: event.params.donationId,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }
    }

    // 4. Explicitly mark the donation status
    const donationRef = db.collection('donations').doc(event.params.donationId);
    batch.update(donationRef, {
      status: 'Pending_Approval',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Commit all Firestore writes securely
    await batch.commit();
    logger.info(`Firestore documents updated successfully for donation ${event.params.donationId}`);

    // 5. Dispatch Firebase Cloud Messaging (FCM) Push Notifications if tokens are available
    if (ngoData?.fcmTokens && Array.isArray(ngoData.fcmTokens) && ngoData.fcmTokens.length > 0) {
      const payload = {
        notification: {
          title: 'New Medicine Donation! 💊',
          body: `A user has offered a donation. Tap here to review the items and accept the request.`,
        },
        data: {
          donationId: event.params.donationId,
          type: 'donation_request',
          click_action: 'FLUTTER_NOTIFICATION_CLICK' // Standard identifier for mobile handling
        }
      };

      // Multicast to all registered devices that belong to the NGO Administrator
      const messagingResponse = await admin.messaging().sendEachForMulticast({
        tokens: ngoData.fcmTokens,
        notification: payload.notification,
        data: payload.data,
      });
      
      logger.info(`FCM execution: ${messagingResponse.successCount} messages sent successfully, ${messagingResponse.failureCount} failed.`);
    }

  } catch (error) {
    logger.error('Error processing onDonationCreated trigger:', error);
  }
});
