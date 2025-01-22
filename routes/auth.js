import express from 'express';
import * as authController from '../controllers/authController.js';
import { otpRateLimiter, validateRequest } from '../utils/middleware.js';
import { body } from 'express-validator';
const router = express.Router();

const tokenValidation = [
  body('grant_type').equals('client_credentials'),
  body('client_id').isString().notEmpty(),
  body('client_assertion').isString().notEmpty(),
  body('client_assertion_type').equals(
    'urn:ietf:params:oauth:client-assertion-type:jwt-bearer'
  ),
];

router.post('/request-otp', otpRateLimiter, authController.requestOtp);

router.post('/verify-otp', authController.verifyOtp);

router.post('/complete-signup', authController.completeSignUp);

router.post('/login', authController.login);

router.post(
  '/token',
  // tokenValidation,
  // validateRequest,
  authController.fetchAccessToken
);

export default router;
