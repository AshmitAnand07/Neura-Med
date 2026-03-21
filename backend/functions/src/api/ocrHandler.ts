import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import * as vision from '@google-cloud/vision';
import * as logger from 'firebase-functions/logger';

// Define secret for Google Vision API (if needed externally)
// Note: In native GCP, credentials are automatically inferred.
const visionApiKey = defineSecret('VISION_API_KEY');

// Initialize the Vision Client
const client = new vision.ImageAnnotatorClient();

/**
 * Cloud Function to handle OCR processing securely.
 * Proxying the OCR request ensures that API keys and logic are not exposed on the client.
 */
export const processOcr = onCall(
  {
    secrets: [visionApiKey],
    cors: true, // Allow cross-origin requests from the frontend
  },
  async (request) => {
    // 1. Validate Authentication: Only authenticated users can scan medicines
    if (!request.auth) {
      throw new HttpsError(
        'unauthenticated',
        'You must be logged in to use the OCR scanner.'
      );
    }

    const { imageBase64 } = request.data;

    // 2. Validate Input Payload
    if (!imageBase64 || typeof imageBase64 !== 'string') {
      throw new HttpsError(
        'invalid-argument',
        'A valid base64 image string must be provided in the "imageBase64" field.'
      );
    }

    try {
      logger.info(`Starting OCR process for user: ${request.auth.uid}`);

      // 3. Call Google Cloud Vision API for Text Detection
      const [result] = await client.textDetection({
        image: {
          content: imageBase64,
        },
      });

      const detections = result.textAnnotations;
      
      if (!detections || detections.length === 0) {
        logger.info('OCR completed but no text was detected.');
        return {
          success: true,
          extractedText: '',
          lines: [],
          message: 'No text was found in the provided image.',
        };
      }

      // The first element in the array contains the entire combined text
      const fullText = detections[0].description || '';

      // Clean up the text into readable lines
      const textLines = fullText
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

      logger.info(`OCR successfully extracted ${textLines.length} lines of text.`);

      // 4. Return the structured data to the frontend
      // Advanced keyword extraction (Name, Expiry, Batch) can be built upon these lines
      return {
        success: true,
        extractedText: fullText,
        lines: textLines,
        message: 'OCR completed successfully. Please verify the details.',
      };

    } catch (error) {
      logger.error('OCR Processing failed:', error);

      // Mask internal errors to the client by throwing a structured HttpsError
      throw new HttpsError(
        'internal',
        'An error occurred while analyzing the image. Please try again later.'
      );
    }
  }
);
