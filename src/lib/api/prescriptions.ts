import { 
  getCollection, 
  getDocument, 
  serverTimestamp 
} from "../firebase/firestore";
import { addDoc, updateDoc } from "firebase/firestore";
import { Prescription } from "../../types/prescription";

const COLLECTION_NAME = "prescriptions";

export const uploadPrescription = async (prescription: Omit<Prescription, "id" | "createdAt">) => {
  const colRef = getCollection(COLLECTION_NAME);
  return addDoc(colRef, {
    ...prescription,
    createdAt: serverTimestamp(),
  });
};

export const getPrescription = async (id: string) => {
  const docRef = getDocument(COLLECTION_NAME, id);
  return docRef; // User can then use getDoc(docRef)
};
