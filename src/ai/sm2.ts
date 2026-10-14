/**
 * SuperMemo 2 (SM-2) Spaced Repetition Algorithm Implementation
 * Quality scale:
 * 5 - Perfect recall, without hesitation
 * 4 - Correct response after a hesitation
 * 3 - Correct response recalled with serious difficulty
 * 2 - Incorrect response; where the correct one seemed easy to recall
 * 1 - Incorrect response; the correct one remembered
 * 0 - Complete blackout
 */

export interface SM2Input {
  quality: number; // 0 to 5
  repetition: number;
  previousInterval: number; // in days
  previousEaseFactor: number;
}

export interface SM2Result {
  interval: number; // in days
  repetition: number;
  easeFactor: number;
  nextReviewDate: number; // timestamp in ms
}

export function calculateSM2({
  quality,
  repetition,
  previousInterval,
  previousEaseFactor
}: SM2Input): SM2Result {
  // Clamp quality between 0 and 5
  const q = Math.max(0, Math.min(5, Math.round(quality)));

  // Calculate new Ease Factor (EF')
  // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  let newEaseFactor =
    previousEaseFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  
  // Ease factor minimum floor is 1.3
  if (newEaseFactor < 1.3) {
    newEaseFactor = 1.3;
  }

  let newInterval: number;
  let newRepetition: number;

  if (q < 3) {
    // Failed recall: reset repetition count and set interval to 1 day
    newRepetition = 0;
    newInterval = 1;
  } else {
    // Successful recall
    if (repetition === 0) {
      newInterval = 1;
    } else if (repetition === 1) {
      newInterval = 6;
    } else {
      newInterval = Math.round(previousInterval * newEaseFactor);
    }
    newRepetition = repetition + 1;
  }

  const msInDay = 86400000;
  const nextReviewDate = Date.now() + newInterval * msInDay;

  return {
    interval: newInterval,
    repetition: newRepetition,
    easeFactor: Number(newEaseFactor.toFixed(2)),
    nextReviewDate
  };
}

/**
 * Convenience helper to map binary quiz choices (Got it / Not yet) or 3-button choices to 0-5 quality
 */
export function mapQuizGradeToSM2Quality(grade: 'notYet' | 'hard' | 'good' | 'easy' | 'gotIt'): number {
  switch (grade) {
    case 'notYet':
      return 1;
    case 'hard':
      return 3;
    case 'gotIt':
    case 'good':
      return 4;
    case 'easy':
      return 5;
    default:
      return 3;
  }
}
