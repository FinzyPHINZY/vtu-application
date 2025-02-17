import express from 'express';
import * as AuditController from '../../controllers/admin/auditController.js';
import {
  adminAuth,
  tokenExtractor,
  userExtractor,
  validateHeaders,
  validateRequest,
} from '../../utils/middleware.js';
import { userActivityValidation } from '../../utils/admin/helpers.js';

const router = express.Router();

router.use(validateHeaders);
router.use(tokenExtractor);
router.use(userExtractor);
router.use(adminAuth);

router.get(
  '/user-activity',
  userActivityValidation,
  validateRequest,
  AuditController.getUserActivity
);

export default router;
