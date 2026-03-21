export type MedicineStatus = "safe" | "expiring" | "expired";

export interface Medicine {
  id: string;
  name: string;
  brand: string;
  manufacturer: string;
  composition: string[]; // Array of active ingredients
  expiryDate: any; // Firestore Timestamp
  batchNumber: string;
  status: MedicineStatus;
  sealed: boolean;
  userId: string; // Owner reference
  familyMemberId?: string; // Which family member
  prescriptionId?: string; // Optional prescription link
  imageUrl: string;
  donatable: boolean; // Computed by eligibility check
  createdAt: any; // Firestore Timestamp
  archived?: boolean; // Soft delete flag
}
