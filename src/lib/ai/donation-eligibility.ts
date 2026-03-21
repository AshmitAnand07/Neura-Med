// src/lib/ai/donation-eligibility.ts

import { AI_CONSTANTS } from '../utils/ai-constants';

export interface DonationMedicine {
  name: string;
  isSealed: boolean;
  expiryDateStr: string; // ISO 8601 string or similar parsable date
  isRestricted: boolean; // e.g., narcotic, highly regulated
  isOTC: boolean; // Over-the-counter
}

export type EligibilityStatus = 'APPROVED' | 'REJECTED' | 'NEEDS_MANUAL_REVIEW';

export interface EligibilityResult {
  status: EligibilityStatus;
  reason: string;
  flags: string[]; // List of specific failure or warning codes
}

/**
 * Calculates the number of days remaining until the given expiry date.
 * 
 * @param expiryDateStr Parsable date string
 * @returns Number of days integer
 */
function getDaysToExpiry(expiryDateStr: string): number {
  const now = new Date();
  const expiry = new Date(expiryDateStr);
  const timeDiff = expiry.getTime() - now.getTime();
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
}

/**
 * Evaluates a medicine's eligibility for donation.
 * Strictly rule-based to ensure deterministic, explainable healthcare checks.
 * 
 * @param medicine The medicine metrics from OCR/user input
 * @returns A structured result mapping exactly why it failed or passed
 */
export function evaluateDonationEligibility(medicine: DonationMedicine): EligibilityResult {
  const flags: string[] = [];
  const daysToExpiry = getDaysToExpiry(medicine.expiryDateStr);

  // Failure Check 1: Must be sealed
  if (!medicine.isSealed) {
    flags.push('UNSEALED');
  }

  // Failure Check 2: Expiry Window Safety
  if (daysToExpiry < 0) {
    flags.push('ALREADY_EXPIRED');
  } else if (daysToExpiry < AI_CONSTANTS.DONATION.MIN_EXPIRY_BUFFER_DAYS) {
    flags.push('EXPIRY_TOO_CLOSE');
  }

  // Needs Review Check: Highly restricted/prescription medication
  let needsReview = false;
  if (medicine.isRestricted && !medicine.isOTC) {
    flags.push('RESTRICTED_PRESCRIPTION');
    needsReview = true;
  }

  // Compile Result
  if (flags.includes('UNSEALED') || flags.includes('ALREADY_EXPIRED') || flags.includes('EXPIRY_TOO_CLOSE')) {
    let reason = "Rejected due to safety concerns: ";
    if (flags.includes('UNSEALED')) reason += "Medicine packaging is unsealed. ";
    if (flags.includes('ALREADY_EXPIRED')) reason += "Medicine is expired. ";
    if (flags.includes('EXPIRY_TOO_CLOSE')) {
      reason += `Expiry date is less than ${AI_CONSTANTS.DONATION.MIN_EXPIRY_BUFFER_DAYS} days away (${daysToExpiry} days remaining). `;
    }
    
    return {
      status: 'REJECTED',
      reason: reason.trim(),
      flags
    };
  }

  if (needsReview) {
    return {
      status: 'NEEDS_MANUAL_REVIEW',
      reason: "This medication contains restricted compounds and requires manual intervention or a verified doctor's prescription channel to distribute.",
      flags
    };
  }

  return {
    status: 'APPROVED',
    reason: "Medicine passes all automated safety, expiry, and restriction checks.",
    flags: ['SAFE_FOR_DONATION']
  };
}
