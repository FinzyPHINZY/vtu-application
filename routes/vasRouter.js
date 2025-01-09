import express from 'express';
import * as vasController from '../controllers/VasController.js';
import { tokenExtractor, userExtractor } from '../utils/middleware.js';
const router = express.Router();

// Middlewares
router.use(tokenExtractor);
router.use(userExtractor);

router.post('/purchase-airtime', vasController.purchaseAirtime);

export default router;
