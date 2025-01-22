import express from 'express';
import {
  auth,
  tokenExtractor,
  userExtractor,
  validateHeaders,
  validateRequest,
} from '../utils/middleware.js';
import { accountIdValidation, subAccountValidation } from '../utils/helpers.js';
import * as accountController from '../controllers/accountController.js';
const router = express.Router();

router.use(tokenExtractor);
router.use(userExtractor);

router.post(
  '/subaccount',
  subAccountValidation,
  validateRequest,
  accountController.createSubAccount
);

router.get(
  '/:id',
  accountIdValidation,
  validateRequest,
  accountController.getAccountDetails
);

export default router;
