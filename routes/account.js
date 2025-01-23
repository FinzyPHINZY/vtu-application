import express from 'express';
import {
  tokenExtractor,
  userExtractor,
  validateHeaders,
  validateRequest,
} from '../utils/middleware.js';
import {
  accountIdValidation,
  accountsQueryValidation,
  subAccountValidation,
} from '../utils/helpers.js';
import * as accountController from '../controllers/accountController.js';
const router = express.Router();

router.use(tokenExtractor);
router.use(userExtractor);

// create account for user
router.post(
  '/subaccount',
  validateHeaders,
  subAccountValidation,
  validateRequest,
  accountController.createSubAccount
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
  '/',
  validateHeaders,
  accountsQueryValidation,
  validateRequest,
  accountController.getAccounts
);

export default router;
