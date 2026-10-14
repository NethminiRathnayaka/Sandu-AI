import { describe, it, expect } from 'vitest';
import { estimateCalories, MET_VALUES } from '../utils/calories';

describe('Calorie Estimation (MET Formula)', () => {
  it('calculates calories for running using MET 8.3', () => {
    // 8.3 * 65 * (30 / 60) = 269.75 ~ 270
    const calories = estimateCalories({
      type: 'running',
      durationMinutes: 30,
      weightKg: 65
    });

    expect(calories).toBe(270);
  });

  it('calculates calories for walking using MET 3.5', () => {
    // 3.5 * 65 * (60 / 60) = 227.5 ~ 228
    const calories = estimateCalories({
      type: 'walking',
      durationMinutes: 60,
      weightKg: 65
    });

    expect(calories).toBe(228);
  });

  it('falls back to custom MET 4.5 for unknown activity types', () => {
    // 4.5 * 65 * (40 / 60) = 195
    const calories = estimateCalories({
      type: 'rollerblading',
      durationMinutes: 40,
      weightKg: 65
    });

    expect(calories).toBe(195);
  });

  it('returns 0 for duration <= 0', () => {
    expect(estimateCalories({ type: 'gym', durationMinutes: 0 })).toBe(0);
    expect(estimateCalories({ type: 'yoga', durationMinutes: -10 })).toBe(0);
  });
});
