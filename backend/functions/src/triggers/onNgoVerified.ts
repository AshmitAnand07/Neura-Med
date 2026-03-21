import { onDocumentUpdated } from 'firebase-functions/v2/firestore';
import * as admin from 'firebase-admin';
import * as logger from 'firebase-functions/logger';

/**
 * Firestore Trigger: onNgoVerified
 * Fires when an NGO's document in Firestore is updated.
 * 
 * Responsibilities:
 * 1. Determine if the 'isVerified' field transitioned from false to true.
 * 2. If verified, generate an in-app alert for the NGO Administrator.
 * 3. Send a push notification (FCM) to celebrate the verification.
 */
export const onNgoVerified = onDocumentUpdated('ngos/{ngoId}', async (event) => {
  const snapshot = event.data;
  
  if (!snapshot) {
    logger.error('No data found for the triggered event.');
    return;
  }

  const beforeData = snapshot.before.data();
  const afterData = snapshot.after.data();

  // 1. Detect state change: was it already verified?
  const wasVerified = beforeData?.isVerified === true;
  const isNowVerified = afterData?.isVerified === true;

  // We strictly only want to run logic when it *transitions* to verified
  if (wasVerified || !isNowVerified) {
    logger.debug(`NGO ${event.params.ngoId} verification status didn't trigger an update. (Before: ${wasVerified}, After: ${isNowVerified})`);
    return;
  }

  const ngoId = event.params.ngoId;
  const ngoAdminUserId = afterData?.adminUserId;
  const db = admin.firestore();

  if (!ngoAdminUserId) {
    logger.warn(`NGO ${ngoId} was verified, but has no adminUserId attached. Cannot send alert.`);
    return;
  }

  try {
    const batch = db.batch();

    // 2. Create an in-app Alert/Notification for the NGO Admin
    const alertRef = db.collection('alerts').doc();
    batch.set(alertRef, {
      userId: ngoAdminUserId,
      ngoId: ngoId,
      type: 'ACCOUNT_VERIFIED',
      message: `Congratulations! Your NGO "${afterData.name || 'Account'}" has been successfully verified by our team. You can now accept active medicine donations.`,
      isRead: false,
      priority: 'high',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Commit the alert securely
    await batch.commit();

    // 3. Dispatch Push Notification if FCM tokens are available
    if (afterData?.fcmTokens && Array.isArray(afterData.fcmTokens) && afterData.fcmTokens.length > 0) {
      const payload = {
        notification: {
          title: 'Account Verified! 🎉',
          body: `Your NGO "${afterData.name || 'Account'}" is now officially verified on NeuraMed.`,
        },
        data: {
          ngoId: ngoId,
          type: 'account_verification',
          click_action: 'FLUTTER_NOTIFICATION_CLICK'
        }
      };

      await admin.messaging().sendEachForMulticast({
        tokens: afterData.fcmTokens,
        notification: payload.notification,
        data: payload.data,
      });
      
      logger.info(`Verification push notification sent to NGO admin devices for NGO: ${ngoId}`);
    }

    logger.info(`Successfully processed NGO verification trigger for ${ngoId}`);

  } catch (error) {
    logger.error('Error processing onNgoVerified trigger:', error);
  }
});
