import express from 'express';

import * as TransactionController from '../controllers/transactionController.js';
import {
  airtimePurchaseValidation,
  dataPurchaseValidation,
  transactionPinValidation,
} from '../utils/helpers.js';
import {
  checkSystemStatus,
  tokenExtractor,
  userExtractor,
  validateHeaders,
  validateRequest,
} from '../utils/middleware.js';
import {
  requireTransactionPin,
  validateTransactionPin,
} from '../utils/transactionPin.js';

const router = express.Router();

router.use(checkSystemStatus);
router.use(tokenExtractor);
router.use(userExtractor);

router.post('/webhook', (req, res) => {
  console.log('webhook response', req.body);
  return res.status(200).json({
    status: 200,
    message: 'webhook called successfully',
    data: req.body,
  });
});

router.get(
  '/',
  validateHeaders,
  validateRequest,
  TransactionController.getTransactions
);

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

router.post(
  '/data/ogdams',
  validateHeaders,
  requireTransactionPin,
  transactionPinValidation,
  validateRequest,
  validateTransactionPin,
  TransactionController.purchaseOgdamsData
);

// // VAS Transaction endpoints

// get cable plans
router.get(
  '/cable-plans',
  validateHeaders,
  validateRequest,
  TransactionController.getCablePlans
);

// get cable list
router.get(
  '/cable-list',
  validateHeaders,
  validateRequest,
  TransactionController.getCableList
);

// get electricity providers
router.get(
  '/utility-providers',
  validateHeaders,
  validateRequest,
  TransactionController.getElectricityCompanies
);

// get data plans
router.get(
  '/data-plans',
  validateHeaders,
  validateRequest,
  TransactionController.fetchDataPlans
);

router.get(
  '/data-plans/ogdams',
  validateHeaders,
  validateRequest,
  TransactionController.fetchOgdamsData
);

// get networks
router.get(
  '/networks',
  validateHeaders,
  validateRequest,
  TransactionController.getNetworkList
);

export default router;
