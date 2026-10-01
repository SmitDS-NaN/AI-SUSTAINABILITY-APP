export const EMISSION_FACTORS = {
  electricity: { factor: 0.82, defaultUnit: 'kWh', label: 'Electricity' },
  water:       { factor: 0.34, defaultUnit: 'kL',  label: 'Water' },
  fuel:        { factor: 2.68, defaultUnit: 'L',   label: 'Fuel' },
  waste:       { factor: 1.90, defaultUnit: 'kg',  label: 'Waste' }
};

/**
 * Calculates carbon footprint deterministically
 * @param {string} category 
 * @param {number} quantity 
 * @returns {number} calculated CO2e in kg
 */
export function calculateCO2e(category, quantity) {
  const cat = (category || '').toLowerCase();
  const config = EMISSION_FACTORS[cat];
  if (!config) {
    throw new Error(`Unknown emission category: ${category}`);
  }
  const qty = Number(quantity);
  if (isNaN(qty) || qty < 0) {
    throw new Error(`Invalid quantity for emission calculation: ${quantity}`);
  }
  return Number((qty * config.factor).toFixed(2));
}

/**
 * Z-score and Moving Average Statistical Anomaly Detection Engine
 * @param {Array} logs - Historical usage logs for an org
 * @returns {Array} List of detected anomalies with z-score and deviation metrics
 */
export function detectAnomalies(logs) {
  if (!logs || logs.length === 0) return [];

  const anomalies = [];
  const categorized = {};

  // Group by category
  logs.forEach(log => {
    const cat = log.category.toLowerCase();
    if (!categorized[cat]) categorized[cat] = [];
    categorized[cat].push(log);
  });

  Object.keys(categorized).forEach(cat => {
    const catLogs = categorized[cat].sort((a, b) => new Date(a.usage_date) - new Date(b.usage_date));
    if (catLogs.length < 3) return; // Need at least 3 points for statistical confidence

    const quantities = catLogs.map(l => Number(l.quantity));
    const mean = quantities.reduce((acc, val) => acc + val, 0) / quantities.length;
    const variance = quantities.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / quantities.length;
    const stdDev = Math.sqrt(variance);

    catLogs.forEach((log, index) => {
      const qty = Number(log.quantity);
      const zScore = stdDev > 0 ? (qty - mean) / stdDev : 0;

      // Calculate 3-month moving average prior to this log
      const prevLogs = catLogs.slice(Math.max(0, index - 3), index);
      let movingAvg = mean;
      if (prevLogs.length > 0) {
        movingAvg = prevLogs.reduce((acc, l) => acc + Number(l.quantity), 0) / prevLogs.length;
      }

      const percentDiff = movingAvg > 0 ? ((qty - movingAvg) / movingAvg) * 100 : 0;

      // Flag as anomaly if Z-Score > 1.8 OR spike > 35% above moving average
      if (zScore > 1.8 || percentDiff > 35) {
        anomalies.push({
          id: log.id,
          category: log.category,
          unit: log.unit,
          quantity: qty,
          usage_date: log.usage_date,
          calculated_co2e: log.calculated_co2e,
          mean: Number(mean.toFixed(2)),
          stdDev: Number(stdDev.toFixed(2)),
          zScore: Number(zScore.toFixed(2)),
          movingAvg: Number(movingAvg.toFixed(2)),
          percentSpike: Number(percentDiff.toFixed(1)),
          notes: log.notes || 'Unexpected consumption surge detected'
        });
      }
    });
  });

  return anomalies.sort((a, b) => new Date(b.usage_date) - new Date(a.usage_date));
}

/**
 * Calculates dynamic organization Sustainability Score (0 - 100)
 * @param {Array} logs 
 * @param {Array} anomalies 
 * @param {Array} goals 
 * @returns {Object} Score details
 */
export function calculateSustainabilityScore(logs, anomalies, goals) {
  let score = 85; // Baseline healthy score

  if (!logs || logs.length === 0) {
    return { score: 75, grade: 'B', breakdown: { stability: 20, goalProgress: 20, efficiency: 35 } };
  }

  // Deduct for recent anomalies (up to 20 pts)
  const anomalyDeduction = Math.min(20, anomalies.length * 6);
  score -= anomalyDeduction;

  // Goal progress boost (+10 pts if goals set and active)
  if (goals && goals.length > 0) {
    score += Math.min(10, goals.length * 5);
  }

  // Cap score between 0 and 100
  score = Math.max(10, Math.min(100, Math.round(score)));

  let grade = 'A+';
  if (score < 60) grade = 'D';
  else if (score < 72) grade = 'C';
  else if (score < 82) grade = 'B';
  else if (score < 92) grade = 'A';

  return {
    score,
    grade,
    breakdown: {
      resourceStability: Math.max(0, 40 - anomalyDeduction),
      targetAlignment: goals ? Math.min(30, 20 + goals.length * 5) : 20,
      carbonEfficiency: Math.round(score * 0.3)
    }
  };
}
