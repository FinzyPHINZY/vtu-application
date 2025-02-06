import express from 'express';
import * as UserController from '../controllers/userController.js';
import {
  authorizeRoles,
  pinAttemptLimiter,
  tokenExtractor,
  userExtractor,
  validateRequest,
} from '../utils/middleware.js';
import {
  passwordValidation,
  registrationValidation,
  transactionPinValidation,
} from '../utils/helpers.js';
const router = express.Router();

// Route        GET /api/user/:id
// Description  Fetch details of a specific user by ID
// Access       Private (Admin or the user themselves)
router.get('/', tokenExtractor, userExtractor, UserController.fetchUser);

// Route        GET /api/user
// Description  Fetch a list of all users
// Access       Private (Admin only)
router.get('/list-users', authorizeRoles('admin'), UserController.fetchUsers);

// Route       PUT /api/user/:id/role
// Desc        Update user role
// Access      Admin only
router.put('/:id/role', authorizeRoles('admin'), UserController.updateUserRole);

router.post(
  '/request-password-reset',
  tokenExtractor,
  userExtractor,
  registrationValidation,
  validateRequest,
  UserController.requestPasswordReset
);

router.post(
  '/reset-password',
  // passwordValidation,
  validateRequest,
  UserController.resetPassword
);

router.post(
  '/set-transaction-pin',
  tokenExtractor,
  userExtractor,
  pinAttemptLimiter,
  transactionPinValidation,
  validateRequest,
  UserController.setTransactionPin
);

export default router;
