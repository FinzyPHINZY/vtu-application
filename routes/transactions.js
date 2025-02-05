import express from 'express';
import {
  tokenExtractor,
  userExtractor,
  validateHeaders,
  validateRequest,
} from '../utils/middleware.js';
import {
  airtimePurchaseValidation,
  dataPurchaseValidation,
  transactionIdValidation,
  transactionPinValidation,
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
  airtimePurchaseValidation,
  transactionPinValidation,
  validateRequest,
  validateTransactionPin,
  TransactionController.purchaseAirtime
);

router.post(
  '/data',
  validateHeaders,
  requireTransactionPin,
  dataPurchaseValidation,
  transactionPinValidation,
  validateRequest,
  validateTransactionPin,
  TransactionController.purchaseData
);

router.post(
  '/cable-tv',
  validateHeaders,
  requireTransactionPin,
  transactionPinValidation,
  validateRequest,
  validateTransactionPin,
  TransactionController.payCableTV
);

router.post(
  '/utility',
  validateHeaders,
  requireTransactionPin,
  transactionPinValidation,
  validateRequest,
  validateTransactionPin,
  TransactionController.payUtilityBill
);

// // VAS Transaction endpoints
// router.get(
//   '/transactions',
//   // validateHeaders,
//   // validateRequest,
//   TransactionController.getTransactions
// );
// router.get(
//   '/transaction/:id',
//   validateHeaders,
//   transactionIdValidation,
//   validateRequest,
//   TransactionController.getTransactionById
// );

export default router;
