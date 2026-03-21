import { extractTextFromImage } from '../services/ocrService';
import { parsePrescriptionText, ParsedPrescription } from '../services/prescriptionParser';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

export interface PrescriptionUploadResponse {
  status: 'success' | 'partial' | 'error';
  userId: string;
  originalText?: string;
  data?: ParsedPrescription;
  message?: string;
}

/**
 * Controller orchestrating the OCR -> Parsing -> Firestore pipeline.
 * 
 * @param imageBuffer The raw image bytes uploaded by the user.
 * @param userId The authenticated user's ID.
 */
export async function processPrescriptionEndpoint(
  imageBuffer: Buffer, 
  userId: string
): Promise<PrescriptionUploadResponse> {
  let rawText = "";

  try {
    // 1. Google Vision OCR Extraction
    try {
      rawText = await extractTextFromImage(imageBuffer);
    } catch (ocrError: any) {
      console.error("[Endpoint] OCR Extraction Failed: ", ocrError.message);
      return {
        status: 'error',
        userId,
        message: 'Failed to extract text from the provided image. Please ensure the image is clear and try again.'
      };
    }

    if (!rawText.trim()) {
      return {
        status: 'error',
        userId,
        message: 'No readable text was found in the prescription image.'
      };
    }

    // 2. AI Semantic Parsing (GPT-4o)
    let structuredData: ParsedPrescription = { medicines: [] };
    let isPartial = false;

    try {
      structuredData = await parsePrescriptionText(rawText);
      if (structuredData.medicines.length === 0) {
        isPartial = true;
      }
    } catch (parseError: any) {
      console.warn("[Endpoint] AI Parsing degraded or failed. Saving raw text.", parseError.message);
      isPartial = true;
    }

    // 3. Database Storage: Write the transaction securely to the NoSQL bounds
    const prescriptionDoc = {
      userId,
      originalText: rawText,
      structuredData: structuredData.medicines.length > 0 ? structuredData.medicines : null,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const docRef = await db.collection('prescriptions').add(prescriptionDoc);
    console.log(`[Endpoint] Successfully committed Prescription payload to Firestore -> ID: ${docRef.id}`);

    // 4. Client Response Output
    return {
      status: isPartial ? 'partial' : 'success',
      userId,
      originalText: rawText,
      data: structuredData,
      message: isPartial 
        ? 'Prescription processed partially. AI could not fully extract all medicines.' 
        : 'Prescription processed successfully.'
    };

  } catch (error: any) {
    console.error("[Endpoint] Fatal Pipeline Error.", error);
    throw new Error(`Critical failure processing prescription: ${error.message}`);
  }
}
