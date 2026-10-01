import { db } from '../config/db.js';
import {
  detectAnomalies,
  calculateSustainabilityScore,
  EMISSION_FACTORS
} from '../services/emission.service.js';

export async function getDashboardSummary(req, res, next) {
  try {
    const orgId = req.user.org_id;

    const org = db.memoryDb.organizations.find(o => o.id === orgId) || {
      id: orgId,
      name: 'Apex Green Manufacturing',
      industry: 'Industrial & Electronics Manufacturing'
    };

    const logs = db.memoryDb.usage_logs.filter(l => l.org_id === orgId);
    const goals = db.memoryDb.goals.filter(g => g.org_id === orgId);
    const recommendations = db.memoryDb.recommendations.filter(r => r.org_id === orgId);

    // Run z-score statistical anomaly detection engine
    const anomalies = detectAnomalies(logs);

    // Calculate dynamic sustainability score
    const sustainabilityScore = calculateSustainabilityScore(logs, anomalies, goals);

    // Calculate totals and category breakdown
    let totalCo2e = 0;
    let totalCostInr = 0;
    const byCategory = {
      electricity: { totalQty: 0, co2e: 0, cost: 0, unit: 'kWh', label: 'Electricity' },
      water:       { totalQty: 0, co2e: 0, cost: 0, unit: 'kL',  label: 'Water' },
      fuel:        { totalQty: 0, co2e: 0, cost: 0, unit: 'L',   label: 'Fuel' },
      waste:       { totalQty: 0, co2e: 0, cost: 0, unit: 'kg',  label: 'Waste' }
    };

    logs.forEach(log => {
      const cat = log.category.toLowerCase();
      const co2 = Number(log.calculated_co2e || 0);
      const cost = Number(log.cost_inr || 0);
      const qty = Number(log.quantity || 0);

      totalCo2e += co2;
      totalCostInr += cost;

      if (byCategory[cat]) {
        byCategory[cat].totalQty += qty;
        byCategory[cat].co2e += co2;
        byCategory[cat].cost += cost;
      }
    });

    // Format numbers
    totalCo2e = Number(totalCo2e.toFixed(2));
    Object.keys(byCategory).forEach(cat => {
      byCategory[cat].co2e = Number(byCategory[cat].co2e.toFixed(2));
      byCategory[cat].totalQty = Number(byCategory[cat].totalQty.toFixed(1));
    });

    // Build monthly timeline for Recharts
    const monthlyMap = {};
    logs.forEach(log => {
      const dateKey = log.usage_date.substring(0, 7); // YYYY-MM
      if (!monthlyMap[dateKey]) {
        monthlyMap[dateKey] = {
          month: dateKey,
          electricity: 0,
          water: 0,
          fuel: 0,
          waste: 0,
          totalCo2e: 0,
          totalCost: 0
        };
      }
      const cat = log.category.toLowerCase();
      const co2 = Number(log.calculated_co2e || 0);
      const cost = Number(log.cost_inr || 0);

      if (monthlyMap[dateKey][cat] !== undefined) {
        monthlyMap[dateKey][cat] += co2;
      }
      monthlyMap[dateKey].totalCo2e += co2;
      monthlyMap[dateKey].totalCost += cost;
    });

    const monthlyTimeline = Object.values(monthlyMap)
      .sort((a, b) => a.month.localeCompare(b.month))
      .map(item => ({
        ...item,
        electricity: Number(item.electricity.toFixed(1)),
        water: Number(item.water.toFixed(1)),
        fuel: Number(item.fuel.toFixed(1)),
        waste: Number(item.waste.toFixed(1)),
        totalCo2e: Number(item.totalCo2e.toFixed(1))
      }));

    res.json({
      organization: org,
      summary: {
        totalCo2eKg: totalCo2e,
        totalCo2eTons: Number((totalCo2e / 1000).toFixed(2)),
        totalCostInr,
        logCount: logs.length,
        highestCategory: Object.keys(byCategory).reduce((a, b) => byCategory[a].co2e > byCategory[b].co2e ? a : b, 'electricity')
      },
      sustainabilityScore,
      byCategory,
      monthlyTimeline,
      anomalies,
      goals,
      recommendationsCount: {
        total: recommendations.length,
        pending: recommendations.filter(r => r.status === 'pending').length,
        in_progress: recommendations.filter(r => r.status === 'in_progress').length,
        completed: recommendations.filter(r => r.status === 'completed').length
      }
    });
  } catch (err) {
    next(err);
  }
}
