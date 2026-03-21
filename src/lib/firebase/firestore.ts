import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  onSnapshot,
  setDoc,
  serverTimestamp 
} from "firebase/firestore";
import { db } from "./config";

export const getCollection = (path: string) => collection(db, path);
export const getDocument = (path: string, id: string) => doc(db, path, id);

export { serverTimestamp, query, where, onSnapshot };
