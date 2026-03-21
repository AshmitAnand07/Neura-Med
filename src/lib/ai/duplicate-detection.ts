// src/lib/ai/duplicate-detection.ts

import { AI_CONSTANTS } from '../utils/ai-constants';

/**
 * Common medicinal terms that shouldn't heavily influence composition matching
 * as they are generic forms or measurements.
 */
const STOP_WORDS = new Set([
  'tablet', 'tablets', 'capsule', 'capsules', 'syrup', 'injection',
  'mg', 'ml', 'g', 'mcg', 'drop', 'drops', 'ointment', 'cream', 'gel'
]);

/**
 * Normalizes text and tokenizes it, removing common medicinal stop words.
 * 
 * @param text Raw ingredient or medicine text
 * @returns Array of significant tokens
 */
export function tokenizeAndNormalize(text: string): Set<string> {
  if (!text) return new Set();
  
  const rawTokens = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ') // Replace punctuation with space
    .split(/\s+/)
    .filter(token => token.length > 1); // Remove single characters

  // Filter out stop words
  const significantTokens = rawTokens.filter(token => !STOP_WORDS.has(token));
  return new Set(significantTokens);
}

/**
 * Calculates the Jaccard similarity score between two sets of tokens.
 * Score is between 0.0 (no overlap) and 1.0 (exact match).
 * 
 * @param set1 Tokens from medicine 1
 * @param set2 Tokens from medicine 2
 * @returns Similarity score
 */
export function calculateJaccardSimilarity(set1: Set<string>, set2: Set<string>): number {
  if (set1.size === 0 && set2.size === 0) return 0;

  let intersectionSize = 0;
  for (const token of set1) {
    if (set2.has(token)) {
      intersectionSize++;
    }
  }

  const unionSize = set1.size + set2.size - intersectionSize;
  return unionSize === 0 ? 0 : intersectionSize / unionSize;
}

export interface DuplicateCheckResult {
  isLikelyDuplicate: boolean;
  similarityScore: number;
  warningLevel: 'HIGH' | 'MODERATE' | 'LOW';
}

/**
 * Evaluates the similarity between an incoming medicine and an existing inventory item.
 * 
 * @param incomingComposition The composition/ingredients of the new medicine
 * @param existingComposition The composition/ingredients of the existing medicine
 * @returns Structured result indicating duplication likelihood
 */
export function evaluateDuplicateProbability(
  incomingComposition: string,
  existingComposition: string
): DuplicateCheckResult {
  const incomingTokens = tokenizeAndNormalize(incomingComposition);
  const existingTokens = tokenizeAndNormalize(existingComposition);

  const score = calculateJaccardSimilarity(incomingTokens, existingTokens);

  let warningLevel: 'HIGH' | 'MODERATE' | 'LOW' = 'LOW';
  let isLikelyDuplicate = false;

  if (score >= AI_CONSTANTS.DUPLICATE_DETECTION.JACCARD_THRESHOLD_HIGH) {
    warningLevel = 'HIGH';
    isLikelyDuplicate = true;
  } else if (score >= AI_CONSTANTS.DUPLICATE_DETECTION.JACCARD_THRESHOLD_MODERATE) {
    warningLevel = 'MODERATE';
    // Let's flag moderate as a likely duplicate for safety in healthcare contexts
    isLikelyDuplicate = true;
  }

  return {
    isLikelyDuplicate,
    similarityScore: Number(score.toFixed(3)),
    warningLevel
  };
}

/**
 * Batch duplicate checker against a user's inventory.
 * 
 * @param incomingComposition The new medicine composition
 * @param inventoryCompositions Array of existing medicine compositions
 * @returns The highest match found
 */
export function findHighestDuplicateMatch(
  incomingComposition: string,
  inventoryCompositions: string[]
): DuplicateCheckResult {
  let highestScore = 0;
  let highestResult: DuplicateCheckResult | null = null;

  for (const comp of inventoryCompositions) {
    const result = evaluateDuplicateProbability(incomingComposition, comp);
    if (result.similarityScore > highestScore) {
      highestScore = result.similarityScore;
      highestResult = result;
    }
  }

  return highestResult || { isLikelyDuplicate: false, similarityScore: 0, warningLevel: 'LOW' };
}
