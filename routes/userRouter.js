import express from 'express';
import * as UserController from '../controllers/UserController.js';
import {
  authorizeRoles,
  tokenExtractor,
  userExtractor,
} from '../utils/middleware.js';
import passport from 'passport';
const router = express.Router();

router.use(tokenExtractor);

// Route        GET /api/user/:id
// Description  Fetch details of a specific user by ID
// Access       Private (Admin or the user themselves)
router.get(
  '/:id',
  userExtractor,
  authorizeRoles('admin', 'user'),
  UserController.fetchUser
);

// Route        GET /api/user
// Description  Fetch a list of all users
// Access       Private (Admin only)
router.get('/', authorizeRoles('admin', 'user'), UserController.fetchUsers);

// Route        POST /api/user/send-otp
// Desc         Send OTP to User Email Address
// Access       Public
router.post('/send-otp', UserController.sendOTP);

// Route        POST /api/user/verify-otp
// Desc         Verify OTP
// Access       Public
router.post('/verify-otp', UserController.verifyOTP);

// Route        POST /api/user/signup
// Desc         Register new user
// Access       Public
router.post('/signup', UserController.signUp);

// Route        POST /api/user/login
// Desc         Authenticate user and return token
// Access       Public
router.post('/login', UserController.login);

// Route       PUT /api/user/:id/role
// Desc        Update user role
// Access      Admin only
router.put(
  '/:id/role',
  userExtractor,
  authorizeRoles('admin'),
  UserController.updateUserRole
);

export default router;
