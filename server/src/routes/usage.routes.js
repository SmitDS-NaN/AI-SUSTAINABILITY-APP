import { Router } from 'express';
import {
  getUsageLogs,
  createUsageLog,
  bulkUploadCSV,
  deleteUsageLog
} from '../controllers/usage.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticateToken);

router.get('/', getUsageLogs);
router.post('/', createUsageLog);
router.post('/upload', bulkUploadCSV);
router.delete('/:id', deleteUsageLog);

export default router;
