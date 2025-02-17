import express from 'express';
import * as NotificationController from '../../controllers/admin/notificationController.js';
import {
  broadcastValidation,
  directMessageValidation,
} from '../../utils/admin/helpers.js';
import {
  adminAuth,
  tokenExtractor,
  userExtractor,
  validateHeaders,
  validateRequest,
} from '../../utils/middleware.js';

const router = express.Router();

router.use(validateHeaders);
router.use(tokenExtractor);
router.use(userExtractor);
router.use(adminAuth);

router.post(
  '/broadcast',
  broadcastValidation,
  validateRequest,
  NotificationController.broadcastMessage
);

router.post(
  '/direct-message',
  directMessageValidation,
  validateRequest,
  NotificationController.sendDirectMessage
);

export default router;
