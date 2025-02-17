import express from 'express';
import * as TransactionController from '../../controllers/admin/transactionController.js';
import {
  adminAuth,
  tokenExtractor,
  userExtractor,
  validateHeaders,
  validateRequest,
} from '../../utils/middleware.js';
import {
  listQueryValidation,
  transactionIdValidation,
} from '../../utils/admin/helpers.js';

const router = express.Router();

router.use(validateHeaders);
router.use(tokenExtractor);
router.use(userExtractor);
router.use(adminAuth);

router.get(
  '/data',
  listQueryValidation,
  validateRequest,
  TransactionController.getDataTransactions
);

router.get(
  '/data/:transactionId',
  transactionIdValidation,
  validateRequest,
  TransactionController.getDataTransaction
);

router.get(
  '/airtime',
  listQueryValidation,
  validateRequest,
  TransactionController.getAirtimeTransactions
);

router.get(
  '/airtime/:transactionId',
  transactionIdValidation,
  validateRequest,
  TransactionController.getAirtimeTransaction
);

router.get(
  '/electricity',
  listQueryValidation,
  validateRequest,
  TransactionController.getElectricityTransactions
);

router.get(
  '/electricity/:transactionId',
  transactionIdValidation,
  validateRequest,
  TransactionController.getElectricityTransaction
);

router.get(
  '/cable-tv',
  listQueryValidation,
  validateRequest,
  TransactionController.getCableTVTransactions
);

router.get(
  '/cable-tv/:transactionId',
  transactionIdValidation,
  validateRequest,
  TransactionController.getCableTVTransaction
);

export default router;
