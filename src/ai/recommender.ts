import { QuoteRecord } from '../db';

export type UserMood = 'focused' | 'tired' | 'energetic' | 'calm' | 'curious';

export interface RecommendQuoteOptions {
  quotes: QuoteRecord[];
  currentQuoteId?: string;
  userMood?: UserMood;
  preferredCategory?: string;
}

/**
 * Recommends an optimal quote, guaranteed different from currentQuoteId,
 * weighted by user favorites and current mood state.
 */
export function recommendNextQuote({
  quotes,
  currentQuoteId,
  userMood = 'focused',
  preferredCategory = 'all'
}: RecommendQuoteOptions): QuoteRecord | null {
  if (!quotes || quotes.length === 0) return null;

  // Filter out the current quote to guarantee variety
  const candidates = quotes.filter((q) => q.id !== currentQuoteId);
  if (candidates.length === 0) {
    return quotes[0];
  }

  // If specific category selected (and not 'all'), filter to that category if possible
  let filtered = candidates;
  if (preferredCategory && preferredCategory !== 'all') {
    const byCategory = candidates.filter((q) => q.category === preferredCategory);
    if (byCategory.length > 0) {
      filtered = byCategory;
    }
  }

  // Calculate mood affinity weights
  // 'focused' -> study (2.0), mindfulness (1.5)
  // 'tired' -> mindfulness (2.5), motivation (2.0)
  // 'energetic' -> fitness (2.5), motivation (2.0)
  // 'calm' -> mindfulness (2.5), study (1.5)
  // 'curious' -> study (2.5), motivation (1.5)
  const moodWeights: Record<UserMood, Record<string, number>> = {
    focused: { study: 2.5, motivation: 1.5, mindfulness: 1.2, fitness: 1.0 },
    tired: { mindfulness: 3.0, motivation: 2.0, study: 1.0, fitness: 0.8 },
    energetic: { fitness: 3.0, motivation: 2.2, study: 1.2, mindfulness: 1.0 },
    calm: { mindfulness: 2.8, study: 1.8, motivation: 1.0, fitness: 1.0 },
    curious: { study: 3.0, motivation: 1.8, mindfulness: 1.2, fitness: 1.0 }
  };

  const weights = moodWeights[userMood] || moodWeights.focused;

  // Compute probability weights for each candidate
  const scored = filtered.map((quote) => {
    let score = 1.0;
    
    // Category match bonus from mood
    const catWeight = weights[quote.category] || 1.0;
    score *= catWeight;

    // Favorited quotes get a gentle familiarity boost
    if (quote.isFavorite === 1) {
      score += 0.8;
    }

    // Add mild random jitter for delightful variety
    score += Math.random() * 0.5;

    return { quote, score };
  });

  // Pick top scoring candidate or roulette weighted choice
  scored.sort((a, b) => b.score - a.score);
  
  // Pick randomly among top 3 highest scores
  const topSlice = scored.slice(0, Math.min(3, scored.length));
  const chosenIndex = Math.floor(Math.random() * topSlice.length);

  return topSlice[chosenIndex].quote;
}
