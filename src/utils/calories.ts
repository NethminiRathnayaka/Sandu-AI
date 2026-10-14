export const MET_VALUES: Record<string, number> = {
  running: 8.3,
  walking: 3.5,
  cycling: 6.8,
  gym: 5.5,
  yoga: 2.8,
  swimming: 6.0,
  custom: 4.5
};

export interface CalorieEstimateParams {
  type: string;
  durationMinutes: number;
  weightKg?: number;
}

/**
 * Calculates estimated calorie expenditure using the standard MET formula:
 * Calories = MET * weightKg * (durationMinutes / 60)
 * Defaults to 65kg if weight is not provided.
 */
export function estimateCalories({
  type,
  durationMinutes,
  weightKg = 65
}: CalorieEstimateParams): number {
  if (durationMinutes <= 0) return 0;

  const normalizedType = (type || 'custom').toLowerCase().trim();
  const met = MET_VALUES[normalizedType] || MET_VALUES.custom;
  const userWeight = Math.max(30, Math.min(250, weightKg));

  const calories = met * userWeight * (durationMinutes / 60);
  return Math.round(calories);
}
