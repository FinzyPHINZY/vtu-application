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
  transactionPinValidation,
  utilityTransactionValidation,
} from '../utils/helpers.js';
import * as TransactionController from '../controllers/transactionController.js';
import {
  requireTransactionPin,
  validateTransactionPin,
} from '../utils/transactionPin.js';
const router = express.Router();

router.use(tokenExtractor);
router.use(userExtractor);

router.post(
  '/airtime',
  validateHeaders,
  requireTransactionPin,
  [...airtimeTransactionValidation, transactionPinValidation],
  validateRequest,
  validateTransactionPin,
  TransactionController.purchaseAirtime
);

router.post(
  '/data',
  validateHeaders,
  requireTransactionPin,
  [...dataTransactionValidation, transactionPinValidation],
  validateRequest,
  validateTransactionPin,
  TransactionController.purchaseData
);

router.post(
  '/cable-tv',
  validateHeaders,
  requireTransactionPin,
  [...cableTVTransactionValidation, transactionPinValidation],
  validateRequest,
  validateTransactionPin,
  TransactionController.payCableTV
);

router.post(
  '/utility',
  validateHeaders,
  requireTransactionPin,
  [...utilityTransactionValidation, transactionPinValidation],
  TransactionController.payUtilityBill
);

export default router;
