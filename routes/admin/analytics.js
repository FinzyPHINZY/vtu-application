import express from 'express';
import {
  adminAuth,
  tokenExtractor,
  userExtractor,
  validateHeaders,
  validateRequest,
} from '../../utils/middleware.js';
import { revenueValidation } from '../../utils/admin/helpers.js';
import * as AnalyticsControllers from '../../controllers/admin/analyticsController.js';

const router = express.Router();

router.use(validateHeaders);
router.use(tokenExtractor);
router.use(userExtractor);
router.use(adminAuth);

router.get(
  '/revenue',
  revenueValidation,
  validateRequest,
  AnalyticsControllers.getRevenue
);

router.get('/summary', AnalyticsControllers.getTransactionsSummary);

export default router;
