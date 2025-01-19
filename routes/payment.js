import express from 'express';
import { auth, validateRequest } from '../utils/middleware.js';
import {
  paymentValidation,
  paymentVerificationValidation,
} from '../utils/helpers.js';
import * as paymentController from '../controllers/paymentController.js';
const router = express.Router();

router.post(
  '/initialize',
  auth,
  paymentValidation,
  validateRequest,
  paymentController.initializePayment
);

router.get(
  '/verify/:reference',
  auth,
  paymentVerificationValidation,
  validateRequest,
  paymentController.verifyPayment
);

export default router;
