import { describe, it, expect } from 'vitest';
import { recommendNextQuote } from '../ai/recommender';
import { QuoteRecord } from '../db';

describe('Quote No-Repeat and Recommendation Logic', () => {
  const dummyQuotes: QuoteRecord[] = [
    {
      id: 'q1',
      text: 'First quote',
      author: 'Author A',
      category: 'motivation',
      sanduTip: 'Tip A',
      isFavorite: 1
    },
    {
      id: 'q2',
      text: 'Second quote',
      author: 'Author B',
      category: 'study',
      sanduTip: 'Tip B',
      isFavorite: 0
    },
    {
      id: 'q3',
      text: 'Third quote',
      author: 'Author C',
      category: 'fitness',
      sanduTip: 'Tip C',
      isFavorite: 0
    }
  ];

  it('guarantees the next quote is different from the current quote ID', () => {
    for (let i = 0; i < 20; i++) {
      const next = recommendNextQuote({
        quotes: dummyQuotes,
        currentQuoteId: 'q1'
      });

      expect(next).not.toBeNull();
      expect(next?.id).not.toBe('q1');
    }
  });

  it('respects category filtering when specified', () => {
    const next = recommendNextQuote({
      quotes: dummyQuotes,
      currentQuoteId: 'q1',
      preferredCategory: 'fitness'
    });

    expect(next?.id).toBe('q3');
    expect(next?.category).toBe('fitness');
  });

  it('handles single quote list without crashing', () => {
    const single = [dummyQuotes[0]];
    const next = recommendNextQuote({
      quotes: single,
      currentQuoteId: 'q1'
    });

    expect(next?.id).toBe('q1');
  });
});
