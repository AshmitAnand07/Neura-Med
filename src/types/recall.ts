export interface Recall {
  id: string;
  batchNumber: string;
  medicineName: string;
  manufacturer: string;
  reason: string;
  issuedBy: string; // CDSCO / state authority
  issuedAt: any; // Firestore Timestamp
  affectedUserIds: string[]; // Populated by recallChecker function
}
