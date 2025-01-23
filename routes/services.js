import express from 'express';
import * as servicesController from '../controllers/servicesController.js';
import {
  tokenExtractor,
  userExtractor,
  validateHeaders,
  validateRequest,
} from '../utils/middleware.js';
import {
  airtimeValidation,
  cableTVValidation,
  dataValidation,
  serviceIdValidation,
  transactionIdValidation,
  utilityValidation,
  verifyEntityValidation,
} from '../utils/helpers.js';
const router = express.Router();

// Middlewares
router.use(tokenExtractor);
router.use(userExtractor);

// get services
router.get('/', validateHeaders, servicesController.getServices);

// get service
router.get(
  '/:id',
  validateHeaders,
  serviceIdValidation,
  validateRequest,
  servicesController.getServicesById
);

// get service categories
router.get(
  '/:id/service-categories',
  validateHeaders,
  serviceIdValidation,
  validateRequest,
  servicesController.getServiceCategories
);

// verify tv data information
router.post(
  '/verify',
  validateHeaders,
  verifyEntityValidation,
  validateRequest,
  servicesController.verifyPowerOrTvData
);

// VAS Payment endpoints
router.post(
  '/pay/airtime',
  validateHeaders,
  airtimeValidation,
  validateRequest,
  servicesController.purchaseAirtime
);
router.post(
  '/pay/data',
  validateHeaders,
  dataValidation,
  validateRequest,
  servicesController.purchaseData
);
router.post(
  '/pay/cable-tv',
  validateHeaders,
  cableTVValidation,
  validateRequest,
  servicesController.purchaseCableTV
);
router.post(
  '/pay/utility',
  validateHeaders,
  utilityValidation,
  validateRequest,
  servicesController.payUtilityBill
);

// VAS Transaction endpoints
router.get(
  '/transactions',
  validateHeaders,
  servicesController.getTransactions
);
router.get(
  '/transaction/:id',
  validateHeaders,
  transactionIdValidation,
  validateRequest,
  servicesController.getTransactionById
);

export default router;
