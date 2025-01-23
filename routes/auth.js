import express from 'express';
import * as authController from '../controllers/authController.js';
import { otpRateLimiter } from '../utils/middleware.js';
const router = express.Router();

router.post('/request-otp', otpRateLimiter, authController.requestOtp);

router.post('/verify-otp', authController.verifyOtp);

router.post('/complete-signup', authController.completeSignUp);

router.post('/login', authController.login);

export default router;
