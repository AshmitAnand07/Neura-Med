import { 
  getCollection, 
  query, 
  where, 
  onSnapshot 
} from "../firebase/firestore";
import { NGO } from "../../types/ngo";

const COLLECTION_NAME = "ngos";

export const useNgosByCity = (city: string, callback: (ngos: NGO[]) => void) => {
  const q = query(getCollection(COLLECTION_NAME), where("city", "==", city), where("verified", "==", true));
  return onSnapshot(q, (snapshot) => {
    const ngos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as NGO));
    callback(ngos);
  });
};

export const getAllVerifiedNgos = (callback: (ngos: NGO[]) => void) => {
  const q = query(getCollection(COLLECTION_NAME), where("verified", "==", true));
  return onSnapshot(q, (snapshot) => {
    const ngos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as NGO));
    callback(ngos);
  });
};
