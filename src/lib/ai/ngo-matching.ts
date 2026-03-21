// src/lib/ai/ngo-matching.ts

import { AI_CONSTANTS } from '../utils/ai-constants';

export interface NgoCandidate {
  id: string;
  name: string;
  demandScore: number;       // Normalized 0-100 based on current stock deficiency
  distanceScore: number;     // Normalized 0-100 (Inverted: Closer means closer to 100)
  trustScore: number;        // Normalized 0-100 based on past successful distributions
  responseScore: number;     // Normalized 0-100 based on speed of acceptance
}

export interface RankedNgo extends NgoCandidate {
  finalMatchScore: number;
  matchExplanation: string; // Explains what drove the score for backend auditing
}

/**
 * Calculates a specific factor's contribution to the final score for auditing.
 * @param score Raw normalized score
 * @param weight Multiplier weight
 */
function calculateWeightedFactor(score: number, weight: number): number {
  return score * weight;
}

/**
 * Ranks an array of NGOs for a specific donation drop-off.
 * 
 * @param ngos Array of candidate NGOs with normalized metrics
 * @returns Sorted array of NGOs by final match score (highest to lowest)
 */
export function rankNgos(ngos: NgoCandidate[]): RankedNgo[] {
  const { DEMAND, DISTANCE, TRUST, RESPONSE } = AI_CONSTANTS.NGO_MATCHING.WEIGHTS;

  const ranked = ngos.map(ngo => {
    // We expect metrics to be out of 100 for proper weighting calculation mapping 0-100 overall
    const demandFactor = calculateWeightedFactor(ngo.demandScore, DEMAND);
    const distanceFactor = calculateWeightedFactor(ngo.distanceScore, DISTANCE);
    const trustFactor = calculateWeightedFactor(ngo.trustScore, TRUST);
    const responseFactor = calculateWeightedFactor(ngo.responseScore, RESPONSE);
    
    const finalScore = demandFactor + distanceFactor + trustFactor + responseFactor;
    
    // Find the primary driver of this score for the explanation string
    const factors = [
      { name: 'Critical Demand', value: demandFactor },
      { name: 'Proximity', value: distanceFactor },
      { name: 'High Trust Rating', value: trustFactor },
      { name: 'Fast Response Time', value: responseFactor }
    ].sort((a, b) => b.value - a.value);

    const primaryDriver = factors[0].value > 20 ? factors[0].name : 'a Balanced Profile';

    return {
      ...ngo,
      finalMatchScore: Math.round(finalScore * 100) / 100, // Round to 2 decimal places
      matchExplanation: `Match driven primarily by ${primaryDriver}. Score breakdowns: ` +
                        `[Demand: ${demandFactor.toFixed(1)}, ` +
                        `Distance: ${distanceFactor.toFixed(1)}, ` +
                        `Trust: ${trustFactor.toFixed(1)}, ` +
                        `Response: ${responseFactor.toFixed(1)}]`
    };
  });

  // Sort descending by finalMatchScore
  // If scores are exactly tied, fallback to distanceScore as the tie-breaker
  return ranked.sort((a, b) => {
    if (b.finalMatchScore === a.finalMatchScore) {
      return b.distanceScore - a.distanceScore;
    }
    return b.finalMatchScore - a.finalMatchScore;
  });
}
