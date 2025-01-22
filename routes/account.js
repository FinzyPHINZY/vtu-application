import express from 'express';
import { auth, validateHeaders, validateRequest } from '../utils/middleware.js';
import { accountIdValidation, subAccountValidation } from '../utils/helpers.js';
import * as accountController from '../controllers/accountController.js';
const router = express.Router();

router.post(
  '/subaccount',
  auth,
  validateHeaders,
  subAccountValidation,
  validateRequest,
  accountController.createSubAccount
);

router.get(
  '/:id',
  auth,
  validateHeaders,
  accountIdValidation,
  validateRequest,
  accountController.getAccountDetails
);

export default router;
