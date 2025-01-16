// src/routes/verificationRoutes.js

import express from 'express';
import * as verificationController from '../controllers/verificationController.js';
const router = express.Router();

router.post('/initiate', verificationController.initiateVerification);
router.post('/validate', verificationController.validateVerification);

export default router;
