// src/lib/utils/ai-constants.ts

/**
 * AI & Logic Constants
 * 
 * Contains threshold values, magic numbers, or status maps strictly related 
 * to the intelligence workflows (e.g. matching algorithms, validation bounds).
 */

export const AI_CONSTANTS = {
  DUPLICATE_DETECTION: {
    // Threshold string similarity for alerting user about duplicate medicine purchase probability
    JACCARD_THRESHOLD_HIGH: 0.85,
    JACCARD_THRESHOLD_MODERATE: 0.60,
  },
  DONATION: {
    // Expiry buffer to ensure usability by the time it reaches an NGO
    MIN_EXPIRY_BUFFER_DAYS: 90, 
  },
  NGO_MATCHING: {
    MAX_RADIUS_KM: 50, // Typical max distance we consider an NGO reachable
    WEIGHTS: {
      DEMAND: 0.4,
      DISTANCE: 0.3,
      TRUST: 0.2,
      RESPONSE: 0.1,
    }
  }
};
