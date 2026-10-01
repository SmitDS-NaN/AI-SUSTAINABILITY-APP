import { Router } from 'express';
import { getGoals, createGoal, deleteGoal } from '../controllers/goals.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticateToken);

router.get('/', getGoals);
router.post('/', createGoal);
router.delete('/:id', deleteGoal);

export default router;
