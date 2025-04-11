import express from 'express';
import multer from 'multer';

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

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Not an image! Please upload an image.'));
    }
  },
});

router.get('/', tokenExtractor, userExtractor, UserController.fetchUser);

router.get('/list-users', authorizeRoles('admin'), UserController.fetchUsers);

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

router.post(
  '/upload-profile-picture',
  tokenExtractor,
  userExtractor,
  upload.single('image'),
  UserController.updateProfilePicture
);

export default router;
