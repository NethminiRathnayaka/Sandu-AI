export interface HistoricalDataPoint {
  date: string;
  steps: number;
  calories: number;
}

export interface ForecastPoint {
  date: string;
  predictedSteps: number;
  predictedCalories: number;
  isForecast: boolean;
}

export interface TrendAnalysis {
  slopeSteps: number;
  slopeCalories: number;
  forecastNext7Days: ForecastPoint[];
  summary: string;
}

/**
 * Calculates ordinary least-squares linear regression: y = m * x + c
 */
export function linearRegression(values: number[]): { slope: number; intercept: number } {
  const n = values.length;
  if (n === 0) return { slope: 0, intercept: 0 };
  if (n === 1) return { slope: 0, intercept: values[0] };

  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;

  for (let i = 0; i < n; i++) {
    const x = i;
    const y = values[i];
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumXX += x * x;
  }

  const denominator = n * sumXX - sumX * sumX;
  if (denominator === 0) {
    return { slope: 0, intercept: sumY / n };
  }

  const slope = (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;

  return { slope, intercept };
}

/**
 * Generates a 7-day forecast from up to 14 days of historical fitness records
 */
export function generateFitnessForecast(history: HistoricalDataPoint[]): TrendAnalysis {
  if (history.length === 0) {
    return {
      slopeSteps: 0,
      slopeCalories: 0,
      forecastNext7Days: [],
      summary: 'No historical data available for forecasting yet.'
    };
  }

  // Sort chronological by date
  const sorted = [...history].sort((a, b) => a.date.localeCompare(b.date));
  const recent = sorted.slice(-14);

  const stepsValues = recent.map((d) => d.steps);
  const caloriesValues = recent.map((d) => d.calories);

  const regSteps = linearRegression(stepsValues);
  const regCalories = linearRegression(caloriesValues);

  const n = recent.length;
  const lastDate = new Date(recent[recent.length - 1].date);
  const forecastNext7Days: ForecastPoint[] = [];

  for (let offset = 1; offset <= 7; offset++) {
    const nextDate = new Date(lastDate);
    nextDate.setDate(lastDate.getDate() + offset);
    const dateStr = nextDate.toISOString().split('T')[0];

    const x = n - 1 + offset;
    const rawPredictedSteps = regSteps.slope * x + regSteps.intercept;
    const rawPredictedCalories = regCalories.slope * x + regCalories.intercept;

    forecastNext7Days.push({
      date: dateStr,
      predictedSteps: Math.max(1000, Math.round(rawPredictedSteps)),
      predictedCalories: Math.max(100, Math.round(rawPredictedCalories)),
      isForecast: true
    });
  }

  let summary = '';
  if (regSteps.slope > 100) {
    summary = 'Your activity is climbing steadily! On track for personal bests.';
  } else if (regSteps.slope < -100) {
    summary = 'Activity dipped slightly recently. Let’s take a gentle stroll today!';
  } else {
    summary = 'Great job maintaining a steady, consistent rhythm!';
  }

  return {
    slopeSteps: Number(regSteps.slope.toFixed(2)),
    slopeCalories: Number(regCalories.slope.toFixed(2)),
    forecastNext7Days,
    summary
  };
}
