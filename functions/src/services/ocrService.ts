import vision from '@google-cloud/vision';

// Initialize the Google Vision client using application default credentials
// or the locally embedded credential mechanisms configured in Firebase Functions.
const client = new vision.ImageAnnotatorClient();

/**
 * Sends a raw image buffer to Google Cloud Vision API and extracts the complete text map.
 * 
 * @param imageBuffer - The raw binary bytes of the uploaded prescription JPEG/PNG.
 * @returns {Promise<string>} The unstructured extracted text from the document.
 */
export async function extractTextFromImage(imageBuffer: Buffer): Promise<string> {
  try {
    console.log("[OCR Service] Sending image buffer to Google Vision API...");
    
    // Annotate the image using the DOCUMENT_TEXT_DETECTION feature
    // which handles dense text blocks and handwriting much better than TEXT_DETECTION
    const [result] = await client.documentTextDetection({
      image: { content: imageBuffer }
    });
    
    const fullTextAnnotation = result.fullTextAnnotation;
    const extractedText = fullTextAnnotation?.text || "";
    
    if (!extractedText.trim()) {
       console.warn("[OCR Service] Vision API returned empty text. Likely a blank or corrupted image.");
    } else {
       console.log(`[OCR Service] Successfully extracted ${extractedText.length} characters.`);
    }

    return extractedText;
    
  } catch (error: any) {
    console.error("[OCR Service] Google Vision Pipeline Failure:", error.message);
    throw new Error(`Failed to extract text from image: ${error.message}`);
  }
}
