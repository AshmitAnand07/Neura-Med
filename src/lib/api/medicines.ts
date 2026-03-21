import { 
  getCollection, 
  getDocument, 
  query, 
  where, 
  onSnapshot, 
  serverTimestamp 
} from "../firebase/firestore";
import { addDoc, updateDoc } from "firebase/firestore";
import { Medicine } from "../../types/medicine";

const COLLECTION_NAME = "medicines";

export const addMedicine = async (medicine: Omit<Medicine, "id" | "createdAt">) => {
  const colRef = getCollection(COLLECTION_NAME);
  return addDoc(colRef, {
    ...medicine,
    createdAt: serverTimestamp(),
  });
};

export const updateMedicine = async (id: string, data: Partial<Medicine>) => {
  const docRef = getDocument(COLLECTION_NAME, id);
  return updateDoc(docRef, data);
};

export const archiveMedicine = async (id: string) => {
  return updateMedicine(id, { archived: true } as any);
};

export const useMedicines = (userId: string, callback: (medicines: Medicine[]) => void) => {
  const q = query(getCollection(COLLECTION_NAME), where("userId", "==", userId), where("archived", "==", false));
  return onSnapshot(q, (snapshot) => {
    const medicines = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Medicine));
    callback(medicines);
  });
};
