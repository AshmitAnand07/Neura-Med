import * as admin from 'firebase-admin';

// Initialize Firebase app for the entire backend
admin.initializeApp();

// API Functions
export * from './api/ocrHandler';
export * from './api/ngoMatcher';
export * from './api/recallChecker';
export * from './api/adherenceHandler';

// Scheduled Functions
export * from './scheduled/expiryChecker';

// Firestore Triggers
export * from './triggers/onMedicineAdded';
export * from './triggers/onDonationCreated';
export * from './triggers/onNgoVerified';
