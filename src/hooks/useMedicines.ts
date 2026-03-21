import { useState, useEffect } from "react";
import { useMedicines as useMedicinesApi } from "../lib/api/medicines";
import { Medicine } from "../types/medicine";

export const useMedicines = (userId: string) => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    const unsubscribe = useMedicinesApi(userId, (data) => {
      setMedicines(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [userId]);

  return { medicines, loading };
};
