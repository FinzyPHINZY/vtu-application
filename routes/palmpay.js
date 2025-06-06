import express from 'express';
import * as PalmpayController from '../controllers/palmpayController.js';
import {
  checkSystemStatus,
  tokenExtractor,
  userExtractor,
  validateHeaders,
  validateRequest,
  virtualAccountLimiter,
} from '../utils/middleware.js';

const router = express.Router();

router.use(checkSystemStatus);

router.post('/palmpay-webhook', PalmpayController.handlePalmpayWebhook);

router.post(
  '/bank-transfer/webhook',
  PalmpayController.handleBankTransferWebhook
);

router.use(tokenExtractor);
router.use(userExtractor);

router.post(
  '/',
  validateHeaders,
  virtualAccountLimiter,
  validateRequest,
  PalmpayController.createVirtualAccount
);

router.post(
  '/status',
  validateHeaders,
  validateRequest,
  PalmpayController.updateVirtualAccountStatus
);

router.post(
  '/delete',
  validateHeaders,
  validateRequest,
  PalmpayController.deleteVirtualAccount
);

router.post(
  '/query',
  validateHeaders,
  validateRequest,
  PalmpayController.queryVirtualAccount
);

router.post(
  '/order',
  validateHeaders,
  validateRequest,
  PalmpayController.createOrder
);

router.post(
  '/bank-transfer',
  validateHeaders,
  validateRequest,
  PalmpayController.createBankTransferOrder
);

router.get(
  '/bank-transfer/status/:reference',
  validateHeaders,
  validateRequest,
  PalmpayController.checkBankTransferStatus
);

export default router;
