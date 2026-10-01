import crypto from 'crypto';
import { db } from '../config/db.js';
import {
  explainAnomaly,
  generateRecommendations,
  chatWithData,
  generateMonthlyReport
} from '../services/ai.service.js';
import { AIChatRequestSchema } from '../schemas/zod.schemas.js';

export async function handleExplainAnomaly(req, res, next) {
  try {
    const { anomaly } = req.body;
    if (!anomaly || !anomaly.category) {
      return res.status(400).json({ error: 'Anomaly data payload required' });
    }

    const explanation = await explainAnomaly(anomaly);
    res.json({
      anomalyId: anomaly.id,
      explanation
    });
  } catch (err) {
    next(err);
  }
}

export async function handleGenerateRecommendations(req, res, next) {
  try {
    const orgId = req.user.org_id;
    const org = db.memoryDb.organizations.find(o => o.id === orgId) || { name: 'Org', industry: 'Manufacturing' };
    const logs = db.memoryDb.usage_logs.filter(l => l.org_id === orgId);

    // Aggregate category totals
    let totalEmissionsKg = 0;
    const byCategory = {
      electricity: { totalQty: 0, co2e: 0, cost: 0 },
      water:       { totalQty: 0, co2e: 0, cost: 0 },
      fuel:        { totalQty: 0, co2e: 0, cost: 0 },
      waste:       { totalQty: 0, co2e: 0, cost: 0 }
    };

    logs.forEach(l => {
      const cat = l.category.toLowerCase();
      const co2 = Number(l.calculated_co2e || 0);
      totalEmissionsKg += co2;
      if (byCategory[cat]) {
        byCategory[cat].totalQty += Number(l.quantity || 0);
        byCategory[cat].co2e += co2;
        byCategory[cat].cost += Number(l.cost_inr || 0);
      }
    });

    const aiOutput = await generateRecommendations({ totalEmissionsKg, byCategory }, org.industry);

    // Save generated recommendations to memory store
    if (aiOutput && Array.isArray(aiOutput.recommendations)) {
      aiOutput.recommendations.forEach(rec => {
        const existing = db.memoryDb.recommendations.find(
          r => r.org_id === orgId && r.title.toLowerCase() === rec.title.toLowerCase()
        );
        if (!existing) {
          db.memoryDb.recommendations.push({
            id: crypto.randomUUID(),
            org_id: orgId,
            title: rec.title,
            description: rec.description,
            impact_co2: rec.impact_co2_kg,
            savings_inr: rec.savings_inr,
            effort_level: rec.effort_level,
            status: 'pending',
            created_at: new Date().toISOString()
          });
        }
      });
    }

    const currentRecs = db.memoryDb.recommendations.filter(r => r.org_id === orgId);

    res.json({
      aiGenerated: aiOutput,
      recommendations: currentRecs
    });
  } catch (err) {
    next(err);
  }
}

export async function getRecommendationsList(req, res, next) {
  try {
    const orgId = req.user.org_id;
    let recs = db.memoryDb.recommendations.filter(r => r.org_id === orgId);
    
    // If empty, generate defaults
    if (recs.length === 0) {
      const logs = db.memoryDb.usage_logs.filter(l => l.org_id === orgId);
      const org = db.memoryDb.organizations.find(o => o.id === orgId) || { name: 'Org' };
      const aiOutput = await generateRecommendations({ logs }, org.industry);
      if (aiOutput && aiOutput.recommendations) {
        aiOutput.recommendations.forEach(rec => {
          db.memoryDb.recommendations.push({
            id: crypto.randomUUID(),
            org_id: orgId,
            title: rec.title,
            description: rec.description,
            impact_co2: rec.impact_co2_kg,
            savings_inr: rec.savings_inr,
            effort_level: rec.effort_level,
            status: 'pending',
            created_at: new Date().toISOString()
          });
        });
      }
      recs = db.memoryDb.recommendations.filter(r => r.org_id === orgId);
    }

    res.json({ recommendations: recs });
  } catch (err) {
    next(err);
  }
}

export async function updateRecommendationStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const orgId = req.user.org_id;

    if (!['pending', 'in_progress', 'completed'].includes(status)) {
      return res.status(400).json({ error: 'Status must be pending, in_progress, or completed' });
    }

    const item = db.memoryDb.recommendations.find(r => r.id === id && r.org_id === orgId);
    if (!item) {
      return res.status(404).json({ error: 'Recommendation not found' });
    }

    item.status = status;
    res.json({ message: 'Status updated successfully', recommendation: item });
  } catch (err) {
    next(err);
  }
}

export async function handleAIChat(req, res, next) {
  try {
    const validated = AIChatRequestSchema.parse(req.body);
    const { message, history } = validated;
    const orgId = req.user.org_id;

    const org = db.memoryDb.organizations.find(o => o.id === orgId) || { name: 'Org' };
    const logs = db.memoryDb.usage_logs.filter(l => l.org_id === orgId);
    const goals = db.memoryDb.goals.filter(g => g.org_id === orgId);

    let totalCo2e = 0;
    logs.forEach(l => totalCo2e += Number(l.calculated_co2e || 0));

    const orgSummary = {
      name: org.name,
      industry: org.industry,
      totalCo2e: Number(totalCo2e.toFixed(1)),
      logCount: logs.length,
      goalsCount: goals.length,
      highestCategory: 'Electricity'
    };

    const reply = await chatWithData(message, history || [], orgSummary);
    res.json({ reply });
  } catch (err) {
    next(err);
  }
}

export async function handleGenerateReport(req, res, next) {
  try {
    const orgId = req.user.org_id;
    const org = db.memoryDb.organizations.find(o => o.id === orgId) || { name: 'Org' };
    const logs = db.memoryDb.usage_logs.filter(l => l.org_id === orgId);

    let totalCo2e = 0;
    logs.forEach(l => totalCo2e += Number(l.calculated_co2e || 0));

    const reportMarkdown = await generateMonthlyReport({
      name: org.name,
      industry: org.industry,
      totalCo2e,
      sustainabilityScore: { score: 88, grade: 'A' }
    });

    res.json({
      orgName: org.name,
      generatedAt: new Date().toISOString(),
      reportMarkdown
    });
  } catch (err) {
    next(err);
  }
}
