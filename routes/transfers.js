import express from 'express';
import {
  tokenExtractor,
  userExtractor,
  validateHeaders,
  validateRequest,
} from '../utils/middleware.js';
import * as TransferController from '../controllers/transferController.js';
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

export default router;
