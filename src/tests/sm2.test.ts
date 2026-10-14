import { describe, it, expect } from 'vitest';
import { calculateSM2, mapQuizGradeToSM2Quality } from '../ai/sm2';

describe('SM-2 Algorithm', () => {
  it('correctly maps quiz grades to quality numbers', () => {
    expect(mapQuizGradeToSM2Quality('easy')).toBe(5);
    expect(mapQuizGradeToSM2Quality('gotIt')).toBe(4);
    expect(mapQuizGradeToSM2Quality('good')).toBe(4);
    expect(mapQuizGradeToSM2Quality('hard')).toBe(3);
    expect(mapQuizGradeToSM2Quality('notYet')).toBe(1);
  });

  it('resets repetition and sets interval to 1 on failure (quality < 3)', () => {
    const result = calculateSM2({
      quality: 1,
      repetition: 4,
      previousInterval: 18,
      previousEaseFactor: 2.5
    });

    expect(result.repetition).toBe(0);
    expect(result.interval).toBe(1);
    expect(result.easeFactor).toBeLessThan(2.5);
    expect(result.easeFactor).toBeGreaterThanOrEqual(1.3);
  });

  it('sets interval to 1 on first successful recall (repetition = 0)', () => {
    const result = calculateSM2({
      quality: 4,
      repetition: 0,
      previousInterval: 1,
      previousEaseFactor: 2.5
    });

    expect(result.repetition).toBe(1);
    expect(result.interval).toBe(1);
  });

  it('sets interval to 6 on second successful recall (repetition = 1)', () => {
    const result = calculateSM2({
      quality: 4,
      repetition: 1,
      previousInterval: 1,
      previousEaseFactor: 2.5
    });

    expect(result.repetition).toBe(2);
    expect(result.interval).toBe(6);
  });

  it('multiplies previous interval by new ease factor on subsequent successes', () => {
    const result = calculateSM2({
      quality: 5,
      repetition: 2,
      previousInterval: 6,
      previousEaseFactor: 2.5
    });

    expect(result.repetition).toBe(3);
    expect(result.interval).toBeGreaterThan(6);
    expect(result.easeFactor).toBeGreaterThan(2.5);
  });

  it('enforces ease factor floor at 1.3', () => {
    const result = calculateSM2({
      quality: 0,
      repetition: 0,
      previousInterval: 1,
      previousEaseFactor: 1.3
    });

    expect(result.easeFactor).toBe(1.3);
  });
});
