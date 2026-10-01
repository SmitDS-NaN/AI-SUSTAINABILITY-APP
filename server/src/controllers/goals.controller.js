import crypto from 'crypto';
import { db } from '../config/db.js';
import { GoalSchema } from '../schemas/zod.schemas.js';

export async function getGoals(req, res, next) {
  try {
    const orgId = req.user.org_id;
    const goals = db.memoryDb.goals.filter(g => g.org_id === orgId);
    res.json({ goals });
  } catch (err) {
    next(err);
  }
}

export async function createGoal(req, res, next) {
  try {
    const orgId = req.user.org_id;
    const validated = GoalSchema.parse(req.body);
    const { target_category, reduction_percentage, target_date } = validated;

    const newGoal = {
      id: crypto.randomUUID(),
      org_id: orgId,
      target_category,
      reduction_percentage,
      target_date,
      created_at: new Date().toISOString()
    };

    db.memoryDb.goals.push(newGoal);
    res.status(201).json({ message: 'Reduction goal created successfully', goal: newGoal });
  } catch (err) {
    next(err);
  }
}

export async function deleteGoal(req, res, next) {
  try {
    const { id } = req.params;
    const orgId = req.user.org_id;

    const index = db.memoryDb.goals.findIndex(g => g.id === id && g.org_id === orgId);
    if (index === -1) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    db.memoryDb.goals.splice(index, 1);
    res.json({ message: 'Goal deleted successfully', id });
  } catch (err) {
    next(err);
  }
}
