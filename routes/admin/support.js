import express from 'express';
import * as SupportController from '../../controllers/admin/supportController.js';
import {
  adminAuth,
  tokenExtractor,
  userExtractor,
  validateHeaders,
  validateRequest,
} from '../../utils/middleware.js';
import {
  ticketsValidation,
  updateTicketValidation,
} from '../../utils/admin/helpers.js';

const router = express.Router();

router.use(validateHeaders);
router.use(tokenExtractor);
router.use(userExtractor);
router.use(adminAuth);

router.get(
  '/tickets',
  ticketsValidation,
  validateRequest,
  SupportController.getTickets
);

router.put(
  '/tickets/:ticketId',
  updateTicketValidation,
  validateRequest,
  SupportController.updateTicket
);

router.get('/customer-feedback', SupportController.getCustomerFeedback);

export default router;
