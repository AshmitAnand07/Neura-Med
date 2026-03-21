import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import * as logger from 'firebase-functions/logger';

/**
 * Helper function to calculate the gross distance in km using the Haversine formula
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Cloud Function to match a user's location and donation details with nearby verified NGOs.
 */
export const findNearbyNgos = onCall(async (request) => {
  // 1. Validate Authentication
  if (!request.auth) {
    throw new HttpsError(
      'unauthenticated',
      'You must be logged in to find NGOs.'
    );
  }

  const { latitude, longitude, maxDistanceKm = 50, availableMedicines = [] } = request.data;

  // 2. Validate Input Payload
  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    throw new HttpsError(
      'invalid-argument',
      'Valid latitude and longitude coordinates must be provided.'
    );
  }

  try {
    logger.info(`Matching NGOs for user: ${request.auth.uid} at [${latitude}, ${longitude}]`);
    const db = admin.firestore();

    // 3. Fetch Verified & Active NGOs
    // Note for Scale: In production with thousands of NGOs, Geohashing (e.g., geomock/geofire) is recommended.
    // Given hackathon constraints, fetching verified NGOs and filtering in memory is a pragmatic approach.
    const ngosSnapshot = await db.collection('ngos')
      .where('isVerified', '==', true)
      .where('isActive', '==', true)
      .get();

    if (ngosSnapshot.empty) {
      return {
        success: true,
        matches: [],
        message: 'No verified NGOs are currently active.',
      };
    }

    const matchedNgos: any[] = [];

    // 4. Process and score matches
    ngosSnapshot.forEach((doc) => {
      const ngoData = doc.data();

      if (ngoData.location && typeof ngoData.location.latitude === 'number' && typeof ngoData.location.longitude === 'number') {
        const distance = calculateDistance(
          latitude, 
          longitude,
          ngoData.location.latitude, 
          ngoData.location.longitude
        );

        if (distance <= maxDistanceKm) {
          // Base score: shorter distance = higher score (up to 50 points)
          let matchScore = 100 - (distance / maxDistanceKm) * 50;

          // Supply & Demand Matching logic (up to 50 points based on needs overlap)
          let needsMatchCount = 0;
          if (ngoData.neededMedicines && Array.isArray(ngoData.neededMedicines) && availableMedicines.length > 0) {
            const needsSet = new Set(ngoData.neededMedicines.map((m: string) => m.toLowerCase()));
            
            availableMedicines.forEach((med: string) => {
              if (needsSet.has(med.toLowerCase())) {
                needsMatchCount++;
              }
            });

            const demandMatchScore = (needsMatchCount / availableMedicines.length) * 50;
            matchScore += demandMatchScore;
          }

          matchedNgos.push({
            id: doc.id,
            name: ngoData.name,
            address: ngoData.address,
            phone: ngoData.phone,
            distanceKm: parseFloat(distance.toFixed(1)),
            matchScore: parseFloat(matchScore.toFixed(1)),
            urgentNeedsMet: needsMatchCount,
          });
        }
      }
    });

    // 5. Sort matches by highest score
    matchedNgos.sort((a, b) => b.matchScore - a.matchScore);

    logger.info(`Successfully found ${matchedNgos.length} NGOs within ${maxDistanceKm}km limit.`);

    return {
      success: true,
      matches: matchedNgos,
      message: `Found ${matchedNgos.length} matching NGOs nearby.`,
    };

  } catch (error) {
    logger.error('Error finding NGOs:', error);
    throw new HttpsError(
      'internal',
      'An error occurred while finding nearby NGOs. Please try again later.'
    );
  }
});
