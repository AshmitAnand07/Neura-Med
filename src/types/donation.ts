export type DonationStatus = "pending" | "verified" | "picked_up" | "rejected";

export interface AuditLogEntry {
  action: string;
  by: string;
  at: any; // Firestore Timestamp
}

export interface DonationRequest {
  id: string;
  medicineId: string;
  userId: string;
  ngoId: string;
  status: DonationStatus;
  scheduledPickup: any; // Firestore Timestamp
  pharmacistNote?: string;
  auditLog: AuditLogEntry[];
  createdAt: any; // Firestore Timestamp
}
