# NEURAMED: Database Engineer Work Summary

This report provides a comprehensive overview of the database architecture and implementation for the NEURAMED project, managed as the **Database Engineer**.

## 1. OVERVIEW
- **Database System**: Google Cloud Firebase (Firestore, Cloud Storage).
- **Architecture**: Modular monorepo architecture. The database layer is decoupled into specialized modules:
  - `database/`: Schema, types, and security rules.
  - `api/`: CRUD layer and Firebase initialization.
  - `frontend/`: Real-time hooks and global state management.

## 2. SCHEMA DESIGN
The system is built around six primary collections with established relationships:

| Collection | Description | Relationships |
| :--- | :--- | :--- |
| `users` | User profiles and settings. | Root collection. Contains embedded `family` members. |
| `medicines` | Personal medicine inventory. | Linked to `users` (via `userId`) and `prescriptions`. |
| `prescriptions` | Digitized medical prescriptions. | Linked to `users`. Stores metadata for image verification. |
| `donations` | Medicine donation lifecycle. | Links `medicines`, `users`, and `ngos`. Includes `auditLog`. |
| `ngos` | Registered and verified NGO profiles. | Independent collection. Linked via `donations`. |
| `alerts` | System-generated notifications. | Linked to `users` and specific `medicines`. |

## 3. DATA MODELS
All data structures are enforced via strictly typed TypeScript interfaces (`src/types/*.ts`):
- **[Medicine](file:///c:/Users/Abhis/OneDrive/Desktop/NeuraMed/src/types/medicine.ts#3-21)**: Tracks brand, composition, expiry date (Firestore Timestamp), and status (`safe`, `expiring`, `expired`).
- **[User](file:///c:/Users/Abhis/OneDrive/Desktop/NeuraMed/src/types/user.ts#9-20)**: Includes `trustScore` and a nested `family` map for fast profile switching.
- **[DonationRequest](file:///c:/Users/Abhis/OneDrive/Desktop/NeuraMed/src/types/donation.ts#9-20)**: Features an `auditLog` array for tracking status transitions (`pending` -> `verified` -> `picked_up`).
- **[NGO](file:///c:/Users/Abhis/OneDrive/Desktop/NeuraMed/src/types/ngo.ts#7-25)**: Stores location as `GeoPoint` and `demand` items for matching logic.

## 4. CRUD OPERATIONS
Implemented in `src/lib/api/`, the operations use a helper-based Firestore interface:
- **Create**: Uses `addDoc` with `serverTimestamp()` for data integrity.
- **Read**: Optimized queries using `where` clauses for filtering and `onSnapshot` for live data.
- **Update**: Atomic updates using `updateDoc` and `arrayUnion` for audit logs.
- **Delete**: Implements **Soft Delete** via the `archived: boolean` flag in the `medicines` collection.

## 5. SECURITY
Security is enforced at the database level via **Firebase Security Rules**:
- **Firestore (`firestore.rules`)**:
  - `allow read, write: if request.auth.uid == userId`: Strict per-user isolation.
  - Verification logic ensures NGOs can only see verified data and their own requests.
- **Storage (`storage.rules`)**:
  - Path-based protection: `medicines/{userId}/{imageId}` and `prescriptions/{userId}/{imageId}`.
  - Ensures private medical documents are only accessible to the owner.

## 6. INDEXING
Managed via `firestore.indexes.json`:
- **Composite Indexes**: Optimized for complex queries such as "Get all unarchived medicines for a specific user" (`userId == X && archived == false`).
- Handles `filtering` and `sorting` (e.g., sorting medicine by expiry date) without performance degradation.

## 7. REAL-TIME SYSTEM
The application stays in sync with Firestore using the Observer pattern:
- **Hooks (`src/hooks/`)**: `useMedicines` and `useFamily` wrap Firestore listeners (`onSnapshot`).
- **Automatic Sync**: UI components re-render immediately when medicine status or family data changes in the cloud.

## 8. STATE MANAGEMENT
A centralized state system (`src/store/`) acts as the "Source of Truth" in the frontend:
- **`medicineStore`**: Syncs real-time medicine data into a global singleton, allowing any component to access the latest inventory without re-fetching.
- **`alertStore`**: Manages unread alert counts and severity filtering globally across the app.

## 9. VALIDATION
The database implementation strictly follows professional standards:
- **Data Ownership**: Auth-based guards ensure zero data leakage between users.
- **Security**: Double-layer validation (Rules + API-level checks).
- **Scalability**: Designed with sub-projects and modular types to support future growth (e.g., Pharmacy integration).

---
**Summary Status**: ALL DATABASE LAYER MODULES DEPLOYED AND VERIFIED.
