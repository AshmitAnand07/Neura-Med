import { Medicine } from "../types/medicine";

/**
 * MedicineStore manages the global state of medicines in the application.
 * Optimized for real-time synchronization with Firestore.
 */
class MedicineStore {
  private static instance: MedicineStore;
  private medicines: Medicine[] = [];
  private listeners: Set<(medicines: Medicine[]) => void> = new Set();

  private constructor() {}

  public static getInstance(): MedicineStore {
    if (!MedicineStore.instance) {
      MedicineStore.instance = new MedicineStore();
    }
    return MedicineStore.instance;
  }

  public setMedicines(medicines: Medicine[]) {
    this.medicines = medicines;
    this.notify();
  }

  public getMedicines(): Medicine[] {
    return this.medicines;
  }

  public subscribe(listener: (medicines: Medicine[]) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach(listener => listener(this.medicines));
  }
}

export const medicineStore = MedicineStore.getInstance();
