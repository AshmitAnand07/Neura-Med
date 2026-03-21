export interface PrescriptionMedicine {
  medicineId: string;
  dosage: string;
  frequency: string;
  durationDays: number;
}

export interface Prescription {
  id: string;
  userId: string;
  doctorName: string;
  hospitalName: string;
  prescriptionDate: any; // Firestore Timestamp
  imageUrl: string;
  medicines: PrescriptionMedicine[];
  createdAt: any; // Firestore Timestamp
}
