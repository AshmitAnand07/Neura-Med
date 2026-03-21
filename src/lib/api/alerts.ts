import { 
  getCollection, 
  getDocument, 
  query, 
  where, 
  onSnapshot, 
  serverTimestamp 
} from "../firebase/firestore";
import { updateDoc } from "firebase/firestore";
import { Alert } from "../../types/alert";

const COLLECTION_NAME = "alerts";

export const useUnreadAlerts = (userId: string, callback: (alerts: Alert[]) => void) => {
  const q = query(getCollection(COLLECTION_NAME), where("userId", "==", userId), where("read", "==", false));
  return onSnapshot(q, (snapshot) => {
    const alerts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Alert));
    callback(alerts);
  });
};

export const markAlertRead = async (id: string) => {
  const docRef = getDocument(COLLECTION_NAME, id);
  return updateDoc(docRef, { read: true });
};
