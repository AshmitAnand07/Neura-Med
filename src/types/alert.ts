export type AlertType = "expiry" | "recall" | "duplicate" | "overuse";
export type AlertSeverity = "info" | "warning" | "critical";

export interface Alert {
  id: string;
  userId: string; // Recipient reference
  type: AlertType;
  severity: AlertSeverity;
  message: string;
  medicineId?: string; // Optional related medicine
  read: boolean;
  createdAt: any; // Firestore Timestamp
}
