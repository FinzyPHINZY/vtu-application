import express from 'express';

import * as verificationController from '../controllers/verificationController.js';
import {
  validateIdentityRequest,
  validationValidation,
  verificationValidation,
} from '../utils/helpers.js';
import {
  checkSystemStatus,
  tokenExtractor,
  userExtractor,
  validateHeaders,
  validateRequest,
} from '../utils/middleware.js';

const router = express.Router();

router.use(checkSystemStatus);
router.use(tokenExtractor);
router.use(userExtractor);

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

router.post(
  '/enquiry',
  validateHeaders,
  validateIdentityRequest,
  validateRequest,
  verificationController.easeIdEnquiry
);
export default router;
