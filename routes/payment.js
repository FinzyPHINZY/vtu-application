import express from 'express';
import { auth, validateRequest } from '../utils/middleware.js';
import { paymentValidation } from '../utils/helpers.js';
import * as paymentController from '../controllers/paymentController.js';
const router = express.Router();

router.post(
  '/initialize',
  auth,
  paymentValidation,
  validateRequest,
  paymentController.initializePayment
);

export default router;
