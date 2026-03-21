import { useState, useEffect } from "react";
import { getDocument, onSnapshot } from "../lib/firebase/firestore";
import { User, FamilyMember } from "../types/user";

export const useFamily = (userId: string) => {
  const [family, setFamily] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    const docRef = getDocument("users", userId);
    const unsubscribe = onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        const userData = doc.data() as User;
        const familyMap = userData.family || {};
        setFamily(Object.values(familyMap));
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [userId]);

  return { family, loading };
};
