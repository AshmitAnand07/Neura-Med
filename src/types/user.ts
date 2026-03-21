export interface FamilyMember {
  memberId: string;
  name: string;
  age: number;
  relation: string;
  profileColor: string;
}

export interface User {
  uid: string;
  name: string;
  phone: string;
  email: string;
  city: string;
  createdAt: any; // Firestore Timestamp
  lastActive: any; // Firestore Timestamp
  trustScore: number;
  family?: Record<string, FamilyMember>;
}
