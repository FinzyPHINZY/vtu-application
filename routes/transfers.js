import express from 'express';
import {
  checkSystemStatus,
  lookupLimiter,
  lookupValidation,
  tokenExtractor,
  userExtractor,
  validateHeaders,
  validateRequest,
} from '../utils/middleware.js';
import * as TransferController from '../controllers/transferController.js';
import * as InternalTransferController from '../controllers/internalTransferController.js';
import {
  historyValidation,
  nameEnquiryValidation,
  statusValidation,
  transferValidation,
} from '../utils/helpers.js';
import {
  requireTransactionPin,
  validateTransactionPin,
} from '../utils/transactionPin.js';
const router = express.Router();

router.use(checkSystemStatus);
router.use(tokenExtractor);
router.use(userExtractor);

// fetch banks
router.get(
  '/banks',
  validateHeaders,
  validateRequest,
  TransferController.getBankList
);

// verify bank information
router.post(
  '/verify',
  validateHeaders,
  nameEnquiryValidation,
  validateRequest,
  TransferController.nameEnquiry
);

// make transfers
router.post(
  '/',
  validateHeaders,
  requireTransactionPin,
  transferValidation,
  validateRequest,
  validateTransactionPin,
  TransferController.executeTransfer
);

// check transfer status
router.post(
  '/status',
  validateHeaders,
  statusValidation,
  validateRequest,
  TransferController.checkTransferStatus
);

// get transfer history
router.get(
  '/',
  validateHeaders,
  historyValidation,
  validateRequest,
  TransferController.getTransferHistory
);

// internal transfers
router.post(
  '/lookup',
  validateHeaders,
  // lookupLimiter,
  lookupValidation,
  validateRequest,
  InternalTransferController.lookupPayee
);

router.post(
  '/transfer',
  validateHeaders,
  requireTransactionPin,
  validateRequest,
  validateTransactionPin,
  InternalTransferController.transfer
);

export default router;
