import express from 'express';
import {
  tokenExtractor,
  userExtractor,
  validateHeaders,
  validateRequest,
} from '../utils/middleware.js';
import * as TransferController from '../controllers/transferController.js';
const router = express.Router();

router.use(tokenExtractor);
router.use(userExtractor);

// fetch banks

router.get(
  '/banks',
  validateHeaders,
  validateRequest,
  TransferController.getBankList
);

router.post(
  '/verify',
  validateHeaders,
  validateRequest,
  TransferController.verifyBankAccount
);

router.post(
  '/status',
  validateHeaders,
  validateRequest,
  TransferController.getTransferStatus
);

export default router;
