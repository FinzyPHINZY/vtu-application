import express from 'express';
import * as SystemController from '../../controllers/admin/systemController.js';
import {
  adminAuth,
  tokenExtractor,
  userExtractor,
  validateHeaders,
  validateRequest,
} from '../../utils/middleware.js';
import { shutdownValidation } from '../../utils/admin/helpers.js';

const router = express.Router();

router.use(validateHeaders);
router.use(tokenExtractor);
router.use(userExtractor);
router.use(adminAuth);

router.post(
  '/emergency-shutdown',
  shutdownValidation,
  validateRequest,
  SystemController.emergencyShutdown
);

router.post('/emergency-restore', SystemController.emergencyRestore);

export default router;
