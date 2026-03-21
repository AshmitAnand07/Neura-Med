import { 
  getCollection, 
  getDocument, 
  query, 
  where, 
  onSnapshot, 
  serverTimestamp 
} from "../firebase/firestore";
import { addDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { DonationRequest, DonationStatus } from "../../types/donation";

const COLLECTION_NAME = "donations";

export const createDonation = async (donation: Omit<DonationRequest, "id" | "createdAt" | "auditLog">) => {
  const colRef = getCollection(COLLECTION_NAME);
  return addDoc(colRef, {
    ...donation,
    auditLog: [{ action: "created", by: donation.userId, at: new Date() }],
    createdAt: serverTimestamp(),
  });
};

export const updateDonationStatus = async (id: string, status: DonationStatus, by: string, note?: string) => {
  const docRef = getDocument(COLLECTION_NAME, id);
  return updateDoc(docRef, {
    status,
    pharmacistNote: note || "",
    auditLog: arrayUnion({ action: `status_changed_to_${status}`, by, at: new Date() })
  });
};

export const useDonationsForUser = (userId: string, callback: (donations: DonationRequest[]) => void) => {
  const q = query(getCollection(COLLECTION_NAME), where("userId", "==", userId));
  return onSnapshot(q, (snapshot) => {
    const donations = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DonationRequest));
    callback(donations);
  });
};
