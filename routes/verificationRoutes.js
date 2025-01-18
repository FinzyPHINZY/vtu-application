// src/routes/verificationRoutes.js

import express from 'express';
import * as verificationController from '../controllers/verificationController.js';
import { validateHeaders, validateRequest } from '../utils/middleware.js';
import {
  validationValidation,
  verificationValidation,
} from '../utils/helpers.js';
const router = express.Router();

router.post(
  '/initiate',
  validateHeaders,
  verificationValidation,
  validateRequest,
  verificationController.initiateVerification
);

router.post(
  '/validate',
  validateHeaders,
  validationValidation,
  validateRequest,
  verificationController.validateVerification
);

export default router;
