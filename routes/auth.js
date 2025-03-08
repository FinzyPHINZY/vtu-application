import express from 'express';

import * as authController from '../controllers/authController.js';
import { loginLimiter, otpRateLimiter } from '../utils/middleware.js';

const router = express.Router();

router.get('/', (req, res) => res.send('htllo wold'));

router.post('/request-otp', otpRateLimiter, authController.requestOtp);

router.post('/verify-otp', authController.verifyOtp);

router.post('/complete-signup', authController.completeSignUp);

router.post('/login', loginLimiter, authController.login);

export default router;
