import express from 'express';
import {
  checkGoogleUser,
  checkSystemStatus,
  tokenExtractor,
  userExtractor,
  validateHeaders,
  validateRequest,
  virtualAccountLimiter,
} from '../utils/middleware.js';
import {
  accountIdValidation,
  accountsQueryValidation,
  subAccountValidation,
} from '../utils/helpers.js';
import * as accountController from '../controllers/accountController.js';
const router = express.Router();

router.use(checkSystemStatus);
router.use(tokenExtractor);
router.use(userExtractor);

// create account for user
router.post(
  '/subaccount',
  validateHeaders,
  checkGoogleUser,
  subAccountValidation,
  validateRequest,
  accountController.createSubAccount
);

// create virtual account
router.post(
  '/virtual',
  validateHeaders,
  // virtualAccountLimiter,
  validateRequest,
  accountController.createVirtualAccount
);

// get virtual account
router.get(
  '/virtual/account/:id',
  validateHeaders,
  validateRequest,
  accountController.getVirtualAccount
);

// get virtual transaction status
router.get(
  '/virtual/:virtualAccountId',
  validateHeaders,
  validateRequest,
  accountController.getVirtualTransaction
);

//  virtual account status
router.post(
  '/virtual/status',
  validateHeaders,
  validateRequest,
  accountController.virtualAccountStatus
);

// get specific account
router.get(
  '/:id',
  validateHeaders,
  accountIdValidation,
  validateRequest,
  accountController.getAccountDetails
);

// get all accounts
router.get(
  '/accounts',
  validateHeaders,
  accountsQueryValidation,
  validateRequest,
  accountController.getAccounts
);

export default router;
