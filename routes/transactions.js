import express from 'express';
import {
  tokenExtractor,
  userExtractor,
  validateHeaders,
  validateRequest,
} from '../utils/middleware.js';
import {
  airtimeTransactionValidation,
  cableTVTransactionValidation,
  dataTransactionValidation,
  utilityTransactionValidation,
} from '../utils/helpers.js';
import * as TransactionController from '../controllers/transactionController.js';
const router = express.Router();

router.use(tokenExtractor);
router.use(userExtractor);

router.post(
  '/airtime',
  validateHeaders,
  airtimeTransactionValidation,
  validateRequest,
  TransactionController.purchaseAirtime
);

router.post(
  '/data',
  validateHeaders,
  dataTransactionValidation,
  validateRequest,
  TransactionController.purchaseData
);

router.post(
  '/cable-tv',
  validateHeaders,
  cableTVTransactionValidation,
  validateRequest,
  TransactionController.payCableTV
);

router.post(
  '/utility',
  validateHeaders,
  utilityTransactionValidation,
  TransactionController.payUtilityBill
);

export default router;
