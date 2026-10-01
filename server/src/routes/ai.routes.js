import { Router } from 'express';
import {
  handleExplainAnomaly,
  handleGenerateRecommendations,
  getRecommendationsList,
  updateRecommendationStatus,
  handleAIChat,
  handleGenerateReport
} from '../controllers/ai.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { aiRateLimiter } from '../middleware/rateLimit.middleware.js';

const router = Router();

router.use(authenticateToken);
router.use(aiRateLimiter);

router.post('/explain-anomaly', handleExplainAnomaly);
router.post('/recommendations', handleGenerateRecommendations);
router.get('/recommendations', getRecommendationsList);
router.put('/recommendations/:id', updateRecommendationStatus);
router.post('/chat', handleAIChat);
router.post('/report', handleGenerateReport);

export default router;
