export interface DemandItem {
  composition: string;
  quantityNeeded: number;
  urgency: "low" | "medium" | "high";
}

export interface NGO {
  id: string;
  name: string;
  registrationNumber: string;
  licenseUrl: string;
  pharmacistName: string;
  location: any; // Firestore GeoPoint
  address: string;
  city: string;
  pincode: string;
  contactEmail: string;
  contactPhone: string;
  verified: boolean;
  trustScore: number;
  acceptanceRate: number;
  avgResponseHours: number;
  demand: DemandItem[];
}
