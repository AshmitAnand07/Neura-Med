import { ParsedIntent } from './intentParser';
import * as admin from 'firebase-admin';

// Reusing global cached Admin bindings
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

export interface ActionResponse {
  success: boolean;
  systemResponseText: string;
  clientAction?: {
    type: 'NAVIGATE' | 'OPEN_UI_MODAL' | 'STATE_UPDATE';
    payload: any;
  };
}

/**
 * The physical execution hub. 
 * Maps abstract intents to concrete database queries and UI triggers.
 */
export async function executeVoiceAction(userId: string, intentData: ParsedIntent): Promise<ActionResponse> {
  const { intent, extractedEntities } = intentData;

  console.log(`[Action Handler] Materializing intent: ${intent} for user: ${userId}`);

  try {
    switch (intent) {
      
      case 'UPLOAD_PRESCRIPTION':
        return {
          success: true,
          systemResponseText: "Sure, opening the prescription scanner for you now. Just hold the camera steady.",
          clientAction: {
            type: 'OPEN_UI_MODAL',
            payload: { view: 'PRESCRIPTION_UPLOAD_CAMERA' }
          }
        };

      case 'SHOW_MEDICINES':
        // Example: Natively fetching inventory sizes dynamically to read aloud.
        const snapshot = await db.collection('medicines').where('userId', '==', userId).get();
        const count = snapshot.size;
        
        return {
          success: true,
          systemResponseText: count > 0 
            ? `You currently have ${count} active medicines in your NeuraMed inventory. Opening your cabinet now.` 
            : `Your inventory is currently empty. Would you like to add a new medicine?`,
          clientAction: {
            type: 'NAVIGATE',
            payload: { route: '/inventory' }
          }
        };

      case 'CHECK_INTERACTION':
        const drugs = Object.values(extractedEntities || {});
        if (drugs.length >= 2) {
           return {
             success: true,
             systemResponseText: `I am cross-referencing ${drugs[0]} and ${drugs[1]} through the interaction engine. Please wait.`,
             clientAction: {
               type: 'NAVIGATE',
               payload: { route: '/interactions', params: { drugs } }
             }
           };
        } else {
           return {
             success: false,
             systemResponseText: "I couldn't hear which two medicines you wanted me to check. Please repeat them clearly.",
           };
        }

      case 'GET_REMINDER':
        return {
          success: true,
          systemResponseText: "Pulling up your upcoming adherence schedule.",
          clientAction: {
            type: 'NAVIGATE',
            payload: { route: '/dashboard' }
          }
        };

      case 'ADD_MEDICINE':
        const drugName = extractedEntities?.drug1 || extractedEntities?.medicine || "a new medicine";
        return {
          success: true,
          systemResponseText: `Preparing to add ${drugName} to your list. Opening the entry form now.`,
          clientAction: {
             type: 'OPEN_UI_MODAL',
             payload: { view: 'ADD_MEDICINE_FORM', initialData: { name: drugName } }
          }
        };

      case 'UNKNOWN':
      default:
        return {
          success: false,
          systemResponseText: intentData.message || "I'm sorry, I didn't completely understand that command. Could you phrase it differently?",
        };
    }
    
  } catch (e: any) {
    console.error("[Action Handler] Failed to execute query:", e);
    return {
      success: false,
      systemResponseText: "I encountered an error trying to process your request."
    };
  }
}
