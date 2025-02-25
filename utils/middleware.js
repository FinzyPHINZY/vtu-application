import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import rateLimit from 'express-rate-limit';
// import { AllowedIPs } from './constants.js';
import { body, validationResult } from 'express-validator';
import dotenv from 'dotenv';
import axios from 'axios';
import ApiError from './error.js';
import SystemStatus from '../models/SystemStatus.js';

dotenv.config({});

export const requestLogger = (req, res, next) => {
  console.log('Method: ', req.method);
  console.log('Path: ', req.path);
  console.log('...');
  next();
};

export const adminAuth = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user || user.role !== 'admin') {
      throw new ApiError(403, false, 'Admin access required');
    }
    next();
  } catch (error) {
    next(error);
  }
};

export const errorHandler = (err, req, res, next) => {
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    details: err.details || 'No additional details',
  });

  if (err instanceof ApiError) {
    return res.status(err.code).json({
      success: err.success,
      status: 'error',
      code: err.code,
      message: err.message,
      details: err.details || null, // Include additional error context if available
    });
  }

  return res.status(500).json({
    success: false,
    status: 'error',
    code: 500,
    message: 'Internal server error',
  });
};

export const checkSystemStatus = async (req, res, next) => {
  try {
    const systemStatus = await SystemStatus.findOne({ key: 'shutdown' });

    if (systemStatus?.isActive) {
      throw new ApiError(
        '503',
        false,
        'The system is temporarily shut down',
        `Estimated restore time: ${systemStatus.estimatedRestoreTime}`
      );
    }

    next();
  } catch (error) {
    console.error(error?.response || error?.message || error);
    next(error);
  }
};

export const convertAccessTokenToIdToken = async (req, res, next) => {
  try {
    const { access_token } = req.body.idToken; // This is actually the access token

    if (!access_token) {
      return res.status(400).json({ message: 'Access Token required' });
    }

    // Fetch user info using the access token
    const response = await axios.get(
      `https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${access_token}`
    );

    if (!response.data.email) {
      return res.status(400).json({ message: 'Invalid Google Access Token' });
    }

    // Attach the user info to the request
    req.user = {
      email: response.data.email,
      googleId: response.data.sub,
    };

    next(); // Proceed to the actual authentication controller
  } catch (error) {
    console.error(
      'Token conversion error:',
      error?.response?.data || error.message
    );
    return res.status(401).json({ message: 'Invalid Google Access Token' });
  }
};

export const tokenExtractor = (req, res, next) => {
  try {
    const authorization = req.get('authorization');

    if (authorization && authorization.startsWith('Bearer ')) {
      req.token = authorization.replace('Bearer ', '');
    } else {
      req.token = null;
    }

    next();
  } catch (error) {
    console.error('Token Extraction Error:', error.message);
    return res
      .status(500)
      .json({ success: false, message: 'Internal Server Error' });
  }
};

export const userExtractor = async (req, res, next) => {
  if (!req.token) {
    return res
      .status(401)
      .json({ success: false, message: 'Unauthorized: No token provided' });
  }

  try {
    const decodedToken = jwt.verify(req.token, process.env.JWT_SECRET);

    if (!decodedToken.id) {
      return res
        .status(403)
        .json({ success: false, message: 'Forbidden: Invalid token' });
    }

    const user = await User.findById(decodedToken.id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    }

    req.user = { ...user.toObject(), ...decodedToken };

    next();
  } catch (error) {
    console.error('JWT Verification Error:', error.message);

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired. Please log in again.',
      });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(400).json({ success: false, message: 'Invalid token' });
    } else {
      return res
        .status(500)
        .json({ success: false, message: 'Internal Server Error' });
    }
  }
};

export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.user?.user.role;

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.',
      });
    }

    next();
  };
};

export const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    statusCode: 429,
    message: 'Too many requests, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const otpRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 3,
  message: {
    success: false,
    statusCode: 429,
    message: 'Too many OTP requests. Please try again after a minute.',
  },
});

// Rate limiting for virtual account creation
export const virtualAccountLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 requests per hour per IP
  message: {
    success: false,
    message: 'Too many virtual account requests, please try again later',
  },
});

export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
    }));

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: formattedErrors,
    });
  }

  next();
};

export const validateHeaders = (req, res, next) => {
  // Check Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(400).json({
      success: false,
      message: 'Missing or invalid Authorization header',
    });
    // throw new Error('Missing or invalid Authorization header');
  }

  next();
};

export const pinAttemptLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window per IP
  message: {
    success: false,
    message: 'Too many PIN attempts, please try again later',
  },
});

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window per IP
  message: {
    success: false,
    message: 'Too many login attempts, please try again later',
  },
});

export const checkGoogleUser = async (req, res, next) => {
  try {
    if (req.user?.isGoogleUser) {
      const { firstName, lastName, phoneNumber } = req.body;

      if (!firstName || !lastName || !phoneNumber) {
        throw new ApiError(
          400,
          false,
          'Please provide firstName, lastName and phoneNumber'
        );
      }

      await User.findByIdAndUpdate(req.user.id, {
        firstName,
        lastName,
        phoneNumber,
      });

      // Proceed to the next middleware/controller
      return next();
    }

    next(); // If it's not a Google user, proceed without validation
  } catch (error) {
    console.error('Error in checkGoogleUser middleware:', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};

// Rate limiting for payee lookup
export const lookupLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 requests per 15 minutes per IP
  message: {
    success: false,
    message: 'Too many lookup requests, please try again later',
  },
});

// Rate limiting for transfers
export const transferLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 transfers per hour per IP
  message: {
    success: false,
    message: 'Transfer limit exceeded, please try again later',
  },
});

// Validation middleware
export const lookupValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Invalid email format'),
];

export const transferValidation = [
  body('payeeId').isMongoId().withMessage('Invalid payee ID'),
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be greater than 0'),
  body('transactionPin')
    .isString()
    .matches(/^\d{4}$/)
    .withMessage('Transaction PIN must be 4 digits'),
];
