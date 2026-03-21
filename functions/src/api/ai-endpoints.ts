// functions/src/api/ai-endpoints.ts

import { findHighestDuplicateMatch } from '../../src/lib/ai/duplicate-detection';
import { evaluateDonationEligibility, DonationMedicine } from '../../src/lib/ai/donation-eligibility';
import { rankNgos, NgoCandidate } from '../../src/lib/ai/ngo-matching';

/**
 * AI Endpoint Implementations for Firebase Cloud Functions
 * 
 * These endpoints serve as secure wrappers around our intelligence layer.
 * Note: Assumes build process handles cross-directory imports from `/src/lib/ai/` 
 * (e.g. through Nx, Turborepo, or tsconfig path aliases mapping @lib to src/lib).
 */

export async function matchNgoEndpoint(reqData: { ngos: NgoCandidate[] }) {
  if (!reqData || !Array.isArray(reqData.ngos)) {
    throw new Error('Invalid Payload: Missing or malformed NGO candidate array.');
  }

  const rankedList = rankNgos(reqData.ngos);
  const bestMatch = rankedList.length > 0 ? rankedList[0] : null;

  return { 
    status: "success", 
    bestMatch, 
    allRankings: rankedList,
    totalEvaluated: rankedList.length
  };
}

export async function evaluateDonationEndpoint(reqData: { medicine: DonationMedicine }) {
  if (!reqData || !reqData.medicine) {
    throw new Error('Invalid Payload: Missing medicine details.');
  }

  const result = evaluateDonationEligibility(reqData.medicine);
  
  return { 
    status: "success", 
    result,
    isActionable: result.status === 'APPROVED' || result.status === 'NEEDS_MANUAL_REVIEW'
  };
}

export async function bulkDuplicateCheckEndpoint(reqData: { currentComp: string, userInventoryComps: string[] }) {
  if (!reqData || !reqData.currentComp || !Array.isArray(reqData.userInventoryComps)) {
    throw new Error('Invalid Payload: Requires incoming composition and inventory array.');
  }

  const matchResult = findHighestDuplicateMatch(reqData.currentComp, reqData.userInventoryComps);

  return { 
    status: "success", 
    duplicateFound: matchResult.isLikelyDuplicate,
    matchDetails: matchResult 
  };
}
