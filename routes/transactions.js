import express from 'express';
import {
  tokenExtractor,
  userExtractor,
  validateHeaders,
  validateRequest,
} from '../utils/middleware.js';
import {
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

// router.post(
//   '/airtime',
//   validateHeaders,
//   requireTransactionPin,
//   transactionPinValidation,
//   validateRequest,
//   validateTransactionPin,
//   TransactionController.purchaseAirtime
// );

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

// router.post(
//   '/cable-tv',
//   validateHeaders,
//   requireTransactionPin,
//   [...cableTVTransactionValidation, transactionPinValidation],
//   validateRequest,
//   validateTransactionPin,
//   TransactionController.payCableTV
// );

// router.post(
//   '/utility',
//   validateHeaders,
//   requireTransactionPin,
//   [...utilityTransactionValidation, transactionPinValidation],
//   TransactionController.payUtilityBill
// );

// router.post(
//   '/transfer',
//   validateHeaders,
//   requireTransactionPin,
//   transactionPinValidation,
//   TransactionController.transferFunds
// );
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
