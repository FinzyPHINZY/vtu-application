import express from 'express';

import * as PalmpayController from '../controllers/palmpayController.js';
import {
  checkSystemStatus,
  tokenExtractor,
  userExtractor,
  validateHeaders,
  validateRequest,
} from '../utils/middleware.js';

const router = express.Router();

router.use(checkSystemStatus);

router.use(tokenExtractor);
router.use(userExtractor);

router.post(
  '/',
  validateHeaders,
  validateRequest,
  PalmpayController.queryBiller
);

router.post(
  '/item',
  validateHeaders,
  validateRequest,
  PalmpayController.queryBillerItem
);

export default router;
