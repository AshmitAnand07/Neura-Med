import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';

/**
 * Cloud Function to check if a scanned medicine is subject to an active recall.
 * This function queries the public openFDA API for drug enforcement reports.
 */
export const checkMedicineRecall = onCall(async (request) => {
  // 1. Authentication Check
  if (!request.auth) {
    throw new HttpsError(
      'unauthenticated',
      'You must be logged in to check recall status.'
    );
  }

  const { medicineName, batchNumber } = request.data;

  // 2. Validate Input Payload
  if (!medicineName || typeof medicineName !== 'string') {
    throw new HttpsError(
      'invalid-argument',
      'A valid medicine name must be provided.'
    );
  }

  try {
    logger.info(`Checking recall status for medicine: ${medicineName}, Batch: ${batchNumber || 'N/A'}, User: ${request.auth.uid}`);

    // Securely encode the query parameters
    const queryName = encodeURIComponent(medicineName.toLowerCase());
    
    // 3. Query the openFDA API for drug recalls
    // Searching the product_description field for the medicine name
    let apiUrl = `https://api.fda.gov/drug/enforcement.json?search=product_description:"${queryName}"`;
    
    if (batchNumber && typeof batchNumber === 'string') {
      const queryBatch = encodeURIComponent(batchNumber);
      // If batch number is provided, narrow down the search to include code_info (lot/batch numbers)
      apiUrl += `+AND+code_info:"${queryBatch}"`;
    }

    // Limit to the top 5 most relevant results
    apiUrl += '&limit=5';

    const response = await fetch(apiUrl);
    
    // The openFDA API returns a 404 if no matching records are found.
    // In the context of a drug recall, a 404 is a positive result (no recall).
    if (response.status === 404) {
      logger.info(`No recall found for ${medicineName}`);
      return {
        success: true,
        isRecalled: false,
        message: 'No active recalls found for this medicine.',
        recallDetails: []
      };
    }

    if (!response.ok) {
      throw new Error(`FDA API returned status: ${response.status}`);
    }

    const data = await response.json();
    const results = data.results || [];

    if (results.length === 0) {
      return {
        success: true,
        isRecalled: false,
        message: 'No active recalls found for this medicine.',
        recallDetails: []
      };
    }

    // 4. Extract and map relevant recall data for the frontend
    const activeRecalls = results.map((recall: any) => ({
      recallNumber: recall.recall_number,
      reason: recall.reason_for_recall,
      status: recall.status,
      classification: recall.classification,
      productDescription: recall.product_description,
      codeInfo: recall.code_info // Specific Batch/Lot numbers affected
    }));

    logger.warn(`Recall alert triggered for ${medicineName}! Found ${activeRecalls.length} records.`);

    return {
      success: true,
      isRecalled: true,
      message: 'WARNING: This medicine has matching recall records. Please review the details.',
      recallDetails: activeRecalls
    };

  } catch (error) {
    logger.error(`Error checking recall for ${medicineName}:`, error);
    
    // Graceful fallback: If the external API is down, don't crash, but inform the client.
    return {
      success: false,
      isRecalled: null,
      message: 'Could not verify recall status at this time due to an external service error.',
      recallDetails: []
    };
  }
});
