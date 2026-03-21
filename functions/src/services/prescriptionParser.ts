import { OpenAI } from 'openai';

// Safe initialization fetching the environment key. 
// Standardized on GPT-4o for aggressive heuristic mapping of illegible handwriting.
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export interface StructuredMedicine {
  name: string;
  dosage: string;
  frequency: string;
  timing: string;
  duration: string;
}

export interface ParsedPrescription {
  medicines: StructuredMedicine[];
}

/**
 * Transforms a raw, notoriously messy OCR prescription block into a strict clean JSON array.
 * 
 * @param rawText - The raw unstructured string returned by the OCR layer.
 * @returns {Promise<ParsedPrescription>} Formatted medical data explicitly structured.
 */
export async function parsePrescriptionText(rawText: string): Promise<ParsedPrescription> {
  if (!rawText.trim()) {
    return { medicines: [] };
  }

  console.log("[AI Parser] Initiating GPT-4o semantic extraction...");

  const systemPrompt = `
You are an expert Clinical Pharmacist AI operating inside the NeuraMed diagnostic layer.
You are given raw and extremely messy OCR text extracted from a doctor's handwritten prescription.

Your task is to identify and extract every legally prescribed medication into a STRICT JSON format.

RULES AND HEURISTICS:
1. Translate medical shorthand aggressively into plain english:
   - "BD" or "BID" -> "twice daily"
   - "OD" -> "once daily"
   - "SOS" -> "as needed"
   - "TDS" or "TID" -> "three times daily"
   - "QDS" or "QID" -> "four times daily"
   - "HS" -> "at bedtime"
   - "PC" -> "after meals"
   - "AC" -> "before meals"

2. If a field is missing on the prescription (e.g., duration is not specified), populate it with the string "Not specified".
3. ONLY extract actual medicines. Ignore patient details, doctor credentials, clinic addresses, or generic medical advice.
4. Correct slight OCR typos in standard drug names (e.g., "Asp1r1n" -> "Aspirin", "Acyc1ovir" -> "Acyclovir").

RETURN STRICTLY APPLICABLE JSON matching the following schema structure exactly:
{
  "medicines": [
    {
      "name": "string",
      "dosage": "string",
      "frequency": "string",
      "timing": "string",
      "duration": "string"
    }
  ]
}
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Raw Prescription Text:\n${rawText}` }
      ],
      response_format: { type: "json_object" },
      temperature: 0.1, // Strict determinism
      max_tokens: 1500
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error("OpenAI returned an empty response.");

    const parsedJson = JSON.parse(content) as ParsedPrescription;
    console.log(`[AI Parser] Extracted ${parsedJson.medicines?.length || 0} modular medicines securely.`);
    
    return parsedJson;

  } catch (error: any) {
    console.error("[AI Parser] LLM Semantic Evaluation Crash:", error.message);
    throw new Error(`AI parsing failed: ${error.message}`);
  }
}
