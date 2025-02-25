import express from 'express';
import * as authController from '../controllers/authController.js';
import {
  convertAccessTokenToIdToken,
  loginLimiter,
  otpRateLimiter,
  validateRequest,
} from '../utils/middleware.js';
import { googleLoginValidation } from '../utils/helpers.js';
const router = express.Router();

router.post('/request-otp', otpRateLimiter, authController.requestOtp);

router.post('/verify-otp', authController.verifyOtp);

router.post('/complete-signup', authController.completeSignUp);

router.post('/login', loginLimiter, authController.login);

router.post(
  '/google',
  convertAccessTokenToIdToken,
  // loginLimiter,
  // googleLoginValidation,
  // validateRequest,
  authController.googleLogin
);

export default router;
