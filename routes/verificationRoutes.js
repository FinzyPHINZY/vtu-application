// src/routes/verificationRoutes.js

import express from 'express';
import * as verificationController from '../controllers/verificationController.js';
import { validateHeaders, validateRequest } from '../utils/middleware.js';
import { body } from 'express-validator';
const router = express.Router();

const verificationValidation = [
  body('type').equals('BVN').withMessage('Verification type must be BVN'),
  body('async').isBoolean().withMessage('async must be a boolean value'),
  body('number')
    .isString()
    .matches(/^\d{11}$/)
    .withMessage('BVN must be 11 digits'),
  body('debitAccountNumber')
    .isString()
    .notEmpty()
    .withMessage('debitAccountNumber is required'),
];

router.post(
  '/initiate',
  validateHeaders,
  verificationValidation,
  validateRequest,
  verificationController.initiateVerification
);
router.post('/validate', verificationController.validateVerification);

export default router;
